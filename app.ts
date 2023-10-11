import './config.js';
import express from 'express';
import db from './db/dataSource.js';
import usersRouter from './routes/users.js';
import chatRouter from './routes/chat.js';
import cookieParser from 'cookie-parser';
import http from "http";
import { Server } from "socket.io";
import dataSource from './db/dataSource.js';
import { authenticate } from './middleware/auth/authenticate.js';

var app = express();
const PORT = 5000;
app.use(express.json());
app.use(cookieParser());
const server = http.createServer(app);
const io = new Server(server);

app.use('/users', usersRouter);
app.use('/chat', authenticate, chatRouter);

app.get('/', (req, res) =>{
  res.send("Welcome to the Real-Time Chat App!");
});

app.get('/health', (req, res) =>{
  res.status(200).send("Everything Good :)");
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("send-message", (msg) => {
    console.log(socket.id + ": " + msg);
    io.emit("message", msg);
   //socket.to(data.room).emit("receive_message", data);
  });

  socket.on('disconnect', () => {
    console.log("User disconnected");
    io.emit("message", `User ${socket.id} disconnected.`);
  })

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