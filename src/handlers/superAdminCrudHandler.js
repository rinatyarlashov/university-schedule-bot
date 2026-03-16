const { Markup } = require("telegraf");
const db = require("../config/db");
const { isSuperAdmin, assignAdminToFaculty, removeAdminFromFaculty } = require("../services/roleService");
const { createFaculty, getAllFaculties, deleteFaculty } = require("../services/facultyService");
const { createDirection, getDirectionsByFaculty, deleteDirection } = require("../services/directionService");
const { createGroup, deleteGroup } = require("../services/groupService");

const state = new Map();

function setState(userId, data) {
    state.set(userId, data);
}

function getState(userId) {
    return state.get(userId);
}

function clearState(userId) {
    state.delete(userId);
}

async function startFacultyCreate(ctx) {
    if (!isSuperAdmin(ctx)) return ctx.reply("❌ Siz super admin emassiz.");
    setState(ctx.from.id, { step: "faculty_name" });
    await ctx.reply("🏛 Fakultet nomini yuboring:");
}

async function startFacultyDelete(ctx) {
    if (!isSuperAdmin(ctx)) return ctx.reply("❌ Siz super admin emassiz.");
    const faculties = getAllFaculties();
    if (!faculties.length) return ctx.reply("❌ Fakultetlar topilmadi.");

    const buttons = faculties.map(f => [Markup.button.callback(`🗑 ${f.name}`, `delete_faculty_${f.id}`)]);
    await ctx.reply("🗑 O‘chiriladigan fakultetni tanlang:", { ...Markup.inlineKeyboard(buttons) });
}

async function startDirectionCreate(ctx) {
    if (!isSuperAdmin(ctx)) return ctx.reply("❌ Siz super admin emassiz.");
    const faculties = getAllFaculties();
    if (!faculties.length) return ctx.reply("❌ Avval fakultet qo‘shing.");

    const buttons = faculties.map(f => [Markup.button.callback(`🏛 ${f.name}`, `create_direction_faculty_${f.id}`)]);
    await ctx.reply("📘 Yo‘nalish qo‘shish uchun fakultetni tanlang:", { ...Markup.inlineKeyboard(buttons) });
}

async function startDirectionDelete(ctx) {
    if (!isSuperAdmin(ctx)) return ctx.reply("❌ Siz super admin emassiz.");
    const faculties = getAllFaculties();
    if (!faculties.length) return ctx.reply("❌ Fakultetlar topilmadi.");

    const buttons = faculties.map(f => [Markup.button.callback(`🏛 ${f.name}`, `delete_direction_faculty_${f.id}`)]);
    await ctx.reply("🗑 Yo‘nalish o‘chirish uchun fakultetni tanlang:", { ...Markup.inlineKeyboard(buttons) });
}

async function startGroupCreate(ctx) {
    if (!isSuperAdmin(ctx)) return ctx.reply("❌ Siz super admin emassiz.");
    const faculties = getAllFaculties();
    if (!faculties.length) return ctx.reply("❌ Avval fakultet qo‘shing.");

    const buttons = faculties.map(f => [Markup.button.callback(`🏛 ${f.name}`, `create_group_faculty_${f.id}`)]);
    await ctx.reply("👥 Guruh qo‘shish uchun fakultetni tanlang:", { ...Markup.inlineKeyboard(buttons) });
}

async function startGroupDelete(ctx) {
    if (!isSuperAdmin(ctx)) return ctx.reply("❌ Siz super admin emassiz.");
    const faculties = getAllFaculties();
    if (!faculties.length) return ctx.reply("❌ Fakultetlar topilmadi.");

    const buttons = faculties.map(f => [Markup.button.callback(`🏛 ${f.name}`, `delete_group_faculty_${f.id}`)]);
    await ctx.reply("🗑 Guruh o‘chirish uchun fakultetni tanlang:", { ...Markup.inlineKeyboard(buttons) });
}

async function startAdminAssign(ctx) {
    if (!isSuperAdmin(ctx)) return ctx.reply("❌ Siz super admin emassiz.");
    const faculties = getAllFaculties();
    if (!faculties.length) return ctx.reply("❌ Avval fakultet qo‘shing.");

    const buttons = faculties.map(f => [Markup.button.callback(`🏛 ${f.name}`, `assign_admin_${f.id}`)]);
    await ctx.reply("➕ Admin tayinlash uchun fakultetni tanlang:", { ...Markup.inlineKeyboard(buttons) });
}

