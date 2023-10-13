import express from 'express';
import { authenticate } from '../middleware/auth/authenticate.js';
import {
    createChat,
    getChatMessages,
    sendMessage,
    clearChat,
    sendAttachment,
    getGroupInfo,
    leaveRoom,
    getChats,
    addParticipant,
    removeParticipant,
    deleteMessage
  } from '../controllers/chat.js';
import { Chat } from '../db/entities/Chat.js';
import db from '../db/dataSource.js';
import { In } from 'typeorm';


  
var router = express.Router();

//POST ROUTES

//FOR TESTING
// router.get('/sendMessage/:message', (req, res)=>{

//   const message = req.params.message;
//   const newMsg = new Message();
//   newMsg.content = message;
//   sendMessage(newMsg).then(() => {
//     res.status(201).send("Message sent!");
//   }).catch(err => {
//     console.log("***ERROR: ");
//     console.error(err);
//     res.status(500).send(err);
//   });

  
// }); 

router.post('/sendMessage/:chatId', (req, res)=>{

  //send text message to the specifies chat
  const chat = Number(req.params.chatId);
  const user = res.locals.user;
  console.log("USER: " + user.profile.fullName + " ID: " + user.id);
  sendMessage(req.body, chat, user).then(() => {
    res.status(201).send("Message sent!");
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).send(err);
  });
  
}); 

router.post('/sendAttachment/:chatId', (req, res) =>{
  
  //send attachment (file/ image) to the specifies chat

}); 

router.post('/create_group', (req, res) =>{

  //creates new group, specifies participents, name, description(optional) in the body
  //user who creates the group is the only admin (only they can delete the group)
  createChat(req.body, "g", res.locals.user).then(() => {
    res.status(201).send("Chat created!");
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).send(err);
  });


});                

router.post('/start_chat/:username', (req, res) =>{

  //const username = req.params.username;
  createChat(req.params, "u", res.locals.user).then(() => {
    res.status(201).send("Chat created!");
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).send(err);
  });

    //starts a one-to-one chat with a specific user

});           

router.post('/add_participant', (req, res) =>{

  //adds a participent to a group chat
  //userId and chatID specified in the body
  //?? SHould the ADMIN only be able to add participents??
  try{ 
    addParticipant(req.body.chatID, res.locals.user, req.body.userID).then(() => {
    res.status(201).send("Chat created!");
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).send(err);
  });} catch(error){
    console.log(error);
    res.status(500).send("Failure");
  }

});         

router.post('/remove_participant', (req, res) =>{

  //removes a participent to a group chat
  //userId and chatID specified in the body
  //?? SHould the ADMIN only be able to delete participents??
  try{ 
    removeParticipant(req.body.chatID, res.locals.user, req.body.userID).then(() => {
    res.status(201).send("Chat created!");
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).send(err);
  });} catch(error){
    console.log(error);
    res.status(500).send("Failure");
  }

});  

router.post('/clear_chat/:chatID', async (req, res) =>{

  //clears the specified chat
  //it should only clear it for the user who chose to clear the chat not the other participants but HOWWWW??
  const id = Number(req.params.chatID);
  clearChat(id, res.locals.user).then((data) => {
    res.status(201).send(data);
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).send(err);
  });

});    

router.post('/leave_chat/:chatId', (req, res) =>{

  //enables user to leave the specified chat [ has to be a group chat?? ]
  try{ 
    removeParticipant(Number(req.params.chatId), res.locals.user, res.locals.user).then(() => {
    res.status(201).send("Chat created!");
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).send(err);
  });} catch(error){
    console.log(error);
    res.status(500).send("Failure");
  }
});

//done
router.post('/leave', (req, res) =>{
    getChats(res.locals.user).then(data => {
      res.status(200).send(data);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send("Something went wrong!!!!");
    });
    
});

//GET ROUTES

//Only for TESTING
router.get('/', async (req: any, res) => {
  try{
      const page = parseInt(req.query.page || '1');
      const pageSize = parseInt(req.query.pageSize || '10');
      const [items, total] = await Chat.findAndCount({
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
      res.status(500).send("Something went wrong!!!!");
    }
    
});

router.get('/search', (req, res) =>{

  //searches a specific chat for the text specified in the body

});     

router.get('/groupInfo/:chatID', (req, res) =>{

  //gets info of the specified group: name, description, participants...etc
  const id = Number(req.params.chatID);
  getGroupInfo(id, res.locals.user).then( data => {
    res.status(200).send(data);
  })
  .catch(error => {
    console.log(error);
    res.status(500).send("Failed to display group info.");
  })


});

router.get('/conversations', async (req: any, res) =>{

  //view all conversations for the user
  getChats(res.locals.user).then(data => {
    res.status(200).send(data);
  })
  .catch(error => {
    console.error(error);
    res.status(500).send("Something went wrong!!!!");
  });
});          

router.get('/enter_chat/:chatId', async (req, res) =>{

  //enter a specific chat with the chat id specified, displays all recent [or should it be ALL??] messages.
  getChatMessages(Number(req.params.chatId), res.locals.user)
  .then((data) => {
    console.log(data);
    try{
      let messages: any = [];
      data.forEach(message => {
        messages.push(message.content);
      })
      res.status(201).send(messages);
    }catch(error){
      console.log(error);
      res.status(500).send("Something went wrong");
    }
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).send(err);
  });

});    

router.get('/history/:chatId', (req, res) =>{

  //displays all chat history for the specified chat
  getChatMessages(Number(req.params.chatId), res.locals.user)
  .then((data) => {
    console.log(data);
    try{
      let messages: any = [];
      data.forEach(message => {
        messages.push(message.content);
      })
      res.status(201).send(messages);
    }catch(error){
      console.log(error);
      res.status(500).send("Something went wrong");
    }
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).send(err);
  });

}); 

//DELETE ROUTES

router.delete('/delete_message/:messageID', (req, res) =>{

  //deletes the specified message from a chat
  deleteMessage(Number(req.params.messageID), res.locals.user).then((data) => {
  res.status(201).send(data);
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).send(err);
  });

});


router.delete('/delete_chat/:chatId', (req, res) =>{

    //deletes a specified chat for the user, so it doesn't appear anymore when they display all conversations
    // if group chat only admin can delete the entire chat, others can leave of they don't want to participate

});



export default router;
