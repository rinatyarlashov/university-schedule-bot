require("dotenv").config();
const { Telegraf } = require("telegraf");
const http = require("http");
const startHandler = require("./handlers/startHandler");
const {
    adminPanel,
    handleExcelUpload,
    sendExcelTemplate,
    askBroadcastMessage,
    handleBroadcastText,
    showStats,
    isAdmin
} = require("./handlers/adminHandler");

const {
    handleChooseMyGroup,
    handleStudentSchedule,
    handleTeacherScheduleStart,
    handleTeacherSearchText,
    handleTodaySchedule,
    handleWeeklySchedule,
    handleMyGroup,
    handleHelp,
    handleCallback
} = require("./handlers/userHandler");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(startHandler);
bot.command("admin", adminPanel);

bot.hears("👥 Guruhingizni tanlang", handleChooseMyGroup);
bot.hears("🔁 Guruhni almashtirish", handleChooseMyGroup);
bot.hears("👤 Mening guruhim", handleMyGroup);
bot.hears("📚 Jadvalni ko‘rish", handleStudentSchedule);
bot.hears("👨‍🏫 O‘qituvchini qidirish", handleTeacherScheduleStart);
bot.hears("📅 Bugungi jadval", handleTodaySchedule);
bot.hears("🗓 Haftalik jadval", handleWeeklySchedule);
bot.hears("ℹ️ Yordam", handleHelp);

bot.hears("⚙️ Admin panel", adminPanel);
bot.hears("📢 Xabar yuborish", askBroadcastMessage);
bot.hears("📊 Statistika", showStats);

bot.hears("📤 Excel yuklash", async (ctx) => {
    if (!isAdmin(ctx)) return ctx.reply("Siz admin emassiz.");
    await ctx.reply("Excel faylni shu yerga yuboring.");
});

bot.hears("📥 Excel template", sendExcelTemplate);
bot.hears("🏠 Bosh menyu", startHandler);

bot.on("document", handleExcelUpload);

bot.on("text", async (ctx, next) => {
    const handledBroadcast = await handleBroadcastText(ctx);
    if (handledBroadcast) return;

    const handledTeacherSearch = await handleTeacherSearchText(ctx);
    if (handledTeacherSearch) return;

    return next();
});

bot.on("callback_query", handleCallback);

bot.launch();
console.log("Bot ishga tushdi");

// Render uchun health server
const PORT = process.env.PORT || 10000;

http
    .createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("University bot ishlayapti");
    })
    .listen(PORT, "0.0.0.0", () => {
        console.log(`Health server portda ishga tushdi: ${PORT}`);
    });