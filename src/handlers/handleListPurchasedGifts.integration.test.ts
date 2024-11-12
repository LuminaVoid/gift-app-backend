import GiftVariant, { IGiftVariantDoc } from "../db/giftVariant.js";
import handleListPurchasedGifts from "./handleListPurchasedGifts.js";
import User, { IUserDoc } from "../db/user.js";
import handlePurchase from "./handlePurchase.js";
import handleSend from "./handleSend.js";
import { TEST_GIFT_MEDIA, TEST_PRICE_10_USDT } from "../setup.integration.js";

describe("handleListPurchasedGifts", () => {
  let alice: IUserDoc;
  let alicePurchasedNotSent: Record<string, any>[] = [];
  let bob: IUserDoc;
  let bobPurchasedNotSent: Record<string, any>[] = [];
  let chris: IUserDoc;
  const chrisPurchasedNotSent: Record<string, any>[] = [];

  let giftVariantA: IGiftVariantDoc;
  let giftVariantB: IGiftVariantDoc;
  let giftVariantC: IGiftVariantDoc;

  beforeEach(async () => {
    [alice, bob, chris] = await User.create(
      ["alice", "bob", "chris"].map((u) => ({ username: u }))
    );
    [giftVariantA, giftVariantB, giftVariantC] = await GiftVariant.create(
      ["A", "B", "C"].map((n) => ({
        name: { en: `gift-${n}`, ru: `подарок-${n}` },
        slug: `gift-${n}`,
        totalSupply: 50,
        media: TEST_GIFT_MEDIA,
        price: TEST_PRICE_10_USDT,
      }))
    );

    const aliceGiftA1 = await handlePurchase({
      buyerId: alice.id,
      giftVariantId: giftVariantA.id,
    });
    const aliceUnsentStockA = await Promise.all(
      [...Array(9).keys()].map(async (i) => {
        // Simulate purchases at different times
        await new Promise((resolve) => setTimeout(resolve, i * 15));
        return handlePurchase({
          buyerId: alice.id,
          giftVariantId: giftVariantA.id,
        });
      })
    );
    const aliceGiftA2 = await handlePurchase({
      buyerId: alice.id,
      giftVariantId: giftVariantA.id,
    });
    const aliceGiftB1 = await handlePurchase({
      buyerId: alice.id,
      giftVariantId: giftVariantB.id,
    });
    const bobGiftA = await handlePurchase({
      buyerId: bob.id,
      giftVariantId: giftVariantA.id,
    });
    const bobGiftB = await handlePurchase({
      buyerId: bob.id,
      giftVariantId: giftVariantB.id,
    });
    const chrisGiftA = await handlePurchase({
      buyerId: chris.id,
      giftVariantId: giftVariantA.id,
    });
    if (
      aliceGiftA1.status === "error" ||
      aliceGiftA2.status === "error" ||
      aliceGiftB1.status === "error" ||
      bobGiftA.status === "error" ||
      bobGiftB.status === "error" ||
      chrisGiftA.status === "error" ||
      aliceUnsentStockA.some((r) => r.status === "error")
    ) {
      console.error(
        `handleListGiftActions.beforeEach failed - some purchase failed`
      );
      process.exit(1);
    }
    const aliceSendA1 = await handleSend({
      senderId: alice.id,
      recipientId: bob.id,
      giftId: aliceGiftA1.gift!._id.toHexString(),
    });
    const aliceSendA2 = await handleSend({
      senderId: alice.id,
      recipientId: chris.id,
      giftId: aliceGiftA2.gift!._id.toHexString(),
    });
    const bobSendA = await handleSend({
      senderId: bob.id,
      recipientId: alice.id,
      giftId: bobGiftA.gift!._id.toHexString(),
    });
    const chrisSendA = await handleSend({
      senderId: chris.id,
      recipientId: alice.id,
      giftId: chrisGiftA.gift!._id.toHexString(),
    });
    if (!aliceSendA1 || !aliceSendA2 || !bobSendA || !chrisSendA) {
      console.error(
        `handleListGiftActions.beforeEach failed - some send failed`
      );
      process.exit(1);
    }
    alicePurchasedNotSent = [
      ...aliceUnsentStockA.map((r) => ({
        id: r.gift!._id.toHexString(),
        variantId: giftVariantA._id,
        purchasePrice: giftVariantA.price,
      })),
      {
        id: aliceGiftB1.gift!._id.toHexString(),
        variantId: giftVariantB._id,
        purchasePrice: giftVariantB.price,
      },
    ];
    alicePurchasedNotSent.reverse();
    bobPurchasedNotSent = [
      {
        id: bobGiftB.gift!._id.toHexString(),
        variantId: giftVariantB._id,
        purchasePrice: giftVariantB.price,
      },
    ];
  });

  it.each([
    ["Alice", 1],
    ["Alice", 2],
    ["Alice", 3],
    ["Alice", 4],
    ["Alice", 5],
    ["Alice", 6],
    ["Alice", 9],
    ["Alice", 10],
    ["Alice", 11],
    ["Bob", 1],
    ["Bob", 2],
    ["Chris", 1],
    ["Chris", 2],
  ])(
    "returns sorted list with proper pagination: gift %s, pageSize=%i",
    async (username, pageSize) => {
      const userMap = {
        Alice: alice,
        Bob: bob,
        Chris: chris,
      } as const;
      const userUnderTest = userMap[username as "Alice" | "Bob" | "Chris"];
      const userGiftsMap = {
        Alice: alicePurchasedNotSent,
        Bob: bobPurchasedNotSent,
        Chris: chrisPurchasedNotSent,
      };
      const userGiftsUnderTest =
        userGiftsMap[username as "Alice" | "Bob" | "Chris"];
      let nextCursor;
      let totalRequest = 0;

      const expectedTotalRequests = Math.max(
        Math.ceil(userGiftsUnderTest.length / pageSize),
        1
      );
      let nextSpotToCheck = 0;

      let page;
      while (true) {
        page = await handleListPurchasedGifts({
          userId: userUnderTest.id,
          cursor: nextCursor,
          pageSize,
        });
        expect(page.status).toBe("ok");
        expect(page.gifts.length).toBeLessThanOrEqual(pageSize);
        for (const gift of page.gifts) {
          expect(gift.buyerId).toStrictEqual(userUnderTest._id);
          expect(gift._id.toHexString()).toStrictEqual(
            userGiftsUnderTest[nextSpotToCheck].id
          );
          expect(gift.variantId).toStrictEqual(
            userGiftsUnderTest[nextSpotToCheck].variantId
          );
          expect(gift.purchasePrice).toStrictEqual(
            userGiftsUnderTest[nextSpotToCheck].purchasePrice
          );
          expect(gift.recipientId).toBeUndefined();
          expect(gift.receivedAt).toBeUndefined();
          nextSpotToCheck++;
        }
        nextCursor = page.cursor;
        totalRequest++;
        if (page.isLastPage || totalRequest > expectedTotalRequests) {
          break;
        }
      }
      expect(totalRequest).toBe(expectedTotalRequests);
      expect(page.cursor).toBeUndefined();
      // TODO: no missed or duplicates
    }
  );

  it("fails if supplied with a bad cursor", async () => {
    const badCursor = "eyAiZm9vIjogImJhciIgfQ==";
    const page = await handleListPurchasedGifts({
      userId: alice.id,
      cursor: badCursor,
    });
    expect(page.gifts).toStrictEqual([]);
    expect(page.status).toBe("error");
  });

  it.todo("Alice cannot see gifts purchased by Bob");
});
