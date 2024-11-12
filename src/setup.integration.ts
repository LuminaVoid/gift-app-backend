import { mongoSetup } from "./db/schema.js";
import User from "./db/user.js";
import Gift from "./db/gift.js";
import GiftAction from "./db/giftAction.js";
import GiftVariant from "./db/giftVariant.js";
import { CryptoPrice } from "./db/common.js";

beforeAll(async () => {
  // TODO: checkEnvironment (test version though)
  await mongoSetup();
  await new Promise((r) => setTimeout(r, 2000)); // wait for integration db to fully initialize
});

afterEach(async () => {
  await GiftVariant.deleteMany();
  await User.deleteMany();
  await Gift.deleteMany();
  await GiftAction.deleteMany();
});

export const TEST_PRICE_10_USDT: CryptoPrice = {
  currencyType: "crypto",
  asset: "USDT",
  amount: "10",
};

export const TEST_GIFT_MEDIA = {
  thumbnailUrl: "https://example.com/thumb.png",
  lottieUrl: "https://example.com/lottie.json",
};
