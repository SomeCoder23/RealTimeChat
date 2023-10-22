
import "../dist/config.js";
import express from "express";
import request from "supertest";
import usersRouter from "../dist/routes/users.js";
import dataSource from "../dist/db/dataSource.js";
import { login } from "../dist/controllers/user.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use("/users", usersRouter);
app.use(express.urlencoded({ extended: false }));


beforeAll(async () => {
  await dataSource.initialize().then(() => {
        console.log('DB connected');
    }).catch(err => {
        console.log("DB connection failed", err);
    });
}, 30000);

// afterAll(async () => {
//   await dataSource.destroy();
// });

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

describe("Logout process", () => {
  it("should logout with valid credentials", async () => {
    const user = {
      username: "raghad"
    };

    const response = await  request(app).post("/users/login").send(user);

    expect(response.status).toBe(200);
  });
});