// index.js
const TelegramBot = require('node-telegram-bot-api');

// 🔑 Paste your actual bot token here
const token = '7432913881:AAGE0IwEaFr1HI92W1R2rZOxqqLHzyuQl1Q';

const bot = new TelegramBot(token, { polling: true });

// Your deployed web app URL (from Vercel/Netlify)
const WEB_APP_URL = 'https://telegram-chess-eta.vercel.app/';

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Welcome! Tap below to play Chess:', {
    reply_markup: {
      inline_keyboard: [[
        { text: '♟️ Start Game', web_app: { url: WEB_APP_URL } }
      ]]
    }
  });
});
