const db = require("../config/db");

function createGroup(directionId, course, groupName) {
    return db.prepare(`
        INSERT INTO groups (direction_id, course, group_name)
        VALUES (?, ?, ?)
    `).run(directionId, course, groupName);
}

module.exports = {
    createGroup
};