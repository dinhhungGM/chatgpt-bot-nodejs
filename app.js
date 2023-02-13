// Config các biến môi trường
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const TelegramBot = require("node-telegram-bot-api");
const ChatGPTService = require("./services/chatgpt.service");
const DbService = require("./services/db.service");

const telegramToken = process.env.TELEGRAM_KEY;

DbService.connect().then(() => {
  // Khởi tạo con Bot từ Token với chế độ Polling
  const bot = new TelegramBot(telegramToken, { polling: true });

  bot.on("message", async (msg) => {
    const authorId = msg.from.id; // Lấy id của người gửi
    const chatId = msg.chat.id; // ID của cuộc trò chuyện hiện tại
    const chatMsg = msg.text; // Nội dung của tin nhắn đã nhận
    // Đầu tiên sẽ lấy thông tin user ra
    const user = await DbService.getUserByTelegramId(authorId);
    // Trả lời tin nhắn dựa trên các tin nhắn cũ
    ChatGPTService.generateCompletion(chatMsg, user).then((responseMsg) => {
      bot.sendMessage(chatId, responseMsg);
    });
  });
});

app.get("/", () => {
  res.send("Server is running");
});

app.listen(PORT, () => {
  console.log("Server is running");
});
