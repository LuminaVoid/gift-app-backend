import mongoose, { ObjectId, Schema } from "mongoose";
import { Timestamped } from "./common.js";
import GiftVariant from "./giftVariant.js";
import Gift from "./gift.js";
import User from "./user.js";

export enum GiftActionType {
  Purchase = "purchase",
  Send = "send",
}

export interface IGiftAction extends Timestamped {
  type: GiftActionType;
  giftId: ObjectId;
  variantId: ObjectId;
  buyerId: ObjectId;
  recipientId?: ObjectId;
}

const GiftActionSchema = new Schema<IGiftAction>(
  {
    type: {
      type: String,
      enum: ["purchase", "send"],
      required: true,
    },
    giftId: {
      type: Schema.Types.ObjectId,
      ref: "Gift",
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "GiftVariant",
      required: true,
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

GiftActionSchema.pre("save", async function (next) {
  const session = this.$session();
  const giftVariantExists = await GiftVariant.findById(this.variantId).session(
    session
  );
  if (!giftVariantExists) {
    return next(
      new Error(
        `Invalid variantId: GiftVariant ${this.variantId} does not exist.`
      )
    );
  }
  const giftExists = await Gift.findById(this.giftId).session(session);
  if (!giftExists) {
    return next(
      new Error(`Invalid giftId: Gift ${this.giftId} does not exist.`)
    );
  }
  const buyerIdExists = await User.findById(this.buyerId).session(session);
  if (!buyerIdExists) {
    return next(
      new Error(`Invalid buyerId: User ${this.buyerId} does not exist.`)
    );
  }
  if (this.recipientId) {
    const recipientIdExists = await User.findById(this.recipientId).session(
      session
    );
    if (!recipientIdExists) {
      return next(
        new Error(
          `Invalid recipientId: User ${this.recipientId} does not exist.`
        )
      );
    }
  }
  next();
});

export default mongoose.models["GiftAction"] ??
  mongoose.model<IGiftAction>("GiftAction", GiftActionSchema);
