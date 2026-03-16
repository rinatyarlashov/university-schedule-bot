const XLSX = require("xlsx");
const db = require("../config/db");

function getOrCreateFaculty(name) {
    let row = db.prepare("SELECT id FROM faculties WHERE name = ?").get(name);
    if (!row) {
        const result = db.prepare("INSERT INTO faculties (name) VALUES (?)").run(name);
        return result.lastInsertRowid;
    }
    return row.id;
}

function getOrCreateDirection(facultyId, name) {
    let row = db.prepare("SELECT id FROM directions WHERE faculty_id = ? AND name = ?").get(facultyId, name);
    if (!row) {
        const result = db.prepare("INSERT INTO directions (faculty_id, name) VALUES (?, ?)").run(facultyId, name);
        return result.lastInsertRowid;
    }
    return row.id;
}

function getOrCreateGroup(directionId, course, groupName) {
    let row = db.prepare("SELECT id FROM groups WHERE direction_id = ? AND course = ? AND group_name = ?").get(directionId, course, groupName);
    if (!row) {
        const result = db.prepare("INSERT INTO groups (direction_id, course, group_name) VALUES (?, ?, ?)").run(directionId, course, groupName);
        return result.lastInsertRowid;
    }
    return row.id;
}

function getOrCreateTeacher(fullName) {
    if (!fullName || !String(fullName).trim()) return null;
    let row = db.prepare("SELECT id FROM teachers WHERE full_name = ?").get(fullName);
    if (!row) {
        const result = db.prepare("INSERT INTO teachers (full_name) VALUES (?)").run(fullName);
        return result.lastInsertRowid;
    }
    return row.id;
}

function importExcel(filePath, facultyFilterId = null) {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const insertSchedule = db.prepare(`
    INSERT INTO schedules (
      group_id, teacher_id, day, lesson_number, start_time, end_time,
      subject, room, building, week_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    let inserted = 0;

    const tx = db.transaction((data) => {
        for (const row of data) {
            const faculty = String(row.faculty || "").trim();
            const direction = String(row.direction || "").trim();
            const course = Number(row.course || 0);
            const groupName = String(row.group_name || "").trim();
            const day = String(row.day || "").trim();
            const lessonNumber = Number(row.lesson_number || 0);
            const startTime = String(row.start_time || "").trim();
            const endTime = String(row.end_time || "").trim();
            const subject = String(row.subject || "").trim();
            const teacherName = String(row.teacher || "").trim();
            const room = String(row.room || "").trim();
            const building = String(row.building || "").trim();
            const weekType = String(row.week_type || "all").trim() || "all";

            if (!faculty || !direction || !course || !groupName || !day || !lessonNumber || !startTime || !endTime || !subject) {
                continue;
            }

            const facultyId = getOrCreateFaculty(faculty);
            if (facultyFilterId && Number(facultyFilterId) !== Number(facultyId)) continue;

            const directionId = getOrCreateDirection(facultyId, direction);
            const groupId = getOrCreateGroup(directionId, course, groupName);
            const teacherId = getOrCreateTeacher(teacherName);

            insertSchedule.run(groupId, teacherId, day, lessonNumber, startTime, endTime, subject, room, building, weekType);
            inserted++;
        }
    });

    tx(rows);
    return inserted;
}

module.exports = { importExcel };
