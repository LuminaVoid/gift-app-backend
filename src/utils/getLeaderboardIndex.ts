import User from "../db/user.js";

// Note: Users collection is indexed by { receivedGiftCount: -1 }
export const getLeaderboardIndex = async (): Promise<
  Record<string, number>
> => {
  try {
    const leaderboard = await User.aggregate([
      { $sort: { receivedGiftCount: -1 } },
      { $project: { _id: 1 } },
    ]);

    return leaderboard.reduce((acc, user, index) => {
      acc[user._id.toString()] = index + 1;
      return acc;
    }, {});
  } catch (error) {
    return {};
  }
};
