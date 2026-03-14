const db = require("../config/db");

function ensureRoleRow(telegramId) {
    let row = db.prepare(`
        SELECT *
        FROM roles
        WHERE telegram_id = ?
    `).get(telegramId);

    if (!row) {
        db.prepare(`
            INSERT INTO roles (telegram_id, role)
            VALUES (?, 'student')
        `).run(telegramId);

        row = db.prepare(`
            SELECT *
            FROM roles
            WHERE telegram_id = ?
        `).get(telegramId);
    }

    return row;
}

function getUserRole(telegramId) {
    if (String(telegramId) === String(process.env.SUPER_ADMIN_ID)) {
        return "superadmin";
    }

    const row = ensureRoleRow(telegramId);
    return row.role;
}

function setUserRole(telegramId, role) {
    ensureRoleRow(telegramId);

    db.prepare(`
        UPDATE roles
        SET role = ?
        WHERE telegram_id = ?
    `).run(role, telegramId);
}

function isSuperAdmin(ctx) {
    return String(ctx.from.id) === String(process.env.SUPER_ADMIN_ID);
}

function isAdmin(ctx) {
    const role = getUserRole(ctx.from.id);
    return role === "admin" || role === "superadmin";
}

function assignAdminToFaculty(telegramId, facultyId) {
    setUserRole(telegramId, "admin");

    db.prepare(`
        INSERT OR IGNORE INTO admin_faculties (telegram_id, faculty_id)
        VALUES (?, ?)
    `).run(telegramId, facultyId);
}

function removeAdminFromFaculty(telegramId, facultyId) {
    db.prepare(`
        DELETE FROM admin_faculties
        WHERE telegram_id = ? AND faculty_id = ?
    `).run(telegramId, facultyId);

    const row = db.prepare(`
        SELECT COUNT(*) AS count
        FROM admin_faculties
        WHERE telegram_id = ?
    `).get(telegramId);

    if (row.count === 0 && String(telegramId) !== String(process.env.SUPER_ADMIN_ID)) {
        setUserRole(telegramId, "student");
    }
}

function getAdminFacultyIds(telegramId) {
    if (String(telegramId) === String(process.env.SUPER_ADMIN_ID)) {
        return [];
    }

    const rows = db.prepare(`
        SELECT faculty_id
        FROM admin_faculties
        WHERE telegram_id = ?
        ORDER BY faculty_id
    `).all(telegramId);

    return rows.map(row => row.faculty_id);
}

function canManageFaculty(telegramId, facultyId) {
    if (String(telegramId) === String(process.env.SUPER_ADMIN_ID)) {
        return true;
    }

    const row = db.prepare(`
        SELECT 1
        FROM admin_faculties
        WHERE telegram_id = ? AND faculty_id = ?
    `).get(telegramId, facultyId);

    return !!row;
}

function getAllAdmins() {
    return db.prepare(`
        SELECT
            r.telegram_id,
            r.role,
            af.faculty_id,
            f.name AS faculty_name
        FROM roles r
        LEFT JOIN admin_faculties af ON af.telegram_id = r.telegram_id
        LEFT JOIN faculties f ON f.id = af.faculty_id
        WHERE r.role IN ('admin', 'superadmin')
        ORDER BY r.telegram_id
    `).all();
}

module.exports = {
    getUserRole,
    setUserRole,
    isSuperAdmin,
    isAdmin,
    assignAdminToFaculty,
    removeAdminFromFaculty,
    getAdminFacultyIds,
    canManageFaculty,
    getAllAdmins
};