const { Markup } = require("telegraf");
const { isSuperAdmin, assignAdminToFaculty, removeAdminFromFaculty } = require("../services/roleService");
const { createFaculty, getAllFaculties } = require("../services/facultyService");
const { createDirection, getDirectionsByFaculty } = require("../services/directionService");
const { createGroup } = require("../services/groupService");

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

async function startDirectionCreate(ctx) {
    if (!isSuperAdmin(ctx)) return ctx.reply("❌ Siz super admin emassiz.");

    const faculties = getAllFaculties();
    if (!faculties.length) {
        return ctx.reply("❌ Avval fakultet qo‘shing.");
    }

    const buttons = faculties.map(f => [
        Markup.button.callback(`🏛 ${f.name}`, `create_direction_faculty_${f.id}`)
    ]);

    await ctx.reply("📘 Yo‘nalish uchun fakultetni tanlang:", {
        ...Markup.inlineKeyboard(buttons)
    });
}

async function startGroupCreate(ctx) {
    if (!isSuperAdmin(ctx)) return ctx.reply("❌ Siz super admin emassiz.");

    const faculties = getAllFaculties();
    if (!faculties.length) {
        return ctx.reply("❌ Avval fakultet qo‘shing.");
    }

    const buttons = faculties.map(f => [
        Markup.button.callback(`🏛 ${f.name}`, `create_group_faculty_${f.id}`)
    ]);

    await ctx.reply("👥 Guruh uchun fakultetni tanlang:", {
        ...Markup.inlineKeyboard(buttons)
    });
}

async function startAdminAssign(ctx) {
    if (!isSuperAdmin(ctx)) return ctx.reply("❌ Siz super admin emassiz.");

    const faculties = getAllFaculties();
    if (!faculties.length) {
        return ctx.reply("❌ Avval fakultet qo‘shing.");
    }

    const buttons = faculties.map(f => [
        Markup.button.callback(`🏛 ${f.name}`, `assign_admin_${f.id}`)
    ]);

    await ctx.reply("➕ Admin tayinlash uchun fakultetni tanlang:", {
        ...Markup.inlineKeyboard(buttons)
    });
}

async function startAdminRemove(ctx) {
    if (!isSuperAdmin(ctx)) return ctx.reply("❌ Siz super admin emassiz.");

    const faculties = getAllFaculties();
    if (!faculties.length) {
        return ctx.reply("❌ Fakultet topilmadi.");
    }

    const buttons = faculties.map(f => [
        Markup.button.callback(`🏛 ${f.name}`, `remove_admin_${f.id}`)
    ]);

    await ctx.reply("➖ Adminni olish uchun fakultetni tanlang:", {
        ...Markup.inlineKeyboard(buttons)
    });
}

async function handleSuperAdminCrudCallback(ctx) {
    if (!isSuperAdmin(ctx)) return false;

    const data = ctx.callbackQuery.data;

    if (data.startsWith("create_direction_faculty_")) {
        const facultyId = Number(data.split("_").pop());
        setState(ctx.from.id, {
            step: "direction_name",
            facultyId
        });
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

        const buttons = directions.map(d => [
            Markup.button.callback(`📘 ${d.name}`, `create_group_direction_${d.id}`)
        ]);

        setState(ctx.from.id, { step: "group_direction_pick", facultyId });

        await ctx.answerCbQuery();
        await ctx.reply("📘 Yo‘nalishni tanlang:", {
            ...Markup.inlineKeyboard(buttons)
        });
        return true;
    }

    if (data.startsWith("create_group_direction_")) {
        const directionId = Number(data.split("_").pop());
        setState(ctx.from.id, {
            step: "group_course",
            directionId
        });
        await ctx.answerCbQuery();
        await ctx.reply("🎓 Kurs raqamini yuboring:");
        return true;
    }

    if (data.startsWith("assign_admin_")) {
        const facultyId = Number(data.split("_").pop());
        setState(ctx.from.id, {
            step: "assign_admin_id",
            facultyId
        });
        await ctx.answerCbQuery();
        await ctx.reply("👤 Admin qilinadigan Telegram ID ni yuboring:");
        return true;
    }

    if (data.startsWith("remove_admin_")) {
        const facultyId = Number(data.split("_").pop());
        setState(ctx.from.id, {
            step: "remove_admin_id",
            facultyId
        });
        await ctx.answerCbQuery();
        await ctx.reply("👤 Adminlikdan olinadigan Telegram ID ni yuboring:");
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
        createFaculty(text);
        clearState(ctx.from.id);
        await ctx.reply(`✅ Fakultet qo‘shildi: ${text}`);
        return true;
    }

    if (current.step === "direction_name") {
        createDirection(current.facultyId, text);
        clearState(ctx.from.id);
        await ctx.reply(`✅ Yo‘nalish qo‘shildi: ${text}`);
        return true;
    }

    if (current.step === "group_course") {
        if (!/^\d+$/.test(text)) {
            await ctx.reply("❌ Kurs raqamini yuboring.");
            return true;
        }

        setState(ctx.from.id, {
            step: "group_name",
            directionId: current.directionId,
            course: Number(text)
        });

        await ctx.reply("👥 Guruh nomini yuboring:");
        return true;
    }

    if (current.step === "group_name") {
        createGroup(current.directionId, current.course, text);
        clearState(ctx.from.id);
        await ctx.reply(`✅ Guruh qo‘shildi: ${text}`);
        return true;
    }

    if (current.step === "assign_admin_id") {
        if (!/^\d+$/.test(text)) {
            await ctx.reply("❌ Faqat Telegram ID yuboring.");
            return true;
        }

        assignAdminToFaculty(Number(text), current.facultyId);
        clearState(ctx.from.id);
        await ctx.reply(`✅ ${text} admin qilindi.`);
        return true;
    }

    if (current.step === "remove_admin_id") {
        if (!/^\d+$/.test(text)) {
            await ctx.reply("❌ Faqat Telegram ID yuboring.");
            return true;
        }

        removeAdminFromFaculty(Number(text), current.facultyId);
        clearState(ctx.from.id);
        await ctx.reply(`✅ ${text} adminlikdan olindi.`);
        return true;
    }

    return false;
}

module.exports = {
    startFacultyCreate,
    startDirectionCreate,
    startGroupCreate,
    startAdminAssign,
    startAdminRemove,
    handleSuperAdminCrudCallback,
    handleSuperAdminCrudText
};