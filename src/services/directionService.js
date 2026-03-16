const db = require("../config/db");

function createDirection(facultyId, name) {
    return db.prepare(`INSERT INTO directions (faculty_id, name) VALUES (?, ?)`).run(facultyId, name);
}

function getDirectionsByFaculty(facultyId) {
    return db.prepare(`SELECT * FROM directions WHERE faculty_id = ? ORDER BY name`).all(facultyId);
}

function deleteDirection(directionId) {
    const groups = db.prepare(`SELECT id FROM groups WHERE direction_id = ?`).all(directionId);

    for (const group of groups) {
        db.prepare(`DELETE FROM schedules WHERE group_id = ?`).run(group.id);
        db.prepare(`DELETE FROM groups WHERE id = ?`).run(group.id);
    }

    db.prepare(`DELETE FROM directions WHERE id = ?`).run(directionId);
}

module.exports = {
    createDirection,
    getDirectionsByFaculty,
    deleteDirection
};