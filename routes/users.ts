import express from 'express';
import {
    createUser,
    getUserProfile,
    updateUserProfile,
    login,
    logout,
    changePassword,
    deleteUserAccount,
  } from '../controllers/user.js';

import {validateUser, validateLogin} from '../middleware/validation/user.js';
import { authenticate } from '../middleware/auth/authenticate.js';

var router = express.Router();


//POST ROUTES

router.post('/login', validateLogin, (req, res) =>{
  const username = req.body.username;
  const password = req.body.password;

  login(username, password)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(401).send(err);
    })

});

router.post('/logout', (req, res) =>{

});

router.post('/register', validateUser ,(req, res)  => {
  createUser(req.body).then(() => {
    res.status(201).send("User successfully registered! :)");
  }).catch(err => {
    console.error(err);
    res.status(500).send(err);
  });

})

//should this be PUT ???
router.post('/change_relationship', (req, res) =>{
  
  //change the relationship status with the user specified in the body
  //user can MUTE, BLOCK other users 
  
}); 


//GET ROUTES

router.get('/status/:id', (req, res) =>{

  //gets the presence status of the specified user 

});

//the get profile endpoints also display the status of the user (online/offline)
router.get('/profile', (req, res) =>{

    //gets the currently logged in user's profile
});

router.get('/profile/:userId', (req, res) =>{

}); 


//PUT ROUTES

router.put('/profile', (req, res) =>{

    //updates currently logged in user's profile
    //all new info specified in the body
}); 


router.put('/change_password', (req, res) =>{

  //change users password
  //user should enter old password and new password in the body

});   


//DELETE ROUTES

router.delete('/deleteAccount', (req, res) =>{

  //delete user

});

// router.post('/forgotpassword', (req, res) =>{
//     });
//  router.post('/resetpassword', (req, res) =>{
//         });



export default router;