const XLSX = require("xlsx");

function createTemplateBuffer() {
    const rows = [
        {
            faculty: "Matematika fakulteti",
            direction: "Amaliy matematika",
            course: 1,
            group_name: "101",
            day: "Dushanba",
            lesson_number: 1,
            start_time: "08:30",
            end_time: "09:50",
            subject: "Algebra",
            teacher: "Aliyev A.A",
            room: "203",
            building: "A-bino",
            week_type: "all"
        }
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jadval");

    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

module.exports = { createTemplateBuffer };