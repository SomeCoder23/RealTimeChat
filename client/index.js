const messageform = document.querySelector(".chatbox form");
const messageList = document.querySelector("#messagelist");
const userList = document.querySelector("ul#users");
const chatboxinput = document.querySelector(".chatbox input")
const useraddform = document.querySelector(".modal")
const backdrop = document.querySelector(".backdrop")
const useraddinput = document.querySelector(".modal input");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const chats = document.getElementById("chats");
const URL = 'http://www.localhost:5000';
const socket = io(URL);

let users = [];
let messages = []
let room;

console.log(messageList);
messageform.addEventListener('submit', messageSubmitHandler)
useraddform.addEventListener('submit', userAddHandler)

socket.on("message", (message) => {
    messages.push(message);
    updateMessages()
})


socket.on('users', function (_users) {
    users = _users
    updateUsers()
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

    fetch(`${URL}/chat/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
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

function userAddHandler(e) {
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username, password: password }),
                credentials: 'include',
            })
            .then(response => {
                console.log("RESPONSE:");
                console.log(response);
                if (!response.ok) {
                    return alert("Password or Username incorrect :(");
                } 

                return response.json();
            })
            .then(data => {
                console.log(data);
                // Handle the response as needed
                if (data.success){
                    socket.emit("adduser", username)
                    useraddform.classList.add("disappear");
                    backdrop.classList.add("disappear");
                    getChats();
                    return;
                }
                else return alert("Password or Username incorrect :(");
            })
            .catch(error => {
                console.error('Error:', error);
            });
}

//if(chats) getChats();