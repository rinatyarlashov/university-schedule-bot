const { Markup } = require("telegraf");

function superAdminMenu() {
    return Markup.keyboard([
        ["➕ Admin qo‘shish", "➖ Admin o‘chirish"],
        ["👥 Adminlar ro‘yxati", "📊 To‘liq statistika"],
        ["📢 Global xabar"],
        ["🏠 Bosh menyu"]
    ]).resize();
}

module.exports = superAdminMenu;