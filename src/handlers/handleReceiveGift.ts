import mongoose from "mongoose";
import Gift, { IGift } from "../db/gift.js";
import GiftVariant, { IGiftVariant } from "../db/giftVariant.js";
import User, { IUser } from "../db/user.js";
import GiftAction, { GiftActionType } from "../db/giftAction.js";
import { APIResponse } from "../types.js";
import { sendGiftReceivedNotification } from "../bot/botInit.js";

interface ReceiveGiftResponseData {
  gift: Omit<IGift, "buyerId"> & { buyerId: IUser };
  giftVariant: IGiftVariant;
}

export const handleReceiveGift = async (
  giftId: string,
  recipientId: string
): Promise<APIResponse<ReceiveGiftResponseData>> => {
  try {
    const session = await mongoose.startSession();
    const { gift, recipient } = await session.withTransaction(async () => {
      const updatedGift = await Gift.findByIdAndUpdate(
        { _id: giftId },
        { $set: { recipientId: recipientId, receivedAt: Date.now() } },
        { session, lean: true, returnDocument: "after" }
      ).populate<{ buyerId: IUser }>("buyerId");
      if (!updatedGift) {
        throw Error("Gift not found");
      }
      const recipient = await User.findByIdAndUpdate(
        recipientId,
        { $inc: { receivedGiftCount: 1 } },
        { session, lean: true, returnDocument: "after" }
      );
      if (!recipient) {
        throw Error("Recipient not found");
      }
      await GiftAction.create(
        [
          {
            type: GiftActionType.Send,
            giftId: giftId,
            variantId: updatedGift.variantId,
            buyerId: updatedGift.buyerId,
            recipientId: recipientId,
          },
        ],
        { session }
      );
      return { gift: updatedGift, recipient };
    });
    const variant = await GiftVariant.findById(gift.variantId);
    if (variant) {
      sendGiftReceivedNotification(
        gift.buyerId.userId,
        gift.buyerId.languageCode === "ru" ? variant.name.ru : variant.name.en,
        recipient.firstName,
        gift.buyerId.languageCode
      );
    }
    return {
      status: "success",
      data: {
        gift: gift,
        giftVariant: variant!,
      },
    };
  } catch (error) {
    console.log("Failed to receive gift");
    console.error(error);
    return {
      status: "error",
      data: null,
    };
  }
};
