const { Markup } = require("telegraf");

function superAdminMenu() {
    return Markup.keyboard([
        ["🏛 Fakultet qo‘shish", "📘 Yo‘nalish qo‘shish"],
        ["👥 Guruh qo‘shish", "➕ Admin tayinlash"],
        ["➖ Adminni olish", "👥 Adminlar ro‘yxati"],
        ["📊 Statistika", "📢 Global xabar"],
        ["🏠 Bosh menyu"]
    ]).resize();
}

module.exports = superAdminMenu;