import { DataSource } from "typeorm";
import { User } from "./entities/User.js";
import { Profile } from "./entities/Profile.js";
import { Chat } from "./entities/Chat.js";
import { Message } from "./entities/Message.js";
import { Contacts } from "./entities/Contacts.js";
import "dotenv/config";

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Chat, Message, Profile, Contacts],
  synchronize: true,
  //logging: true
});


const initialize = async () =>
await dataSource.initialize().then(() => {
  console.log("Connected to DB!");
}).catch(err => {
  console.error('Failed to connect to DB: ' + err);
});

export default { initialize, dataSource};