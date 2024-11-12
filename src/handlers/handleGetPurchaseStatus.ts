import { APIResponse } from "../types.js";
import Invoice, { InvoiceStatus } from "../db/invoice.js";
import Gift from "../db/gift.js";

interface PurchaseStatusResponseData {
  invoiceStatus: InvoiceStatus;
  giftId?: string;
}

export const handleGetPurchaseStatus = async (
  invoiceId: string
): Promise<APIResponse<PurchaseStatusResponseData>> => {
  try {
    const invoice = await Invoice.findOne({ invoiceId: invoiceId });
    if (invoice?.status === InvoiceStatus.Paid) {
      const mintedGift = await Gift.findOne({ invoice: invoice.id }, null, {
        lean: true,
      });
      return {
        status: "success",
        data: {
          invoiceStatus: invoice.status,
          giftId: mintedGift?._id.toHexString(),
        },
      };
    }
    if (invoice) {
      return {
        status: "success",
        data: {
          invoiceStatus: invoice.status,
        },
      };
    }
    return {
      status: "error",
      data: null,
      message: `No invoice with id ${invoiceId}`,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      message: "Internal server error",
    };
  }
};
