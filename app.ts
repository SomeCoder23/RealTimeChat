import "./config.js";
import express from "express";
import db from "./db/dataSource.js";
import usersRouter from "./routes/users.js";
import chatRouter from "./routes/chat.js";
import cookieParser from "cookie-parser";
import http from "http";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { authenticate } from "./middleware/auth/authenticate.js";
import { changeStatus} from "./controllers/user.js";
import { error404Handler } from "./middleware/errorHandling.js";
// import router from "./ses.js";
import AWS from 'aws-sdk';
import { getEmails } from "./controllers/chat.js";

AWS.config.update({
  accessKeyId: process.env.AWS_SES_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  region: process.env.AWS_SES_REGION
});
const ses = new AWS.SES({ region: 'eu-north-1' });

var app = express();
app.use(express.static("client"));
const PORT = 5000;
app.use(express.json());

app.use(cors({ origin: 'http://127.0.0.1:5500', credentials: true }));
app.use(cookieParser());
const server = http.createServer(app);

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
// app.use("/email",router);

app.get("/", (req, res) => {
  res.send("Welcome to the Real-Time Chat App!");
});

app.get("/health", (req, res) => {
  res.status(200).send("Everything Good :)");
});

io.on("connection", (socket: Socket) => {
  console.log("connected to", socket.id);

  socket.on("adduser", (username: string) => {
    socket.data.user = username;
    console.log("USER: " + socket.data.user);
  });

  socket.on("online", async (username: string) => {
    console.log("about to change status...");
    await changeStatus("online", username);
  })

  socket.on("offline", async (username: string) => {
    await changeStatus("offline", username);
  })

  socket.on("message", async (message: any) => {
    if (socket.data.room) {
      const messageData = {
        user: message.sender,
        message: message.data,
        sentAt: message.time,
        chat: socket.data.room,
      };
      
      io.to(socket.data.room).emit("message", messageData);
      
      const emails = await getEmails(socket.data.room, message.sender);

      for(let i = 0; i < emails.length; i++){
      const emailParams: AWS.SES.SendEmailRequest = {
        Source: 'realtimechatapp7@gmail.com', 
        Destination: {
          ToAddresses: [emails[i]], 
        },
        Message: {
          Subject: {
            Data: 'New Message Notification',
          },
          Body: {
            Text: {
              Data: `New message from ${message.sender}: ${message.data}`,
            },
          },
        },
      };
  
      ses.sendEmail(emailParams, (err, data) => {
        if (err) {
          console.error("Error sending email:", err);
        } else {
          console.log("Email sent:", data);
        }
      });
    }
    
    } else {
      console.log("NOT IN ROOM");
      socket.emit("message", "Not in room.");
    }
  });

  socket.on("attachment", (file: any) => {
    if (socket.data.room) {
      io.to(socket.data.room).emit("attachment", {
        sender: file.sender,
        message: file.data,
        sentAt: file.time,
        chat: socket.data.room,
        type: file.type
      });
    } else { console.log("NOT IN ROOM"); socket.emit("message", "Not in room.");}
  });

  socket.on("joinRoom", (room) => {
    socket.join(room);
    socket.data.room = room;
    console.log(`Socket joined room: ${room}`);
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
    io.sockets.emit("users", users);
    console.log("remaining users: ", users);
  });
});

app.use(error404Handler);

server.listen(PORT, () => {
  console.log("SERVER IS RUNNING");
  db.initialize();
});

export default app ;
