import { getLeaderboardIndex } from "../utils/getLeaderboardIndex.js";
import User, { IUser } from "../db/user.js";

interface HandleGetUserByTelegramIdResponse {
  status: "success" | "error";
  user: IUser | null;
}

export const handleGetUserByTelegramId = async (
  telegramId: string
): Promise<HandleGetUserByTelegramIdResponse> => {
  try {
    const user = await User.findOne({ userId: telegramId }, `-__v`, {
      lean: true,
    });
    if (user) {
      const leaderboardIndex = await getLeaderboardIndex();
      const userWithLeaderboardSpot = {
        ...user,
        leaderboardSpot: leaderboardIndex[user._id.toString()],
      };
      return {
        status: "success",
        user: userWithLeaderboardSpot,
      };
    }
    return {
      status: "success",
      user: null,
    };
  } catch (error) {
    return {
      status: "error",
      user: null,
    };
  }
};
