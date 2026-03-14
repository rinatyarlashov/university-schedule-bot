const fs = require("fs");
const path = require("path");
const adminMenu = require("../keyboards/adminMenu");
const superAdminMenu = require("../keyboards/superAdminMenu");
const { importExcel } = require("../services/excelImportService");
const { createTemplateBuffer } = require("../services/excelTemplateService");
const { broadcastToAll } = require("../services/broadcastService");
const {
    getUsersCount,
    getUsersWithGroupCount,
    getAllUsers
} = require("../services/userService");
const {
    isAdmin,
    isSuperAdmin,
    assignAdminToFaculty,
    removeAdminFromFaculty,
    getAdminFacultyIds,
    getAllAdmins,
    canManageFaculty
} = require("../services/roleService");
const { getFaculties } = require("../services/scheduleService");

const waitingFacultyBroadcast = new Set();
const waitingGlobalBroadcast = new Set();

const pendingAddAdminFaculty = new Map();
const pendingRemoveAdminFaculty = new Map();

function getSafeFacultyButtons(prefix) {
    const faculties = getFaculties();
    return faculties.map(f => [{ text: `🏛 ${f.name}`, callback_data: `${prefix}_${f.id}` }]);
}

async function adminPanel(ctx) {
    if (!isAdmin(ctx)) {
        return ctx.reply("❌ Siz admin emassiz.");
    }

    await ctx.reply("⚙️ Admin panel", adminMenu());
}

async function superAdminPanel(ctx) {
    if (!isSuperAdmin(ctx)) {
        return ctx.reply("❌ Siz super admin emassiz.");
    }

    await ctx.reply("👑 Super Admin panel", superAdminMenu());
}

async function sendExcelTemplate(ctx) {
    if (!isAdmin(ctx)) {
        return ctx.reply("❌ Siz admin emassiz.");
    }

    const buffer = createTemplateBuffer();

    await ctx.replyWithDocument(
        {
            source: buffer,
            filename: "schedule_template.xlsx"
        },
        {
            caption: "Universal Excel shablon tayyor."
        }
    );
}

async function askFacultyAnnouncement(ctx) {
    if (!isAdmin(ctx)) {
        return ctx.reply("❌ Siz admin emassiz.");
    }

    waitingFacultyBroadcast.add(ctx.from.id);
    await ctx.reply("📢 Fakultetingiz uchun yuboriladigan e'lonni yozing:");
}

async function askGlobalBroadcast(ctx) {
    if (!isSuperAdmin(ctx)) {
        return ctx.reply("❌ Siz super admin emassiz.");
    }

    waitingGlobalBroadcast.add(ctx.from.id);
    await ctx.reply("📢 Hammaga yuboriladigan global xabarni yozing:");
}

async function handleFacultyBroadcastText(ctx) {
    if (!isAdmin(ctx)) return false;
    if (!waitingFacultyBroadcast.has(ctx.from.id)) return false;

    const text = (ctx.message.text || "").trim();
    if (!text) return true;

    waitingFacultyBroadcast.delete(ctx.from.id);

    const users = getAllUsers();
    const adminFacultyIds = getAdminFacultyIds(ctx.from.id);

    let sent = 0;
    let failed = 0;

    for (const user of users) {
        if (!user.faculty_id) continue;

        if (!isSuperAdmin(ctx) && !adminFacultyIds.includes(user.faculty_id)) {
            continue;
        }

        try {
            await ctx.telegram.sendMessage(
                user.telegram_id,
                `📢 *Fakultet e'loni*\n\n${text}`,
                { parse_mode: "Markdown" }
            );
            sent++;
        } catch (e) {
            failed++;
        }
    }

    await ctx.reply(`✅ Fakultet e'loni yuborildi.\nYetib bordi: ${sent}\nXato: ${failed}`);
    return true;
}

async function handleGlobalBroadcastText(ctx) {
    if (!isSuperAdmin(ctx)) return false;
    if (!waitingGlobalBroadcast.has(ctx.from.id)) return false;

    const text = (ctx.message.text || "").trim();
    if (!text) return true;

    waitingGlobalBroadcast.delete(ctx.from.id);

    const result = await broadcastToAll(ctx, `📢 *Global xabar*\n\n${text}`);

    await ctx.reply(`✅ Global xabar yuborildi.\nYetib bordi: ${result.sent}\nXato: ${result.failed}`);
    return true;
}

async function showStats(ctx) {
    if (!isSuperAdmin(ctx)) {
        return ctx.reply("❌ Statistikani faqat super admin ko‘ra oladi.");
    }

    const users = getUsersCount();
    const usersWithGroup = getUsersWithGroupCount();

    let text = `📊 *To‘liq statistika*\n\n`;
    text += `👥 Foydalanuvchilar: *${users}*\n`;
    text += `🎓 Guruh tanlaganlar: *${usersWithGroup}*\n`;

    await ctx.reply(text, { parse_mode: "Markdown" });
}

async function showAdminsList(ctx) {
    if (!isSuperAdmin(ctx)) {
        return ctx.reply("❌ Faqat super admin ko‘ra oladi.");
    }

    const rows = getAllAdmins();

    if (!rows.length) {
        return ctx.reply("Adminlar topilmadi.");
    }

    let text = `👥 *Adminlar ro‘yxati*\n\n`;

    for (const row of rows) {
        text += `ID: *${row.telegram_id}*\n`;
        text += `Role: *${row.role}*\n`;
        text += `Fakultet: *${row.faculty_name || "-"}*\n\n`;
    }

    await ctx.reply(text, { parse_mode: "Markdown" });
}

