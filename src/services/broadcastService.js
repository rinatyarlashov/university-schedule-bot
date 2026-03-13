const { getAllUsers } = require("./userService");

async function broadcastToAll(bot, message) {
    const users = getAllUsers();
    let sent = 0;
    let failed = 0;

    for (const user of users) {
        try {
            await bot.telegram.sendMessage(user.telegram_id, message, {
                parse_mode: "Markdown"
            });
            sent++;
        } catch (error) {
            failed++;
        }
    }

    return { sent, failed };
}

module.exports = { broadcastToAll };