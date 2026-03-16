const db = require("../config/db");

function getOrCreateUser(telegramId, fullName = "") {
    let user = db.prepare(`SELECT * FROM users WHERE telegram_id = ?`).get(telegramId);

    if (!user) {
        db.prepare(`INSERT INTO users (telegram_id, full_name) VALUES (?, ?)`).run(telegramId, fullName);
        user = db.prepare(`SELECT * FROM users WHERE telegram_id = ?`).get(telegramId);
    }

    return user;
}

function saveUserGroup(telegramId, facultyId, directionId, course, groupId) {
    db.prepare(`
        UPDATE users
        SET faculty_id = ?, direction_id = ?, course = ?, group_id = ?
        WHERE telegram_id = ?
    `).run(facultyId, directionId, course, groupId, telegramId);
}

function clearUserGroup(telegramId) {
    db.prepare(`
        UPDATE users
        SET faculty_id = NULL, direction_id = NULL, course = NULL, group_id = NULL
        WHERE telegram_id = ?
    `).run(telegramId);
}

function getUserByTelegramId(telegramId) {
    return db.prepare(`SELECT * FROM users WHERE telegram_id = ?`).get(telegramId);
}

function getAllUsers() {
    return db.prepare(`SELECT * FROM users ORDER BY id DESC`).all();
}

function getUsersCount() {
    return db.prepare(`SELECT COUNT(*) AS count FROM users`).get().count;
}

function getUsersWithGroupCount() {
    return db.prepare(`SELECT COUNT(*) AS count FROM users WHERE group_id IS NOT NULL`).get().count;
}

module.exports = {
    getOrCreateUser,
    saveUserGroup,
    clearUserGroup,
    getUserByTelegramId,
    getAllUsers,
    getUsersCount,
    getUsersWithGroupCount
};