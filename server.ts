import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);
// app.use(cors());

// const PORT = process.env.PORT || 3000;


// io.on("connection", (socket) => {
//   console.log(`User Connected: ${socket.id}`);

// //   socket.on("join_room", (data) => {
// //     socket.join(data);
// //   });

//   socket.on("message", (msg) => {
//     console.log(msg);
//     socket.emit("message", msg);
//    // socket.to(data.room).emit("receive_message", data);
//   });

//   socket.on('disconnect', () => {
//     console.log("User disconnected");
//   })


// });

// server.listen(PORT, () => {
//   console.log("SERVER IS RUNNING");
// });