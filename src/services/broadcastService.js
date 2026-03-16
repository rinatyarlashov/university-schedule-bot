const { getAllUsers } = require("./userService");

async function broadcastToAll(ctx, text) {
    const users = getAllUsers();
    let sent = 0;
    let failed = 0;

    for (const user of users) {
        try {
            await ctx.telegram.sendMessage(user.telegram_id, text, { parse_mode: "Markdown" });
            sent++;
        } catch (e) {
            failed++;
        }
    }

    return { sent, failed };
}

module.exports = { broadcastToAll };