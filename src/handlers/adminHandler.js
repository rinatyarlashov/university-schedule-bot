const fs = require("fs");
const path = require("path");
const adminMenu = require("../keyboards/adminMenu");
const { importExcel } = require("../services/excelImportService");
const { createTemplateBuffer } = require("../services/excelTemplateService");
const { broadcastToAll } = require("../services/broadcastService");
const {
    getUsersCount,
    getUsersWithGroupCount
} = require("../services/userService");

const waitingBroadcastAdmins = new Set();

function isAdmin(ctx) {
    return String(ctx.from.id) === String(process.env.ADMIN_ID);
}

async function adminPanel(ctx) {
    if (!isAdmin(ctx)) {
        return ctx.reply("Siz admin emassiz.");
    }

    await ctx.reply("⚙️ Admin panel", adminMenu());
}

async function sendExcelTemplate(ctx) {
    if (!isAdmin(ctx)) {
        return ctx.reply("Siz admin emassiz.");
    }

    const buffer = createTemplateBuffer();

    await ctx.replyWithDocument(
        {
            source: buffer,
            filename: "schedule_template.xlsx"
        },
        {
            caption: "Excel shablon tayyor. Shu formatda to‘ldiring."
        }
    );
}

async function askBroadcastMessage(ctx) {
    if (!isAdmin(ctx)) {
        return ctx.reply("Siz admin emassiz.");
    }

    waitingBroadcastAdmins.add(ctx.from.id);
    await ctx.reply("📢 Hammaga yuboriladigan xabarni yozing:");
}

async function handleBroadcastText(ctx) {
    if (!isAdmin(ctx)) return false;
    if (!waitingBroadcastAdmins.has(ctx.from.id)) return false;

    const text = (ctx.message.text || "").trim();
    if (!text) return true;

    waitingBroadcastAdmins.delete(ctx.from.id);

    const finalMessage = `📢 *Admin xabari*\n\n${text}`;
    const result = await broadcastToAll(ctx, finalMessage);

    await ctx.reply(
        `✅ Xabar yuborildi.\nYetib bordi: ${result.sent}\nXato: ${result.failed}`
    );

    return true;
}

async function showStats(ctx) {
    if (!isAdmin(ctx)) {
        return ctx.reply("❌ Siz admin emassiz.");
    }

    const users = getUsersCount();
    const usersWithGroup = getUsersWithGroupCount();

    let text = `📊 *Bot statistikasi*\n\n`;
    text += `👥 Foydalanuvchilar: *${users}*\n`;
    text += `🎓 Guruh tanlaganlar: *${usersWithGroup}*\n`;

    await ctx.reply(text, { parse_mode: "Markdown" });
}

async function handleExcelUpload(ctx) {
    if (!isAdmin(ctx)) {
        return ctx.reply("Siz admin emassiz.");
    }

    const document = ctx.message.document;
    if (!document) return;

    const fileName = document.file_name || "";
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
        return ctx.reply("Faqat Excel fayl yuboring (.xlsx yoki .xls).");
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

    const count = importExcel(filePath);

    await ctx.reply(`✅ Excel import tugadi. ${count} ta qator o‘qildi.`);

    await broadcastToAll(
        ctx,
        "📢 *Admin xabari*\n\nDars jadvali yangilandi. Iltimos, botdan yangi jadvalni tekshiring."
    );
}

module.exports = {
    adminPanel,
    handleExcelUpload,
    sendExcelTemplate,
    askBroadcastMessage,
    handleBroadcastText,
    showStats,
    isAdmin
};