import express from 'express';
import { authenticate } from '../middleware/auth/authenticate.js';
import {
    createChat,
    getChatMessages,
    sendMessage,
    clearChat,
    getGroupInfo,
    leaveRoom,
    getChats,
    addParticipant,
    removeParticipant,
    deleteMessage,
    addContact,
    getHistory
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
router.post('/sendMessage/:chatId', (req, res, next) => sendMessage(req, res, next, "text")); 
//needs some modifications
router.post('/sendAttachment/:chatId', upload.single('file'), (req, res, next) => sendMessage(req, res, next, "attachment")); 
router.post('/create_group', createChat);                
router.post('/start_chat/:username', createChat);           
//i still forgot to test these two
router.post('/add_participant', addParticipant);         
router.post('/remove_participant', removeParticipant);  
//needs some modifications
router.post('/clear_chat/:chatId', clearChat);    
router.post('/addContact/:username', addContact);
//not done 
router.post('/leave_chat/:chatId', (req, res) =>{
  res.send("Leaving chat...");
  //enables user to leave the specified chat [ has to be a group chat?? ]
  // try{ 
  //   removeParticipant(Number(req.params.chatId), res.locals.user, res.locals.user).then(() => {
  //     res.status(200).json({success: true, msg: "Left chatroom!"});
  //   }).catch(err => {
  //   console.log("***ERROR: ");
  //   console.error(err);
  //   res.status(500).send(err);
  // });} catch(error){
  //   console.log(error);
  //   res.status(500).json({success: false, error: "Problem occurred."});
  // }
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
//not started*********************************
router.get('/search', (req, res) =>{

  //searches a specific chat for the text specified in the body

});     
router.get('/groupInfo/:chatId', getGroupInfo);
router.get('/conversations', getChats);          
router.get('/getMessages/:chatId', getChatMessages);    
//not done
router.get('/history/:chatId', getHistory); 

//DELETE ROUTES
router.delete('/delete_message/:messageId', deleteMessage);

//not started
router.delete('/delete_chat/:chatId', (req, res) =>{

    //deletes a specified chat for the user, so it doesn't appear anymore when they display all conversations
    // if group chat only admin can delete the entire chat, others can leave of they don't want to participate

});


export default router;