async function startAddAdmin(ctx) {
    if (!isSuperAdmin(ctx)) {
        return ctx.reply("❌ Siz super admin emassiz.");
    }

    const buttons = getSafeFacultyButtons("assign_admin_faculty");
    await ctx.reply("➕ Admin qo‘shish uchun fakultetni tanlang:", {
        reply_markup: { inline_keyboard: buttons }
    });
}

async function startRemoveAdmin(ctx) {
    if (!isSuperAdmin(ctx)) {
        return ctx.reply("❌ Siz super admin emassiz.");
    }

    const buttons = getSafeFacultyButtons("remove_admin_faculty");
    await ctx.reply("➖ Adminni o‘chirish uchun fakultetni tanlang:", {
        reply_markup: { inline_keyboard: buttons }
    });
}

async function handleAdminAddRemoveText(ctx) {
    const text = (ctx.message.text || "").trim();

    if (pendingAddAdminFaculty.has(ctx.from.id)) {
        const facultyId = pendingAddAdminFaculty.get(ctx.from.id);

        if (!/^\d+$/.test(text)) {
            await ctx.reply("Faqat Telegram ID yuboring.");
            return true;
        }

        assignAdminToFaculty(Number(text), facultyId);
        pendingAddAdminFaculty.delete(ctx.from.id);

        await ctx.reply(`✅ ${text} foydalanuvchi faculty_id=${facultyId} uchun admin qilindi.`);
        return true;
    }

    if (pendingRemoveAdminFaculty.has(ctx.from.id)) {
        const facultyId = pendingRemoveAdminFaculty.get(ctx.from.id);

        if (!/^\d+$/.test(text)) {
            await ctx.reply("Faqat Telegram ID yuboring.");
            return true;
        }

        removeAdminFromFaculty(Number(text), facultyId);
        pendingRemoveAdminFaculty.delete(ctx.from.id);

        await ctx.reply(`✅ ${text} foydalanuvchidan faculty_id=${facultyId} admin huquqi olib tashlandi.`);
        return true;
    }

    return false;
}

async function handleExcelUpload(ctx) {
    if (!isAdmin(ctx)) {
        return ctx.reply("❌ Siz admin emassiz.");
    }

    const document = ctx.message.document;
    if (!document) return;

    const fileName = document.file_name || "";
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
        return ctx.reply("Faqat Excel fayl yuboring (.xlsx yoki .xls).");
    }

    const adminFacultyIds = getAdminFacultyIds(ctx.from.id);

    if (!isSuperAdmin(ctx) && !adminFacultyIds.length) {
        return ctx.reply("❌ Sizga hali hech qaysi fakultet biriktirilmagan.");
    }

    const link = await ctx.telegram.getFileLink(document.file_id);
    const uploadsDir = path.join(process.cwd(), "uploads");

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }

    const filePath = path.join(uploadsDir, `${Date.now()}_${fileName}`);

    const response = await fetch(link.href);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    let count = 0;

    if (isSuperAdmin(ctx)) {
        count = importExcel(filePath, null);
    } else {
        for (const facultyId of adminFacultyIds) {
            count += importExcel(filePath, facultyId);
        }
    }

    await ctx.reply(`✅ Excel import tugadi. ${count} ta qator o‘qildi.`);

    const users = getAllUsers();
    let sent = 0;

    for (const user of users) {
        if (!user.faculty_id) continue;

        if (isSuperAdmin(ctx) || adminFacultyIds.includes(user.faculty_id)) {
            try {
                await ctx.telegram.sendMessage(
                    user.telegram_id,
                    "📢 *Admin xabari*\n\nDars jadvali yangilandi. Iltimos, yangi jadvalni tekshiring.",
                    { parse_mode: "Markdown" }
                );
                sent++;
            } catch (e) {}
        }
    }

    console.log(`Announcement sent to ${sent} users`);
}

async function handleAdminCallback(ctx) {
    const data = ctx.callbackQuery.data;

    if (data.startsWith("assign_admin_faculty_")) {
        if (!isSuperAdmin(ctx)) return;

        const facultyId = Number(data.split("_").pop());
        pendingAddAdminFaculty.set(ctx.from.id, facultyId);

        await ctx.answerCbQuery();
        await ctx.reply(`Faculty ID ${facultyId} tanlandi.\nEndi admin qilinadigan Telegram ID ni yuboring:`);
        return true;
    }

    if (data.startsWith("remove_admin_faculty_")) {
        if (!isSuperAdmin(ctx)) return;

        const facultyId = Number(data.split("_").pop());
        pendingRemoveAdminFaculty.set(ctx.from.id, facultyId);

        await ctx.answerCbQuery();
        await ctx.reply(`Faculty ID ${facultyId} tanlandi.\nEndi adminlikdan olinadigan Telegram ID ni yuboring:`);
        return true;
    }

    return false;
}

module.exports = {
    adminPanel,
    superAdminPanel,
    sendExcelTemplate,
    askFacultyAnnouncement,
    askGlobalBroadcast,
    handleFacultyBroadcastText,
    handleGlobalBroadcastText,
    showStats,
    showAdminsList,
    startAddAdmin,
    startRemoveAdmin,
    handleAdminAddRemoveText,
    handleExcelUpload,
    handleAdminCallback,
    isAdmin,
    isSuperAdmin
};