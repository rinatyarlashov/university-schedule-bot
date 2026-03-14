const { Markup } = require("telegraf");

function adminMenu() {
    return Markup.keyboard([
        ["📤 Excel yuklash", "📥 Excel template"],
        ["📢 Fakultet e'loni"],
        ["🏠 Bosh menyu"]
    ]).resize();
}

module.exports = adminMenu;