async function startAdminRemove(ctx) {
    if (!isSuperAdmin(ctx)) return ctx.reply("❌ Siz super admin emassiz.");
    const faculties = getAllFaculties();
    if (!faculties.length) return ctx.reply("❌ Fakultetlar topilmadi.");

    const buttons = faculties.map(f => [Markup.button.callback(`🏛 ${f.name}`, `remove_admin_${f.id}`)]);
    await ctx.reply("➖ Adminni olish uchun fakultetni tanlang:", { ...Markup.inlineKeyboard(buttons) });
}

async function handleSuperAdminCrudCallback(ctx) {
    if (!isSuperAdmin(ctx)) return false;
    const data = ctx.callbackQuery.data;

    if (data.startsWith("create_direction_faculty_")) {
        const facultyId = Number(data.split("_").pop());
        setState(ctx.from.id, { step: "direction_name", facultyId });
        await ctx.answerCbQuery();
        await ctx.reply("📘 Yo‘nalish nomini yuboring:");
        return true;
    }

    if (data.startsWith("create_group_faculty_")) {
        const facultyId = Number(data.split("_").pop());
        const directions = getDirectionsByFaculty(facultyId);
        if (!directions.length) {
            await ctx.answerCbQuery();
            await ctx.reply("❌ Bu fakultetda yo‘nalish yo‘q.");
            return true;
        }

        const buttons = directions.map(d => [Markup.button.callback(`📘 ${d.name}`, `create_group_direction_${d.id}`)]);
        await ctx.answerCbQuery();
        await ctx.reply("📘 Yo‘nalishni tanlang:", { ...Markup.inlineKeyboard(buttons) });
        return true;
    }

    if (data.startsWith("create_group_direction_")) {
        const directionId = Number(data.split("_").pop());
        setState(ctx.from.id, { step: "group_course", directionId });
        await ctx.answerCbQuery();
        await ctx.reply("🎓 Kurs raqamini yuboring:");
        return true;
    }

    if (data.startsWith("assign_admin_")) {
        const facultyId = Number(data.split("_").pop());
        setState(ctx.from.id, { step: "assign_admin_id", facultyId });
        await ctx.answerCbQuery();
        await ctx.reply("👤 Admin qilinadigan Telegram ID ni yuboring:");
        return true;
    }

    if (data.startsWith("remove_admin_")) {
        const facultyId = Number(data.split("_").pop());
        setState(ctx.from.id, { step: "remove_admin_id", facultyId });
        await ctx.answerCbQuery();
        await ctx.reply("👤 Adminlikdan olinadigan Telegram ID ni yuboring:");
        return true;
    }

    if (data.startsWith("delete_faculty_")) {
        const facultyId = Number(data.split("_").pop());
        deleteFaculty(facultyId);
        await ctx.answerCbQuery("Fakultet o‘chirildi");
        await ctx.editMessageText("✅ Fakultet o‘chirildi.");
        return true;
    }

    if (data.startsWith("delete_direction_faculty_")) {
        const facultyId = Number(data.split("_").pop());
        const directions = getDirectionsByFaculty(facultyId);
        if (!directions.length) {
            await ctx.answerCbQuery();
            await ctx.reply("❌ Bu fakultetda yo‘nalish yo‘q.");
            return true;
        }

        const buttons = directions.map(d => [Markup.button.callback(`🗑 ${d.name}`, `delete_direction_${d.id}`)]);
        await ctx.answerCbQuery();
        await ctx.reply("🗑 O‘chiriladigan yo‘nalishni tanlang:", { ...Markup.inlineKeyboard(buttons) });
        return true;
    }

    if (data.startsWith("delete_direction_")) {
        const directionId = Number(data.split("_").pop());
        deleteDirection(directionId);
        await ctx.answerCbQuery("Yo‘nalish o‘chirildi");
        await ctx.editMessageText("✅ Yo‘nalish o‘chirildi.");
        return true;
    }

    if (data.startsWith("delete_group_faculty_")) {
        const facultyId = Number(data.split("_").pop());
        const directions = getDirectionsByFaculty(facultyId);
        if (!directions.length) {
            await ctx.answerCbQuery();
            await ctx.reply("❌ Bu fakultetda yo‘nalish yo‘q.");
            return true;
        }

        const buttons = directions.map(d => [Markup.button.callback(`📘 ${d.name}`, `delete_group_direction_${d.id}`)]);
        await ctx.answerCbQuery();
        await ctx.reply("📘 Yo‘nalishni tanlang:", { ...Markup.inlineKeyboard(buttons) });
        return true;
    }

    if (data.startsWith("delete_group_direction_")) {
        const directionId = Number(data.split("_").pop());
        setState(ctx.from.id, { step: "delete_group_course", directionId });
        await ctx.answerCbQuery();
        await ctx.reply("🎓 O‘chirish uchun kurs raqamini yuboring:");
        return true;
    }

    if (data.startsWith("delete_group_")) {
        const groupId = Number(data.split("_").pop());
        deleteGroup(groupId);
        await ctx.answerCbQuery("Guruh o‘chirildi");
        await ctx.editMessageText("✅ Guruh o‘chirildi.");
        return true;
    }

    return false;
}

