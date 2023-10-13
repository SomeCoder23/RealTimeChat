import { ChatTypes } from "../@types/types.js";
import db from '../db/dataSource.js';
import { Profile } from "../db/entities/Profile.js";
import { User } from "../db/entities/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {socket} from './chat.js'

const createUser = async (payload: ChatTypes.User) => {
  return db.dataSource.manager.transaction(async transaction => {
   
    try
    {
      //First: Creates User Profile and Saves it 
      const profile = Profile.create({
        fullName: payload.fullName,
        birthday: payload.birthday,
        bio: payload.bio,
      });
      
      await transaction.save(profile);
      console.log("Saved Profile!");
      //Second: Hashes password, creates new user and saves it.
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      const currentDate = new Date();
      const user = User.create({
        username: payload.username,
        password: hashedPassword,
        createdAt: currentDate,
        profile: profile
      });

      await transaction.save(user);

    } catch(error){
      console.log("###ERROR: ");
      console.log(error);
      throw "Failed to register user.";
    }
   
  });
};


const updateUserProfile = async (payload: ChatTypes.Profile, user: User) => {

  return db.dataSource.manager.transaction(async transaction => {
   
    try
    {
      let profile = user.profile;
      profile.fullName = payload.fullName !== undefined ? payload.fullName : profile.fullName;
      profile.birthday = payload.birthday !== undefined ? payload.birthday : profile.birthday;
      profile.bio = payload.bio !== undefined ? payload.bio : profile.bio;
      
      await transaction.save(profile);
  

    } catch(error){
      console.log("###ERROR: ");
      console.log(error);
      throw "Failed to update user profile.";
    }
   
  });

};

const login = async (username: string, password: string) => {
  
    // Implement logic for user login using AWS Cognito or the authentication method 
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
        return { token, fullName: user.profile.fullName };
        
      } else {
        throw ("Invalid Username or password!");
      }
    } catch (error) {
      throw ("Invalid Username or password!");
    }
};


const changePassword = async (passwords: any, user: User) => {

    //  using AWS Cognito or the authentication method
    const passwordMatching = await bcrypt.compare(passwords.old, user?.password || '');
    if(passwordMatching){
      
      if(passwords.new.length < 6)
        throw new Error('Password should contain at least 6 characters!');

      user.password = await bcrypt.hash(passwords.new, 10);
      user.save().then((response) => {
        return "User password updated!";
      }).catch(error => {
        console.error(error);
        throw new Error('Something went wrong');
      });
    }
    else throw new Error("Password incorrect");
};


//deletes user but still needs to deal with user's chats
const deleteAccount = async (id: string) => {
    // Delete all data related with this account from DB/AWS S3 etc...
    try {

      const user = await User.findOneBy({ id });
      if (user) {
        await user.remove();
        return "User Deleted!";
       // res.send('User Deleted');
      } else {
        console.log("User not found");
        throw("User not found :(");
      }
    } catch (error) {
        console.log(error);
        throw("Something went wrong, can't delete user account :(");
    }
    
};

export {
  createUser,
  updateUserProfile,
  login,
  //logout,
  changePassword,
  deleteAccount,
};
