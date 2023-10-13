import { ChatTypes } from "../@types/types.js";
import ioClient from 'socket.io-client';
import { Message } from "../db/entities/Message.js";
import { User } from "../db/entities/User.js";
import { Chat } from "../db/entities/Chat.js";
import { In, MoreThan } from "typeorm";
import db from '../db/dataSource.js';
import { Contacts } from "../db/entities/Contacts.js";
const socket = ioClient('http://localhost:5000');
// import userAddHandler from '../client/index.js';

const createChat = async (payload: any, type: string, cUser: User) => {
  let chatName, desc;
  let participants;
  const currentTime = new Date();

  try {
    if (type === 'g') {
      desc = payload.description;
      chatName = payload.name;

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
        chatName = user.username;

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
      name: chatName,
      description: desc,
      createdAt: currentTime,
      participants: participants,
      type: type === 'g' ? "group" : "1To1"
    });

    try {
      newChat.save().then((response) => {
        console.log("Chat created :)");
        socket.emit("joinRoom", response.id);
        return "Chat created!";
      }).catch(error => {
        console.error(error);
        throw new Error('Something went wrong');
      });

    } catch (error) {
      console.error(error);
      throw new Error('Something went wrong');
    }
  } catch (error) {
    console.log(error);
    throw new Error("Couldn't create chat");
  }
};
  
const enterRoom = async (id: number, user: User) => {
  //returns messages if user is a participant of chat room
  const chat = await Chat.findOneBy({id});
  if(chat){
    for (const participant of chat.participants){
      if(participant.id == user.id){
        socket.emit("joinRoom", chat.id);
        return chat.messages;
      }
    } 
    throw new Error("Chat not found");
  }else throw new Error("Chat not found");
  
};

const getMessages = async(id: number) => {
  const date = new Date();
  const messages = await Message.find({
    where: {
      timeSent: MoreThan(new Date(date.getTime() - 24 * 60 * 60 * 1000))
    }
  });
  const senders = messages.map(message => message.sender);
  const users = await User.find({
    where: {
      id: In(senders)
    }
  });
  const usernames = users.map(user => user.username);
  let formatedMessages : any[] = [];

  for(let i = 0; i < messages.length; i++){
    formatedMessages.push({user: usernames[i], message: messages[i].content});
  }
  return formatedMessages;
}

const sendMessage = async (message: Message, id: number, user: User)=> {

  //checks if chat exists 
  const chat = await Chat.findOneBy({id});
  if(chat){
    //then checks if current user is a participant
    for (const participant of chat.participants){
      if(participant.id == user.id){
        const currentTime = new Date(); 
        const newMsg = Message.create({
          ...message,
          timeSent: currentTime,
          chat_id: id,
          type: "text",
          sender: user.id
        }); 
        
        //then sends message
        try{    
          newMsg.save().then((response) => {
            return socket.emit('message', newMsg.content);
          }).catch(error => {
            console.error(error);
            throw new Error('Something went wrong');
          });   
        } catch(error){
          console.log(error);
          throw new Error("Couldn't send message");
        }
      }
    } 
    throw new Error("Chat not found");
  }else throw new Error("Chat not found");

  

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

const getGroupInfo = async (id: number, user: User) => {
  const group = await Chat.findOneBy({id});
  if(group && group?.type === 'group'){

    //checks if current user is a participant of group
    for (const participant of group.participants){
      if(participant.id == user.id){
        return formatChatInfo(group);
      }
    } 
    throw new Error("Chat not found");
  }
}

const getChats = async (user: User) => {
  try{
    const userId = user.id;
    const results = await db.dataSource.manager.query('SELECT chatId FROM chat_participants_user WHERE userId = ?', [userId]);
    const chatIds = results.map((row : any) => row.chatId);

    const chats = await Chat.find({
      where: {
        id: In(chatIds),
      },
    });
    console.log(results);
    console.log(chats);
    leaveRoom();
    return chats;

  } catch(error){
    console.error(error);
    return "Something went wrong!!!!";
  }
}

const addParticipant = async (id: number, user: User, newUser: User) => {
  const validated = await validate(id, user);
  if(validated){
    const chat = await Chat.findOneBy({id});
    chat?.participants.push(newUser);
    chat?.save().then(response => {
      return "Participant successfully added!";
    }).catch(error => {
      console.log(error);
      return error;
    })

  } else throw new Error("Chat not found :(");

}

//NOTE: maybe should add admin attribute to chat, and only allow admin to remove
const removeParticipant = async (id: number, user: User, oldUser: User) => {
  const validated = await validate(id, user);
  if(validated){
    const chat = await Chat.findOneBy({id});
    if(chat){
    const participants = chat?.participants.filter(p => p !== oldUser);
    chat.participants = participants;
    chat.save().then(response => {
      return "Participant removed added!";
    }).catch(error => {
      console.log(error);
      return error;
    })
  }

  } else throw new Error("Chat not found :(");

}

const leaveRoom = () => {
  return socket.emit("leaveRoom");
}

const deleteMessage = async(id: number, user: User) => {
  const message = await Message.findOneBy({id});
  if(message){
    if(message.sender === user.id){
      try{
        await message.remove();
        return "Message deleted!";
      }catch(err){
        console.log(err);
        return new Error("Failed :(");
      }
    }
  }
}

  

const sendAttachment = async ()=> {
 
  //NOTE: may remove this function and add feature with sendMessage function

};

//checks if chat exists and user is a participant
const validate = async (id: number, user: User) => {
  //checks if chat exists 
  const chat = await Chat.findOneBy({id});
  if(chat){
    //then checks if current user is a participant
    for (const participant of chat.participants){
      if(participant.id == user.id)
        return true
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



export {
  createChat,
  enterRoom as getChatMessages,
  sendMessage,
  changeFriendStatus,
  getGroupInfo,
  sendAttachment,
  clearChat,
  socket,
  leaveRoom,
  getChats,
  getMessages,
  addParticipant,
  removeParticipant,
  deleteMessage
};