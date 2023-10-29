# Chat Endpoints

- ### Send Message
Allow the user to send a text message to the specified chat.

**URL** : `/chat/sendMessage/:chatId`

**Method** : `POST`

**Auth required** : Yes

**Data examples:**

```json
{
    "content": "I want to sleeeeeep"
}
```

**Success Responses:**

**Condition** : Chat ID provided is valid.

**Code** : `201 CREATED`


**Error Response:**

- `401:` Unauthorized.
- `404:` Chat not found.
- `500:` Internal server error.

   ---
  
- ### Send Attachment
Allow the user to send an attachment to the specified chat.
 
**URL** : `/chat/sendAttachment/:chatId`

**Method** : `POST`

**Auth required** : Yes

**Data examples:**

 file 

**Success Responses:**

**Condition** : Chat ID is valid and file is in request.

**Code** : `201 CREATED`


**Error Response:**

- `401:` Unauthorized.
- `404:` Chat not found.
- `500:` Internal server error (Failed file upload)

   ---
  
- ### Create New Group
Allow the user to create a new group chat and add participants

**URL** : `/chat/create_group`

**Method** : `POST`

**Auth required** : Yes

**Data examples:**

```json
{
    "name": "Group Chat #1",
    "description": "I have no idea what this group is for.",
    "participants": ["Johney123", "SomePerson", "AnotherPerson"]
}
```

**Success Responses:**

**Condition** : Data provided is valid and was able to add it to the DB.

**Code** : `201 CREATED`


**Error Response:**

- `401:` Unauthorized.
- `400:` Participants usernames are all invalid
- `500:` Internal server error.

   ---

- ### Start One-To-One Chat
   Allow the user to create a one-to-one chat with the specified user.

**URL** : `/chat/start_chat/:username`

**Method** : `POST`

**Auth required** : Yes

**Data examples:**
No data in body only in params.


**Success Responses:**

**Condition** : Data provided is valid.

**Code** : `201 CREATED`


**Error Response:**

- `401:` Unauthorized.
- `409:` Chat already exists.
- `400:` Participant username invalid
- `500:` Internal server error.

   ---
  
- ### Add participant
  Allow the user to add a new participant to an already created group chat. 

**URL** : `/chat/add_participant`

**Method** : `POST`

**Auth required** : Yes

**Data examples:**

```json
{
    "username": "Janey20",
    "chatID": "123"
}
```

**Success Responses:**

**Condition** : Data provided is valid and was able to update DB successfully.

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `400:` Invalid username + Participant already added to the group.
- `404:` Chat not found.
- `500:` Internal server error.

   ---
  
- ### Remove participant
   Allow the user to remove a participant from a group chat.

**URL** : `/chat/remove_participant`

**Method** : `POST`

**Auth required** : Yes

**Data examples**

```json
{
    "username": "Janey20",
    "chatID": "123"
}
```

**Success Responses**

**Condition** : Data provided is valid and was able to update DB successfully.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `400:` Invalid username + Participant is not in chat.
- `404:` Chat not found.
- `500:` Internal server error.

   ---
  
- ### Clear Chat
   Allow the user to clear the specified chat of all messages.
  
**URL** : `/chat/clear_chat/:chatId`

**Method** : `POST`

**Auth required** : Yes

**Data examples:**
No body only params.

**Success Responses:**

**Condition** : Chat ID valid.

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `404:` Chat not found.
- `500:` Internal server error.

   ---
  
- ### Search Messages
   Allow the user to search through the messages of a specified chat.
  
**URL** : `/chat/search`

**Method** : `POST`

**Auth required** : Yes

**Data examples:**

```json
{
    "query": "some query",
    "chatID": "2"
}
```

**Success Responses:**

**Condition** : Chat ID is valid

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `404:` Chat not found.
- `500:` Internal server error.

   ---
  
- ### Search Chats
Allow the user to search through all the chat rooms (1-to-1 + groups) they are in.

**URL** : `/chat/searchChats`

**Method** : `POST`

**Auth required** : Yes

**Data examples:**

```json
{
    "query": "some query"
}
```

**Success Responses:**

**Condition** : Connected to DB and got results.

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---

- ### Leave Chat
   Allow the user to leave a certain chat, the chat will no longer appear for the user.

**URL** : `/chat/leave_chat/:chatId`

**Method** : `POST`

**Auth required** : Yes

**Data examples:**
No body only params.

**Success Responses:**

**Condition** : Chat ID valid.

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `404:` Chat not found.
- `500:` Internal server error.

   ---

- ### Display Chats
Gets all the chats the user is currently a participant of.

**URL** : `/chat/` or `/chat/conversations`

**Method** : `GET`

**Auth required** : YES

**Success Responses:**

**Condition** : Connected to DB and got results.

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
- ### Display Chat Info
   Gets the info of a certain chat.

**URL** : `/chat/chatInfo/:chatId`

**Method** : `GET`

**Auth required** : Yes


**Success Responses:**

**Condition** : Chat ID is valid

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `404:` Chat not found.
- `500:` Internal server error.

   ---
  
- ### Display Chat Messages
Gets the messages of a certain chat, only gets messages of the last 24 hours.

**URL** : `/chat/getMessages/:chatId`

**Method** : `GET`

**Auth required** : Yes


**Success Responses:**

**Condition** : Chat ID is valid

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `404:` Chat not found.
- `500:` Internal server error.

   ---
  
- ### Display Chat History
Gets ALL messages of a certain chat.

**URL** : `/chat/history/:chatId`

**Method** : `Get`

**Auth required** : Yes


**Success Responses:**

**Condition** : Chat ID is valid

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `404:` Chat not found.
- `500:` Internal server error.

   ---
  
- ### Change Chat Room Status
Change the status of a chat room, (normal/ blocked/ muted)

**URL** : `/chat/changeStatus`

**Method** : `PUT`

**Auth required** : Yes

**Data examples**

```json
{
    "chatID": "2",
    "status": "mute"
}
```

**Success Responses**

**Condition** : Chat ID valid and db updated successfully.
**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `404:` Chat not found.
- `500:` Internal server error.

   ---
  
- ### Delete Message
Allow the user to delete a certain message they sent.

**URL** : `/chat/delete_message/:messageId`

**Method** : `DELETE`

**Auth required** : Yes

**Data examples**
No body only params.

**Success Responses**

**Condition** : Message ID is valid and current user sent the message.

**Code** : `200 OK`


**Error Response**

- `401:` Unauthorized.
- `403:` Current user did not send message.
- `404:` Message not found.
- `500:` Internal server error.

   ---
  
