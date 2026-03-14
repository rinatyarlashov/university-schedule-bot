const { Telegraf } = require("telegraf");

const startHandler = require("./handlers/startHandler");
const adminHandler = require("./handlers/adminHandler");
const userHandler = require("./handlers/userHandler");
const superAdminCrudHandler = require("./handlers/superAdminCrudHandler");

function createBotApp() {
    const bot = new Telegraf(process.env.BOT_TOKEN);

    // commands
    bot.start(startHandler);
    bot.command("admin", adminHandler.adminPanel);
    bot.command("superadmin", adminHandler.superAdminPanel);

    // student menu
    bot.hears("👥 Guruhingizni tanlang", userHandler.handleChooseMyGroup);
    bot.hears("🔁 Guruhni almashtirish", userHandler.handleChooseMyGroup);
    bot.hears("👤 Mening guruhim", userHandler.handleMyGroup);
    bot.hears("📚 Jadvalni ko‘rish", userHandler.handleStudentSchedule);
    bot.hears("👨‍🏫 O‘qituvchini qidirish", userHandler.handleTeacherScheduleStart);
    bot.hears("📅 Bugungi jadval", userHandler.handleTodaySchedule);
    bot.hears("🗓 Haftalik jadval", userHandler.handleWeeklySchedule);
    bot.hears("ℹ️ Yordam", userHandler.handleHelp);

    // admin menu
    bot.hears("⚙️ Admin panel", adminHandler.adminPanel);
    bot.hears("📤 Excel yuklash", async (ctx) => {
        if (!adminHandler.isAdmin(ctx)) {
            return ctx.reply("❌ Siz admin emassiz.");
        }
        await ctx.reply("📤 Excel faylni shu yerga yuboring.");
    });
    bot.hears("📥 Excel template", adminHandler.sendExcelTemplate);
    bot.hears("📢 Fakultet e'loni", adminHandler.askFacultyAnnouncement);

    // super admin menu
    bot.hears("👑 Super Admin panel", adminHandler.superAdminPanel);
    bot.hears("🏛 Fakultet qo‘shish", superAdminCrudHandler.startFacultyCreate);
    bot.hears("🗑 Fakultetni o‘chirish", superAdminCrudHandler.startFacultyDelete);
    bot.hears("📘 Yo‘nalish qo‘shish", superAdminCrudHandler.startDirectionCreate);
    bot.hears("🗑 Yo‘nalishni o‘chirish", superAdminCrudHandler.startDirectionDelete);
    bot.hears("👥 Guruh qo‘shish", superAdminCrudHandler.startGroupCreate);
    bot.hears("🗑 Guruhni o‘chirish", superAdminCrudHandler.startGroupDelete);
    bot.hears("➕ Admin tayinlash", superAdminCrudHandler.startAdminAssign);
    bot.hears("➖ Adminni olish", superAdminCrudHandler.startAdminRemove);

    bot.hears("👥 Adminlar ro‘yxati", adminHandler.showAdminsList);
    bot.hears("📊 Statistika", adminHandler.showStats);
    bot.hears("📊 To‘liq statistika", adminHandler.showStats);
    bot.hears("📢 Global xabar", adminHandler.askGlobalBroadcast);

    // common
    bot.hears("🏠 Bosh menyu", startHandler);

    // files
    bot.on("document", adminHandler.handleExcelUpload);

    // text router
    bot.on("text", async (ctx, next) => {
        const handledSuperAdminCrud = await superAdminCrudHandler.handleSuperAdminCrudText(ctx);
        if (handledSuperAdminCrud) return;

        const handledAdminManage = await adminHandler.handleAdminAddRemoveText(ctx);
        if (handledAdminManage) return;

        const handledFacultyBroadcast = await adminHandler.handleFacultyBroadcastText(ctx);
        if (handledFacultyBroadcast) return;

        const handledGlobalBroadcast = await adminHandler.handleGlobalBroadcastText(ctx);
        if (handledGlobalBroadcast) return;

        const handledTeacherSearch = await userHandler.handleTeacherSearchText(ctx);
        if (handledTeacherSearch) return;

        return next();
    });

    // callback router
    bot.on("callback_query", async (ctx) => {
        const handledSuperCrud = await superAdminCrudHandler.handleSuperAdminCrudCallback(ctx);
        if (handledSuperCrud) return;

        const handledAdmin = await adminHandler.handleAdminCallback(ctx);
        if (handledAdmin) return;

        return userHandler.handleCallback(ctx);
    });

    return { bot };
}

module.exports = { createBotApp };