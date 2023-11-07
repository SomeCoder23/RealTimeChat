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
const msgSearch = document.getElementById("msgSearch")
const chatsSearch = document.getElementById("searchChats")
const searchBtn = document.getElementById("searchBtn2")
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const login = document.getElementById("login-form");
const toast = document.getElementById("toast");
const chatList = document.getElementById("chats");
const logout = document.getElementById("logout");
const URL = 'http://www.localhost:5000';
const socket = io(URL);

let allMessages = []
let orderedChats = [];
let currentChat = 0;
let chatType = "";
let chatStatus = "normal";
let user;
let searching = false;

socket.on("message", (message) => {
    if(chatStatus == "blocked") return;
    allMessages.push(message);
    if(searching) return;
    if(currentChat == message.chat)
     addMessage(message);
})

socket.on("attachment", file => {
    allMessages.push(file);
    if(searching) return;
    if(currentChat == file.chat)  
    addAttachment(file);
})

socket.on('users', function (_users) {
    console.log(_users + " connected");
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
            if(username)
            username.innerText = "Loading...";
        } 

        return response.json();
    })
    .then(data => {
        console.log(data);
        if (data.success){
            user = data.username;
            username.innerText = user;
            return true;
        }
        else return false;
    })
    .catch(error => {
        if(username)
         username.innerText = "Loading";
        else return false;
    });
}}

const updateChats = (chats) => {
    chatList.innerHTML = "";
    let status;
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
          const activeChat = document.querySelector('.clearfix.active');
          if (activeChat) {
            activeChat.classList.remove('active');
          }
          newChat.classList.add('active');
          chatName.innerText = chats[i].name;
          currentChat = chats[i].id;
          chatType = chats[i].type;
          chatStatus = chats[i].chatStatus;
          sessionStorage.setItem('currentChat', chats[i].id);
          socket.emit("joinRoom", chats[i].id);
        });
      
        chatList.append(newChat);
      }
}

const updateChatMessages = (messages) => {
    messageList.innerHTML = "";
    if(messages.length < 1){
        title2.style.display = "block";
        title2.innerText = "No messages to show here."
        return;
    }
    for(let i = 0; i < messages.length; i++){
        if(messages[i].type == "image" || messages[i].type =="file")
            addAttachment(messages[i]);
        else addMessage(messages[i]);      
    }
}

