import mongoose, { RootFilterQuery } from "mongoose";
import GiftAction, { IGiftAction } from "../db/giftAction.js";
import { PaginatedRequestArgs, PaginatedResponse } from "../types.js";

interface HandleListUserHistoryArgs extends PaginatedRequestArgs {
  userId: string;
}

export const handleListUserHistory = async ({
  userId,
  pageSize = 30,
  cursor,
}: HandleListUserHistoryArgs): Promise<PaginatedResponse<IGiftAction>> => {
  try {
    let query: RootFilterQuery<IGiftAction> = {
      $or: [{ buyerId: userId }, { recipientId: userId }],
    };
    if (cursor) {
      const decodedCursor = JSON.parse(
        Buffer.from(cursor, "base64").toString("ascii")
      );
      if (
        !decodedCursor.hasOwnProperty("lastUserActionId") ||
        !decodedCursor.hasOwnProperty("lastUserActionCreatedAt")
      ) {
        throw Error("Bad cursor");
      }
      query = {
        $and: [
          query,
          {
            $or: [
              {
                createdAt: { $lt: decodedCursor.lastUserActionCreatedAt },
              },
              {
                createdAt: { $eq: decodedCursor.lastUserActionCreatedAt },
                _id: {
                  $gt: mongoose.Types.ObjectId.createFromHexString(
                    decodedCursor.lastUserActionId
                  ),
                },
              },
            ],
          },
        ],
      };
    }
    const userActions = await GiftAction.find(query)
      .sort({ createdAt: "desc", _id: "desc" })
      .limit(pageSize + 1)
      .populate(["buyerId", "recipientId", "giftId"]);
    const isLastPage = userActions.length < pageSize + 1;
    const userActionsToReturn = isLastPage
      ? userActions
      : userActions.slice(0, userActions.length - 1);
    if (isLastPage) {
      return {
        data: userActionsToReturn,
        isLastPage,
        status: "success",
      };
    }
    const lastUserAction = userActionsToReturn[userActionsToReturn.length - 1];
    const nextCursor = Buffer.from(
      JSON.stringify({
        lastUserActionId: lastUserAction.id,
        lastUserActionCreatedAt: lastUserAction.createdAt,
      })
    ).toString("base64");
    return {
      status: "success",
      isLastPage,
      data: userActionsToReturn,
      cursor: nextCursor,
    };
  } catch (error) {
    return {
      status: "error",
      isLastPage: false,
      data: [],
    };
  }
};
