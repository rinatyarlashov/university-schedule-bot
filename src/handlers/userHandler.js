const { Markup } = require("telegraf");
const mainMenu = require("../keyboards/mainMenu");
const {
    getFaculties,
    getDirectionsByFaculty,
    getCoursesByDirection,
    getGroups,
    getScheduleByGroup,
    getTodayScheduleByGroup,
    getGroupFullInfo
} = require("../services/scheduleService");
const { searchTeachersByName, getTeacherSchedule } = require("../services/teacherService");
const { getOrCreateUser, saveUserGroup, clearUserGroup, getUserByTelegramId } = require("../services/userService");
const { formatGroupSchedule, formatTeacherSchedule, formatTodayGroupSchedule } = require("../utils/formatSchedule");
const { getUserRole } = require("../services/roleService");

async function handleChooseMyGroup(ctx) {
    getOrCreateUser(ctx.from.id, ctx.from.first_name || "");
    const faculties = getFaculties();
    if (!faculties.length) return ctx.reply("❌ Hozircha fakultetlar kiritilmagan.");

    const buttons = faculties.map(f => [Markup.button.callback(`🏛 ${f.name}`, `selfac_${f.id}`)]);
    buttons.push([Markup.button.callback("🏠 Bosh menyu", "go_home")]);

    await ctx.reply("👥 *Guruhingizni tanlash uchun fakultetni tanlang:*", {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard(buttons)
    });
}

async function handleStudentSchedule(ctx) {
    const faculties = getFaculties();
    if (!faculties.length) return ctx.reply("❌ Hozircha fakultetlar kiritilmagan.");

    const buttons = faculties.map(f => [Markup.button.callback(`🏛 ${f.name}`, `fac_${f.id}`)]);
    buttons.push([Markup.button.callback("🏠 Bosh menyu", "go_home")]);

    await ctx.reply("🎓 *Fakultetni tanlang:*", {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard(buttons)
    });
}

async function handleTeacherScheduleStart(ctx) {
    await ctx.reply("👨‍🏫 *O‘qituvchi familiyasi yoki ismini yuboring:*", { parse_mode: "Markdown" });
}

async function handleTeacherSearchText(ctx) {
    const text = (ctx.message.text || "").trim();
    const ignoredButtons = [
        "👥 Guruhingizni tanlang", "🔁 Guruhni almashtirish", "👤 Mening guruhim",
        "📚 Jadvalni ko‘rish", "👨‍🏫 O‘qituvchini qidirish", "📅 Bugungi jadval",
        "🗓 Haftalik jadval", "ℹ️ Yordam", "⚙️ Admin panel", "👑 Super Admin panel",
        "📤 Excel yuklash", "📥 Excel template", "📢 Fakultet e'loni", "📢 Global xabar",
        "📊 Statistika", "📊 To‘liq statistika", "👥 Adminlar ro‘yxati", "🏠 Bosh menyu",
        "🏛 Fakultet qo‘shish", "🗑 Fakultetni o‘chirish", "📘 Yo‘nalish qo‘shish",
        "🗑 Yo‘nalishni o‘chirish", "👥 Guruh qo‘shish", "🗑 Guruhni o‘chirish",
        "➕ Admin tayinlash", "➖ Adminni olish", "➕ Admin qo‘shish", "➖ Admin o‘chirish"
    ];

    if (ignoredButtons.includes(text) || text.startsWith("/")) return false;

    const teachers = searchTeachersByName(text);
    if (!teachers.length) return false;

    const buttons = teachers.map(t => [Markup.button.callback(`👨‍🏫 ${t.full_name}`, `teacher_${t.id}`)]);
    buttons.push([Markup.button.callback("🏠 Bosh menyu", "go_home")]);

    await ctx.reply("🔎 *Topilgan o‘qituvchilar:*", {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard(buttons)
    });

    return true;
}

async function handleTodaySchedule(ctx) {
    getOrCreateUser(ctx.from.id, ctx.from.first_name || "");
    const user = getUserByTelegramId(ctx.from.id);

    if (user && user.group_id) {
        const rows = getTodayScheduleByGroup(user.group_id);
        if (!rows.length) return ctx.reply("📭 Bugun sizning guruhingiz uchun dars yo‘q.");
        return ctx.reply(formatTodayGroupSchedule(rows), { parse_mode: "Markdown" });
    }

    return ctx.reply("❌ Siz hali guruh tanlamagansiz.\nAvval `👥 Guruhingizni tanlang` tugmasini bosing.", { parse_mode: "Markdown" });
}

