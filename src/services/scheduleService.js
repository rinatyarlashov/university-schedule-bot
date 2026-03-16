const db = require("../config/db");

function getFaculties() {
    return db.prepare(`SELECT id, name FROM faculties ORDER BY name`).all();
}

function getDirectionsByFaculty(facultyId) {
    return db.prepare(`SELECT id, name FROM directions WHERE faculty_id = ? ORDER BY name`).all(facultyId);
}

function getCoursesByDirection(directionId) {
    return db.prepare(`SELECT DISTINCT course FROM groups WHERE direction_id = ? ORDER BY course`).all(directionId);
}

function getGroups(directionId, course) {
    return db.prepare(`SELECT id, group_name FROM groups WHERE direction_id = ? AND course = ? ORDER BY group_name`).all(directionId, course);
}

function getScheduleByGroup(groupId) {
    return db.prepare(`
        SELECT s.*, t.full_name AS teacher
        FROM schedules s
                 LEFT JOIN teachers t ON t.id = s.teacher_id
        WHERE s.group_id = ?
        ORDER BY
            CASE s.day
                WHEN 'Dushanba' THEN 1
                WHEN 'Seshanba' THEN 2
                WHEN 'Chorshanba' THEN 3
                WHEN 'Payshanba' THEN 4
                WHEN 'Juma' THEN 5
                WHEN 'Shanba' THEN 6
                ELSE 7
                END,
            s.lesson_number
    `).all(groupId);
}

function getTodayName() {
    const days = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
    return days[new Date().getDay()];
}

function getTodayScheduleByGroup(groupId) {
    const today = getTodayName();
    return db.prepare(`
        SELECT s.*, t.full_name AS teacher
        FROM schedules s
                 LEFT JOIN teachers t ON t.id = s.teacher_id
        WHERE s.group_id = ? AND s.day = ?
        ORDER BY s.lesson_number, s.start_time
    `).all(groupId, today);
}

function getGroupFullInfo(groupId) {
    return db.prepare(`
    SELECT g.id, g.group_name, g.course, d.name AS direction_name, f.name AS faculty_name
    FROM groups g
    LEFT JOIN directions d ON d.id = g.direction_id
    LEFT JOIN faculties f ON f.id = d.faculty_id
    WHERE g.id = ?
  `).get(groupId);
}

module.exports = {
    getFaculties,
    getDirectionsByFaculty,
    getCoursesByDirection,
    getGroups,
    getScheduleByGroup,
    getTodayScheduleByGroup,
    getGroupFullInfo
};