require("dotenv").config();
const http = require("http");
const { createBotApp } = require("./app");

const { bot } = createBotApp();

bot.launch();
console.log("Bot ishga tushdi");

const PORT = process.env.PORT || 10000;

http
    .createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("University BOT 2.0 ishlayapti");
    })
    .listen(PORT, "0.0.0.0", () => {
        console.log(`Health server portda ishga tushdi: ${PORT}`);
    });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));