async function handleWeeklySchedule(ctx) {
    getOrCreateUser(ctx.from.id, ctx.from.first_name || "");
    const user = getUserByTelegramId(ctx.from.id);

    if (user && user.group_id) {
        const rows = getScheduleByGroup(user.group_id);
        if (!rows.length) return ctx.reply("📭 Sizning guruhingiz uchun haftalik jadval topilmadi.");
        return ctx.reply(formatGroupSchedule(rows), { parse_mode: "Markdown" });
    }

    return ctx.reply("❌ Siz hali guruh tanlamagansiz.\nAvval `👥 Guruhingizni tanlang` tugmasini bosing.", { parse_mode: "Markdown" });
}

async function handleMyGroup(ctx) {
    const user = getUserByTelegramId(ctx.from.id);
    if (!user || !user.group_id) {
        return ctx.reply("❌ Siz hali guruh tanlamagansiz.", {
            ...Markup.inlineKeyboard([[Markup.button.callback("👥 Guruhni tanlash", "start_choose_group")]])
        });
    }

    const info = getGroupFullInfo(user.group_id);
    if (!info) return ctx.reply("❌ Saqlangan guruh topilmadi.");

    await ctx.reply(
        `✅ *Sizning guruhingiz*\n\n🏛 Fakultet: *${info.faculty_name}*\n🎓 Yo‘nalish: *${info.direction_name}*\n📚 Kurs: *${info.course}*\n👥 Guruh: *${info.group_name}*`,
        {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([[Markup.button.callback("❌ Guruhni o‘chirish", "delete_my_group")]])
        }
    );
}

async function handleHelp(ctx) {
    const text = [
        "ℹ️ *Yordam*",
        "",
        "👥 *Guruhingizni tanlang* — o‘zingiz o‘qiydigan guruhni saqlaydi.",
        "🔁 *Guruhni almashtirish* — boshqa guruh tanlash imkonini beradi.",
        "👤 *Mening guruhim* — saqlangan guruhni ko‘rsatadi.",
        "📚 *Jadvalni ko‘rish* — istalgan guruh jadvalini ko‘rsatadi.",
        "👨‍🏫 *O‘qituvchini qidirish* — o‘qituvchi jadvalini topadi.",
        "📅 *Bugungi jadval* — saqlangan guruhning bugungi darslari.",
        "🗓 *Haftalik jadval* — saqlangan guruhning haftalik jadvali."
    ].join("\n");

    await ctx.reply(text, { parse_mode: "Markdown" });
}

