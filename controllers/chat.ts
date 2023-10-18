import { ChatTypes } from "../@types/types.js";
import ioClient from 'socket.io-client';
import { Message } from "../db/entities/Message.js";
import { User } from "../db/entities/User.js";
import { Chat } from "../db/entities/Chat.js";
import { In, MoreThan } from "typeorm";
import db from '../db/dataSource.js';
import { Contacts } from "../db/entities/Contacts.js";
//const socket = ioClient('http://localhost:5000');
import express from 'express';

//NOTE #1: if there are no valid participants DO NOT CREATE GROUP
//NOTE #2: if one-to-one chat already exists do not create. (duhh of course)
const createChat = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const currentUser = res.locals.user;
  let chatName, desc;
  let participants;
  let type = "1to1";
  const currentTime = new Date();

  try {
    //if its a group chat
    if (!req.params.username) {
      desc = req.body.description;
      chatName = req.body.name;
      type = "group";

      try{
        const users = await User.find({
          where: {
            username: In(req.body.participants)
          }
        });
        participants = users;

      } catch(err){
        console.log(err);
        res.status(401).json({success: false, error: "Participant(s) username invalid"});
        return;
      }
    } else {
      //if its ont-to-one chat
      const username = req.params.username;
      const user = await User.findOneBy({ username });
      if (user) {
        console.log("User " + user.profile.fullName + " found!!");
        participants = [user];
        desc = "A one-to-one chat";
        chatName = user.username;

        //adds to contact....maybe should have its own endpoint?
      //   try {
      //     // addContact(currentUser , user.username);
      //     // addContact(user, currentUser.username);
      // } catch (error) {
      //   console.error(error);
      //   res.status(500).json({success: false, error: 'Problem Occurred'});
      // }


      } else {
        res.status(401).json({success: false, error: "Participant not found."});
        return;
      }
    }

    participants.push(currentUser);
    const newChat = Chat.create({
      name: chatName,
      description: desc,
      createdAt: currentTime,
      participants: participants,
      type: type == "group" ? "group" : "1To1"
    });

    try {
      newChat.save().then((response) => {
        console.log("Chat created :)");
        //socket.emit("joinRoom", response.id);
        res.status(201).json({success: true, msg: "Created chat successfully!", data: response});
      }).catch(error => {
        console.error(error);
        res.status(500).json({success: false, error: 'Problem Occurred'});
        return;
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({success: false, error: 'Problem Occurred'});
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({success: false, error: "Failed to create chat."});
  }
}

//gets the messages of the last 24 hours
const getChatMessages = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const id : number = Number(req.params.chatId);
  const user = res.locals.user;
  const date = new Date();

  const chat = await validate(id, user);

  if(chat){
    const messages = chat.messages.filter(message => message.timeSent > new Date(date.getTime() - 24 * 60 * 60 * 1000))
    //format messages so to only send: sender's username, message content, and time sent
    const formatedMessages = await formatMessages(messages);
    res.status(200).json({success: true, data: formatedMessages});
  }
  else res.status(401).json({success: false, error: 'Chat not found'});
  
}

const getGroupInfo = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const id = Number(req.params.chatId);
  const user = res.locals.user;

  const group = await validate(id, user);
  if(group && group?.type === 'group'){
    res.status(200).json({success: true, data: formatChatInfo(group)});
  } else 
     res.status(400).json({success: false, error: 'Group not found'});

}

const sendMessage = async ( req: express.Request, res: express.Response, next: express.NextFunction, type: string) => {
  const user = res.locals.user;
  const id = Number(req.params.chatId);
  let message = req.body.content;

  //checks if chat exists 
  const chat = await validate(id, user);
  if(chat){
    const currentTime = new Date(); 

    if(type == "attachment"){
      //saves attachment to file on server
      if (!req.file) {
        res.status(500).json({success: false, error: "Failed Upload File!"});
        return;
      }
      const fileURL = req.file.destination + req.file.filename;
      message = fileURL;
    }

    const newMsg = Message.create({
      content: message,
      timeSent: currentTime,
      chat_id: id,
      type: type.toLowerCase() === 'attachment' ? "attachment" : "text",
      sender: user.id
    }); 
    
    //then sends message
   
      newMsg.save().then((response) => {
        //return socket.emit('message', newMsg.content);
        res.status(201).json({success: true, msg: "Message saved!", data: newMsg.content});
      }).catch(error => {
        console.error(error);
        res.status(500).json({success: false, error: 'Problem Occurred'});
      });   

  } else res.status(400).json({success: false, error: "Chat not found."});

}

//NOTE: clears chat for all participants. Maybe should fix that.
const clearChat = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const id = Number(req.params.chatId);
  const user = res.locals.user;

  const chat = await validate(id, user);
    if(chat){
      chat.messages = [];
      chat.save().then((response) => {
        res.status(201).json({success: true, msg: "Chat cleared.", data: response})
      }).catch(error => {
        console.error(error);
        res.status(500).json({success: false, error: 'Problem Occurred'});
      });
      
    }else res.status(400).json({success: false, error: 'Chat not found.'});

}

const leaveRoom = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {}

//NOTE: needs formating
const getChats = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = res.locals.user;
  try{
        const userId = user.id;
        const results = await db.dataSource.manager.query('SELECT chatId FROM chat_participants_user WHERE userId = ?', [userId]);
        const chatIds = results.map((row : any) => row.chatId);
    
        const chats = await Chat.find({
          where: {
            id: In(chatIds),
          },
        });
        //leaveRoom();
        res.status(200).json({success: true, data: chats});
    
      } catch(error){
        console.error(error);
        res.status(500).json({success: false, error: "Problem occurred"});

      }
}

