function formatLine() {
    return "━━━━━━━━━━━━━━━━━━";
}

function formatHeader(title) {
    return `✨ *${title}*\n${formatLine()}\n\n`;
}

function formatLesson(row) {
    let text = `🕐 *${row.lesson_number}-para* | *${row.start_time}-${row.end_time}*\n`;
    text += `📘 *Fan:* ${row.subject}\n`;
    text += `👨‍🏫 *O‘qituvchi:* ${row.teacher || "-"}\n`;
    text += `🏫 *Xona:* ${row.room || "-"}\n`;

    if (row.building) {
        text += `🏢 *Bino:* ${row.building}\n`;
    }

    if (row.week_type) {
        text += `📍 *Hafta:* ${row.week_type}\n`;
    }

    return text;
}

function formatGroupSchedule(rows) {
    if (!rows || !rows.length) {
        return "❌ Jadval topilmadi.";
    }

    let text = formatHeader("Haftalik jadval");
    let currentDay = "";

    for (const row of rows) {
        if (row.day !== currentDay) {
            currentDay = row.day;
            text += `📅 *${row.day}*\n\n`;
        }

        text += formatLesson(row);
        text += `${formatLine()}\n\n`;
    }

    return text;
}

function formatTeacherSchedule(rows) {
    if (!rows || !rows.length) {
        return "❌ Bu o‘qituvchi uchun jadval topilmadi.";
    }

    let text = formatHeader("O‘qituvchi jadvali");
    let currentDay = "";

    for (const row of rows) {
        if (row.day !== currentDay) {
            currentDay = row.day;
            text += `📅 *${row.day}*\n\n`;
        }

        text += `🕐 *${row.lesson_number}-para* | *${row.start_time}-${row.end_time}*\n`;
        text += `📘 *Fan:* ${row.subject}\n`;
        text += `🎓 *Yo‘nalish:* ${row.direction_name}\n`;
        text += `👥 *Guruh:* ${row.course}-kurs | ${row.group_name}\n`;
        text += `🏫 *Xona:* ${row.room || "-"}\n`;

        if (row.building) {
            text += `🏢 *Bino:* ${row.building}\n`;
        }

        if (row.week_type) {
            text += `📍 *Hafta:* ${row.week_type}\n`;
        }

        text += `${formatLine()}\n\n`;
    }

    return text;
}

function formatTodayGroupSchedule(rows) {
    if (!rows || !rows.length) {
        return "📭 Bugun bu guruh uchun dars yo‘q.";
    }

    let text = formatHeader("Bugungi jadval");

    for (const row of rows) {
        text += formatLesson(row);
        text += `${formatLine()}\n\n`;
    }

    return text;
}

module.exports = {
    formatGroupSchedule,
    formatTeacherSchedule,
    formatTodayGroupSchedule
};