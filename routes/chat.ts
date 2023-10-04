import express from 'express';
import {
    createChat,
    getChatMessages,
    sendMessage,
    changeFriendStatus,
    createGroup,
    sendAttachment
  } from '../controllers/chat.js';
  
var router = express.Router();


            
router.get('/:conversationId/messages', getChatMessages=>{

}); 
router.post('/:conversationId/send', sendMessage=>{

}); 

router.post('/send-message', sendMessage=>{

});               
router.post('/change-friend-status', changeFriendStatus=>{

}); 
router.post('/create-group', createGroup=>{

});                
router.post('/send-attachment', sendAttachment=>{

});         
router.get('/search', search=>{

});                          
router.post('/create-chat', createChat=>{

});                 
router.post('/add-participant', addParticipant=>{

});         
router.post('/remove-participant', removeParticipant=>{

});  
router.post('/clear-chat', clearChat=>{

});                
router.get('/conversations', getConversations=>{

});          
router.get('/enter-chat/:conversationId', enterChat=>{

});    
router.get('/chat-history/:conversationId', getChatHistory=>{

}); 
router.post('/change-password', changeChatPassword=>{

});     
router.delete('/delete-chat/:conversationId', deleteChat=>{

});

export default router;
