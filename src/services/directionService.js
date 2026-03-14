const db = require("../config/db");

function createDirection(facultyId, name) {
    return db.prepare(`
        INSERT INTO directions (faculty_id, name)
        VALUES (?, ?)
    `).run(facultyId, name);
}

function getDirectionsByFaculty(facultyId) {
    return db.prepare(`
        SELECT *
        FROM directions
        WHERE faculty_id = ?
        ORDER BY name
    `).all(facultyId);
}

module.exports = {
    createDirection,
    getDirectionsByFaculty
};