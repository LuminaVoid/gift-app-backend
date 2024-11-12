import GiftVariant, { IGiftVariant } from "../db/giftVariant.js";

export const handleGetGiftVariantById = async (
  id: string
): Promise<IGiftVariant | null> => {
  try {
    const giftVairnat = await GiftVariant.findById(id, `-__v`, { lean: true });
    return giftVairnat;
  } catch (error) {
    return null;
  }
};
