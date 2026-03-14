const db = require("../config/db");

function createFaculty(name) {
    return db.prepare(`
        INSERT INTO faculties (name)
        VALUES (?)
    `).run(name);
}

function getAllFaculties() {
    return db.prepare(`
        SELECT *
        FROM faculties
        ORDER BY name
    `).all();
}

module.exports = {
    createFaculty,
    getAllFaculties
};