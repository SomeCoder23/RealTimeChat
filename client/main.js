//import axios from "axios";
//import Cookies from 'js-cookie';
const sendMsg = document.getElementById("send");
const messageList = document.getElementById("messages");
const chatboxinput = document.getElementById("input")
const chatName = document.getElementById("name")
const username = document.getElementById("username")
const body = document.getElementById("body")
const title1 = document.getElementById("title1")
const title2 = document.getElementById("title2")
const topHeading = document.getElementById("top")
const bottom = document.getElementById("bottom")


const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const login = document.getElementById("login-form");
const toast = document.getElementById("toast");
const chatList = document.getElementById("chats");
const logout = document.getElementById("logout");
const URL = 'http://www.localhost:5000';
const socket = io(URL);

//let users = [];
//let messages = []
let orderedChats = [];
let currentChat = 0;
let user;

socket.on("message", (message) => {
    //messages.push(message);
    if(currentChat == message.chat)
     updateMessages(message);
})


socket.on('users', function (_users) {
    console.log(_users + " connected");
    // users = _users
    // updateUsers();
});


const getProfile = () => {
    if(username !== null){
    fetch(`${URL}/users/profile`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    })
    .then(response => {
        console.log("RESPONSE:");
        console.log(response);
        if (!response.ok) {
            //return alert("A Problem Occured");
            username.innerText = "Loading...";
            return;
        } 

        return response.json();
    })
    .then(data => {
        console.log(data);
        if (data.success){
            user = data.username;
            username.innerText = user;
            return;
        }
        else return username.innerText = "Loading";
    })
    .catch(error => {
        //console.error("somethign went wrongoo");
        username.innerText = "Loading";
        //return alert("Something went wrong :(");
    });
}}

const getChats = () => {
    console.log("Getting chats...");
    fetch(`${URL}/chat/conversations`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    })
    .then(response => {
        console.log("RESPONSE:");
        console.log(response);
        if(response.status == 401){
            window.location.href = "/client/login.html";   
            return;
        }
        if (!response.ok) {
            return alert("A Problem Occured");
        } 

        return response.json();
    })
    .then(data => {
        console.log(data);
        if (data.success){
            let status;
            const chats = data.data;
            if(chats.length < 1) {
                title1.style.display = "flex";
                return;
            }
            else title1.style.display = "none";
            for (let i = 0; i < chats.length; i++) {
                console.log(chats[i].name + " status: " + chats[i].status);
                if(chats[i].status == "online") status = "online";
                else status = "offline";
                let newChat = document.createElement("li");
                newChat.classList.add("clearfix");
                newChat.innerHTML = `
                  <img src="images/defaultIcon.png" alt="avatar">
                  <div class="about">
                    <div class="name">${chats[i].name}</div>
                    <div class="status"> <i class="fa fa-circle ${status}"></i> ${status} </div>                                            
                  </div>`;
              
                newChat.addEventListener('click', () => {
                  getMessages(chats[i].id);
                  if(title2.style.display != "none") {
                    console.log("changing appearance.......");
                    title2.style.display = "none";
                    topHeading.style.display = "flex";
                    bottom.style.display = "block";
                  }
                  // Remove the "active" class from previously clicked chat
                  const activeChat = document.querySelector('.clearfix.active');
                  if (activeChat) {
                    activeChat.classList.remove('active');
                  }
                  newChat.classList.add('active');
                  chatName.innerText = chats[i].name;
                  currentChat = chats[i].id;
                  socket.emit("joinRoom", chats[i].id);
                });
              
                chatList.append(newChat);
              }
            return;
        }
        else return alert(data.error);
    })
    .catch(error => {
        console.error('Error:', error);
        //return alert("Something went wrong :(");
    });

}

