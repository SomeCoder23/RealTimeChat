import { ChatTypes } from "../@types/types.js";
import db from '../db/dataSource.js';
import { Profile } from "../db/entities/Profile.js";
import { User } from "../db/entities/User.js";
import bcrypt from 'bcrypt';

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
      
      //Second: Hashes password, creates new user and saves it.
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      const currentDate = new Date();
      const user = User.create({
        userName: payload.userName,
        password: hashedPassword,
        createdAt: currentDate,
        profile: profile
      });

      await transaction.save(user);

    } catch(error){
      console.log(error);
      throw "Failed to register user.";
    }
   
  });
};


const getUserProfile = async (userID: string) => {};


const updateUserProfile = async (userID: string, profile: ChatTypes.Profile) => {};


const login = async (username: string, password: string) => {
  
    // Implement logic for user login using AWS Cognito or the authentication method 
};


const logout = async (userID: string) => {
};


const changePassword = async (oldPassword: string, newPassword: string) => {

    //  using AWS Cognito or the authentication method
};


const deleteUserAccount = async (userID: string) => {
    // Delete all data related with this account from DB/AWS S3 etc...
};

export {
  createUser,
  getUserProfile,
  updateUserProfile,
  login,
  logout,
  changePassword,
  deleteUserAccount,
};
