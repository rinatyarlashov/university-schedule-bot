const { Markup } = require("telegraf");

function superAdminMenu() {
    return Markup.keyboard([
        ["🏛 Fakultet qo‘shish", "🗑 Fakultetni o‘chirish"],
        ["📘 Yo‘nalish qo‘shish", "🗑 Yo‘nalishni o‘chirish"],
        ["👥 Guruh qo‘shish", "🗑 Guruhni o‘chirish"],
        ["➕ Admin tayinlash", "➖ Adminni olish"],
        ["👥 Adminlar ro‘yxati", "📊 Statistika"],
        ["📢 Global xabar"],
        ["🏠 Bosh menyu"]
    ]).resize();
}

module.exports = superAdminMenu;