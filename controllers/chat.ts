import { ChatTypes } from "../@types/types.js";
import ioClient from 'socket.io-client';
import { Message } from "../db/entities/Message.js";
import { User } from "../db/entities/User.js";
import { Chat } from "../db/entities/Chat.js";
import { In } from "typeorm";
import db from '../db/dataSource.js';

const socket = ioClient('http://localhost:5000');


const createChat = async (payload: any, type: string, cUser: User) => {
  let cName, room, desc;
  let participants;

  try {
    if (type === 'g') {
      room = "group";
      desc = payload.description;
      cName = payload.name;

      try{
        const users = await User.find({
          where: {
            username: In(payload.participants)
          }
        });
        participants = users;

      } catch(err){
        console.log(err);
        throw new Error("User(s) not found.")
      }
      // for (const username of payload.participants.array) {
      //   const user = await User.findOneBy({ username });
      //   if (user) {
      //     participants.push(user);
      //   } else {
      //     throw new Error("User: " + username + " not found.");
      //   }
      // }
    } else {
      const username = payload.username;
      const user = await User.findOneBy({ username });
      if (user) {
        console.log("User " + user.profile.fullName + " found!!");
        participants = [user];
        room = "1To1";
        desc = "A one-to-one chat";
        cName = user.username;
      } else {
        throw new Error("Can't find user :(");
      }
    }

    participants.push(cUser);
    const currentTime = new Date();
    const newChat = Chat.create({
      name: cName,
      description: desc,
      createdAt: currentTime,
      participants: participants,
      type: type === 'g' ? "group" : "1To1"
    });

    try {
        db.dataSource.manager.transaction(async (transaction) => {
          await transaction.save(newChat);
        });
        console.log("Chat created :)");
        return 1;
    } catch (error) {
      console.error(error);
      throw new Error('Something went wrong');
    }
  } catch (error) {
    console.log(error);
    throw new Error("Couldn't create chat");
  }
};

  
const getChatMessages = async (id: number, user: User) => {
  //returns messages if user is a participant of chat room
  const chat = await Chat.findOneBy({id});
  if(chat){
    if(chat.participants.includes(user))
      return chat.messages;
    else throw new Error("Chat not found");
  }else throw new Error("Chat not found");
  
};

const sendMessage = async (message: Message, chatID: number, user: User)=> {

  const currentTime = new Date(); 
  //const currentTime = new Date().getTime(); 
  const newMsg = Message.create({
    ...message,
    timeSent: currentTime,
    chat_id: chatID,
    type: "text",
    sender: user.id
  }); 
  
    try{    
      newMsg.save().then((response) => {
        return socket.emit('send-message', newMsg.content);
      }).catch(error => {
        console.error(error);
        throw new Error('Something went wrong');
      });   
    } catch(error){
      console.log(error);
      throw new Error("Couldn't send message");
    }

}
  // const message = new Message();
  // socket.on('chat message', (msg) => {
  //   console.log('Received message:', msg);
  // });



const getChats = async(user: User) => {
    //display users conversations
}


const changeFriendStatus = async () => {

};
  
// const createGroup = async (payload: ChatTypes.Chat) => {
 
// };

const sendAttachment = async ()=> {

};

export {
  createChat,
  getChatMessages,
  sendMessage,
  getChats,
  changeFriendStatus,
  //createGroup,
  sendAttachment
};