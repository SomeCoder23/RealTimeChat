import express from 'express';
import {
    createChat,
    getChatMessages,
    sendMessage,
    changeFriendStatus,
   // createGroup,
    sendAttachment
  } from '../controllers/chat.js';
  
var router = express.Router();

//POST ROUTES

router.post('/sendMessage/:chatId', (req, res)=>{

  //send text message to the specifies chat
  
}); 

router.post('/sendAttachment/:chatId', (req, res) =>{
  
  //send attachment (file/ image) to the specifies chat

}); 

router.post('/create_group', (req, res) =>{

  //creates new group, specifies participents, name, description(optional) in the body
  //user who creates the group is the only admin (only they can delete the group)

});                

router.post('/start_chat/:userID', (req, res) =>{

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

router.get('/search', (req, res) =>{

  //searches a specific chat for the text specified in the body

});     

router.get('/groupInfo/:chatID', (req, res) =>{

  //gets info of the specified group: name, description, participants...etc

});

router.get('/conversations', (req, res) =>{

  //view all conversations for the user

});          

router.get('/enter_chat/:chatId', (req, res) =>{

  //enter a specific chat with the chat id specified, displays all recent [or should it be ALL??] messages.

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
