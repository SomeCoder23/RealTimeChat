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
    deleteMessage,
    addContact
  } from '../controllers/chat.js';
import { Chat } from '../db/entities/Chat.js';
import db from '../db/dataSource.js';
import { In } from 'typeorm';
import { fileURLToPath } from 'url';
import path from 'path';
import multer from 'multer';

var router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'uploads/');
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage });
router.use("/uploads", express.static(path.join(__dirname, "uploads")));
  

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
  sendMessage(req.body.content, chat, user, "text").then(() => {
    res.status(200).json({success: true, data: req.body.content});
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).json({success: false, error: "Failed to send."});
  });
  
}); 

router.post('/sendAttachment/:chatId', upload.single('file'), (req, res) =>{
  
  //send attachment (file/ image) to the specifies chat

  if (!req.file) {
    res.status(500).json({success: false, error: "Failed Upload File!"});
    return;
  }
  const fileURL = req.file.destination + req.file.filename;
  const chat = Number(req.params.chatId);
  const user = res.locals.user;
  console.log("USER: " + user.profile.fullName + " ID: " + user.id);
  sendMessage(fileURL, chat, user, "attachment").then(() => {
    res.status(200).json({success: true, data: fileURL});
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).json({success: false, error: "Failed to send."});
  });

}); 

router.post('/create_group', (req, res) =>{

  //creates new group, specifies participents, name, description(optional) in the body
  //user who creates the group is the only admin (only they can delete the group)
  createChat(req.body, "g", res.locals.user).then((data) => {
    res.status(201).json({success: true, data: data});
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).json({success: false, error: "Failed to create group."});
  });


});                

router.post('/start_chat/:username', (req, res) =>{

  //const username = req.params.username;
  createChat(req.params, "u", res.locals.user).then((data) => {
    res.status(201).json({success: true, data: data});
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).json({success: false, error: "Failed to start chat."});
  });

    //starts a one-to-one chat with a specific user

});           

router.post('/add_participant', (req, res) =>{

  //adds a participent to a group chat
  //userId and chatID specified in the body
  //?? SHould the ADMIN only be able to add participents??
  try{ 
    addParticipant(req.body.chatID, res.locals.user, req.body.userID).then(() => {
      res.status(201).json({success: true, msg: "Participant added!"});
    }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).json({success: false, error: "Failed to add participant."});
  });} catch(error){
    console.log(error);
    res.status(500).json({success: false, error: "Failed to add participant."});
  }

});         

router.post('/remove_participant', (req, res) =>{

  //removes a participent to a group chat
  //userId and chatID specified in the body
  //?? SHould the ADMIN only be able to delete participents??
  try{ 
    removeParticipant(req.body.chatID, res.locals.user, req.body.userID).then(() => {
      res.status(201).json({success: true, msg: "Participant removed!"});
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).json({success: false, error: "Failed to remove participant."});
  });} catch(error){
    console.log(error);
    res.status(500).json({success: false, error: "Failed to remove participant."});
  }

});  

router.post('/clear_chat/:chatID', async (req, res) =>{

  //clears the specified chat
  //it should only clear it for the user who chose to clear the chat not the other participants but HOWWWW??
  const id = Number(req.params.chatID);
  clearChat(id, res.locals.user).then((data) => {
    res.status(200).json({success: true, data: data, msg: "Cleared chat!"});
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).json({success: false, error: "Failed to clear chat."});
  });

});    

router.post('/addContact/:username', (req, res) => {
  const username = req.params.username;
  addContact(res.locals.user, username).then(data => {
    res.status(200).json({success: true, msg: "New contact added!"});
  }).catch(err => {
    console.log(err);
    res.status(500).json({success: false, error: "Problem adding contact."});
  })
});

//not done
router.post('/leave_chat/:chatId', (req, res) =>{

  //enables user to leave the specified chat [ has to be a group chat?? ]
  try{ 
    removeParticipant(Number(req.params.chatId), res.locals.user, res.locals.user).then(() => {
      res.status(200).json({success: true, msg: "Left chatroom!"});
    }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).send(err);
  });} catch(error){
    console.log(error);
    res.status(500).json({success: false, error: "Problem occurred."});
  }
});

//i'm not sure what this for anymore
router.post('/leave', (req, res) =>{
    getChats(res.locals.user).then(data => {
      res.status(200).json({success: true, data: data, msg: "Left chat for good!"});
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({success: false, error: "Problem occurred."});
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
      res.status(500).json({success: false, error: "Problem occurred."});
    }
    
});

router.get('/search', (req, res) =>{

  //searches a specific chat for the text specified in the body

});     

router.get('/groupInfo/:chatID', (req, res) =>{

  //gets info of the specified group: name, description, participants...etc
  const id = Number(req.params.chatID);
  getGroupInfo(id, res.locals.user).then( data => {
    res.status(200).json({success: true, data: data});
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({success: false, error: "Problem occurred."});
  })


});

router.get('/conversations', async (req: any, res) =>{

  //view all conversations for the user
  getChats(res.locals.user).then(data => {
    res.status(200).json({ success: true, chats: data });
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ success: false, error: 'Something went wrong' });
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
      res.status(200).json({success: true, data: messages});
    }catch(error){
      console.log(error);
      res.status(500).json({success: false, error: "Problem occurred."});
    }
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).json({success: false, error: "Problem occurred."});
  });

});    


//not done
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
      res.status(200).json({success: true, data: messages});
    }catch(error){
      console.log(error);
      res.status(500).json({success: false, error: "Problem occurred."});
    }
  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).json({success: false, error: "Problem occurred."});
  });

}); 

//DELETE ROUTES

router.delete('/delete_message/:messageID', (req, res) =>{

  //deletes the specified message from a chat
  deleteMessage(Number(req.params.messageID), res.locals.user).then((data) => {
    res.status(200).json({success: true, data: data, msg: "Deleted message!"});

  }).catch(err => {
    console.log("***ERROR: ");
    console.error(err);
    res.status(500).json({success: false, error: "Problem occurred."});
  });

});


router.delete('/delete_chat/:chatId', (req, res) =>{

    //deletes a specified chat for the user, so it doesn't appear anymore when they display all conversations
    // if group chat only admin can delete the entire chat, others can leave of they don't want to participate

});



export default router;
