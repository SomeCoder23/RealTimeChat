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
  getHistory,
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
const upload = multer({ storage: storage });
router.use("/uploads", express.static(path.join(__dirname, "uploads")));


//POST ROUTES
router.post("/message/:chatId", (req, res, next) =>
  sendMessage(req, res, next, "text")
);
router.post("/attachment/:chatId",
  upload.single("file"),
  (req, res, next) => sendMessage(req, res, next, "attachment")
);
router.post("/group", createChat);
router.post("/newChat/:username", createChat);
router.post("/add_participant", addParticipant);
router.post("/remove_participant", removeParticipant);
router.post("/clear_chat/:chatId", clearChat);
router.post("/searchMsgs", searchMessages);
router.post("/search", searchChats);
router.post("/leave_chat/:chatId", leaveRoom);

//GET ROUTES
router.get("/", getChats);
router.get("/chatInfo/:chatId", getGroupInfo);
router.get("/conversations", getChats);
router.get("/messages/:chatId", getChatMessages);
router.get("/history/:chatId", getHistory);

//PUT ROUTES
router.put("/changeStatus", changeChatStatus);

//DELETE ROUTES
//router.delete("/delete_message/:messageId", deleteMessage);

export default router;