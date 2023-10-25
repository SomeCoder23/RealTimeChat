import "../dist/config.js";
import express from "express";
import { Request, Response } from 'express'; 
import request from "supertest";
import usersRouter from "../dist/routes/users.js";
import dataSource from "../dist/db/dataSource.js";
import {
  updateUserProfileTEST,
  getContactsTEST
} from "../dist/controllers/user.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { User } from "../dist/db/entities/User.js";
import { getChatsTEST } from "../dist/controllers/chat.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use("/users", usersRouter);
// app.use("/chat", authenticate, chatRouter);

app.use(express.urlencoded({ extended: false }));

beforeAll(async () => {
  await dataSource
    .initialize()
    .then(() => {
      console.log("DB connected");
    })
    .catch((err) => {
      console.log("DB connection failed", err);
    });
}, 500000);

afterAll(async () => {
  await dataSource.dataSource.destroy();
});


const username = "TEST_USER";
let token;

describe("register process", () => {
  it("should register with valid credentials", async () => {
    const user = {
      fullName: "new person",
      username: "TEST_USER2",
      password: "123456",
      birthday: "2000-11-11",
      email: "hayat@gmail.com",
    };

    const response = await request(app).post("/users/register").send(user);
    if(response.statusCode == 400)
      console.log(response.body.error);
    expect(response.status).toBe(201);

  });
});


describe("Login process", () => {
  it("should login with valid credentials", async () => {
    const user = {
      username: username,
      password: "123456",
    };

    const response = await request(app).post("/users/login").send(user);

    expect(response.status).toBe(200);
    token = response.body.token;

  });
});


describe("searchUsers process", () => {
  it("should search for users by username", async () => {
    const query = "raghad"; // Replace with the query you want to search for
    const response = await request(app).get(`/users/search/${query}`);

    expect(response.status).toBe(200);

    expect(Array.isArray(response.body.data)).toBe(true);
  });
});


describe("getChats process", () => {
  
  it("should return chats for current user", async () => {
    const user = await User.findOneBy({username});
    const result = await getChatsTEST(user);
    console.log("RESULT: ");
    console.log(result);
    expect(result.status).toBe(200);
    expect(Array.isArray(result.data)).toBe(true);
  });
});

describe("updateUserProfile process", () => {

  const name = "test name2";
  const bio = "i'm quitting programminggggg";
  const bday = "1900-11-12";

  it("should update profile of user", async () => {
    const user = await User.findOneBy({username});
    const result = await updateUserProfileTEST(user, {fullName: name, bio: bio, birthday: bday});
    console.log("RESULT: ");
    console.log(result);
    expect(result.status).toBe(201);
    expect(result.data.fullName).toBe(name);
    expect(result.data.birthday).toBe(bday);
    expect(result.data.bio).toBe(bio);
  });

});


describe("getContacts process", () => {
  it("should retrieve user contacts", async () => {
    const user = await User.findOneBy({username});
    const result = await getContactsTEST(user);
    console.log("RESULT: ");
    console.log(result);
    expect(result.status).toBe(200);
    expect(Array.isArray(result.data)).toBe(true);
  });
});
