import express from 'express';
import {
    createUser,
    //getUserProfile,
    updateUserProfile,
    login,
    logout,
    changePassword,
    deleteAccount,
  } from '../controllers/user.js';
import {validateUser, validateLogin} from '../middleware/validation/user.js';
import { authenticate } from '../middleware/auth/authenticate.js';
import { User } from '../db/entities/User.js';
import { In } from 'typeorm';
import { changeFriendStatus } from '../controllers/chat.js';

var router = express.Router();

//POST ROUTES

//something wrong with setting cookiesssssssssssssssssssssssssssssssssssssssssssss 
//in the browser
router.post('/login', validateLogin, login);

router.post('/logout', authenticate, logout);

//needs minor modifications
router.post('/register', validateUser ,createUser);


//GET ROUTES

//needs to format output
router.get('/', authenticate, async (req: any, res) => {
  try{
      const page = parseInt(req.query.page || '1');
      const pageSize = parseInt(req.query.pageSize || '10');
      const [items, total] = await User.findAndCount({
        skip: pageSize * (page - 1),
        take: pageSize
      });
      
      res.send({
        page: 1,
        pageSize: items.length,
        total,
        items
      });
    } catch(error){
      console.error(error);
      res.status(500).json({ success: false, error: 'Somwthing went wrong' });
    }
    
});

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

//the get profile endpoints also display the status of the user (online/offline)
//probably needs formating
router.get('/profile', authenticate, async (req, res) =>{

    //gets the currently logged in user's profile
    try{
      const user = res.locals.user;
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

//updates profile
router.put('/profile', authenticate, updateUserProfile); 

router.put('/change_password', authenticate, changePassword);   

router.put('/change_relationship', authenticate, (req, res) =>{
  
  //first checks if users are even connected
  //change the relationship status with the user specified in the body
  //user can MUTE, BLOCK other users 
  const status = req.body.status;
  const contact = req.body.username;
  changeFriendStatus(res.locals.user, contact, status).then((data) => {
    res.status(201).json({ success: true, msg: `Relationship status with ${contact} changed successfully!` ,data: data});
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).json({ success: false, error: 'Somwthing went wrong' });

  });
  
}); 


//DELETE ROUTES
//needs work
router.delete('/deleteAccount', authenticate, deleteAccount);

// router.post('/forgotpassword', (req, res) =>{
//     });
//  router.post('/resetpassword', (req, res) =>{
//         });



export default router;