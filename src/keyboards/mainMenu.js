const { Markup } = require("telegraf");

function mainMenu(role = "student") {
    const buttons = [
        ["👥 Guruhingizni tanlang", "🔁 Guruhni almashtirish"],
        ["👤 Mening guruhim"],
        ["📅 Bugungi jadval", "🗓 Haftalik jadval"],
        ["📚 Jadvalni ko‘rish", "👨‍🏫 O‘qituvchini qidirish"],
        ["ℹ️ Yordam"]
    ];

    if (role === "admin" || role === "superadmin") {
        buttons.push(["⚙️ Admin panel"]);
    }

    if (role === "superadmin") {
        buttons.push(["👑 Super Admin panel"]);
    }

    return Markup.keyboard(buttons).resize();
}

module.exports = mainMenu;