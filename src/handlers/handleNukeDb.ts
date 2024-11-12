import gift from "../db/gift.js";
import giftAction from "../db/giftAction.js";
import giftVariant from "../db/giftVariant.js";
import invoice from "../db/invoice.js";
import user from "../db/user.js";

export const handleNukeDb = async () => {
  try {
    console.log("NUKING");
    await giftVariant.deleteMany();
    await gift.deleteMany();
    await giftAction.deleteMany();
    await invoice.deleteMany();
    await user.deleteMany();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