async function handleCallback(ctx) {
    const data = ctx.callbackQuery.data;

    if (data === "go_home") {
        await ctx.answerCbQuery();
        const role = getUserRole(ctx.from.id);
        await ctx.reply("🏠 Bosh menyu", mainMenu(role));
        return;
    }

    if (data === "start_choose_group") {
        await ctx.answerCbQuery();
        return handleChooseMyGroup(ctx);
    }

    if (data === "delete_my_group") {
        await ctx.answerCbQuery();
        clearUserGroup(ctx.from.id);
        await ctx.editMessageText("✅ Saqlangan guruh o‘chirildi.", {
            ...Markup.inlineKeyboard([
                [Markup.button.callback("👥 Qayta guruh tanlash", "start_choose_group")],
                [Markup.button.callback("🏠 Bosh menyu", "go_home")]
            ])
        });
        return;
    }

    // save own group flow
    if (data.startsWith("selfac_")) {
        const facultyId = Number(data.split("_")[1]);
        const directions = getDirectionsByFaculty(facultyId);
        const buttons = directions.map(d => [Markup.button.callback(`📘 ${d.name}`, `seldir_${facultyId}_${d.id}`)]);
        buttons.push([Markup.button.callback("🏠 Bosh menyu", "go_home")]);
        await ctx.editMessageText("👥 *Yo‘nalishni tanlang:*", {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard(buttons)
        });
        return;
    }

    if (data.startsWith("seldir_")) {
        const [, facultyId, directionId] = data.split("_");
        const courses = getCoursesByDirection(Number(directionId));
        const buttons = courses.map(c => [Markup.button.callback(`🎓 ${c.course}-kurs`, `selcourse_${facultyId}_${directionId}_${c.course}`)]);
        buttons.push([Markup.button.callback("🏠 Bosh menyu", "go_home")]);
        await ctx.editMessageText("👥 *Kursni tanlang:*", {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard(buttons)
        });
        return;
    }

    if (data.startsWith("selcourse_")) {
        const [, facultyId, directionId, course] = data.split("_");
        const groups = getGroups(Number(directionId), Number(course));
        const buttons = groups.map(g => [Markup.button.callback(`👥 ${g.group_name}`, `selgroup_${facultyId}_${directionId}_${course}_${g.id}`)]);
        buttons.push([Markup.button.callback("🏠 Bosh menyu", "go_home")]);
        await ctx.editMessageText("👥 *Endi guruhni tanlang:*", {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard(buttons)
        });
        return;
    }

    if (data.startsWith("selgroup_")) {
        const [, facultyId, directionId, course, groupId] = data.split("_");
        saveUserGroup(ctx.from.id, Number(facultyId), Number(directionId), Number(course), Number(groupId));
        await ctx.editMessageText("✅ Guruhingiz saqlandi.\nEndi `📅 Bugungi jadval` va `🗓 Haftalik jadval` avtomatik ishlaydi.", {
            ...Markup.inlineKeyboard([
                [Markup.button.callback("❌ Guruhni o‘chirish", "delete_my_group")],
                [Markup.button.callback("🏠 Bosh menyu", "go_home")]
            ])
        });
        return;
    }

    // view schedule flow
    if (data.startsWith("fac_")) {
        const facultyId = Number(data.split("_")[1]);
        const directions = getDirectionsByFaculty(facultyId);
        const buttons = directions.map(d => [Markup.button.callback(`📘 ${d.name}`, `dir_${facultyId}_${d.id}`)]);
        buttons.push([Markup.button.callback("🏠 Bosh menyu", "go_home")]);
        await ctx.editMessageText("🎓 *Yo‘nalishni tanlang:*", {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard(buttons)
        });
        return;
    }

    if (data.startsWith("dir_")) {
        const [, facultyId, directionId] = data.split("_");
        const courses = getCoursesByDirection(Number(directionId));
        const buttons = courses.map(c => [Markup.button.callback(`🎓 ${c.course}-kurs`, `course_${facultyId}_${directionId}_${c.course}`)]);
        buttons.push([Markup.button.callback("🏠 Bosh menyu", "go_home")]);
        await ctx.editMessageText("📚 *Kursni tanlang:*", {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard(buttons)
        });
        return;
    }

    if (data.startsWith("course_")) {
        const [, facultyId, directionId, course] = data.split("_");
        const groups = getGroups(Number(directionId), Number(course));
        const buttons = groups.map(g => [Markup.button.callback(`👥 ${g.group_name}`, `group_${facultyId}_${directionId}_${course}_${g.id}`)]);
        buttons.push([Markup.button.callback("🏠 Bosh menyu", "go_home")]);
        await ctx.editMessageText("👥 *Guruhni tanlang:*", {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard(buttons)
        });
        return;
    }

    if (data.startsWith("group_")) {
        const [, facultyId, directionId, course, groupId] = data.split("_");
        const rows = getScheduleByGroup(Number(groupId));
        if (!rows.length) {
            await ctx.editMessageText("❌ Bu guruh uchun jadval topilmadi.");
            return;
        }

        await ctx.editMessageText(formatGroupSchedule(rows), {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([[Markup.button.callback("⬅️ Orqaga", `course_${facultyId}_${directionId}_${course}`), Markup.button.callback("🏠 Bosh menyu", "go_home")]])
        });
        return;
    }

    if (data.startsWith("teacher_")) {
        const teacherId = Number(data.split("_")[1]);
        const rows = getTeacherSchedule(teacherId);
        if (!rows.length) {
            await ctx.editMessageText("❌ Bu o‘qituvchi uchun jadval topilmadi.");
            return;
        }

        await ctx.editMessageText(formatTeacherSchedule(rows), {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([[Markup.button.callback("🏠 Bosh menyu", "go_home")]])
        });
        return;
    }

    await ctx.answerCbQuery("Noma'lum amal");
}

module.exports = {
    handleChooseMyGroup,
    handleStudentSchedule,
    handleTeacherScheduleStart,
    handleTeacherSearchText,
    handleTodaySchedule,
    handleWeeklySchedule,
    handleMyGroup,
    handleHelp,
    handleCallback
};
