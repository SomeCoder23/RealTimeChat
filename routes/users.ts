import express from 'express';
import {
    createUser,
    getUserProfile,
    updateUserProfile,
    login,
    //logout,
    changePassword,
    deleteUserAccount,
  } from '../controllers/user.js';
import {validateUser, validateLogin} from '../middleware/validation/user.js';
import { authenticate } from '../middleware/auth/authenticate.js';

var router = express.Router();

//POST ROUTES

router.post('/login', validateLogin, (req, res, next) =>{
  const username = req.body.username;
  const password = req.body.password;

  login(username, password)
    .then(data => {
      res.cookie('fullName', data.fullName, {
        maxAge: 60 * 60 * 1000
      });
      res.cookie('loginTime', Date.now(), {
        maxAge: 60 * 60 * 1000
      });
      res.cookie('token', data.token, {
        maxAge: 60 * 60 * 1000
      });

      res.send("Successfully logged in! :)");
    })
    .catch(err => {
      res.send("Something went wrong :(");
      console.log("ERROR: " + err);
      // next({
      //   code: "INVALID_CREDENTIALS",
      //   message: err
      // });
    })

});

router.post('/logout', (req, res) =>{

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

  res.send("Successfully logged out! :)");

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
router.get('/profile', authenticate, (req, res) =>{

    //gets the currently logged in user's profile
    res.send("Welcome! :)");
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