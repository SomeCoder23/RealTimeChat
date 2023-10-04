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



router.post('/login', loginUser=>{

});  
router.post('/logout', logoutUser=>{

});
router.post('/register', createUser => {

})
router.get('/profile/:userId', getUserProfile=>{

}); 
router.put('/profile/:userId', updateUserProfile=>{

}); 
router.delete('/user/remove/:id', deleteUserById=>{

});

router.put('/change-password', changePassword=>{
 }); 
 
// router.post('/forgotpassword', forgotPassword=>{
//     });
//  router.post('/resetpassword', resetPassword=>{
//         });



export default router;