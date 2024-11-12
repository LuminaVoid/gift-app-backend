import mongoose from "mongoose";
import User, { IUser } from "../db/user.js";
import { getLeaderboardIndex } from "../utils/getLeaderboardIndex.js";

type HandleListUsersArgs = {
  cursor?: string;
  pageSize?: number;
  searchStr?: string;
};

type HandleListUsersResponse = {
  users: IUser[];
  isLastPage: boolean;
  status: "ok" | "error";
  cursor?: string;
};

const handleListUsers = async ({
  cursor,
  pageSize = 30,
  searchStr,
}: HandleListUsersArgs): Promise<HandleListUsersResponse> => {
  try {
    let query = {};
    if (cursor) {
      const decodedCursor = JSON.parse(
        Buffer.from(cursor, "base64").toString("ascii")
      );
      if (
        !decodedCursor.hasOwnProperty("lastUserId") ||
        !decodedCursor.hasOwnProperty("lastUserGiftCount")
      ) {
        throw Error("Bad cursor");
      }
      query = {
        $or: [
          {
            receivedGiftCount: { $lt: decodedCursor.lastUserGiftCount },
          },
          {
            receivedGiftCount: { $eq: decodedCursor.lastUserGiftCount },
            _id: {
              $gt: mongoose.Types.ObjectId.createFromHexString(
                decodedCursor.lastUserId
              ),
            },
          },
        ],
      };
    }
    if (searchStr) {
      const regex = new RegExp(searchStr, "i");
      const searchFilter = { firstName: { $regex: regex } };
      if (Object.keys(query).length === 0) {
        query = searchFilter;
      } else {
        query = {
          $and: [searchFilter, query],
        };
      }
    }
    const users = await User.find(query)
      .sort({ receivedGiftCount: "desc", _id: "asc" })
      .limit(pageSize + 1);
    const isLastPage = users.length < pageSize + 1;
    const usersToReturn = isLastPage ? users : users.slice(0, users.length - 1);
    const leaderboardIndex = await getLeaderboardIndex();
    const usersWithLeaderboardPlacing = usersToReturn.map((user) => ({
      ...user.toObject(),
      leaderboardSpot: leaderboardIndex[user._id.toString()],
    }));
    if (isLastPage) {
      return {
        users: usersWithLeaderboardPlacing,
        isLastPage,
        status: "ok",
      };
    }
    const lastUser = usersToReturn[usersToReturn.length - 1];
    const nextCursor = Buffer.from(
      JSON.stringify({
        lastUserId: lastUser.id,
        lastUserGiftCount: lastUser.receivedGiftCount,
      })
    ).toString("base64");
    return {
      users: usersWithLeaderboardPlacing,
      isLastPage,
      cursor: nextCursor,
      status: "ok",
    };
  } catch (error) {
    return {
      users: [],
      isLastPage: false,
      status: "error",
    };
  }
};

export default handleListUsers;
