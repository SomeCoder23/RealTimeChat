import express from 'express';
import {
    createUser,
    getUserProfile,
    updateUserProfile,
    loginUser,
    logoutUser,
    changePassword,
    deleteUserAccount,
  } from '../controllers/user.js';

var router = express.Router();



router.post('/login', (req, res) =>{

});  
router.post('/logout', (req, res) =>{

});
router.post('/register', (req, res)  => {

})

router.get('/profile', (req, res) =>{

    //gets the currently logged in user's profile
});

router.get('/profile/:userId', (req, res) =>{

}); 


router.put('/profile', (req, res) =>{

    //updates currently logged in user's profile
    //all new info specified in the body
}); 


router.put('/change_password', (req, res) =>{

  //change users password
  //user should enter old password and new password in the body

});   

 //should this be PUT ???
router.post('/change_friend_status', (req, res) =>{

  //change the relationship status with the user specified in the body
  //user can MUTE, BLOCK other users 

}); 


router.delete('/deleteAccount', (req, res) =>{

  //delete user

});

// router.post('/forgotpassword', (req, res) =>{
//     });
//  router.post('/resetpassword', (req, res) =>{
//         });



export default router;