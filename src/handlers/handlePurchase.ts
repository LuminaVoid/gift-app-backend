import mongoose, { Document } from "mongoose";
import Gift, { IGift } from "../db/gift.js";
import GiftVariant, { IGiftVariant } from "../db/giftVariant.js";
import GiftAction, { GiftActionType } from "../db/giftAction.js";
import { CryptoPayInvoice, Price } from "../db/common.js";
import Invoice, { IInvoice, InvoiceStatus } from "../db/invoice.js";

type HandlePurchaseArgs = {
  buyerId: string;
  giftVariantId: string;
};

type HandlePurchaseResponse = {
  status: "ok" | "error";
  gift?: IGift;
  giftVariant?: IGiftVariant;
};

const CRYPTO_PAY_API_URL = `https://testnet-pay.crypt.bot/api`;
const CRYPTO_PAY_HEADERS = new Headers({
  "Crypto-Pay-API-Token": process.env.CP_TOKEN,
  "Content-Type": "application/json",
});

type HandlePurchaseInvoiceResponse = {
  status: "ok" | "error";
  invoiceId?: number;
  botInvoiceUrl?: string;
  miniAppInvoiceUrl?: string;
  webAppInvoiceUrl?: string;
};

export const INVOICE_EXPIRATION = 300; // in seconds, 5 minutes

export const handlePurchaseInvoice = async ({
  buyerId,
  giftVariantId,
}: HandlePurchaseArgs): Promise<HandlePurchaseInvoiceResponse> => {
  const giftVariant = await GiftVariant.findById(giftVariantId);

  if (!giftVariant) {
    return {
      status: "error",
    };
  }

  const description = `Purchasing a ${giftVariant.name.en} gift`;
  const body: Record<string, string | number> = {
    currency_type: giftVariant.price.currencyType,
    amount: giftVariant.price.amount,
    description,
    expires_in: INVOICE_EXPIRATION,
  };
  if (giftVariant.price.currencyType === "crypto") {
    body.asset = giftVariant.price.asset;
  }
  if (giftVariant.price.currencyType === "fiat") {
    body.fiat = giftVariant.price.fiat;
  }

  try {
    const resp = await fetch(`${CRYPTO_PAY_API_URL}/createInvoice`, {
      method: "POST",
      headers: CRYPTO_PAY_HEADERS,
      body: JSON.stringify(body),
    });
    const respJson = (await resp.json()) as {
      ok: boolean;
      result: CryptoPayInvoice;
      error: any;
    };

    if (!respJson.ok) {
      console.log("Error while creating an invoice:", respJson.error);
      return {
        status: "error",
      };
    }
    const invoiceData: Partial<IInvoice> = {
      invoiceId: respJson.result.invoice_id,
      invoiceCreatedAt: new Date(respJson.result.created_at),
      status: InvoiceStatus.Active,
      expirationDate: new Date(respJson.result.expiration_date),
      hash: respJson.result.hash,
      currencyType: respJson.result.currency_type,
      amount: respJson.result.amount,
      asset: respJson.result.asset,
      fiat: respJson.result.fiat,
      botInvoiceUrl: respJson.result.bot_invoice_url,
      miniAppInvoiceUrl: respJson.result.mini_app_invoice_url,
      webAppInvoiceUrl: respJson.result.web_app_invoice_url,
    };
    await saveInvoiceAndReserveGift(buyerId, giftVariantId, invoiceData);

    return {
      status: "ok",
      invoiceId: invoiceData.invoiceId,
      botInvoiceUrl: invoiceData.botInvoiceUrl,
      miniAppInvoiceUrl: invoiceData.miniAppInvoiceUrl,
      webAppInvoiceUrl: invoiceData.webAppInvoiceUrl,
    };
  } catch (error) {
    console.error("handlePurchaseInvoice error", error);
    return {
      status: "error",
    };
  }
};

const saveInvoiceAndReserveGift = async (
  buyerId: string,
  giftVariantId: string,
  invoiceData: Partial<IInvoice>
) => {
  try {
    const session = await mongoose.startSession();
    const [giftVariant, invoice] = await session.withTransaction(async () => {
      const giftVariant = await GiftVariant.findByIdAndUpdate(
        giftVariantId,
        { $inc: { reservedCount: 1 } },
        { session, lean: true, returnDocument: "after" }
      );
      const invoice = await Invoice.create(
        [
          {
            ...invoiceData,
            buyerId,
            giftVariantId,
          },
        ],
        { session, lean: true }
      );
      return [giftVariant, invoice];
    });
    return {
      status: "ok",
      giftVariant,
      invoice,
    };
  } catch (error) {
    console.error("saveInvoiceAndReserveGift Transaction failed", error);
    return {
      status: "error",
    };
  }
};

const handlePurchase = async ({
  buyerId,
  giftVariantId,
}: HandlePurchaseArgs): Promise<HandlePurchaseResponse> => {
  try {
    const session = await mongoose.startSession();

    const [gift, giftVariant] = await session.withTransaction(async () => {
      const giftVariant = await GiftVariant.findByIdAndUpdate(
        giftVariantId,
        { $inc: { soldCount: 1 } },
        { session, lean: true, returnDocument: "after" }
      );
      if (!giftVariant) throw new Error("handlePurchase: variant not found");
      const [gift] = await Gift.create(
        [
          {
            variantId: giftVariantId,
            buyerId: buyerId,
            purchasePrice: giftVariant.price,
          },
        ],
        { session, lean: true }
      );
      await GiftAction.create(
        [
          {
            type: GiftActionType.Purchase,
            giftId: gift._id,
            buyerId,
            variantId: giftVariantId,
          },
        ],
        { session }
      );
      return [gift, giftVariant];
    });
    return {
      status: "ok",
      gift: gift as IGift,
      giftVariant: giftVariant as IGiftVariant,
    };
  } catch (error) {
    console.error("handlePurchase Transaction failed", error);
    return {
      status: "error",
    };
  }
};

export default handlePurchase;
