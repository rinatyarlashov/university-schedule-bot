require("dotenv").config();
const { Telegraf } = require("telegraf");
const http = require("http");

const startHandler = require("./handlers/startHandler");

const {
    adminPanel,
    superAdminPanel,
    handleExcelUpload,
    sendExcelTemplate,
    askFacultyAnnouncement,
    askGlobalBroadcast,
    handleFacultyBroadcastText,
    handleGlobalBroadcastText,
    showStats,
    showAdminsList,
    startAddAdmin,
    startRemoveAdmin,
    handleAdminAddRemoveText,
    handleAdminCallback,
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

const {
    startFacultyCreate,
    startFacultyDelete,
    startDirectionCreate,
    startDirectionDelete,
    startGroupCreate,
    startGroupDelete,
    startAdminAssign,
    startAdminRemove,
    handleSuperAdminCrudCallback,
    handleSuperAdminCrudText
} = require("./handlers/superAdminCrudHandler");

const bot = new Telegraf(process.env.BOT_TOKEN);

// =========================
// BASIC
// =========================
bot.start(startHandler);
bot.command("admin", adminPanel);
bot.command("superadmin", superAdminPanel);

// =========================
// STUDENT MENUS
// =========================
bot.hears("👥 Guruhingizni tanlang", handleChooseMyGroup);
bot.hears("🔁 Guruhni almashtirish", handleChooseMyGroup);
bot.hears("👤 Mening guruhim", handleMyGroup);
bot.hears("📚 Jadvalni ko‘rish", handleStudentSchedule);
bot.hears("👨‍🏫 O‘qituvchini qidirish", handleTeacherScheduleStart);
bot.hears("📅 Bugungi jadval", handleTodaySchedule);
bot.hears("🗓 Haftalik jadval", handleWeeklySchedule);
bot.hears("ℹ️ Yordam", handleHelp);

// =========================
// ADMIN MENUS
// =========================
bot.hears("⚙️ Admin panel", adminPanel);
bot.hears("📤 Excel yuklash", async (ctx) => {
    if (!isAdmin(ctx)) {
        return ctx.reply("❌ Siz admin emassiz.");
    }

    await ctx.reply("📤 Excel faylni shu yerga yuboring.");
});
bot.hears("📥 Excel template", sendExcelTemplate);
bot.hears("📢 Fakultet e'loni", askFacultyAnnouncement);

// =========================
// SUPER ADMIN MENUS
// =========================
bot.hears("👑 Super Admin panel", superAdminPanel);

bot.hears("🏛 Fakultet qo‘shish", startFacultyCreate);
bot.hears("🗑 Fakultetni o‘chirish", startFacultyDelete);

bot.hears("📘 Yo‘nalish qo‘shish", startDirectionCreate);
bot.hears("🗑 Yo‘nalishni o‘chirish", startDirectionDelete);

bot.hears("👥 Guruh qo‘shish", startGroupCreate);
bot.hears("🗑 Guruhni o‘chirish", startGroupDelete);

bot.hears("➕ Admin tayinlash", startAdminAssign);
bot.hears("➕ Admin qo‘shish", startAddAdmin);

bot.hears("➖ Adminni olish", startAdminRemove);
bot.hears("➖ Admin o‘chirish", startRemoveAdmin);

bot.hears("👥 Adminlar ro‘yxati", showAdminsList);

bot.hears("📊 Statistika", showStats);
bot.hears("📊 To‘liq statistika", showStats);

bot.hears("📢 Global xabar", askGlobalBroadcast);

// =========================
// COMMON
// =========================
bot.hears("🏠 Bosh menyu", startHandler);

// =========================
// FILE UPLOAD
// =========================
bot.on("document", handleExcelUpload);

// =========================
// TEXT FLOW ORDER
// 1) super admin crud
// 2) admin add/remove by id
// 3) faculty broadcast
// 4) global broadcast
// 5) teacher search
// =========================
bot.on("text", async (ctx, next) => {
    const handledSuperAdminCrud = await handleSuperAdminCrudText(ctx);
    if (handledSuperAdminCrud) return;

    const handledAdminManage = await handleAdminAddRemoveText(ctx);
    if (handledAdminManage) return;

    const handledFacultyBroadcast = await handleFacultyBroadcastText(ctx);
    if (handledFacultyBroadcast) return;

    const handledGlobalBroadcast = await handleGlobalBroadcastText(ctx);
    if (handledGlobalBroadcast) return;

    const handledTeacherSearch = await handleTeacherSearchText(ctx);
    if (handledTeacherSearch) return;

    return next();
});

// =========================
// CALLBACK FLOW ORDER
// 1) super admin crud
// 2) admin callback
// 3) normal user callback
// =========================
bot.on("callback_query", async (ctx) => {
    const handledSuperCrud = await handleSuperAdminCrudCallback(ctx);
    if (handledSuperCrud) return;

    const handledAdmin = await handleAdminCallback(ctx);
    if (handledAdmin) return;

    return handleCallback(ctx);
});

// =========================
// START BOT
// =========================
bot.launch();
console.log("Bot ishga tushdi");

// =========================
// RENDER HEALTH SERVER
// =========================
const PORT = process.env.PORT || 10000;

http
    .createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("University bot ishlayapti");
    })
    .listen(PORT, "0.0.0.0", () => {
        console.log(`Health server portda ishga tushdi: ${PORT}`);
    });

// =========================
// GRACEFUL STOP
// =========================
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));