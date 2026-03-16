const adminHandler = require("./adminHandler");
const studentHandler = require("./studentHandler");
const superAdminCrudHandler = require("./superAdminCrudHandler");

async function textRouter(ctx, next) {
    const handledSuperAdminCrud = await superAdminCrudHandler.handleSuperAdminCrudText(ctx);
    if (handledSuperAdminCrud) return;

    const handledAdminManage = await adminHandler.handleAdminAddRemoveText(ctx);
    if (handledAdminManage) return;

    const handledFacultyBroadcast = await adminHandler.handleFacultyBroadcastText(ctx);
    if (handledFacultyBroadcast) return;

    const handledGlobalBroadcast = await adminHandler.handleGlobalBroadcastText(ctx);
    if (handledGlobalBroadcast) return;

    const handledTeacherSearch = await studentHandler.handleTeacherSearchText(ctx);
    if (handledTeacherSearch) return;

    return next();
}

module.exports = textRouter;
