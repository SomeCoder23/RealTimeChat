import './config.js';
import express from 'express';
import db from './db/dataSource.js';
import usersRouter from './routes/users.js';
import chatRouter from './routes/chat.js';
import cookieParser from 'cookie-parser';
import http from "http";
import cors from 'cors';
import { Server, Socket } from "socket.io";
import dataSource from './db/dataSource.js';
import { authenticate } from './middleware/auth/authenticate.js';

var app = express();
app.use(express.static('client'));
const PORT = 5000;
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://127.0.0.1:5500', 
  credentials: true,
}));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
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

  //done
  socket.on("adduser", (username: string) => {
    socket.data.user = username;
    users.push(username);
    console.log("latest users", users);
    io.sockets.emit("users", users);
  });

  //done
  socket.on("message", (message: string) => {
    if(socket.data.room){
    io.to(socket.data.room).emit("message", {
      user: socket.data.user,
      message: message,
    });
  } else socket.emit("error", "Not in room.");
  });

  // done
  socket.on('joinRoom', (room) => {
    socket.join(room);
    socket.data.room = room;
    console.log(`Socket joined room: ${room}`);
    io.sockets.emit("joinedRoom", room);
  });

  socket.on('leaveRoom', () => {
    if(socket.data.room){
    socket.leave(socket.data.room);
    console.log(`Socket left room: ${socket.data.room}`);}
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


server.listen(PORT, () => {
  console.log("SERVER IS RUNNING");
  db.initialize();
});

// app.listen(PORT, () => {
//     console.log(`App is listening on port ${PORT}`);
//     db.initialize();
  
// });

export default app;