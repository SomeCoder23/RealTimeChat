//import axios from "axios";

const sendMsg = document.getElementById("send");
const messageList = document.getElementById("messages");
const chatboxinput = document.getElementById("input")


const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const login = document.getElementById("login-form");
const toast = document.getElementById("toast");
const chats = document.getElementById("chats");
const URL = 'http://www.localhost:5000';
const socket = io(URL);

let users = [];
let messages = []
//let room;

if(sendMsg)
    sendMsg.addEventListener('click', messageSubmitHandler);

if(login)
login.addEventListener('submit', loginHandler)

socket.on("message", (message) => {
    messages.push(message);
    updateMessages(message.message);
})


socket.on('users', function (_users) {
    console.log(_users + " connected");
    // users = _users
    // updateUsers();
});

const getChats = () => {
    console.log("Getting chats...");
    fetch(`${URL}/chat/conversations`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
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
           for(let i = 0; i < data.chats.length; i++){
            var node = document.createElement("LI");
            var textnode = document.createTextNode(data.chats[i]);
            node.appendChild(textnode);
            chats.appendChild(node);
           }
            return;
        }
        else return alert("Problemo :(");
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

    messageList.innerHTML += `<li class="clearfix">
    <div class="message-data">
        <span class="message-data-time">10:12 AM, Today</span>
    </div>
    <div class="message my-message">${message}</div>                                    
    </li>`;
    
}

function messageSubmitHandler(e) {
    e.preventDefault();
    console.log("SENDING MESSAGE...");
    let message = chatboxinput.value;

    fetch(`${URL}/chat/sendMessage`, {
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
            socket.emit("message", message)

            chatboxinput.value = ""
            return;
        }
        else return alert("Failed to send Message :(");
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
                    window.location.href = "/client/main.html";               
                    return;
                }
                else return toast.innerText = "Password or Username incorrect :(";
            })
            .catch(error => {
                console.error('Error:', error);
            });
}

