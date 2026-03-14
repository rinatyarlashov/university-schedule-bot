const mainMenu = require("../keyboards/mainMenu");
const { getOrCreateUser } = require("../services/userService");
const { getUserRole } = require("../services/roleService");

async function startHandler(ctx) {
    getOrCreateUser(ctx.from.id, ctx.from.first_name || "");

    const role = getUserRole(ctx.from.id);

    let text = `🎓 *Assalomu alaykum!*\n\n`;
    text += `Men *universitet dars jadvali botiman*.\n\n`;
    text += `Kerakli bo‘limni tanlang.\n\n`;

    if (role === "superadmin") {
        text += `👑 Siz *Super Admin*siz.\n`;
    } else if (role === "admin") {
        text += `⚙️ Siz *Admin*siz.\n`;
    }

    await ctx.reply(text, {
        parse_mode: "Markdown",
        ...mainMenu(role)
    });
}

module.exports = startHandler;