const db = require("../config/db");

function createFaculty(name) {
    return db.prepare(`INSERT INTO faculties (name) VALUES (?)`).run(name);
}

function getAllFaculties() {
    return db.prepare(`SELECT * FROM faculties ORDER BY name`).all();
}

function deleteFaculty(facultyId) {
    const directions = db.prepare(`SELECT id FROM directions WHERE faculty_id = ?`).all(facultyId);

    for (const direction of directions) {
        const groups = db.prepare(`SELECT id FROM groups WHERE direction_id = ?`).all(direction.id);

        for (const group of groups) {
            db.prepare(`DELETE FROM schedules WHERE group_id = ?`).run(group.id);
            db.prepare(`DELETE FROM groups WHERE id = ?`).run(group.id);
        }

        db.prepare(`DELETE FROM directions WHERE id = ?`).run(direction.id);
    }

    db.prepare(`DELETE FROM admin_faculties WHERE faculty_id = ?`).run(facultyId);
    db.prepare(`DELETE FROM faculties WHERE id = ?`).run(facultyId);
}

module.exports = {
    createFaculty,
    getAllFaculties,
    deleteFaculty
};