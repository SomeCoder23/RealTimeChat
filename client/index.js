const messageform = document.querySelector(".chatbox form");
const messageList = document.querySelector("#messagelist");
const userList = document.querySelector("ul#users");
const chatboxinput = document.querySelector(".chatbox input")
const useraddform = document.querySelector(".modal")
const backdrop = document.querySelector(".backdrop")
const useraddinput = document.querySelector(".modal input");
const socket = io("http://localhost:5000");



let users = [];
let messages = []


console.log(messageList);

socket.on("message", (message) => {
    messages.push(message);
    updateMessages()
})


socket.on('users', function (_users) {
    users = _users
    updateUsers()
});


messageform.addEventListener('submit', messageSubmitHandler)
useraddform.addEventListener('submit', userAddHandler)

function updateUsers() {
    userList.textContent = ''
    for (let i = 0; i < users.length; i++) {
        var node = document.createElement("LI");
        var textnode = document.createTextNode(users[i]);
        node.appendChild(textnode);
        userList.appendChild(node);
    }
}

function updateMessages() {
    messageList.textContent = ''
    for (let i = 0; i < messages.length; i++) {
        messageList.innerHTML += `<li>
                     <p>${messages[i].user}</p>
                     <p>${messages[i].message}</p>
        
                       </li>`
    }
}

function messageSubmitHandler(e) {
    e.preventDefault();

    let message = chatboxinput.value;

    socket.emit("message", message)

    chatboxinput.value = ""


}

function userAddHandler(e) {
    e.preventDefault();

    let username = useraddinput.value;


    if (!username) {
        return alert("You must add a user name");
    }
    socket.emit("adduser", username)

    useraddform.classList.add("disappear")
    backdrop.classList.add("disappear")


}
// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";
// import io from "socket.io-client";

// const socket = io("http://localhost:5000"); 

// const messageform = document.querySelector(".chatbox form") as HTMLFormElement;
// const messageList = document.querySelector("#messagelist") as HTMLUListElement;
// const userList = document.querySelector("ul#users") as HTMLUListElement;
// const chatboxinput = document.querySelector(".chatbox input") as HTMLInputElement;
// const useraddform = document.querySelector(".modal") as HTMLFormElement;
// const backdrop = document.querySelector(".backdrop") as HTMLElement;
// const useraddinput = document.querySelector(".modal input") as HTMLInputElement;

// let users: string[] = [];
// let messages: { user: string; message: string }[] = [];

// console.log(messageList);

// socket.on("message", (message: { user: string; message: string }) => {
//   messages.push(message);
//   updateMessages();
// });

// socket.on('users', function (_users: string[]) {
//   users = _users;
//   updateUsers();
// });

// messageform.addEventListener('submit', messageSubmitHandler);
// useraddform.addEventListener('submit', userAddHandler);

// function updateUsers() {
//   userList.textContent = '';
//   for (let i = 0; i < users.length; i++) {
//     var node = document.createElement("LI");
//     var textnode = document.createTextNode(users[i]);
//     node.appendChild(textnode);
//     userList.appendChild(node);
//   }
// }

// function updateMessages() {
//   messageList.textContent = '';
//   for (let i = 0; i < messages.length; i++) {
//     messageList.innerHTML += `<li>
//       <p>${messages[i].user}</p>
//       <p>${messages[i].message}</p>
//     </li>`;
//   }
// }

// function messageSubmitHandler(e: Event) {
//   e.preventDefault();

//   let message = chatboxinput.value;

//   socket.emit("message", message);

//   chatboxinput.value = '';
// }

// function userAddHandler(e: Event) {
//   e.preventDefault();

//   let username = useraddinput.value;

//   if (!username) {
//     return alert("You must add a user name");
//   }
//   socket.emit("adduser", username);

//   useraddform.classList.add("disappear");
//   backdrop.classList.add("disappear");
// }
// ----------------------------------------

// socket.on("connect", () => {
//   console.log("Connected to the Socket.IO server");

//   // Send a test message to the server
//   socket.emit("send-message", "Hello, Server!");
// });

// socket.on("message", (msg) => {
//   console.log("Received message from the server:", msg);
// });

// socket.on("disconnect", () => {
//   console.log("Disconnected from the server");
// });


// // const app = express();
// // const server = http.createServer(app);
// // const io = new Server(server);
// // app.use(cors());

// // const PORT = process.env.PORT || 3000;


// // io.on("connection", (socket) => {
// //   console.log(`User Connected: ${socket.id}`);

// // //   socket.on("join_room", (data) => {
// // //     socket.join(data);
// // //   });

// //   socket.on("message", (msg) => {
// //     console.log(msg);
// //     socket.emit("message", msg);
// //    // socket.to(data.room).emit("receive_message", data);
// //   });

// //   socket.on('disconnect', () => {
// //     console.log("User disconnected");
// //   })


// // });

// // server.listen(PORT, () => {
// //   console.log("SERVER IS RUNNING");
// // });