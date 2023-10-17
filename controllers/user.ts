import { ChatTypes } from "../@types/types.js";
import db from '../db/dataSource.js';
import { Profile } from "../db/entities/Profile.js";
import { User } from "../db/entities/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express from 'express';

const createUser = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const username = req.body.username;
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
      console.log("SESSION:");
      console.log(req.session);
      (req.session as any).fullName = user.profile.fullName;
      (req.session as any).token = token;
      console.log("SESSION:");
      console.log(req.session);
      console.log((req.session as any).token);
      // res.header('Access-Control-Allow-Credentials', 'true');
      // res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
      // res.cookie('fullName', data.fullName, {
      //   httpOnly: true,
      //   maxAge: 60 * 60 * 1000,
      //   domain: 'http://127.0.0.1:5500', 
      //   path: '/client',  
      // });
      // res.cookie('loginTime', Date.now(), {
      //   maxAge: 60 * 60 * 1000
      // });
      // res.cookie('token', data.token, {
      //   maxAge: 60 * 60 * 1000
      // });
       res.status(200).json({ success: true, msg: "Successfully logged in!" });
        
      } else {
        res.status(500).json({success: false, error: "Invalid Username or password!"});
      }
    } catch (error) {
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
        await user.remove();
        res.status(201).json({success: true, msg: "Account Deleted!"});
     
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

export {
  createUser,
  updateUserProfile,
  login,
  logout,
  changePassword,
  deleteAccount,
};
