function formatGroupSchedule(rows) {
    if (!rows || !rows.length) {
        return "📭 Jadval topilmadi.";
    }

    let text = `🗓 *Haftalik jadval*\n`;
    text += `━━━━━━━━━━━━━━━━━━\n\n`;

    for (const row of rows) {
        text += `📅 *${row.day}*\n`;
        text += `🕐 *${row.lesson_number}-para* | *${row.start_time}-${row.end_time}*\n`;
        text += `📘 *Fan:* ${row.subject}\n`;
        text += `👨‍🏫 *O‘qituvchi:* ${row.teacher || "-"}\n`;
        text += `🏫 *Xona:* ${row.room || "-"}\n`;
        if (row.building) text += `🏢 *Bino:* ${row.building}\n`;
        if (row.week_type) text += `📍 *Hafta:* ${row.week_type}\n`;
        text += `━━━━━━━━━━━━━━━━━━\n\n`;
    }

    return text;
}

function formatTeacherSchedule(rows) {
    if (!rows || !rows.length) {
        return "📭 O‘qituvchi uchun jadval topilmadi.";
    }

    let text = `👨‍🏫 *O‘qituvchi jadvali*\n`;
    text += `━━━━━━━━━━━━━━━━━━\n\n`;

    for (const row of rows) {
        text += `📅 *${row.day}*\n`;
        text += `🕐 *${row.lesson_number}-para* | *${row.start_time}-${row.end_time}*\n`;
        text += `📘 *Fan:* ${row.subject}\n`;
        text += `🏛 *Fakultet:* ${row.faculty_name || "-"}\n`;
        text += `🎓 *Yo‘nalish:* ${row.direction_name || "-"}\n`;
        text += `👥 *Guruh:* ${row.group_name || "-"}\n`;
        text += `🏫 *Xona:* ${row.room || "-"}\n`;
        text += `━━━━━━━━━━━━━━━━━━\n\n`;
    }

    return text;
}

function formatTodayGroupSchedule(rows) {
    if (!rows || !rows.length) {
        return "📭 Bugun bu guruh uchun dars yo‘q.";
    }

    let text = `✨ *Bugungi jadval*\n`;
    text += `━━━━━━━━━━━━━━━━━━\n\n`;

    for (const row of rows) {
        text += `🕐 *${row.lesson_number}-para* | *${row.start_time}-${row.end_time}*\n`;
        text += `📘 *Fan:* ${row.subject}\n`;
        text += `👨‍🏫 *O‘qituvchi:* ${row.teacher || "-"}\n`;
        text += `🏫 *Xona:* ${row.room || "-"}\n`;
        if (row.building) text += `🏢 *Bino:* ${row.building}\n`;
        if (row.week_type) text += `📍 *Hafta:* ${row.week_type}\n`;
        text += `━━━━━━━━━━━━━━━━━━\n\n`;
    }

    return text;
};