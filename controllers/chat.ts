import { ChatTypes } from "../@types/types.js";
import ioClient from 'socket.io-client';
import { Message } from "../db/entities/Message.js";
import { User } from "../db/entities/User.js";
import { Chat } from "../db/entities/Chat.js";
import { ILike, In, Like, MoreThan } from "typeorm";
import db from '../db/dataSource.js';
import { Contacts } from "../db/entities/Contacts.js";
//const socket = ioClient('http://localhost:5000');
import express, { response } from 'express';
import { UserChat } from "../db/entities/UserChat.js";

//NOTE: when creating a one-to-one chat should i add the users to each others contacts if not added already????
const createChat = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const currentUser = res.locals.user;
  let chatName, desc;
  let participants;
  let type = "1to1";
  let userChats :UserChat[] = [];
  const currentTime = new Date();

  try {
    //if its a group chat
    if (!req.body.username) {
      desc = req.body.description;
      chatName = req.body.name;
      type = "group";

      try{
        const users = await User.find({
          where: {
            username: In(req.body.participants)
          }
        });
        if(users.length < 1){
          res.status(400).json({success: false, error: "No valid participants"}); 
          return;
        }
        participants = users;
        participants.push(currentUser);
        for(let i = 0; i < participants.length; i++){
          const userChat = await UserChat.create({
            name: chatName,
            user: participants[i],
          });
          userChats.push(userChat);
        }

      } catch(err){
        console.log(err);
        res.status(401).json({success: false, error: "Participant(s) username invalid"});
        return;
      }
    } else {
      //if its ont-to-one chat
      const username = req.params.username;
      const user:any = await User.findOneBy({ username });
      if (user) {
        //check if there already exits a chat.
        const chats1 = await UserChat.find({where: {user: currentUser}})
        const filteredChats = chats1.filter(chat => {if (chat.chat.type === "1To1" && chat.name === user.username) return chat;});
        // let chats2 = await UserChat.find({where: {user: user, chat: In(filteredChats)}})
         if(filteredChats.length > 0){
          res.status(409).json({success: false, error: "Chat already exists", data: filteredChats});
          return;
        }

        participants = [user];
        desc = "A one-to-one chat";
        //chatName = user.username;
        const user1 = await UserChat.create({
          user: user,
          name: currentUser.username
        });
        const user2 = await UserChat.create({
          user: currentUser,
          name: user.username
        });
        userChats.push(user1, user2);
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

    const newChat = Chat.create({
      //name: chatName,
      description: desc,
      createdAt: currentTime,
      type: type == "group" ? "group" : "1To1"
    });

    

    try {
      db.dataSource.manager.transaction(async (transaction) => {
        await transaction.save(newChat);
        for(let i = 0; i < userChats.length; i++){
        userChats[i].chat = newChat;
        await transaction.save(userChats[i]);
      }
      res.status(201).json({success: true, msg: "Created chat successfully!", data: response});
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
    console.log("Inside....");
    //format messages so to only send: sender's username, message content, and time sent
    const formatedMessages = await formatMessages(messages);
    res.status(200).json({success: true, data: formatedMessages});
    //res.sendFile(__dirname + '/client/main.html');
  }
  else {
    res.status(401).json({success: false, error: 'Chat not found'});
    //res.render('chats', { err: "not found" });
}
  
}


const getGroupInfo = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const id = Number(req.params.chatId);
  const user = res.locals.user;

  const group: any = await validate(id, user);
  if(group /*&& group.chat.type === 'group'*/){
    // const userChat = await UserChat.find({
    //   where: {
    //     chat: group,
    //     user: user
    //   }
    // });
    const chatInfo = await formatChatInfo(group, user);
    res.status(200).json({success: true, data: chatInfo});
  } else 
     res.status(400).json({success: false, error: 'Group not found'});

}

//NOTE: change the code for attachments so it uploads it to s3 not folder uploads folder
const sendMessage = async ( req: express.Request, res: express.Response, next: express.NextFunction, type: string) => {
  const user = res.locals.user;
  const id = Number(req.params.chatId);
  let message = req.body.content;
  console.log("SENDING....SENDING....");
  //checks if chat exists 
  const chat:any = await validate(id, user);
  if(chat){
    const currentTime = new Date(); 

    if(type == "attachment"){
      //saves attachment to file on server
      type = req.body.type;
      console.log("The file: ");
      console.log(req.file);
      if (!req.file) {
        res.status(500).json({success: false, error: "Failed Upload File!"});
        return;
      }
      const fileURL = "../" + req.file.destination + req.file.filename;
      message = fileURL;
      console.log("FILE:", fileURL);
    }

    const newMsg = Message.create({
      content: message,
      timeSent: currentTime,
      chat_id: chat.chat.id,
      type: type.toLowerCase() === 'image' ? "image" : type.toLowerCase() == "file"? "file": "text",
      sender: user.id
    }); 
    
    try {
      db.dataSource.manager.transaction(async (transaction) => {
        await transaction.save(newMsg);
        const userChats = await UserChat.find({where: {chat: chat.chat}});
        console.log(userChats.length);
        console.log(userChats);
        //only add message to users who haven't blocked the chat
        const updatedUserChats = [];
        for(let i = 0; i < userChats.length; i++){
          if(userChats[i].status != "blocked"){
            console.log("Adding message to: ", userChats[i].user.username)
            userChats[i].messages.push(newMsg);
            userChats[i].lastEntry = newMsg.timeSent;
            updatedUserChats.push(userChats[i]);
           // await transaction.save(userChats[i])
          }      
        }
        await transaction.save(updatedUserChats);
        const formatedMsg = {message: newMsg.content, time: newMsg.timeSent, sender: user.username};
      res.status(201).json({success: true, msg: "Created message successfully!", data: formatedMsg});
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({success: false, error: 'Problem Occurred'});
      return;
    }
  
  } else res.status(400).json({success: false, error: "Chat not found."});

}


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

//NOTE: after user leaves a chat they can no longer see it listed in their conversations, should i 
//maybe change that so they don't see any new messages only????? LATER
const leaveRoom = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  req.body.username = res.locals.user.username;
  req.body.chatID = req.params.chatId;
  removeParticipant(req, res, next);
}

const getChats = async ( req: express.Request, res: express.Response, next: express.NextFunction, user: any) => {
  //const user = res.locals.user;
  console.log("INSIDDEEE GET CHATS...");
  try{
        const userChats = await UserChat.find({where: {user: user}, order: {
          lastEntry: "DESC" 
        }});
        if(userChats){
        console.log("USER CHATS: ");
        console.log(userChats);
        let formatedChats = [];
        for(let i = 0; i < userChats.length; i++){
          const chatty = await formatChatInfo(userChats[i], user);
          formatedChats.push(chatty);
        }
        console.log("READY TO SEND....");
        //return 200;
        res.status(200).json({success: true, totalChats: formatedChats.length, data: formatedChats});
      }
    
      } catch(error){
        console.log(error);
        //return error;
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

const addParticipant = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = res.locals.user;
  const id = Number(req.body.chatID);
  const username = req.body.username;

  const chat:any = await validate(id, user);
  //ONLY add participants to group chat
  if(chat && chat.chat.type == "group"){
    const newUser:any = await User.findOneBy({username});
    if(!newUser) {
      res.status(400).json({success: false, error: "Invalid participant username."});
      return;
    }
    //checks if user already a participant, if so send an error message
    const exists = await UserChat.findOne({where: {user: newUser, chat: chat.chat}})
    if(exists){
      res.status(400).json({success: false, error: "Participant already added to group"}); 
      return;
    }
    const newParticipant = await UserChat.create({
      name : chat.name,
      user: newUser,
      chat: chat.chat
    })
      newParticipant.save().then(response => {
      res.status(200).json({success: true, data: response, msg: `${username} added successfully.`});
    }).catch(error => {
      console.log(error);
      res.status(500).json({success: false, error: "Problem occurred"});
    })
  } else res.status(400).json({success: false, error: "Chat not found"});
}

// //NOTE: maybe should add admin attribute to chat, and only allow admin to remove
const removeParticipant = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = res.locals.user;
  const id = Number(req.body.chatID);
  const username = req.body.username;

  const chat = await validate(id, user);
  if(chat  && chat.chat.type == "group"){
    const oldUser = await User.findOneBy({username});
    if(oldUser){
      const userChat = await validate(id, oldUser);
      if(userChat){
        await userChat.remove();
        res.status(201).json({success: true, msg: `${username} removed successfully`, data: response});
      } else {
          res.status(400).json({success: false, error: "Participant isn't even in the group."});
          return;
      }
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

const addContact = async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = res.locals.user;
  const username = req.params.username;

  const other : any = await User.findOneBy({username});
  if(other){
    //checks if contact already exists.
    const exists = await Contacts.find({
      where: {
        user: user,
        contact: other
      }
    }) 

    if(exists[0]){
      res.status(409).json({success: false, error: "Contact already exists."});
      return;
    }

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
     // case 'm': case 'mute': case 'muted': relationship[0].relationshipStatus = "muted"; break;
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

const changeChatStatus = async ( req: express.Request, res: express.Response, next: express.NextFunction) =>{
  const status = req.body.status;
  const chat = Number(req.body.chatID);
  const user = res.locals.user;

  const userChat = await validate(chat, user);
  if(userChat){

    
    switch(status.toLowerCase()){
      case 'b': case 'block': case 'blocked': userChat.status = "blocked"; break;
      case 'm': case 'mute': case 'muted': userChat.status = "muted"; break;
      default: userChat.status = "normal";
    }

    userChat.save().then((response) => {
      res.status(201).json({success: true, msg: "Status updated successfully!", data: userChat});
    }).catch(error => {
      console.error(error);
      res.status(500).json({success: false, error: 'Problem occurred'});
    });

  } else{
    res.status(401).json({success: false, error: 'Other user not found.'});
  }

}


const searchChats =  async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const query = req.body.query;
  const user = res.locals.user;
  let chats;
  if(query.length < 1) chats = await UserChat.find({where: {user: user}, order: {
    lastEntry: "DESC" 
  }});
  else chats = await UserChat.find({
    where: {name: ILike(`${query}%`), user: user}, order: {
      lastEntry: "DESC" 
    }
  });

  console.log(chats);

  if(chats){
    res.status(200).json({success: true, data: chats})
  }
  else {
    res.status(500).json({success: false, error: "Problemo occurred."})
  }
}

const searchMessages =  async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
  const query = req.body.query;
  const chatId = Number(req.body.chatID);
  const user = res.locals.user;
  const chat = await validate(chatId, user);
  if(chat){
    let messages;
    if(query.length < 1) messages = chat.messages;
    else messages = chat.messages.filter(msg => msg.content.includes(query));
  const formatedMessages = await formatMessages(messages);
  if(messages){
    res.status(200).json({success: true, data: formatedMessages})
  }
  else {
    res.status(500).json({success: false, error: "Problemo occurred."})
  }
}
else res.status(400).json({success: false, error: "Invalid chat."})

}


//checks if chat exists and user is a participant
const validate = async (id: number, user: any) => {
  //checks if chat exists 
  const chat: any = await Chat.findOneBy({id});
  if(chat){
  const userChat = await UserChat.findOne({where: {chat: chat, user: user}});
  if(userChat){
    //then checks if current user is a participant
    // for (const participant of chat.participants){
    //   if(participant.id == user.id)
        return userChat;
    //} 
  }}
  return false; 
}

const formatChatInfo = async (chat: any, user: User) => {
 // const usernames = chat.participants.map((user) => user.username);
 const users = await UserChat.find({where: {chat: chat.chat}})
 const usernames = users.map(user => user.user.username);
 const presenceStatus = users.map(userChat => {if(userChat.user.id != user.id) return userChat.user.profile.status;})
 console.log(presenceStatus);
 const isOnline = presenceStatus.filter(status => status == "online");
 return {
    id: chat.chat.id,
    name: chat.name,
    description: chat.chat.description,
    status: isOnline.length > 0? "online": "offline",
    totalParticipants: usernames.length, 
    createdAt: chat.chat.createdAt,
    participants: usernames
  };
}


const formatMessages = async (messages: Message[]) => {
  const senders : any = messages.map(message => message.sender);
  let formatedMessages : any[] = [];
  for(let i = 0; i < messages.length; i++){
    formatedMessages.push({sender: senders[i].username, message: messages[i].content, sentAt: messages[i].timeSent, type: messages[i].type});
  }
  return formatedMessages;
}

//<><><><><><><><><><><>><><><><><><><><><><><><><><><><><><><<><<><<<>>>
//FOR TESTING (SAME AS ABOVE BUT WITHOUT THE RESPONSE AND REQUEST OBJECTS):

const getChatsTEST = async (user: any) => {
  //const user = res.locals.user;
  console.log("INSIDDEEE GET CHATS...");
  try{
        const userChats = await UserChat.find({where: {user: user}, order: {
          lastEntry: "DESC" 
        }});
        if(userChats){
        console.log("USER CHATS: ");
        console.log(userChats);
        let formatedChats = [];
        for(let i = 0; i < userChats.length; i++){
          const chatty = await formatChatInfo(userChats[i], user);
          formatedChats.push(chatty);
        }
        console.log("READY TO SEND....");
        return {status: 200, data: formatedChats};
      }
    
      } catch(error){
        console.log(error);
        return {status: 500, error: "Something went wrong"};
      }
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
  addContact,
  searchMessages,
  searchChats,
  changeChatStatus,
  getChatsTEST
};