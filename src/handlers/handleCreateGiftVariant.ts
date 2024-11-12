import GiftVariant, { IGiftVariant } from "../db/giftVariant.js";

const handleCreateGiftVariant = async (giftVariant: IGiftVariant) => {
  try {
    const ok = await GiftVariant.create(giftVariant);
    console.log("OK?");
    console.log(ok);
    return true;
  } catch (error) {
    return false;
  }
};

export default handleCreateGiftVariant;
