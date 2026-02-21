"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processBillingEntry = void 0;
const https_1 = require("firebase-functions/v2/https");
exports.processBillingEntry = (0, https_1.onCall)({
    cors: true,
}, async (request) => {
    console.log("Billing process initiated for:", request.data.invoiceNo);
    return {
        success: true,
        message: "Billing entry received for processing.",
    };
});
