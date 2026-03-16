const adminHandler = require("./adminHandler");
const studentHandler = require("./studentHandler");
const superAdminCrudHandler = require("./superAdminCrudHandler");

async function callbackHandler(ctx) {
    const handledSuperCrud =
        await superAdminCrudHandler.handleSuperAdminCrudCallback(ctx);
    if (handledSuperCrud) return;

    const handledAdmin =
        await adminHandler.handleAdminCallback(ctx);
    if (handledAdmin) return;

    return studentHandler.handleCallback(ctx);
}

module.exports = callbackHandler;