const db = require("../config/db");

function createGroup(directionId, course, groupName) {
    return db.prepare(`INSERT INTO groups (direction_id, course, group_name) VALUES (?, ?, ?)`).run(directionId, course, groupName);
}

function deleteGroup(groupId) {
    db.prepare(`DELETE FROM schedules WHERE group_id = ?`).run(groupId);
    db.prepare(`DELETE FROM groups WHERE id = ?`).run(groupId);
}

module.exports = {
    createGroup,
    deleteGroup
};