//NOTE: might needs to be changed so as to get history from S3 aws bucket maybe?
const getHistory = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const id : number = Number(req.params.chatId);
  const user = res.locals.user;
  const chat = await validate(id, user);
  if(chat){  
    const formatedMessages = await formatMessages(chat.messages);
    res.status(200).json({success: true, data: formatedMessages});
  }
  else res.status(401).json({success: false, error: 'Chat not found'});
}

//NOTE: if entered user already a participant send appropriate message
const addParticipant = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = res.locals.user;
  const id = Number(req.body.chatID);
  const username = req.body.username;

  const chat = await validate(id, user);
  if(chat && chat.type == "group"){
    const newUser = await User.findOneBy({username});
    if(newUser){
    chat.participants.push(newUser);
    chat.save().then(response => {
      res.status(200).json({success: true, data: response, msg: `${username} added successfully.`});
    }).catch(error => {
      console.log(error);
      res.status(500).json({success: false, error: "Problem occurred"});
    })
  } else res.status(400).json({success: false, error: "Invalid participant username."});


  } else res.status(400).json({success: false, error: "Chat not found"});
}

// //NOTE: maybe should add admin attribute to chat, and only allow admin to remove
//NOTE: check if entered user is even the chat 
//DID NOT WORK, NEED TO DELETE IT FROM JOINED TABLE***************
const removeParticipant = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = res.locals.user;
  const id = Number(req.body.chatID);
  const username = req.body.username;

  const chat = await validate(id, user);
  if(chat  && chat.type == "group"){
    const oldUser = await User.findOneBy({username});
    if(oldUser){
      const participants = chat?.participants.filter(p => p !== oldUser);
      chat.participants = participants;
      chat.save().then(response => {
        res.status(201).json({success: true, msg: `${username} removed successfully`, data: response});
      }).catch(error => {
        console.log(error);
        res.status(500).json({success: false, error: "Problem occurred"});
      })
    } else res.status(400).json({success: false, error: "Participant username invalid"});

  } else res.status(400).json({success: false, error: "Chat or participant invalid"});

}

const deleteMessage = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = res.locals.user;
  const id = Number(req.params.messageId);
  const message = await Message.findOneBy({id});
  if(message){ 
    if(message.sender.toString() === user.toString()){
      console.log("Yup, this person sent it.");
      try{
        await message.remove();
        res.status(200).json({success: true, msg: "Message Deleted"});
      }catch(err){
        console.log(err);
        res.status(500).json({success: false, error: "Problem occurred"});
      }
    } else res.status(400).json({success: false, error: "Can't delete a message you didn't send dude."});
  } else res.status(400).json({success: false, error: "Message not found"});
}

//NOTE: needs to check if contact already exists before creating one.
const addContact = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = res.locals.user;
  const username = req.params.username;

  const other = await User.findOneBy({username});
  if(other){
    const date = new Date();
    const contact = Contacts.create({
      user: user,
      contact: other,
      createdAt: date
    });
    
    try {
      db.dataSource.manager.transaction(async (transaction) => {
        await transaction.save(contact);
        res.status(200).json({success: true, msg: "Added new contact!", data: contact});
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({success: false, error: "Problem occurred"});
    }
  } else {
    res.status(400).json({success: false, error: "This other person doesn't seem to exist :("});
  }
}

const changeFriendStatus = async ( req: express.Request, res: express.Response, next: express.NextFunction) =>{
  const status = req.body.status;
  const username = req.body.username;
  const user = res.locals.user;

  const contact : any = await User.findOneBy({username});
  if(contact){
    const contactsRepo = db.dataSource.getRepository(Contacts);
    const relationship = await contactsRepo.find({
      where: {
        user: user,
        contact: contact
      }
    });

    if(relationship[0]){
    switch(status.toLowerCase()){
      case 'b': case 'block': case 'blocked': relationship[0].relationshipStatus = "blocked"; break;
      case 'm': case 'mute': case 'muted': relationship[0].relationshipStatus = "muted"; break;
      default: relationship[0].relationshipStatus = "normal";
    }

    relationship[0].save().then((response) => {
      res.status(201).json({success: true, msg: "Status updated successfully!", data: relationship[0]});
    }).catch(error => {
      console.error(error);
      res.status(500).json({success: false, error: 'Problem occurred'});
    });

  } else res.status(401).json({success: false, error: 'Contact does not exist. Would you like to create one?'});

  } else{
    res.status(401).json({success: false, error: 'Other user not found.'});
  }

}


// const leaveRoom = () => {
//   return socket.emit("leaveRoom");
// }

//checks if chat exists and user is a participant
const validate = async (id: number, user: User) => {
  //checks if chat exists 
  const chat = await Chat.findOneBy({id});
  if(chat){
    //then checks if current user is a participant
    for (const participant of chat.participants){
      if(participant.id == user.id)
        return chat
    } 
  }
  return false; 
}

const formatChatInfo = (chat: Chat) => {
  const usernames = chat.participants.map((user) => user.username);
  return {
    name: chat.name,
    description: chat.description,
    createdAt: chat.createdAt,
    participants: usernames
  }
}

const formatMessages = async (messages: Message[]) => {
  const senders = messages.map(message => message.sender);
  //const usernames = users.map(user => user.username);
  let formatedMessages : any[] = [];

  for(let i = 0; i < messages.length; i++){
    formatedMessages.push({sender: senders[i].toString(), message: messages[i].content, sentAt: messages[i].timeSent});
  }
  return formatedMessages;
}



export {
  createChat,
  getChatMessages,
  sendMessage,
  changeFriendStatus,
  getGroupInfo,
  clearChat,
  leaveRoom,
  getChats,
  getHistory,
  addParticipant,
  removeParticipant,
  deleteMessage,
  addContact
};