const db = require("../config/db");

function searchTeachersByName(query) {
    return db.prepare(`
        SELECT id, full_name
        FROM teachers
        WHERE full_name LIKE ?
        ORDER BY full_name
            LIMIT 20
    `).all(`%${query}%`);
}

function getTeacherSchedule(teacherId) {
    return db.prepare(`
        SELECT
            s.*,
            g.group_name,
            g.course,
            d.name AS direction_name,
            f.name AS faculty_name
        FROM schedules s
                 LEFT JOIN groups g ON g.id = s.group_id
                 LEFT JOIN directions d ON d.id = g.direction_id
                 LEFT JOIN faculties f ON f.id = d.faculty_id
        WHERE s.teacher_id = ?
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
    `).all(teacherId);
}

module.exports = {
    searchTeachersByName,
    getTeacherSchedule
};