function addAttachment(file) {
    let type;
    let align = "";
    let content;
    if(file.sender == user) type = "message my-message";
    else {
        type = "message other-message float-right";
        align = "text-right";
        }
    if(file.type == "image"){
        content = `<img src=${file.message} alt="Image" class="chat-image" id=${file.message}>`
    } else {
        content = `<a href=${file.message} target="_blank" class="chat-file">
        View File
      </a>`
    }
    let newMsg = document.createElement("li");
    newMsg.classList.add("clearfix");
    newMsg.innerHTML += `<div class="message-data ${align}">
    <span class="message-data-time">${file.sentAt}</span>
</div>
<div class='${type}'>${content}</div>`;
    messageList.append(newMsg); 
    const fileElement = document.getElementById(file.message);
    if(fileElement){fileElement.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log("toggling....");
        fileElement.classList.toggle("expanded");
        document.getElementById("backdrop").classList.toggle("appear");
        console.log(fileElement.classList);
    });}
}

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
            window.location.href = "/client/index.html";   
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
            const chats = data.data;
            updateChats(chats);
            return;
        }
        else return alert(data.error);
    })
    .catch(error => {
        console.error('Error:', error);
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
            const messages = data.data;
            allMessages = messages;         
            updateChatMessages(messages);
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

function addMessage(message) {
    let type;
    let align = "";
    if(message.sender == user) type = "message my-message";
    else {
        type = "message other-message float-right";
        align = "text-right";
        }
    
    let newMsg = document.createElement("li");
    newMsg.classList.add("clearfix");
    let content;
    if(chatType == "group"){
        content = `<b> ${message.sender} </b> <br> ${message.message}`; 
    }
    else content =  message.message;

    newMsg.innerHTML += `<div class="message-data ${align}">
    <span class="message-data-time">${message.sentAt}</span>
</div>
<div class='${type}'>${content}</div>`;
    messageList.append(newMsg);   
     
}

function messageSubmitHandler(e) {
    e.preventDefault();
    console.log("SENDING MESSAGE...");
    if(currentChat == 0) return alert("Please choose a chat.");
    let message = chatboxinput.value;
    if(message.length < 1) return;
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
            socket.emit("message", {data: message, time: data.data.time, sender: data.data.sender}, user);
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

const searchChats = () => {
    const query = chatsSearch.value;
    fetch(`${URL}/chat/searchChats`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ query: query}),
    })
    .then(response => {
        console.log("RESPONSE:");
        console.log(response);
        if(response.status == 401){
            window.location.href = "/client/index.html";   
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
            const chats = data.data;
            updateChats(chats);
            return;
        }
        else return alert(data.error);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

const searchMsgs = () => {

    const query = msgSearch.value;
    fetch(`${URL}/chat/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ query: query, chatID: currentChat}),
    })
    .then(response => {
        console.log("RESPONSE:");
        console.log(response);
        if(response.status == 401){
            window.location.href = "/client/index.html";   
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
            const messages = data.data;
            updateChatMessages(messages);
            return;
        }
        else return alert(data.error);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

const clearMsgs = () => {
    allMessages = [];
    fetch(`${URL}/chat//clear_chat/${currentChat}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    })
    .then(response => {
        console.log("RESPONSE:");
        console.log(response);
        if (!response.ok) {
            return alert("Failed to clear chat :(");
        } 

        return response.json();
    })
    .then(data => {
        console.log(data);
        if (data.success){
            messageList.innerHTML = "";
            return;
        }
        else return alert(data.error);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

const sendAttachment = (file, type) => {
    if(currentChat == 0) return alert("Please choose a chat.");
    console.log("file: ");
    console.log(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    fetch(`${URL}/chat/sendAttachment/${currentChat}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    })
    .then(response => {
        console.log("FILE RESPONSE:");
        console.log(response);
        if (!response.ok) {
            return alert("Failed to send attachment :(");
        } 

        return response.json();
    })
    .then(data => {
        console.log(data);
        if (data.success){
            console.log(data.data);
            sessionStorage.setItem('sentFile', "yes");
            return socket.emit("attachment", {data: data.message, time: data.data.time, sender: data.data.sender, type: type})
        }
        else return alert(data.error);
    })
    .catch(error => {
        console.error('Error:', error);
        return alert("Ooops couldn't send attachment.");
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
                userOffline();
                window.location.href = "/client/index.html";               
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
    const displayMsgs = sessionStorage.getItem('sentFile');
    if(displayMsgs == "yes") {
        console.log("displayMsgs: ");
        console.log(displayMsgs);
        const chatId = sessionStorage.getItem('currentChat');
        getMessages(chatId);
        sessionStorage.setItem('sentFile', "no");
        title2.style.display = "none";
        topHeading.style.display = "flex";
        bottom.style.display = "block";
    }
    window.addEventListener('focus', userOnline);
    getChats();
    const hiddenBtn = document.getElementById("submitAttachment");
    document.getElementById("clearBtn").addEventListener("click", clearMsgs);
    document.getElementById("imgBtn").addEventListener("click", () => {
        document.getElementById('imgInput').click();
    });
    document.getElementById("fileBtn").addEventListener("click", () => {
        document.getElementById('fileInput').click();
    });
    document.getElementById('imgInput').addEventListener('change', (event) => {
        event.preventDefault();
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            hiddenBtn.click();
            sendAttachment(selectedFile, "image");
        }
    });
    document.getElementById('fileInput').addEventListener('change', (event) => {
        event.preventDefault();
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            hiddenBtn.click();
            sendAttachment(selectedFile, "file");
        }
    })
    sendMsg.addEventListener('click', messageSubmitHandler);
    document.getElementById("searchBtn1").addEventListener("click", searchChats);
    chatsSearch.addEventListener("input", searchChats);
    msgSearch.addEventListener("input", searchMsgs);
    document.getElementById("searchBtn3").addEventListener("click", searchMsgs);
    searchBtn.addEventListener("click", () => {
        const iconElement = searchBtn.querySelector("i");
        searching = !searching;

        if (searching) {
            messageList.innerHTML = "";
            iconElement.classList.remove("fa-search");
            iconElement.classList.add("fa-comment");
            document.getElementById("searchBlock").style.display = "flex";
            bottom.style.display = "none";
        } else {
            //messageList = allMessages;
            updateChatMessages(allMessages);
            iconElement.classList.remove("fa-comment");
            iconElement.classList.add("fa-search");
            document.getElementById("searchBlock").style.display = "none";
            bottom.style.display = "block";
          }
    });
    document.getElementById("attachmentsForm").addEventListener("submit", e =>{
        e.preventDefault();
    })
}

if(login)
  login.addEventListener('submit', loginHandler);

if(!getProfile() && login){
    window.location.href = "/client/main.html"; 
}