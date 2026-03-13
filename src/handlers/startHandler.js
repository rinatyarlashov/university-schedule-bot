const mainMenu = require("../keyboards/mainMenu");
const { getOrCreateUser } = require("../services/userService");

async function startHandler(ctx) {
    const isAdmin = String(ctx.from.id) === String(process.env.ADMIN_ID);

    getOrCreateUser(ctx.from.id, ctx.from.first_name || "");

    let text = `🎓 *Assalomu alaykum!*\n\n`;
    text += `Men *matematika fakulteti dars jadvali botiman*.\n\n`;
    text += `Quyidagilardan birini tanlang:\n`;
    text += `• 📚 Jadvalni ko‘rish\n`;
    text += `• 👨‍🏫 O‘qituvchini qidirish\n`;
    text += `• 📅 Bugungi jadval\n`;
    text += `• 🗓 Haftalik jadval\n\n`;
    text += `💾 Bir marta guruh tanlasangiz, bot uni eslab qoladi.\n\n`;

    if (isAdmin) {
        text += `✅ Siz adminsiz: /admin`;
    }

    await ctx.reply(text, {
        parse_mode: "Markdown",
        ...mainMenu(isAdmin)
    });
}

module.exports = startHandler;