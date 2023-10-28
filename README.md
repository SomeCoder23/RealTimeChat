# Real-Time Chat App:

## API Documentation: 

- ### User Endpoints:
  - #### Register User

Allow the a new user to register with their credentials into the system.

**URL** : `/users/register`

**Method** : `POST`

**Auth required** : No

**Data examples**

```json
{
    "username": "Janey20",
    "fullName": "Jane Doe",
    "password": "jane1234",
    "email": "janey@gmail.com",
    "birthday": "2000-02-02"
}
```

```json
{
     "username": "Johney101",
    "fullName": "John Doe",
    "password": "john1234",
    "email": "johney@gmail.com",
    "birthday": "2000-02-02",
    "bio": "hey guys I'm john :), feel free to message me anytime"
}
```

**Success Responses**

**Condition** : Data provided is valid.

**Code** : `201`


**Error Response**

- `401:` Unauthorized.
- `409:` Username is already used.
- `500:` Internal server error.
- 
  ---
 
  - #### Login
  Allow the user to login successfully with their username and password.

**URL** : `/users/login`

**Method** : `POST`

**Auth required** : No

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Logout
   Allow the user to logout.

**URL** : `/users/logout`

**Method** : `POST`

**Auth required** : Yes

**Data examples**
No data.

**Success Responses**

**Condition** : Successfully cleared all cookies and logged out.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Add Contact
   Add new contact.

**URL** : `/users/addContact/:username`

**Method** : `POST`

**Auth required** : Yes

**Data examples**
No data in body, only in params.

**Success Responses**

**Condition** : Username provided is valid.

**Code** : `201 OK`


**Error Response**

- `401:` Unauthorized.
- `409:` Contact already exists.
- `404:` Other user doesn't exist.
- `500:` Internal server error.

   ---
  
  - #### Display Users
   Display the all the registered user's profiles and usernames.

**URL** : `/users/`

**Method** : `GET`

**Auth required** : Yes

**Data examples**
No data.

**Success Responses**

**Condition** : Connected to DB and got users

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Display Contacts
   Display user's contacts

**URL** : `/users/contacts`

**Method** : `GET`

**Auth required** : Yes

**Data examples**
No data.

**Success Responses**

**Condition** : Connected to DB and got contacts.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Search Users
   Search all registered users by thier username.

**URL** : `/users/search/:query`

**Method** : `GET`

**Auth required** : Yes

**Data examples**
No data in body, only params.

**Success Responses**

**Condition** : Connected to DB and got users.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Get Presence Status
Get the presence status (online /offline) of a certain user.

**URL** : `/users/status/:id `

**Method** : `GET`

**Auth required** : Yes

**Data examples**
No data in body only params.

**Success Responses**

**Condition** : User exists.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `404:` User not found.
- `500:` Internal server error.

   ---
  
  - #### Get User's Profile
    Get the currently logged in user's profile.
    
**URL** : `/users/profile`

**Method** : `GET`

**Auth required** : Yes

**Data examples**
No data.

**Success Responses**

**Condition** : User is authorized.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Get Specific Profile
  Get a specified user's profile.

**URL** : `/users/profile/:userId`

**Method** : `GET`

**Auth required** : Yes

**Data examples**
No data in body only params.

**Success Responses**

**Condition** : User id (from params) is valid

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `404:` User not found.
- `500:` Internal server error.

   ---
  
  - #### Update Profile
  Allow the user to update their profile.

**URL** : `/users/profile`

**Method** : `PUT`

**Auth required** : Yes

**Data examples**

```json
{
    "fullName": "updatedName",
    "bio": "updatedBio",
    "birthday" : "0000-00-00",
}
```

**Success Responses**

**Condition** : Updated and save profile to db.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Change Password
  Allow the user to change password.

**URL** : `/users/change_password`

**Method** : `PUT`

**Auth required** : Yes

**Data examples**

```json
{
    "new": "newPass1234",
    "old": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized + Current password incorrect.
- `400:` Invalid new password, should contain at least 6 characters.
- `500:` Internal server error.

   ---
  
  - #### Change Friend Status
 Change the status (blocked/normal) with a contact.
 
**URL** : `/users/change_relationship`

**Method** : `PUT`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Johney20",
    "status": "blocked"
}
```

**Success Responses**

**Condition** : Data provided is valid and was saved successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `409:` Contact does not exist.
- `404:` Other user not found.
- `500:` Internal server error.

   ---
 
  
- ### Chat Endpoints:
  - #### Send Message
   Allow the user to send a text message to the specified chat.

**URL** : `/chat/sendMessage/:chatId`

**Method** : `POST`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Send Attachment
  Allow the user to send an attachment to the specified chat.
 
**URL** : `/chat/sendAttachment/:chatId`

**Method** : `POST`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Create New Group
   Allow the user to create a new group chat and add participants

**URL** : `/chat/create_group`

**Method** : `POST`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---

  - #### Start One-To-One Chat
   Allow the user to create a one-to-one chat with the specified user.

**URL** : `/chat/start_chat/:username`

**Method** : `POST`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Add participant
  Allow the user to add a new participant to an already created group chat. 

**URL** : `/chat/add_participant`

**Method** : `POST`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Remove participant
   Allow the user to remove a participant from a group chat, if the currently logged in user is the admin of the group.

**URL** : `/chat/remove_participant`

**Method** : `POST`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Clear Chat
   Allow the user to clear the specified chat of all messages.
  
**URL** : `/chat/clear_chat/:chatId`

**Method** : `POST`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Search Messages
   Allow the user to search through the messages of a specified chat.
  
**URL** : `/chat/search`

**Method** : `POST`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Search Chats
   Allow the user to search through all the chat rooms (1-to-1 + groups) they are in.

**URL** : `/chat/searchChats`

**Method** : `POST`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---

  - #### Leave Chat
   Allow the user to leave a certain chat, the chat will no longer appear for the user.

**URL** : `/chat/leave_chat/:chatId`

**Method** : `POST`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---

  - #### Display Chats
   Gets all the chats the user is currently a participant of.

**URL** : `/chat/` or `/chat/conversations`

**Method** : `GET`

**Auth required** : YES

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Display Chat Info
   Gets the info of a certain chat.

**URL** : `/chat/chatInfo/:chatId`

**Method** : `GET`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Display Chat Messages
   Gets the messages of a certain chat, only gets messages of the last 24 hours.

**URL** : `/chat/getMessages/:chatId`

**Method** : `GET`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Display Chat History
   Gets ALL messages of a certain chat.

**URL** : `/chat/history/:chatId`

**Method** : `Get`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Change Chat Room Status
   Change the status of a chat room, (normal/ blocked/ muted)

**URL** : `/chat/changeStatus`

**Method** : `PUT`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
  - #### Delete Message
   Allow the user to delete a certain message they sent.

**URL** : `/chat/delete_message/:messageId`

**Method** : `DELETE`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to login successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  


### To implement this chat app we used:
- Express + Node JS
- TypeORM
- Xampp
- PostMan
- Socket.io
- AWS EC2
- ASG + RDS
- SES