async function handleSuperAdminCrudText(ctx) {
    if (!isSuperAdmin(ctx)) return false;
    const current = getState(ctx.from.id);
    if (!current) return false;

    const text = (ctx.message.text || "").trim();

    if (current.step === "faculty_name") {
        if (!text) {
            await ctx.reply("❌ Fakultet nomini yuboring.");
            return true;
        }

        try {
            createFaculty(text);
            clearState(ctx.from.id);
            await ctx.reply(`✅ Fakultet qo‘shildi: ${text}`);
        } catch (e) {
            clearState(ctx.from.id);
            await ctx.reply("❌ Fakultet qo‘shishda xatolik. Balki bu fakultet oldin mavjuddir.");
        }
        return true;
    }

    if (current.step === "direction_name") {
        if (!text) {
            await ctx.reply("❌ Yo‘nalish nomini yuboring.");
            return true;
        }

        try {
            createDirection(current.facultyId, text);
            clearState(ctx.from.id);
            await ctx.reply(`✅ Yo‘nalish qo‘shildi: ${text}`);
        } catch (e) {
            clearState(ctx.from.id);
            await ctx.reply("❌ Yo‘nalish qo‘shishda xatolik.");
        }
        return true;
    }

    if (current.step === "group_course") {
        if (!/^\d+$/.test(text)) {
            await ctx.reply("❌ Kurs raqamini yuboring.");
            return true;
        }

        setState(ctx.from.id, { step: "group_name", directionId: current.directionId, course: Number(text) });
        await ctx.reply("👥 Guruh nomini yuboring:");
        return true;
    }

    if (current.step === "group_name") {
        if (!text) {
            await ctx.reply("❌ Guruh nomini yuboring.");
            return true;
        }

        try {
            createGroup(current.directionId, current.course, text);
            clearState(ctx.from.id);
            await ctx.reply(`✅ Guruh qo‘shildi: ${text}`);
        } catch (e) {
            clearState(ctx.from.id);
            await ctx.reply("❌ Guruh qo‘shishda xatolik.");
        }
        return true;
    }

    if (current.step === "assign_admin_id") {
        if (!/^\d+$/.test(text)) {
            await ctx.reply("❌ Faqat Telegram ID yuboring.");
            return true;
        }

        try {
            assignAdminToFaculty(Number(text), current.facultyId);
            clearState(ctx.from.id);
            await ctx.reply(`✅ ${text} admin qilindi.`);
        } catch (e) {
            clearState(ctx.from.id);
            await ctx.reply("❌ Admin tayinlashda xatolik.");
        }
        return true;
    }

    if (current.step === "remove_admin_id") {
        if (!/^\d+$/.test(text)) {
            await ctx.reply("❌ Faqat Telegram ID yuboring.");
            return true;
        }

        try {
            removeAdminFromFaculty(Number(text), current.facultyId);
            clearState(ctx.from.id);
            await ctx.reply(`✅ ${text} adminlikdan olindi.`);
        } catch (e) {
            clearState(ctx.from.id);
            await ctx.reply("❌ Adminni olishda xatolik.");
        }
        return true;
    }

    if (current.step === "delete_group_course") {
        if (!/^\d+$/.test(text)) {
            await ctx.reply("❌ Kurs raqamini yuboring.");
            return true;
        }

        const groups = db.prepare(`
      SELECT id, group_name
      FROM groups
      WHERE direction_id = ? AND course = ?
      ORDER BY group_name
    `).all(current.directionId, Number(text));

        clearState(ctx.from.id);

        if (!groups.length) {
            await ctx.reply("❌ Bu kursda guruh topilmadi.");
            return true;
        }

        const buttons = groups.map(g => [Markup.button.callback(`🗑 ${g.group_name}`, `delete_group_${g.id}`)]);
        await ctx.reply("🗑 O‘chiriladigan guruhni tanlang:", { ...Markup.inlineKeyboard(buttons) });
        return true;
    }

    return false;
}

module.exports = {
    startFacultyCreate,
    startFacultyDelete,
    startDirectionCreate,
    startDirectionDelete,
    startGroupCreate,
    startGroupDelete,
    startAdminAssign,
    startAdminRemove,
    handleSuperAdminCrudCallback,
    handleSuperAdminCrudText
};
