import { getLeaderboardIndex } from "../utils/getLeaderboardIndex.js";
import User from "../db/user.js";

export const handleGetUserById = async (id: string) => {
  try {
    const user = await User.findById(id);
    if (user) {
      const leaderboardIndex = await getLeaderboardIndex();
      const userWithLeaderboardSpot = {
        ...user.toObject(),
        leaderboardSpot: leaderboardIndex[user._id.toString()],
      };
      return {
        status: "ok",
        user: userWithLeaderboardSpot,
      };
    }
    return {
      status: "ok",
      user,
    };
  } catch (error) {
    return {
      status: "error",
      user: null,
    };
  }
};
