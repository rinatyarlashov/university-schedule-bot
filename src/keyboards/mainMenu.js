const { Markup } = require("telegraf");

function mainMenu(isAdmin = false) {
    const buttons = [
        ["👥 Guruhingizni tanlang", "🔁 Guruhni almashtirish"],
        ["👤 Mening guruhim"],
        ["📅 Bugungi jadval", "🗓 Haftalik jadval"],
        ["📚 Jadvalni ko‘rish", "👨‍🏫 O‘qituvchini qidirish"],
        ["ℹ️ Yordam"]
    ];

    if (isAdmin) {
        buttons.push(["⚙️ Admin panel"]);
    }

    return Markup.keyboard(buttons).resize();
}

module.exports = mainMenu;