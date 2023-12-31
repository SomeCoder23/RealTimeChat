import express from 'express';
import {
    createUser,
    getUsers,
    updateUserProfile,
    login,
    logout,
    changePassword,
    getContacts,
    searchUsers
  } from '../controllers/user.js';
import {validateUser, validateLogin} from '../middleware/validation/user.js';
import { authenticate } from '../middleware/auth/authenticate.js';
import { User } from '../db/entities/User.js';
import { changeFriendStatus, addContact } from '../controllers/chat.js';
var router = express.Router();

//POST ROUTES
router.post('/login', validateLogin, login);
router.post('/logout', authenticate, logout);
router.post('/register', validateUser ,createUser);
router.post('/contact/:username', authenticate, addContact);

//GET ROUTES
router.get('/', authenticate, getUsers);
router.get('/contacts', authenticate, getContacts);
router.get("/search/:query", searchUsers);
router.get('/status/:username', authenticate, async (req, res) =>{
  try{
    const username = req.params.username;
    const user = await User.findOneBy({username});
    if (user) {
        res.status(200).json({success: true, data: user.profile.status});
      } else {
        res.status(404).json({ success: false, error: 'User not found' });

      }

}catch(error){
    console.error(error);
    res.status(500).json({ success: false, error: 'Something went wrong' });
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

router.get('/profile/:username', authenticate, async (req, res) =>{

  try{
    const username = req.params.username;
    const user = await User.findOneBy({username});
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
router.put('/password', authenticate, changePassword);   
router.put('/relationship', authenticate, changeFriendStatus); 

export default router;