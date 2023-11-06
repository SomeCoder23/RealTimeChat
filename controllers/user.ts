import db from '../db/dataSource.js';
import { Profile } from "../db/entities/Profile.js";
import { User } from "../db/entities/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express from 'express';
import { Contacts } from "../db/entities/Contacts.js";
import "dotenv/config"
import { ILike, In } from 'typeorm';
import { UserChat } from '../db/entities/UserChat.js';
import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_SES_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  region: process.env.AWS_SES_REGION
});
const ses = new AWS.SES({ region: 'eu-north-1' });

const createUser = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const username = req.body.username;
  const email = req.body.email;
  const user = await User.findOneBy({username});
  if(user){
    res.status(400).json({success: false, error: "Username already in use."});
    return;
  }

  db.dataSource.manager.transaction(async transaction => { 
        try
        {
          //First: Creates User Profile and Saves it 
          const profile = Profile.create({
            fullName: req.body.fullName,
            birthday: req.body.birthday,
            bio: req.body.bio,
          });
          
          await transaction.save(profile);
          console.log("Saved Profile!");
          //Second: Hashes password, creates new user and saves it.
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
          const currentDate = new Date();
          const newUser = User.create({
            username: username,
            password: hashedPassword,
            email: email,
            createdAt: currentDate,
            profile: profile
          });
    
          await transaction.save(newUser);
          res.status(201).json({success: true, msg: "Successfully Registered!", data: newUser});
    
        } catch(error){
          console.log("###ERROR: ");
          console.log(error);
          res.status(500).json({success: false, error: "Failed to register."})
        }
       
      });
}

const updateUserProfile = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = res.locals.user;
   db.dataSource.manager.transaction(async transaction => {
        try
        {
          let profile = user.profile;
          profile.fullName = req.body.fullName !== undefined ? req.body.fullName : profile.fullName;
          profile.birthday = req.body.birthday !== undefined ? req.body.birthday : profile.birthday;
          profile.bio = req.body.bio !== undefined ? req.body.bio : profile.bio;
          
          await transaction.save(profile);
          res.status(201).json({success: true, msg: "Profile Updated Successfully!", data: profile});
    
        } catch(error){
          console.log("###ERROR: ");
          console.log(error);
          res.status(500).json({success: false, error: "Failed to update user profile."})
        }
       
      });
}

const login = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log("INSIDE LOGIN....");

   try {
      const user = await User.findOneBy({
        username
      });
  
      const passwordMatching = await bcrypt.compare(password, user?.password || '');
  
      if (user && passwordMatching) {
        const token = jwt.sign(
          {
            id: user.id,
            username: user.username
          },
          process.env.SECRET_KEY || '',
          {
            expiresIn: "1h"
          }
        );
        //change presences status of user.
        //user.profile.status = "online";
       // await user.save();
      // console.log("SESSION:");
  
      res.cookie('username', user.username, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.cookie('loginTime', Date.now(), {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
       res.status(200).json({ success: true, msg: "Successfully logged in!"}).send();
        
      } else {
        res.status(400).json({success: false, error: " Invalid Username or password!"});
      }
    } catch (error) {
      console.log(error);
        res.status(500).json({success: false, error: "Invalid Username or password!"});
    }
}

const changePassword = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user: User = res.locals.user;
  const passwords = req.body;

  const passwordMatching = await bcrypt.compare(passwords.old, user?.password || '');
      if(passwordMatching){
        
        if(passwords.new.length < 6){
          res.status(400).json({success: false, error: 'Password should contain at least 6 characters!'});
          return; 
        }
               
        user.password = await bcrypt.hash(passwords.new, 10);
        user.save().then(() => {
          res.status(200).json({success: true, msg: "Password Successfully Updated"})
        }).catch(error => {
          console.error(error);
          res.status(500).json({success: false, error: 'A problem occurred :('});
        });
      }
      else res.status(400).json({success: false, error: 'Password incorrect'});
}


const logout = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  
  const username = res.locals.user.username;
  const user = await User.findOneBy({
    username
  });
  if(user){
  user.profile.status = "offline";
  user.save().then((response: any) => {
    res.cookie('fullName', '', {
      maxAge: -1,  // This means the cookie will be deleted
      expires: new Date(Date.now() - 1000)
    });
    res.cookie('loginTime', '', {
      maxAge: -1
    });
    res.cookie('token', '', {
      maxAge: -1
    });
  
    res.status(200).json({ success: true , msg: "Successfully logged out!"});
  }).catch((error: any) => {
    console.error(error);
      res.status(500).json({ success: false, error: 'Logout failed' });
  });

}
else res.status(500).json({ success: false, error: 'Logout failed' });
}

