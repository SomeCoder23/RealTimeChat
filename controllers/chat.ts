import { ChatTypes } from "../@types/types.js";
import ioClient from 'socket.io-client';
import { Message } from "../db/entities/Message.js";
import { User } from "../db/entities/User.js";
import { Chat } from "../db/entities/Chat.js";
import { In } from "typeorm";
import db from '../db/dataSource.js';
import { Contacts } from "../db/entities/Contacts.js";
const socket = ioClient('http://localhost:5000');


const createChat = async (payload: any, type: string, cUser: User) => {
  let cName, desc;
  let participants;
  const currentTime = new Date();

  try {
    if (type === 'g') {
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
    } else {
      const username = payload.username;
      const user = await User.findOneBy({ username });
      if (user) {
        console.log("User " + user.profile.fullName + " found!!");
        participants = [user];
        desc = "A one-to-one chat";
        cName = user.username;

        //adds to contact....maybe should have its own endpoint?
        const contact1 = Contacts.create({
          user: cUser,
          contact: user,
          createdAt: currentTime 
        });

        const contact2 = Contacts.create({
          user: user,
          contact: cUser,
          createdAt: currentTime 
        });

        try {
          db.dataSource.manager.transaction(async (transaction) => {
            await transaction.save(contact1);
            await transaction.save(contact2);
          });
          console.log("Contact created");
      } catch (error) {
        console.error(error);
        throw new Error('Something went wrong');
      }


      } else {
        throw new Error("Can't find user :(");
      }
    }

    participants.push(cUser);
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
    for (const participant of chat.participants){
      if(participant.id == user.id){
        return chat.messages;
      }
    } 
    throw new Error("Chat not found");
  }else throw new Error("Chat not found");
  
};

const sendMessage = async (message: Message, chatID: number, user: string)=> {

  const currentTime = new Date(); 
  //const currentTime = new Date().getTime(); 
  const newMsg = Message.create({
    ...message,
    timeSent: currentTime,
    chat_id: chatID,
    type: "text",
    sender: user
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

//needs testing<><><><><><><><><><><><><><><>
const clearChat = async(id: number, user: User) => {
  const chat = await Chat.findOneBy({id});
  if(chat){
    for (const participant of chat.participants){
      if(participant.id == user.id){
        chat.messages = [];
        chat.save().then((response) => {
          console.log("Chat cleared successfully :)");
          return chat;
        }).catch(error => {
          console.error(error);
          throw new Error('Something went wrong');
        });
        
      }
    } 
    throw new Error("Chat not found");
  }else throw new Error("Chat not found");



}



const changeFriendStatus = async (user: any, username: string, status: string) => {
  const contact : any = await User.findOneBy({username});
  if(contact){
    const contactsRepo = db.dataSource.getRepository(Contacts);
    const relationship = await contactsRepo.find({
      where: {
        user: user,
        contact: contact
      }
    });

    console.log("CONTACT: ");
    console.log(relationship);
    switch(status.toLowerCase()){
      case 'b': case 'block': case 'blocked': relationship[0].relationshipStatus = "blocked"; break;
      case 'm': case 'mute': case 'muted': relationship[0].relationshipStatus = "muted"; break;
      default: relationship[0].relationshipStatus = "normal";
    }

    relationship[0].save().then((response) => {
      return "Relationship status changed!";
    }).catch(error => {
      console.error(error);
      return 'Something went wrong';
    });

  } else{
    return "User not found :(";
  }


};
  
// const createGroup = async (payload: ChatTypes.Chat) => {
 
// };

const sendAttachment = async ()=> {

};



export {
  createChat,
  getChatMessages,
  sendMessage,
  changeFriendStatus,
  //createGroup,
  sendAttachment,
  clearChat
};