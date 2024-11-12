import mongoose, { RootFilterQuery } from "mongoose";
import GiftAction, { IGiftAction } from "../db/giftAction.js";

type HandleListGiftActionsArgs = {
  giftVariantId: string;
  cursor?: string;
  pageSize?: number;
};

type HandleListGiftActionsResponse = {
  giftActions: IGiftAction[];
  isLastPage: boolean;
  status: "ok" | "error";
  cursor?: string;
};

const handleListGiftActions = async ({
  giftVariantId,
  cursor,
  pageSize = 30,
}: HandleListGiftActionsArgs): Promise<HandleListGiftActionsResponse> => {
  try {
    let query: RootFilterQuery<IGiftAction> = { variantId: giftVariantId };
    if (cursor) {
      const decodedCursor = JSON.parse(
        Buffer.from(cursor, "base64").toString("ascii")
      );
      if (
        !decodedCursor.hasOwnProperty("lastGiftActionId") ||
        !decodedCursor.hasOwnProperty("lastGiftActionCreatedAt")
      ) {
        throw Error("Bad cursor");
      }
      query = {
        $and: [
          { variantId: giftVariantId },
          {
            $or: [
              {
                createdAt: { $lt: decodedCursor.lastGiftActionCreatedAt },
              },
              {
                createdAt: { $eq: decodedCursor.lastGiftActionCreatedAt },
                _id: {
                  $gt: mongoose.Types.ObjectId.createFromHexString(
                    decodedCursor.lastGiftActionId
                  ),
                },
              },
            ],
          },
        ],
      };
    }
    const giftActions = await GiftAction.find(query)
      .sort({ createdAt: "desc", _id: "desc" })
      .limit(pageSize + 1)
      .populate(["buyerId", "recipientId"]);
    const isLastPage = giftActions.length < pageSize + 1;
    const giftActionsToReturn = isLastPage
      ? giftActions
      : giftActions.slice(0, giftActions.length - 1);
    if (isLastPage) {
      return {
        giftActions: giftActionsToReturn,
        isLastPage,
        status: "ok",
      };
    }
    const lastGiftAction = giftActionsToReturn[giftActionsToReturn.length - 1];
    const nextCursor = Buffer.from(
      JSON.stringify({
        lastGiftActionId: lastGiftAction.id,
        lastGiftActionCreatedAt: lastGiftAction.createdAt,
      })
    ).toString("base64");
    return {
      giftActions: giftActionsToReturn,
      isLastPage,
      cursor: nextCursor,
      status: "ok",
    };
  } catch (error) {
    return {
      giftActions: [],
      isLastPage: false,
      status: "error",
    };
  }
};

export default handleListGiftActions;
