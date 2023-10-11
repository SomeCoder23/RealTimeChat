import './config.js';
import express from 'express';
import db from './db/dataSource.js';
import usersRouter from './routes/users.js';
import chatRouter from './routes/chat.js';
import cookieParser from 'cookie-parser';
import http from "http";
import { Server, Socket } from "socket.io";
import dataSource from './db/dataSource.js';
import { authenticate } from './middleware/auth/authenticate.js';

var app = express();
const PORT = 5000;
app.use(express.json());
app.use(cookieParser());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const chatRooms = new Map(); // Store chat rooms
const users: string[] = [];


app.use('/users', usersRouter);
app.use('/chat', authenticate, chatRouter);

app.get('/', (req, res) =>{
  res.send("Welcome to the Real-Time Chat App!");
});

app.get('/health', (req, res) =>{
  res.status(200).send("Everything Good :)");
});


io.on('connection', (socket: Socket) => {
  console.log('connected to', socket.id);
  const room: string = 'MYROOM';

  socket.on("adduser", (username: string) => {
    socket.data.user = username;
    users.push(username);
    console.log("latest users", users);
    io.sockets.emit("users", users);
  });

  socket.on("message", (message: string) => {
    io.sockets.emit("message", {
      user: socket.data.user,
      message: message,
    });
  });

  socket.on("disconnect", () => {
    console.log("deleting ", socket.data.user);

    if (socket.data.user) {
      const index = users.indexOf(socket.data.user);
      if (index !== -1) {
        users.splice(index, 1);
      }
    }

    io.sockets.emit("users", users);
    console.log('remaining users: ', users);
  });
});

// io.on('connection', (socket) => {
//   console.log(`User Connected: ${socket.id}`);

//   // Create a new chat room
//   socket.on('create-room', (roomName) => {
//     if (!chatRooms.has(roomName)) {
//       socket.join(roomName);
//       chatRooms.set(roomName, new Set());
//       chatRooms.get(roomName).add(socket.id);
//     }
//   });

//   // Join an existing chat room
//   socket.on('join-room', (roomName) => {
//     if (chatRooms.has(roomName)) {
//       socket.join(roomName);
//       chatRooms.get(roomName).add(socket.id);
//     }
//   });

//   // Leave a chat room
//   socket.on('leave-room', (roomName) => {
//     if (chatRooms.has(roomName)) {
//       socket.leave(roomName);
//       chatRooms.get(roomName).delete(socket.id);
//     }
//   });

//   socket.on('send-message', (roomName, msg) => {
//     // Emit the message to everyone in the room
//     if (chatRooms.has(roomName)) {
//       io.to(roomName).emit('message', `${socket.id}: ${msg}`);
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log("User disconnected");
//     // Remove the user from all chat rooms
//     chatRooms.forEach((participants, roomName) => {
//       if (participants.has(socket.id)) {
//         participants.delete(socket.id);
//         io.to(roomName).emit('message', `User ${socket.id} left the room.`);
//       }
//     });
//   });
// });

server.listen(PORT, () => {
  console.log("SERVER IS RUNNING");
  db.initialize();
});

// app.listen(PORT, () => {
//     console.log(`App is listening on port ${PORT}`);
//     db.initialize();
  
// });

export default app;