const getContacts = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = res.locals.user;
  const contacts = await Contacts.find({where: 
    {user: user}
  })

  //NOTE: if no user has no contacts yet -> send appropraite message.
  if(contacts){
    const people = await formatContacts(contacts, user);
    res.status(200).json({success: true, data: people});
  }
  else res.status(500).json({success: false, error: "Problem occurred"});

}

const getUsers = async ( req: any, res: express.Response, next: express.NextFunction) => {
  try{
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '10');
    const [users, total] = await User.findAndCount({
      skip: pageSize * (page - 1),
      take: pageSize
    });
    const formatedUsers = users.map(user => {
      return {
        username: user.username,
        name: user.profile.fullName,
        bio: user.profile.bio
      }
    });
    const data = {
      page: 1,
      pageSize: users.length,
      total,
      formatedUsers
    }
    res.status(200).json({success: true, data: data});
  } catch(error){
    console.error(error);
    res.status(500).json({ success: false, error: 'Somwthing went wrong' });
  }
}

//may need formating
const searchUsers =  async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const query = req.params.query;
  let users;
  if(query.length < 1) users = await User.find(); 

  else users = await User.find({
    where: {username: ILike(`${query}%`)}
  });
  

  if(users){
    let results;
    if(users.length >= 1)
     results = users.map(user => {
      return {
        username: user.username,
        name: user.profile.fullName,
        bio: user.profile.bio
      }
    });
    else results = "No users found";
    res.status(200).json({success: true, total: users.length, data: results})
  }
  else {
    res.status(500).json({success: false, error: "Problemo occurred."})
  }
}


const changeStatus = async (status: string, username: string) => {
  try { const user = await User.findOneBy({username});
  if(user){
   if(status == "online")
      user.profile.status = "online";
    else user.profile.status = "offline";
    user.profile.save().then(() => {
      return;
    }).catch(error => {
      console.error(error);
    });
  }
  } catch(err){
    console.log(err);
  }

}

const formatContacts = async (contacts: Contacts[], user: any) => {
  const people: any = contacts.map(contact => contact.contact);
  let formatedContacts = [];
  const userChats = await UserChat.find({where: {user: user}});
  const chats = userChats.map(userchat => userchat.chat.id);
  for(let i = 0; i < contacts.length; i++){
     //let commonChats: any = await UserChat.find({where: {user: people[i], chat: In(chats)}})
     const userChats2 = await UserChat.find({where: {user: people[i]}});
     const chats2 = userChats2.map(userchat => userchat.chat.id);
     const chatIds = chats.filter(chat => chats2.includes(chat));
     let commonChats: any = userChats2.filter(chat => chatIds.includes(chat.chat.id));
    commonChats = commonChats.map((chats: any) => {
      return {
        name: chats.name,
        status: chats.status
      }
    })
    formatedContacts.push({contact: people[i].username, relationship: contacts[i].relationshipStatus, started: contacts[i].createdAt, commonChats: commonChats})
  }
  return formatedContacts;
}

//<><><><><><><><><><><>><><><><><><><><><><><><><><><><><><><<><<><<<>>>
//FOR TESTING (SAME AS ABOVE BUT WITHOUT THE RESPONSE AND REQUEST OBJECTS):

const updateUserProfileTEST = async (user: any, body: any) => {
  try
  {
      let profile : Profile = user.profile;
      profile.fullName = body.fullName !== undefined ? body.fullName : profile.fullName;
      profile.birthday = body.birthday !== undefined ? body.birthday : profile.birthday;
      profile.bio = body.bio !== undefined ? body.bio : profile.bio;

      return await profile.save().then(() => {
        console.log("SAVED PROFILE...");
        return {status: 201, msg: "Profile Updated Successfully!", data: profile};
      }).catch(error => {
        console.error(error);
      return {status: 500, error: "Failed to update user profile."}

      });

    } catch(error){
      console.log("###ERROR: ");
      console.log(error);
      return {status: 500, error: "Failed to update user profile."}
    }
}

const getContactsTEST = async (user: any) => {
  const contacts = await Contacts.find({where: 
    {user: user}
  })
  if(contacts){
    const people = await formatContacts(contacts, user);
    return {status: 200, data: people}
  }
  else return {status: 500, error: "Problem occurred"}

}

export {
  createUser,
  updateUserProfile,
  login,
  logout,
  changePassword,
  getContacts,
  getUsers,
  changeStatus,
  searchUsers,
  updateUserProfileTEST,
  getContactsTEST
};
