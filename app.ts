import "./config.js";
import express from "express";
import db from "./db/dataSource.js";
import usersRouter from "./routes/users.js";
import chatRouter from "./routes/chat.js";
import cookieParser from "cookie-parser";
import http from "http";
import cors from "cors";
import { Server, Socket } from "socket.io";
import dataSource from "./db/dataSource.js";
import { authenticate } from "./middleware/auth/authenticate.js";
import session from "express-session";
import path from "path";
import { changeStatus } from "./controllers/user.js";
import router from "./ses.js";

var app = express();
//app.use(express.static("client"));
const PORT = 5000;
app.use(express.json());

app.use(cors({ origin: 'http://127.0.0.1:5500', credentials: true }));
app.use(cookieParser());
const server = http.createServer(app);

// Your API routes
app.get('/setCookie', (req, res) => {
  console.log("COOKIE BEING SET....");
  res.cookie('myCookie3', 'cookieValue', { httpOnly: false, sameSite: 'lax' });
 res.setHeader('Set-Cookie', 'myCookie1=exampleValue; HttpOnly');
 res.cookie('myCookie2', 'exampleValue', { httpOnly: true });
 res.cookie('token', 'cookieValue', {
  httpOnly: true,
  sameSite: 'none',
  secure: true, 
});
  res.send('Cookie set successfully.');
});

// app.get('/getCookie', authenticate, (req, res) => {
//   const token = req.cookies.token;
//   console.log(token);
//   res.json({ token});
// });

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const users: string[] = [];

app.use("/users", usersRouter);
app.use("/chat", authenticate,chatRouter);
app.use("/email",router),

app.get("/", (req, res) => {
  res.send("Welcome to the Real-Time Chat App!");
});

app.get("/health", (req, res) => {
  res.status(200).send("Everything Good :)");
});

io.on("connection", (socket: Socket) => {
  console.log("connected to", socket.id);

  //done
  socket.on("adduser", (username: string) => {
    socket.data.user = username;
    //users.push(username);
    changeStatus("online", username);
    console.log("USER: " + socket.data.user);
    console.log("latest users", users);
   // io.sockets.emit("users", users);
  });

  socket.on("removeUser", (username: string) => {
    changeStatus("offline", username);
  })
  //done
  socket.on("message", (message: any) => {
    if (socket.data.room) {
      //.to(socket.data.room).
      const data = {
        user: message.sender,
        message: message.data,
        sentAt: message.time
      };
      console.log(data)
      console.log("Room: " + socket.data.room);
      console.log("USER: " + socket.data.user);
      io.to(socket.data.room).emit("message", {
        user: message.sender,
        message: message.data,
        sentAt: message.time,
        chat: socket.data.room
      });
    } else { console.log("NOT IN ROOM"); socket.emit("message", "Not in room.");}
  });

  // done
  socket.on("joinRoom", (room) => {
    socket.join(room);
    socket.data.room = room;
    console.log(`Socket joined room: ${room}`);
    //io.sockets.emit("joinedRoom", room);
  });

  socket.on("leaveRoom", () => {
    if (socket.data.room) {
      socket.leave(socket.data.room);
      console.log(`Socket left room: ${socket.data.room}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("deleting ", socket.data.user);
    if(socket.data.user) changeStatus("offline", socket.data.user);
    // if (socket.data.user) {
    //   const index = users.indexOf(socket.data.user);
    //   if (index !== -1) {
    //     users.splice(index, 1);
    //   }
    // }

    io.sockets.emit("users", users);
    console.log("remaining users: ", users);
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

export default app 
router;
