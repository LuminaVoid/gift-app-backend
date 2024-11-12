import User, { type IUserDoc } from "../db/user.js";
import GiftVariant, { type IGiftVariantDoc } from "../db/giftVariant.js";
import Gift from "../db/gift.js";
import handlePurchase from "./handlePurchase.js";
import GiftAction, { GiftActionType } from "../db/giftAction.js";
import { TEST_GIFT_MEDIA, TEST_PRICE_10_USDT } from "../setup.integration.js";

const BAD_ID = "671dfeb9620ab8f4264c563a";

describe("handlePurchase", () => {
  let testBuyer: IUserDoc;
  let testGiftVariant: IGiftVariantDoc;
  beforeEach(async () => {
    testBuyer = await User.create({
      username: "johndoe",
    });
    testGiftVariant = await GiftVariant.create({
      name: { en: "Delicious Cake", ru: "Вкусный Торт" },
      slug: "delicious-cake",
      media: TEST_GIFT_MEDIA,
      price: TEST_PRICE_10_USDT,
      totalSupply: 500,
    });
  });

  it("properly creates & updates documents on gift purchase", async () => {
    const purchaseResponse = await handlePurchase({
      buyerId: testBuyer.id,
      giftVariantId: testGiftVariant.id,
    });
    const gifts = await Gift.find();
    expect(gifts.length).toBe(1);
    expect(gifts[0]).toMatchObject({
      buyerId: testBuyer._id,
      variantId: testGiftVariant._id,
      purchasePrice: TEST_PRICE_10_USDT,
    });

    console.log(purchaseResponse.gift?.variantId);

    expect(gifts[0].recipientId).toBeUndefined();
    expect(purchaseResponse.status).toBe("ok");
    expect(purchaseResponse.gift).toBeDefined();
    expect(purchaseResponse.gift?._id.toString()).toStrictEqual(gifts[0].id);
    expect(purchaseResponse.giftVariant).toBeDefined();
    expect(purchaseResponse.giftVariant?._id).toStrictEqual(
      testGiftVariant._id
    );

    expect((await GiftVariant.findById(testGiftVariant._id))?.soldCount).toBe(
      1
    );

    const giftActions = await GiftAction.find();
    expect(giftActions.length).toBe(1);
    expect(giftActions[0]).toMatchObject({
      type: GiftActionType.Purchase,
      giftId: gifts[0]._id,
      buyerId: testBuyer._id,
      variantId: testGiftVariant._id,
    });
    expect(giftActions[0].recipientId).toBeUndefined();
  });

  it("fails the transaction completely if one part fails", async () => {
    const purchaseResponse = await handlePurchase({
      buyerId: testBuyer.id,
      giftVariantId: BAD_ID,
    });
    expect((await Gift.find()).length).toBe(0);
    expect(await GiftVariant.findById(BAD_ID)).toBeNull();
    expect((await GiftAction.find()).length).toBe(0);
    expect(purchaseResponse.status).toBe("error");
    expect(purchaseResponse.gift).toBeUndefined();
    expect(purchaseResponse.giftVariant).toBeUndefined();
  });

  it.todo("TODO: read about product reservations in shops");
  it.todo("Alice cannot buy a gift if total supply is sold out already");
  it.todo("refund? depending on how/when tx is processed");
});
