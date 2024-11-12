import mongoose from "mongoose";
import { IGiftVariant } from "../db/giftVariant.js";
import GiftVariant from "../db/giftVariant.js";

type HandleListGiftVariantsArgs = {
  cursor?: string;
  pageSize?: number;
};

type HandleListGiftVariantsResponse = {
  giftVariants: IGiftVariant[];
  isLastPage: boolean;
  status: "ok" | "error";
  cursor?: string;
};

const handleListGiftVariants = async ({
  cursor,
  pageSize = 30,
}: HandleListGiftVariantsArgs): Promise<HandleListGiftVariantsResponse> => {
  try {
    let query = {};
    if (cursor) {
      const decodedCursor = JSON.parse(
        Buffer.from(cursor, "base64").toString("ascii")
      );
      if (
        !decodedCursor.hasOwnProperty("lastGiftVariantId") ||
        !decodedCursor.hasOwnProperty("lastGiftVariantSupply")
      ) {
        throw Error("Bad cursor");
      }
      query = {
        $or: [
          {
            totalSupply: { $gt: decodedCursor.lastGiftVariantSupply },
          },
          {
            totalSupply: { $eq: decodedCursor.lastGiftVariantSupply },
            _id: {
              $gt: mongoose.Types.ObjectId.createFromHexString(
                decodedCursor.lastGiftVariantId
              ),
            },
          },
        ],
      };
    }
    const giftVariants = await GiftVariant.find(query)
      .sort({ totalSupply: "asc", _id: "asc" })
      .limit(pageSize + 1);
    const isLastPage = giftVariants.length < pageSize + 1;
    const giftVariantsToReturn = isLastPage
      ? giftVariants
      : giftVariants.slice(0, giftVariants.length - 1);
    const lastGiftVariant =
      giftVariantsToReturn[giftVariantsToReturn.length - 1];
    if (isLastPage) {
      return {
        giftVariants: giftVariantsToReturn,
        isLastPage,
        status: "ok",
      };
    }
    const nextCursor = Buffer.from(
      JSON.stringify({
        lastGiftVariantId: lastGiftVariant.id,
        lastGiftVariantSupply: lastGiftVariant.totalSupply,
      })
    ).toString("base64");
    return {
      giftVariants: giftVariantsToReturn,
      isLastPage,
      cursor: nextCursor,
      status: "ok",
    };
  } catch (error) {
    return {
      giftVariants: [],
      isLastPage: false,
      status: "error",
    };
  }
};

export default handleListGiftVariants;
