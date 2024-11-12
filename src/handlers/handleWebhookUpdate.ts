import mongoose from "mongoose";
import { CryptoPayInvoice } from "../db/common.js";
import Gift from "../db/gift.js";
import GiftVariant from "../db/giftVariant.js";
import Invoice, { InvoiceStatus } from "../db/invoice.js";
import GiftAction, { GiftActionType } from "../db/giftAction.js";
import { sendPurchaseNotification } from "../bot/botInit.js";
import User from "../db/user.js";

const handleWebhookUpdate = async (invoice: CryptoPayInvoice) => {
  if (invoice.status !== "paid") {
    console.log(
      `handleWebhookUpdate: received "invoice_paid" update with unpaid ${invoice.status} invoice (ignoring)`
    );
    return false;
  }
  let notificationData:
    | {
        buyerId: string;
        giftName: { en: string; ru: string };
      }
    | undefined;
  try {
    const session = await mongoose.startSession();
    notificationData = await session.withTransaction(async () => {
      const updatedInvoice = await Invoice.findOneAndUpdate(
        { invoiceId: invoice.invoice_id },
        { $set: { status: InvoiceStatus.Paid } },
        { session, lean: true, returnDocument: "after" }
      );
      if (!updatedInvoice) {
        throw new Error("handleWebhookUpdate: invoice not found");
      }
      const giftVariant = await GiftVariant.findByIdAndUpdate(
        updatedInvoice.giftVariantId,
        { $inc: { soldCount: 1, reservedCount: -1 } },
        { session, lean: true, returnDocument: "after" }
      );
      if (!giftVariant) {
        throw new Error("handlePurchase: variant not found");
      }
      const [gift] = await Gift.create(
        [
          {
            variantId: giftVariant._id,
            buyerId: updatedInvoice.buyerId,
            invoice: updatedInvoice._id,
            purchasePrice: giftVariant.price,
            ordinal: giftVariant.soldCount,
          },
        ],
        { session, lean: true }
      );
      await GiftAction.create(
        [
          {
            type: GiftActionType.Purchase,
            giftId: gift._id,
            buyerId: updatedInvoice.buyerId,
            variantId: giftVariant._id,
          },
        ],
        { session }
      );
      return {
        buyerId: updatedInvoice.buyerId.toHexString(),
        giftName: giftVariant.name,
      };
    });
  } catch (error) {
    console.log("handleWebhookUpdate failed", error);
    return false;
  }

  try {
    if (notificationData) {
      const user = await User.findById(notificationData.buyerId);
      if (!user) {
        throw new Error(`User ${notificationData.buyerId} not found`);
      }
      const giftName =
        user.languageCode === "ru"
          ? notificationData.giftName.ru
          : notificationData.giftName.en;
      sendPurchaseNotification(user.userId, giftName, user.languageCode);
    }
  } catch (error) {
    console.log("Failed to send notification on purcase");
    console.error(error);
  }
  return true;
};

export default handleWebhookUpdate;
