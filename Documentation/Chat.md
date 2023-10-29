# Chat Endpoints

- ### Send Message
Allow the user to send a text message to the specified chat.

**URL** : `/chat/sendMessage/:chatId`

**Method** : `POST`

**Auth required** : Yes

**Data examples:**

```json
{
    "username": "Janey20",
    "password": "jane1234"
}
```

**Success Responses:**

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
  
