import mongoose from "mongoose";
import Gift from "../db/gift.js";
import User from "../db/user.js";
import GiftAction, { GiftActionType } from "../db/giftAction.js";

type HandleSendArgs = {
  giftId: string;
  senderId: string;
  recipientId: string;
};

const handleSend = async ({
  giftId,
  senderId,
  recipientId,
}: HandleSendArgs) => {
  try {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await Gift.updateOne(
        { _id: giftId },
        { $set: { recipientId: recipientId, receivedAt: Date.now() } },
        { session }
      );
      await User.updateOne(
        { _id: recipientId },
        { $inc: { receivedGiftCount: 1 } },
        { session }
      );
      const thatGift = await Gift.findOne({ _id: giftId }).session(session);
      if (!thatGift) {
        throw Error("Gift not found after update");
      }
      await GiftAction.create(
        [
          {
            type: GiftActionType.Send,
            giftId: giftId,
            variantId: thatGift.variantId,
            buyerId: senderId,
            recipientId: recipientId,
          },
        ],
        { session }
      );
    });
    return true;
  } catch (error) {
    console.log("Transaction failed", error);
    return false;
  }
};

export default handleSend;
