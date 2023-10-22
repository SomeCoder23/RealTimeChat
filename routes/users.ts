import express from 'express';
import {
    createUser,
    getUsers,
    updateUserProfile,
    login,
    logout,
    changePassword,
    deleteAccount,
    getContacts
  } from '../controllers/user.js';
import {validateUser, validateLogin} from '../middleware/validation/user.js';
import { authenticate } from '../middleware/auth/authenticate.js';
import { User } from '../db/entities/User.js';
import { changeFriendStatus, addContact } from '../controllers/chat.js';
var router = express.Router();

//POST ROUTES

//something wrong with setting cookiesssssssssssssssssssssssssssssssssssssssssssss 
//in the browser
router.post('/login', validateLogin, login);
router.post('/logout', authenticate, logout);
router.post('/register', validateUser ,createUser);
router.post('/addContact/:username', authenticate, addContact);

//GET ROUTES
router.get('/', authenticate, getUsers);
router.get('/contacts', authenticate, getContacts);
router.get('/status/:id', authenticate, async (req, res) =>{

  //gets the presence status of the specified user 
  try{
    const id = req.params.id;
    const user = await User.findOne({
        where: {id}
    });
    if (user) {
        res.status(200).json({success: true, data: user.profile.status});
      } else {
        res.status(404).json({ success: false, error: 'User not found' });

      }

}catch(error){
    console.error(error);
    res.status(500).json({ success: false, error: 'Somwthing went wrong' });
}

});

router.get('/profile', authenticate, async (req, res) =>{

    //gets the currently logged in user's profile
    try{
      const user = res.locals.user;
      if (user) {
        res.status(200).json({success: true, data: user.profile, username: user.username});
      } else {
        res.status(404).json({ success: false, error: 'User not found' });
      }
  
  }catch(error){
      console.error(error);
      res.status(500).json({ success: false, error: 'Somwthing went wrong' });
    }
});

router.get('/profile/:userId', authenticate, async (req, res) =>{

  try{
    const id = req.params.userId;
    const user = await User.findOne({
        where: {id}
    });
    if (user) {
      res.status(200).json({success: true, data: user.profile});
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }

  }catch(error){
      console.error(error);
      res.status(500).json({ success: false, error: 'Somwthing went wrong' });
    }
}); 

//PUT ROUTES
router.put('/profile', authenticate, updateUserProfile); 
router.put('/change_password', authenticate, changePassword);   
router.put('/change_relationship', authenticate, changeFriendStatus); 

//DELETE ROUTES
//doesn't work properly :(
router.delete('/deleteAccount', authenticate, deleteAccount);


export default router;