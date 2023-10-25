import "../dist/config.js";
import express from "express";
import request from "supertest";
import usersRouter from "../dist/routes/users.js";
import dataSource from "../dist/db/dataSource.js";
import {
  createUser,
  login,
  searchUsers,
  logout,
  updateUserProfile,
  getContacts,
} from "../dist/controllers/user.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// import { authenticate } from "../middleware/auth/authenticate.js";

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




describe("register process", () => {
  it("should register with valid credentials", async () => {
    const user = {
      fullName: "hayat amro",
      username: "hayoot",
      password: "123456",
      birthday: "2000-11-11",
      email: "hayat@gmail.com",
    };

    const response = await request(app).post("/users/register").send(user);

    expect(response.status).toBe(201);
  });
});




describe("Login process", () => {
  it("should login with valid credentials", async () => {
    const user = {
      username: "raghad",
      password: "123456",
    };

    const response = await request(app).post("/users/login").send(user);

    expect(response.status).toBe(200);
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





// describe("logout process", () => {
//   it("should log out the user", async () => {
//     const user = {
//       username: "raghad",
//     };

//     const authToken = jwt.sign(
//       { username: user.username },
//       process.env.SECRET_KEY,
//       {
//         expiresIn: "1h",
//       }
//     );

//     const response = await request(app)
//       .post("/users/logout")
//       .set("Authorization", `Bearer ${authToken}`);

//     expect(response.status).toBe(200);

//     expect(response.body.success).toBe(true);
//   });
// });




// describe("updateUserProfile process", () => {
//   it("should update the user profile", async () => {
//     // Assuming you have already authenticated the user and have a valid token
//     const authToken = "your_auth_token_here";

//     const updatedProfile = {
//       fullName: "New Full Name",
//       birthday: "1990-01-01",
//       bio: "New bio information",
//     };

//     const response = await request(app)
//       .put("/users/profile")
//       .send(updatedProfile)
//       .set("Authorization", `Bearer ${authToken}`); // Replace with your authentication method

//     expect(response.status).toBe(201);

//     // Assuming the response body contains the updated profile data
//     expect(response.body.success).toBe(true);
//     expect(response.body.msg).toBe("Profile Updated Successfully!");
//     expect(response.body.data.fullName).toBe(updatedProfile.fullName);
//     expect(response.body.data.birthday).toBe(updatedProfile.birthday);
//     expect(response.body.data.bio).toBe(updatedProfile.bio);
//   });
// });





// describe("getContacts process", () => {
//   it("should retrieve user contacts", async () => {
//     const authToken = "your_auth_token_here";

//     const response = await request(app)
//       .get("/users/contacts")
//       .set("Authorization", `Bearer ${authToken}`);

//     expect(response.status).toBe(200);

//     expect(response.body.success).toBe(true);
//     expect(Array.isArray(response.body.data)).toBe(true);
//   });
// });
