import mongoose, { HydratedDocument, Model, ObjectId, Schema } from "mongoose";
import { CRYPTO_CURRENCIES, FIAT_CURRENCIES, Timestamped } from "./common.js";
import GiftVariant from "./giftVariant.js";
import User from "./user.js";

export enum InvoiceStatus {
  Active = "active",
  Paid = "paid",
  Expired = "expired",
}

export interface IInvoice extends Timestamped {
  invoiceId: number;
  invoiceCreatedAt: Date;
  status: InvoiceStatus;
  expirationDate: Date;
  hash: string;
  currencyType: string;
  amount: string;
  asset?: string;
  fiat?: string;
  botInvoiceUrl: string;
  miniAppInvoiceUrl: string;
  webAppInvoiceUrl: string;
  giftVariantId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
}

export type IInvoiceDoc = HydratedDocument<IInvoice>;

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceId: {
      type: Number,
      required: true,
    },
    invoiceCreatedAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "paid", "expired"],
      required: true,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    currencyType: {
      type: String,
      enum: ["crypto", "fiat"],
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    asset: {
      type: String,
      enum: CRYPTO_CURRENCIES,
      required: false,
    },
    fiat: {
      type: String,
      enum: FIAT_CURRENCIES,
      required: false,
    },
    botInvoiceUrl: {
      type: String,
      required: true,
    },
    miniAppInvoiceUrl: {
      type: String,
      required: true,
    },
    webAppInvoiceUrl: {
      type: String,
      required: true,
    },
    giftVariantId: {
      type: Schema.Types.ObjectId,
      ref: "GiftVariant",
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

InvoiceSchema.pre("save", async function (next) {
  const session = this.$session();
  const giftVariantExists = await GiftVariant.findById(
    this.giftVariantId
  ).session(session);
  if (!giftVariantExists) {
    return next(
      new Error(
        `Invalid giftVariantId: GiftVariant ${this.giftVariantId} does not exist.`
      )
    );
  }
  const buyerIdExists = await User.findById(this.buyerId).session(session);
  if (!buyerIdExists) {
    return next(
      new Error(`Invalid buyerId: User ${this.buyerId} does not exist.`)
    );
  }
  next();
});

InvoiceSchema.pre("findOneAndUpdate", async function (next) {
  const docToUpdate = await this.model.findOne(this.getQuery());

  if (docToUpdate && docToUpdate.status === InvoiceStatus.Paid) {
    return next(
      new Error(`Cannot modify already paid invoice (${docToUpdate._id})`)
    );
  }

  if (docToUpdate && docToUpdate.status === InvoiceStatus.Expired) {
    return next(
      new Error(`Cannot modify already expired invoice (${docToUpdate._id})`)
    );
  }
  next();
});

export default (mongoose.models["Invoice"] as Model<IInvoice>) ??
  mongoose.model<IInvoice>("Invoice", InvoiceSchema);
