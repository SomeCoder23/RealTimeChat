import express from "express";
import {
  createChat,
  getChatMessages,
  sendMessage,
  clearChat,
  getGroupInfo,
  leaveRoom,
  getChats,
  addParticipant,
  removeParticipant,
  deleteMessage,
  addContact,
  getHistory,
  searchUsers,
  searchMessages,
  searchChats,
  changeChatStatus
} from "../controllers/chat.js";
import { fileURLToPath } from "url";
import path from "path";
import multer from "multer";

var router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads/");
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });
router.use("/uploads", express.static(path.join(__dirname, "uploads")));

//POST ROUTES
router.post("/sendMessage/:chatId", (req, res, next) =>
  sendMessage(req, res, next, "text")
);
router.post(
  "/sendAttachment/:chatId",
  upload.single("file"),
  (req, res, next) => sendMessage(req, res, next, "attachment")
);
router.post("/create_group", createChat);
router.post("/start_chat/:username", createChat);
router.post("/add_participant", addParticipant);
router.post("/remove_participant", removeParticipant);
router.post("/clear_chat/:chatId", clearChat);

//router.post('/addContact/:username', addContact);
//removes self permenantly from chat....
router.post("/leave_chat/:chatId", leaveRoom);
router.post("/searchUsers/:query", searchUsers);
router.post("/search", searchMessages);
router.post("/searchChats/:query", searchChats);

//GET ROUTES

//not started*********************************
router.get("/", getChats);
router.get("/chatInfo/:chatId", getGroupInfo);
router.get("/conversations", getChats);
router.get("/getMessages/:chatId", getChatMessages);
router.get("/history/:chatId", getHistory);

//PUT ROUTES
router.put("/changeStatus", changeChatStatus);

//DELETE ROUTES
router.delete("/delete_message/:messageId", deleteMessage);
//the same as leave chat, should probably change one... :(
router.delete("/delete_chat/:chatId", leaveRoom);

export default router;
