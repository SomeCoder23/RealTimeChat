
import "../dist/config.js";
import express from "express";
import request from "supertest";
import usersRouter from "../dist/routes/users.js";
import dataSource from "../dist/db/dataSource.js";
import {createUser, login } from "../dist/controllers/user.js";
import dotenv from "dotenv";
// import { authenticate } from "../middleware/auth/authenticate.js";


dotenv.config();
const app = express();
app.use(express.json());
app.use("/users", usersRouter);
// app.use("/chat", authenticate, chatRouter);

app.use(express.urlencoded({ extended: false }));

beforeAll(async () => {
  await dataSource.initialize().then(() => {
    console.log('DB connected');
  }).catch(err => {
        console.log("DB connection failed", err);
      });
    }, 100000);
    
    afterAll(async () => {
        await dataSource.dataSource.destroy();
      });
      
      
      describe("register process", () => {
        it("should register with valid credentials", async () => {
          const user = {
             fullName : "randaa dalati",
             username:"randahh",
             password:"123456",
             birthday: "2003-11-11"
          };
      
          const response = await  request(app).post("/users/register").send(user);
      
          expect(response.status).toBe(201);
        });
      });


      describe("Login process", () => {
  it("should login with valid credentials", async () => {
    const user = {
      username: "raghad",
      password: "123456",
    };

    const response = await  request(app).post("/users/login").send(user);

    expect(response.status).toBe(200);
  });
});

// describe("register process", () => {
//   it("should register with valid credentials", async () => {
//     const user = {
//        fullName : "roaa shaheen",
//        username:"roreti",
//        password:"123456",
//        birthday: "2003-08-10"
//     };

//     const response = await  request(app).post("/chat/create_group").send(user);

//     expect(response.status).toBe(201);
//   });
// });


// describe("Logout process", () => {
//   it("should logout with valid credentials", async () => {
//     const user = {
//       username: "hadool"
//     };

//     const response = await  request(app).post("/users/logout").send(send);

//     expect(response.status).toBe(200);
//   });
// });



// describe("addContact process", () => {
//   it("should add a contact with valid credentials", async () => {
//     // Replace these values with valid test data
//     const user = {
//       fullName: "John Doe",
//       username: "john_doe",
//       password: "password123",
//       birthday: "1990-01-15"
//     };

//     // Create a new user to act as the contact
//     const contactUser = {
//       fullName: "Alice Smith",
//       username: "alice_smith",
//       password: "contact_password",
//       birthday: "1995-05-20"
//     };

//     // Register the contact user
//     const registerContactResponse = await request(app).post("/users/register").send(contactUser);

//     // Ensure the contact user is successfully registered
//     expect(registerContactResponse.status).toBe(201);

//     // Authenticate as the user
//     const loginResponse = await request(app).post("/users/login").send(user);

//     // Ensure the user is successfully logged in
//     expect(loginResponse.status).toBe(200);

//     // Add the contact
//     const addContactResponse = await request(app).post(`chat/addcontact/${contactUser.username}`)
//       .set("Authorization", `Bearer ${loginResponse.body.token}`); // Replace with your authentication method

//     // Ensure the contact is successfully added
//     expect(addContactResponse.status).toBe(200);
//   });
// });




