import express from 'express';
import {
    createUser,
    //getUserProfile,
    updateUserProfile,
    login,
    //logout,
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

router.post('/login', validateLogin, (req, res, next) =>{
  const username = req.body.username;
  const password = req.body.password;

  login(username, password)
    .then((data:any) => {
      console.log(data);
      res.header('Access-Control-Allow-Credentials', 'true');
res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
      res.cookie('fullName', data.fullName, {
        maxAge: 60 * 60 * 1000,
        domain: 'http://127.0.0.1:5500', 
        path: '/client',  
      });
      res.cookie('loginTime', Date.now(), {
        maxAge: 60 * 60 * 1000
      });
      res.cookie('token', data.token, {
        maxAge: 60 * 60 * 1000
      });

      //res.redirect('/client/index.html');
      res.status(200).json({ success: true, msg: "Successfully logged in!" });
    })
    .catch(err => {
      console.log("ERROR: " + err);
      res.status(500).json({ success: false, error: 'Login failed' });
      // next({
      //   code: "INVALID_CREDENTIALS",
      //   message: err
      // });
    })

});

router.post('/logout', authenticate, async (req, res) =>{

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


});

router.post('/register', validateUser ,(req, res)  => {
  console.log('Inside endpoint!');
  console.log("BODY:");
  console.log(req);
  createUser(req.body).then(() => {
    console.log("Successsssssss");
    res.status(200).json({ success: true });
    //res.status(201).send("User successfully registered! :)");
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).json({ success: false, error: 'Registeration failed' });
    //res.status(500).send(err);
  });

})


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
router.put('/profile', authenticate, (req, res) =>{

    //updates currently logged in user's profile
    //all new info specified in the body
    updateUserProfile(req.body, res.locals.user).then(() => {
      res.status(201).json({ success: true, msg: "User profile successfully updated! :)"});
    }).catch(err => {
      console.log("***ERROR: ");
      console.error(err);
      res.status(500).json({ success: false, error: 'Somwthing went wrong' });
    });

}); 


router.put('/change_password', authenticate, (req, res) =>{

  //change users password
  //user should enter old password and new password in the body
  changePassword(req.body, res.locals.user).then(() => {
    res.status(201).json({ success: true, msg: "User password successfully updated! :)"});
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  });

});   

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
//needs fixingg
router.delete('/deleteAccount', authenticate, (req, res) =>{

  //delete user
  deleteAccount(res.locals.user).then(() => {
    res.status(201).send("User successfully deleted! :)");
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).send(err);
  });

});

// router.post('/forgotpassword', (req, res) =>{
//     });
//  router.post('/resetpassword', (req, res) =>{
//         });



export default router;