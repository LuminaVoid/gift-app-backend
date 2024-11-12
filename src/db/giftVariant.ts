import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { Price, PRICE_SCHEMA_DEFINITION, Timestamped } from "./common.js";
import { BigNumber } from "bignumber.js";

export interface IGiftVariant extends Timestamped {
  name: {
    en: string;
    ru: string;
  };
  slug: string;
  media: {
    thumbnailUrl: string;
    lottieUrl: string;
    lottieInitialFrame?: number;
    lottieSequence?: string[];
    bgGradient?: {
      top: string;
      bottom: string;
    };
  };
  price: Price;
  totalSupply: number;
  soldCount: number;
  reservedCount: number;
}

export type IGiftVariantDoc = HydratedDocument<IGiftVariant>;

const GiftVariantSchema = new Schema<IGiftVariant>(
  {
    name: {
      en: {
        type: String,
        required: true,
        trim: true,
      },
      ru: {
        type: String,
        required: true,
        trim: true,
      },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    media: {
      thumbnailUrl: {
        type: String,
        required: true,
        trim: true,
      },
      lottieUrl: {
        type: String,
        required: true,
        trim: true,
      },
      lottieInitialFrame: {
        type: Number,
        required: false,
      },
      lottieSequence: [
        {
          type: String,
        },
      ],
      bgGradient: {
        top: {
          type: String,
          required: false,
        },
        bottom: {
          type: String,
          required: false,
        },
      },
    },
    price: PRICE_SCHEMA_DEFINITION,
    totalSupply: {
      type: Number,
      required: true,
      min: 1,
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reservedCount: {
      type: Number,
      default: 0,
      min: 0,
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

GiftVariantSchema.pre("save", async function (next) {
  const variant = this as IGiftVariant;
  if (this.isNew) {
    if (variant.soldCount > 0) {
      next(new Error("Purchased supply should be 0 for new gift variant"));
    }

    if (variant.reservedCount > 0) {
      next(new Error("Reserved supply should be 0 for new gift variant"));
    }
    if (new BigNumber(variant.price.amount).lte(0)) {
      next(new Error("Gift price must be greater than 0"));
    }

    if (variant.price.currencyType === "crypto" && !variant.price.asset) {
      next(new Error("Gift with crypto price must declare the 'asset' field"));
    }

    if (variant.price.currencyType === "fiat" && !variant.price.fiat) {
      next(new Error("Gift with fiat price must declare the 'fiat' field"));
    }
  }
  if (variant.soldCount > variant.totalSupply) {
    next(new Error("Purchased supply cannot exceed total supply"));
  }

  if (variant.reservedCount > variant.totalSupply) {
    next(new Error("Reserved supply cannot exceed total supply"));
  }
  next();
});

export default (mongoose.models["GiftVariant"] as Model<IGiftVariant>) ??
  mongoose.model<IGiftVariant>("GiftVariant", GiftVariantSchema);
