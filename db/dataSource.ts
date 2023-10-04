import { DataSource } from "typeorm";
import { User } from "./entities/User.js";
import { Profile } from "./entities/Profile.js";
import { Chat } from "./entities/Chat.js";
import { Message } from "./entities/Message.js";

const dataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'chatapp',
  entities: [Chat, Message, User, Profile],
  synchronize: true,
  logging: true
});


const initialize = async () =>
await dataSource.initialize().then(() => {
  console.log("Connected to DB!");
}).catch(err => {
  console.error('Failed to connect to DB: ' + err);
});

export default { initialize, dataSource};