const getMessages = (chatID) => {
    console.log("Getting messages...");
    fetch(`${URL}/chat/getMessages/${chatID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    })
    .then(response => {
        console.log("RESPONSE:");
        console.log(response);
        if (!response.ok) {
            return alert("A Problem Occured");
        } 

        return response.json();
    })
    .then(data => {
        console.log(data);
        if (data.success){
            if(!user) return alert("A problem occurred."); 
            messageList.innerHTML = "";
           const messages = data.data;
           for(let i = 0; i < messages.length; i++){
                let type;
                let align = "";
                if(messages[i].sender == user) type = "message my-message";
                else {
                    type = "message other-message float-right";
                    align = "text-right";
                 }
                
                let message = document.createElement("li");
                message.classList.add("clearfix");
                message.innerHTML += `<div class="message-data ${align}">
                <span class="message-data-time">${messages[i].sentAt}</span>
            </div>
            <div class='${type}'>${messages[i].message}</div>`;
                messageList.append(message);          
           }
            return;
        }
        else return alert(data.error);
    })
    .catch(error => {
        console.error('Error:', error);
    });

}


function updateUsers() {
    userList.textContent = ''
    for (let i = 0; i < users.length; i++) {
        var node = document.createElement("LI");
        var textnode = document.createTextNode(users[i]);
        node.appendChild(textnode);
        userList.appendChild(node);
    }
}

function updateMessages(message) {
    let type;
    let align = "";
    if(message.user == user) type = "message my-message";
    else {
        type = "message other-message float-right";
        align = "text-right";
        }
    
    let newMsg = document.createElement("li");
    newMsg.classList.add("clearfix");
    newMsg.innerHTML += `<div class="message-data ${align}">
    <span class="message-data-time">${message.sentAt}</span>
</div>
<div class='${type}'>${message.message}</div>`;
    messageList.append(newMsg);   
    
    
}

function messageSubmitHandler(e) {
    e.preventDefault();
    console.log("SENDING MESSAGE...");
    if(currentChat == 0) return alert("Please choose a chat.");
    let message = chatboxinput.value;

    fetch(`${URL}/chat/sendMessage/${currentChat}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({content: message}),
    })
    .then(response => {
        console.log("RESPONSE:");
        console.log(response);
        if (!response.ok) {
            return alert("Failed to send Message :(");
        } 

        return response.json();
    })
    .then(data => {
        console.log(data);
        if (data.success){
            console.log(data.data);
            socket.emit("message", {data: message, time: data.data.time, sender: data.data.sender})
            chatboxinput.value = ""
            return;
        }
        else return alert(data.error);
    })
    .catch(error => {
        console.error('Error:', error);
    });

}


function loginHandler(e) {
    e.preventDefault();

    e.preventDefault();
    console.log("LOGIN BUTTON CLICKED!");
    let username = usernameInput.value;
    let password = passwordInput.value;

    if (!username || !password) {
        return alert("You must fill in all fields!");
    }

    fetch(`${URL}/users/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username, password: password }),
            })
            .then(response => {
                console.log("RESPONSE:");
                console.log(response);
                if (!response.ok) {
                    return toast.innerText = "Password or Username incorrect :(";
                } 

                console.log("COOKIE:");
                console.log(document.cookie);
                return response.json();
            })
            .then(data => {
                console.log(data);
                // Handle the response as needed
                if (data.success){
                    socket.emit("adduser", username);
                    console.log("yaaasssss");
                    window.location.href = "/client/main.html";               
                    return;
                }
                else return toast.innerText = "Password or Username incorrect :(";
            })
            .catch(error => {
                console.error('Error:', error);
            });
}

const userOffline = () => {
    socket.emit("offline", user);
}

const userOnline = () => {
    if(user)
        socket.emit("online", user);
}

if(logout){
    logout.addEventListener('click', () => {
        fetch(`${URL}/users/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            console.log("RESPONSE:");
            console.log(response);
            if (!response.ok) {
                return alert("Something went wrong");
            } 
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (data.success){
                window.location.href = "/client/login.html";               
                return;
            }
            else return alert(data.error);
        })
        .catch(error => {
            console.error('Error:', error);
            return alert("Something went wrong");
        });

    })
}

if(sendMsg){    
    // window.addEventListener('blur', () => {
    //     setTimeout(userOffline, 60000);
    //   });
    window.addEventListener('focus', userOnline);
    window.addEventListener('blur', userOffline);
    getChats();
    getProfile();
    //window.addEventListener('load', getChats());
    //window.addEventListener('load', getProfile());
    sendMsg.addEventListener('click', messageSubmitHandler);
}

if(login)
login.addEventListener('submit', loginHandler)

