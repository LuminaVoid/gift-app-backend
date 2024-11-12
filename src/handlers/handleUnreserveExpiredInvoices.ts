import GiftVariant from "../db/giftVariant.js";
import Invoice from "../db/invoice.js";
import { INVOICE_EXPIRATION } from "./handlePurchase.js";

const CLEANUP_SAFETY_MARGIN = 10000; // in ms

export const handleUnreserveExpiredInvoices = async () => {
  console.log("Scheduled cleanup of reserved gifts");
  try {
    const expiredInvoices = await Invoice.find(
      {
        createdAt: {
          $lt: new Date(
            Date.now() - 1000 * INVOICE_EXPIRATION - CLEANUP_SAFETY_MARGIN
          ),
        },
      },
      null,
      { lean: true }
    );
    if (expiredInvoices.length === 0) {
      console.log(`Expired reserved gifts: 0 found `);
      return;
    }
    const variantReserveResetMap = expiredInvoices.reduce<
      Record<string, number>
    >((acc, cur) => {
      const a = cur.giftVariantId;
      if (acc[cur.giftVariantId.toHexString()]) {
        acc[cur.giftVariantId.toHexString()] =
          acc[cur.giftVariantId.toHexString()] + 1;
        return acc;
      }
      acc[cur.giftVariantId.toHexString()] = 1;
      return acc;
    }, {});
    for (const giftVariantId of Object.keys(variantReserveResetMap)) {
      await GiftVariant.findByIdAndUpdate(giftVariantId, {
        $inc: { reservedCount: -variantReserveResetMap[giftVariantId] },
      });
    }
    console.log(`Expired reserved gifts: ${expiredInvoices.length}`);
    console.log(variantReserveResetMap);
    console.log("Scheduled cleanup finished");
  } catch (error) {
    console.log("Scheduled cleanup failed");
    console.error(error);
    return;
  }
};
