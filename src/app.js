const { Telegraf } = require("telegraf");

const startHandler = require("./handlers/startHandler");
const studentHandler = require("./handlers/studentHandler");
const adminHandler = require("./handlers/adminHandler");
const superAdminCrudHandler = require("./handlers/superAdminCrudHandler");
const textRouter = require("./handlers/textRouter");
const callbackHandler = require("./handlers/callbackHandler");

function createBotApp() {
    const bot = new Telegraf(process.env.BOT_TOKEN);

    bot.start(startHandler);
    bot.command("admin", adminHandler.adminPanel);
    bot.command("superadmin", adminHandler.superAdminPanel);

    // student
    bot.hears("👥 Guruhingizni tanlang", studentHandler.chooseGroup);
    bot.hears("🔁 Guruhni almashtirish", studentHandler.chooseGroup);
    bot.hears("👤 Mening guruhim", studentHandler.myGroup);
    bot.hears("📚 Jadvalni ko‘rish", studentHandler.viewSchedule);
    bot.hears("👨‍🏫 O‘qituvchini qidirish", studentHandler.teacherSearchStart);
    bot.hears("📅 Bugungi jadval", studentHandler.todaySchedule);
    bot.hears("🗓 Haftalik jadval", studentHandler.weeklySchedule);
    bot.hears("ℹ️ Yordam", studentHandler.help);

    // admin
    bot.hears("⚙️ Admin panel", adminHandler.adminPanel);
    bot.hears("📤 Excel yuklash", async (ctx) => {
        if (!adminHandler.isAdmin(ctx)) {
            return ctx.reply("❌ Siz admin emassiz.");
        }
        await ctx.reply("📤 Excel faylni shu yerga yuboring.");
    });
    bot.hears("📥 Excel template", adminHandler.sendExcelTemplate);
    bot.hears("📢 Fakultet e'loni", adminHandler.askFacultyAnnouncement);

    // super admin
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

    bot.hears("🏠 Bosh menyu", startHandler);

    bot.on("document", adminHandler.handleExcelUpload);
    bot.on("text", textRouter);
    bot.on("callback_query", callbackHandler);

    return { bot };
}

module.exports = { createBotApp };
