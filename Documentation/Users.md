# User Endpoints

- ### Register User

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

**Success Responses:**

**Condition** : Data provided is valid.

**Code** : `201`


**Error Response:**

- `401:` Unauthorized.
- `409:` Username is already used.
- `500:` Internal server error.

  ---
 
 - ### Login
  Allow the user to login successfully with their username and password.

**URL** : `/users/login`

**Method** : `POST`

**Auth required** : No

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


**Error Response:**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
- ### Logout
   Allow the user to logout.

**URL** : `/users/logout`

**Method** : `POST`

**Auth required** : Yes

**Data examples:**
No data.

**Success Responses:**

**Condition** : Successfully cleared all cookies and logged out.

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
- ### Add Contact
   Add new contact.

**URL** : `/users/addContact/:username`

**Method** : `POST`

**Auth required** : Yes

**Data examples:**
No data in body, only in params.

**Success Responses:**

**Condition** : Username provided is valid.

**Code** : `201 OK`


**Error Response:**

- `401:` Unauthorized.
- `409:` Contact already exists.
- `404:` Other user doesn't exist.
- `500:` Internal server error.

   ---
  
- ### Display Users
   Display the all the registered user's profiles and usernames.

**URL** : `/users/`

**Method** : `GET`

**Auth required** : Yes

**Data examples:**
No data.

**Success Responses:**

**Condition** : Connected to DB and got users

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
- ### Display Contacts
   Display user's contacts

**URL** : `/users/contacts`

**Method** : `GET`

**Auth required** : Yes

**Data examples:**
No data.

**Success Responses:**

**Condition** : Connected to DB and got contacts.

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
- ### Search Users
   Search all registered users by thier username.

**URL** : `/users/search/:query`

**Method** : `GET`

**Auth required** : Yes

**Data examples:**
No data in body, only params.

**Success Responses:**

**Condition** : Connected to DB and got users.

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
- ### Get Presence Status
Get the presence status (online /offline) of a certain user.

**URL** : `/users/status/:id `

**Method** : `GET`

**Auth required** : Yes

**Data examples:**
No data in body only params.

**Success Responses:**

**Condition** : User exists.

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `404:` User not found.
- `500:` Internal server error.

   ---
  
- ### Get User's Profile
    Get the currently logged in user's profile.
    
**URL** : `/users/profile`

**Method** : `GET`

**Auth required** : Yes

**Data examples:**
No data.


**Success Responses:**

**Condition** : User is authorized.

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
- ### Get Specific Profile
  Get a specified user's profile.

**URL** : `/users/profile/:userId`

**Method** : `GET`

**Auth required** : Yes

**Data examples:**
No data in body only params.


**Success Responses:**

**Condition** : User id (from params) is valid

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `404:` User not found.
- `500:` Internal server error.

   ---
  
- ### Update Profile
  Allow the user to update their profile.

**URL** : `/users/profile`

**Method** : `PUT`

**Auth required** : Yes

**Data examples:**

```json
{
    "fullName": "updatedName",
    "bio": "updatedBio",
    "birthday" : "0000-00-00",
}
```

**Success Responses:**

**Condition** : Updated and save profile to db.

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `500:` Internal server error.

   ---
  
- ### Change Password
  Allow the user to change password.

**URL** : `/users/change_password`

**Method** : `PUT`

**Auth required** : Yes

**Data examples:**

```json
{
    "new": "newPass1234",
    "old": "jane1234"
}
```

**Success Responses:**

**Condition** : Data provided is valid.

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized + Current password incorrect.
- `400:` Invalid new password, should contain at least 6 characters.
- `500:` Internal server error.

   ---
  
- ### Change Friend Status
 Change the status (blocked/normal) with a contact.
 
**URL** : `/users/change_relationship`

**Method** : `PUT`

**Auth required** : Yes

**Data examples:**

```json
{
    "username": "Johney20",
    "status": "blocked"
}
```

**Success Responses:**

**Condition** : Data provided is valid and was saved successfully.

**Code** : `200 OK`


**Error Response:**

- `401:` Unauthorized.
- `409:` Contact does not exist.
- `404:` Other user not found.
- `500:` Internal server error.

   ---
 
