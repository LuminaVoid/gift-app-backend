import User, { type IUserDoc } from "../db/user.js";
import GiftVariant, { type IGiftVariantDoc } from "../db/giftVariant.js";
import Gift from "../db/gift.js";
import handlePurchase from "./handlePurchase.js";
import GiftAction, { GiftActionType } from "../db/giftAction.js";
import handleSend from "./handleSend.js";
import { TEST_GIFT_MEDIA, TEST_PRICE_10_USDT } from "../setup.integration.js";

describe("handleSend", () => {
  let testSender: IUserDoc;
  let testRecipient: IUserDoc;
  let testGiftId: string;
  let testGiftVariant: IGiftVariantDoc;

  beforeAll(async () => {
    testSender = await User.create({
      username: "johndoe",
    });
    testRecipient = await User.create({
      username: "janedoe",
    });
    testGiftVariant = await GiftVariant.create({
      name: { en: "Delicious Cake", ru: "Вкусный Торт" },
      slug: "delicious-cake",
      media: TEST_GIFT_MEDIA,
      price: TEST_PRICE_10_USDT,
      totalSupply: 500,
    });
    const purchaseResponse = await handlePurchase({
      buyerId: testSender.id,
      giftVariantId: testGiftVariant.id,
    });
    if (purchaseResponse.status === "error" || !purchaseResponse.gift) {
      console.error(`handleSend.beforeAll - handlePurchase returned error`);
      process.exit(1);
    }
    testGiftId = purchaseResponse.gift._id.toHexString();
    // TODO: flaky
    await new Promise((r) => setTimeout(r, 1000)); // to avoid timestamp collision in MongoDB due to fast test
  });

  it("properly creates & updates documents on gift send", async () => {
    let recipientUser = await User.findById(testRecipient.id);
    if (!recipientUser) {
      expect.fail("user with testRecipient.id not found");
    }
    expect(recipientUser.receivedGiftCount).toBe(0);

    await handleSend({
      giftId: testGiftId,
      senderId: testSender.id,
      recipientId: testRecipient.id,
    });
    const gift = await Gift.findById(testGiftId);
    if (!gift) {
      expect.fail("gift with testGiftId not found");
    }
    expect(gift).toMatchObject({
      buyerId: testSender._id,
      variantId: testGiftVariant._id,
      recipientId: testRecipient._id,
      purchasePrice: TEST_PRICE_10_USDT,
    });
    expect(gift.receivedAt).toBeDefined();
    // TODO: flaky
    // AssertionError: expected 265 to be greater than 740
    expect(gift.receivedAt?.getMilliseconds()).toBeGreaterThan(
      gift.createdAt.getMilliseconds()
    );

    recipientUser = await User.findById(testRecipient.id);
    if (!recipientUser) {
      expect.fail("user with testRecipient.id not found");
    }
    expect(recipientUser.receivedGiftCount).toBe(1);

    const giftActions = await GiftAction.find({ giftId: testGiftId }).sort({
      createdAt: "asc",
    });
    expect(giftActions[0]).toMatchObject({
      type: GiftActionType.Purchase,
      variantId: testGiftVariant._id,
      buyerId: testSender._id,
    });
    expect(giftActions[0].recipientId).toBeUndefined();
    expect(giftActions[1]).toMatchObject({
      type: GiftActionType.Send,
      variantId: testGiftVariant._id,
      buyerId: testSender._id,
      recipientId: testRecipient._id,
    });
  });

  it.todo("Alice cannot send gift that doesn't exist");
  it.todo("Alice cannot send gift owned by Bob");
  it.todo("Alice cannot send gift to herself");
  it.todo("Alice cannot send gift if it was already sent");
});
