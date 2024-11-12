import mongoose, { RootFilterQuery } from "mongoose";
import Gift, { IGift } from "../db/gift.js";

type HandleListPurchasedGiftsArgs = {
  userId: string;
  cursor?: string;
  pageSize?: number;
};

type HandleListPurchasedGiftsResponse = {
  gifts: IGift[];
  isLastPage: boolean;
  status: "ok" | "error";
  cursor?: string;
};

const handleListPurchasedGifts = async ({
  userId,
  cursor,
  pageSize = 30,
}: HandleListPurchasedGiftsArgs): Promise<HandleListPurchasedGiftsResponse> => {
  try {
    let query: RootFilterQuery<IGift> = {
      buyerId: userId,
      recipientId: undefined,
    };
    if (cursor) {
      const decodedCursor = JSON.parse(
        Buffer.from(cursor, "base64").toString("ascii")
      );
      if (
        !decodedCursor.hasOwnProperty("lastGiftId") ||
        !decodedCursor.hasOwnProperty("lastGiftCreatedAt")
      ) {
        throw Error("Bad cursor");
      }
      query = {
        $and: [
          { buyerId: userId, recipientId: undefined },
          {
            $or: [
              {
                createdAt: { $lt: decodedCursor.lastGiftCreatedAt },
              },
              {
                createdAt: { $eq: decodedCursor.lastGiftCreatedAt },
                _id: {
                  $gt: mongoose.Types.ObjectId.createFromHexString(
                    decodedCursor.lastGiftId
                  ),
                },
              },
            ],
          },
        ],
      };
    }
    const gifts = await Gift.find(query)
      .sort({ createdAt: "desc", _id: "desc" })
      .limit(pageSize + 1);
    const isLastPage = gifts.length < pageSize + 1;
    const giftsToReturn = isLastPage ? gifts : gifts.slice(0, gifts.length - 1);
    const lastGift = giftsToReturn[giftsToReturn.length - 1];
    if (isLastPage) {
      return {
        gifts: giftsToReturn,
        isLastPage,
        status: "ok",
      };
    }
    const nextCursor = Buffer.from(
      JSON.stringify({
        lastGiftId: lastGift.id,
        lastGiftCreatedAt: lastGift.createdAt,
      })
    ).toString("base64");
    return {
      gifts: giftsToReturn,
      isLastPage,
      cursor: nextCursor,
      status: "ok",
    };
  } catch (error) {
    return {
      gifts: [],
      isLastPage: false,
      status: "error",
    };
  }
};

export default handleListPurchasedGifts;
