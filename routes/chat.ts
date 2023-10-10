import express from 'express';
import {
    createChat,
    getChatMessages,
    sendMessage,
    getChats,
    changeFriendStatus,
   // createGroup,
    sendAttachment
  } from '../controllers/chat.js';
import { Message } from '../db/entities/Message.js';
import { create } from 'domain';
import { Chat } from '../db/entities/Chat.js';
  
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
  sendMessage(req.body, chat, res.locals.user).then(() => {
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

});         

router.post('/remove_participant', (req, res) =>{

  //removes a participent to a group chat
  //userId and chatID specified in the body
  //?? SHould the ADMIN only be able to delete participents??

});  

router.post('/clear_chat/:chatID', (req, res) =>{

  //clears the specified chat
  //it should only clear it for the user who chose to clear the chat not the other participants but HOWWWW??

});    

router.post('/leave_chat/:chatId', (req, res) =>{

  //enables user to leave the specified chat [ has to be a group chat?? ]
});

//GET ROUTES

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

});

router.get('/conversations', (req, res) =>{

  //view all conversations for the user
  getChats(res.locals.user).then((data) => {
    res.status(201).send(data);
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).send(err);
  });

});          

router.get('/enter_chat/:chatId', (req, res) =>{

  //enter a specific chat with the chat id specified, displays all recent [or should it be ALL??] messages.
  getChatMessages(Number(req.params.chatId), res.locals.user).then((data) => {
    res.status(201).send(data);
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).send(err);
  });

});    

router.get('/history/:chatId', (req, res) =>{

  //displays all chat history for the specified chat

}); 

//DELETE ROUTES

router.delete('/delete_message/:messageID', (req, res) =>{

  //deletes the specified message from a chat

});


router.delete('/delete_chat/:chatId', (req, res) =>{

    //deletes a specified chat for the user, so it doesn't appear anymore when they display all conversations
    // if group chat only admin can delete the entire chat, others can leave of they don't want to participate

});



export default router;
