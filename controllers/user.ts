import db from '../db/dataSource.js';
import { Profile } from "../db/entities/Profile.js";
import { User } from "../db/entities/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express from 'express';
import { Contacts } from "../db/entities/Contacts.js";
import "dotenv/config"

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
            expiresIn: "30m"
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
       res.status(200).json({ success: true, msg: "Successfully logged in!" }).send();
        
      } else {
        res.status(500).json({success: false, error: " :(Invalid Username or password!"});
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
          res.status(201).json({success: true, msg: "Password Successfully Updated"})
        }).catch(error => {
          console.error(error);
          res.status(500).json({success: false, error: 'A problem occurred :('});
        });
      }
      else res.status(400).json({success: false, error: 'Password incorrect'});
}

const deleteAccount = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Delete all data related with this account from DB/AWS S3 etc...
  const user = res.locals.user;
    try {
      await db.dataSource.manager.transaction(async (transaction) => {
        const contacts = await Contacts.find({
          where: [
            { contact: user },
            { user: user },
          ],
        });
        const contactRemoval = contacts.map(async (contact) => {
            await transaction.remove(Contacts, contact);
        });

        await Promise.all(contactRemoval);

        await transaction.remove(User, user);
    });

    res.status(201).json({ success: true, msg: 'Account Deleted!' });
     
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, error: 'Failed to delete account'});
    }
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
  const contacts = await Contacts.find({where: 
    {user: res.locals.user}
  })

  //NOTE: if no user has no contacts yet -> send appropraite message.
  if(contacts){
    const people = await formatContacts(contacts);
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

const changeStatus = async (status: string, username: string) => {
  try { const user = await User.findOneBy({username});
  if(user){
   if(status == "online")
      user.profile.status = "online";
    else user.profile.status = "offline";
    console.log("Changing to online....");
    user.profile.save().then(() => {
      console.log(`${user.username} STATUS: ${user.profile.status}`);
      return;
    }).catch(error => {
      console.error(error);
    });
  }
  } catch(err){
    console.log(err);
  }

}

const formatContacts = async (contacts: Contacts[]) => {
  const people = contacts.map(contact => contact.contact);
  let formatedContacts = [];
  for(let i = 0; i < contacts.length; i++){
    formatedContacts.push({contact: people[i].username, relationship: contacts[i].relationshipStatus, started: contacts[i].createdAt})
  }
  return formatedContacts;
}


export {
  createUser,
  updateUserProfile,
  login,
  logout,
  changePassword,
  deleteAccount,
  getContacts,
  getUsers,
  changeStatus
};
