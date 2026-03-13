const { Markup } = require("telegraf");

function adminMenu() {
    return Markup.keyboard([
        ["📤 Excel yuklash", "📥 Excel template"],
        ["📢 Xabar yuborish", "📊 Statistika"],
        ["🏠 Bosh menyu"]
    ]).resize();
}

module.exports = adminMenu;