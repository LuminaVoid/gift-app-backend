import mongoose, { Types, Model, ObjectId, Schema } from "mongoose";
import { Price, PRICE_SCHEMA_DEFINITION, Timestamped } from "./common.js";
import GiftVariant from "./giftVariant.js";

export interface IGift extends Timestamped {
  variantId: Types.ObjectId;
  buyerId: Types.ObjectId;
  invoice: Types.ObjectId;
  ordinal: number; // The ordinal #number the gift was minted
  purchasePrice: Price;
  recipientId?: Types.ObjectId;
  receivedAt?: Date;
}

const GiftSchema = new Schema<IGift>(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "GiftVariant",
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    ordinal: {
      type: Number,
      required: true,
    },
    purchasePrice: PRICE_SCHEMA_DEFINITION,
    receivedAt: {
      type: Date,
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

GiftSchema.pre("save", async function (next) {
  const giftVariantExists = await GiftVariant.exists({ _id: this.variantId });
  if (!giftVariantExists) {
    return next(
      new Error(
        `Invalid variantId: GiftVariant ${this.variantId} does not exist.`
      )
    );
  }
  next();
});

GiftSchema.pre("findOneAndUpdate", async function (next) {
  const docToUpdate = await this.model.findOne(this.getQuery());

  if (docToUpdate && docToUpdate.recipientId) {
    return next(new Error(`The gift ${docToUpdate._id} is already received`));
  }
  next();
});

export default (mongoose.models["Gift"] as Model<IGift>) ??
  mongoose.model<IGift>("Gift", GiftSchema);
