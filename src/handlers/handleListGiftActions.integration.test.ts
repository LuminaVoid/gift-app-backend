import GiftVariant, { IGiftVariantDoc } from "../db/giftVariant.js";
import handleListGiftActions from "./handleListGiftActions.js";
import { GiftActionType } from "../db/giftAction.js";
import User, { IUserDoc } from "../db/user.js";
import handlePurchase from "./handlePurchase.js";
import handleSend from "./handleSend.js";
import mongoose from "mongoose";
import { TEST_GIFT_MEDIA, TEST_PRICE_10_USDT } from "../setup.integration.js";

describe("handleListGiftActions", () => {
  let alice: IUserDoc;
  let bob: IUserDoc;
  let chris: IUserDoc;

  let giftVariantA: IGiftVariantDoc;
  let giftVariantB: IGiftVariantDoc;
  let giftVariantC: IGiftVariantDoc;
  let expectedHistoryA: Record<string, string>[] = [];
  let expectedHistoryB: Record<string, string>[] = [];
  const expectedHistoryC: Record<string, string>[] = [];

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
    expectedHistoryA = [];
    expectedHistoryB = [];

    const aliceGiftA1 = await handlePurchase({
      buyerId: alice.id,
      giftVariantId: giftVariantA.id,
    });
    expectedHistoryA.push({
      type: GiftActionType.Purchase,
      giftId: aliceGiftA1.gift!._id.toHexString(),
      variantId: giftVariantA.id,
      buyerId: alice.id,
    });
    const bobGiftA = await handlePurchase({
      buyerId: bob.id,
      giftVariantId: giftVariantA.id,
    });
    expectedHistoryA.push({
      type: GiftActionType.Purchase,
      giftId: bobGiftA.gift!._id.toHexString(),
      variantId: giftVariantA.id,
      buyerId: bob.id,
    });
    const bobGiftB = await handlePurchase({
      buyerId: bob.id,
      giftVariantId: giftVariantB.id,
    });
    expectedHistoryB.push({
      type: GiftActionType.Purchase,
      giftId: bobGiftB.gift!._id.toHexString(),
      variantId: giftVariantB.id,
      buyerId: bob.id,
    });
    const aliceGiftA2 = await handlePurchase({
      buyerId: alice.id,
      giftVariantId: giftVariantA.id,
    });
    expectedHistoryA.push({
      type: GiftActionType.Purchase,
      giftId: aliceGiftA2.gift!._id.toHexString(),
      variantId: giftVariantA.id,
      buyerId: alice.id,
    });
    const aliceGiftB1 = await handlePurchase({
      buyerId: alice.id,
      giftVariantId: giftVariantB.id,
    });
    expectedHistoryB.push({
      type: GiftActionType.Purchase,
      giftId: aliceGiftB1.gift!._id.toHexString(),
      variantId: giftVariantB.id,
      buyerId: alice.id,
    });
    if (
      aliceGiftA1.status === "error" ||
      aliceGiftA2.status === "error" ||
      aliceGiftB1.status === "error" ||
      bobGiftA.status === "error" ||
      bobGiftB.status === "error"
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
    expectedHistoryA.push({
      type: GiftActionType.Send,
      giftId: aliceGiftA1.gift!._id.toHexString(),
      variantId: giftVariantA.id,
      buyerId: alice.id,
      recipientId: bob.id,
    });
    const aliceSendA2 = await handleSend({
      senderId: alice.id,
      recipientId: chris.id,
      giftId: aliceGiftA2.gift!._id.toHexString(),
    });
    expectedHistoryA.push({
      type: GiftActionType.Send,
      giftId: aliceGiftA2.gift!._id.toHexString(),
      variantId: giftVariantA.id,
      buyerId: alice.id,
      recipientId: chris.id,
    });
    if (!aliceSendA1 || !aliceSendA2) {
      console.error(
        `handleListGiftActions.beforeEach failed - some send failed`
      );
      process.exit(1);
    }
    expectedHistoryA.reverse();
    expectedHistoryB.reverse();
  });

  it.each([
    ["A", 1],
    ["A", 2],
    ["A", 3],
    ["A", 4],
    ["A", 5],
    ["A", 6],
    ["A", 9],
    ["A", 10],
    ["A", 11],
    ["B", 1],
    ["B", 2],
    ["C", 1],
    ["C", 2],
  ])(
    "returns sorted list with proper pagination: gift %s, pageSize=%i",
    async (giftVariant, pageSize) => {
      const giftVarMap = {
        A: giftVariantA,
        B: giftVariantB,
        C: giftVariantC,
      } as const;
      const giftVarUnderTest = giftVarMap[giftVariant as "A" | "B" | "C"];
      const giftVarHistoryMap = {
        A: expectedHistoryA,
        B: expectedHistoryB,
        C: expectedHistoryC,
      } as const;
      const giftVarHistoryUnderTest =
        giftVarHistoryMap[giftVariant as "A" | "B" | "C"];

      let nextCursor;
      let totalRequest = 0;
      const expectedTotalRequests = Math.max(
        Math.ceil(giftVarHistoryUnderTest.length / pageSize),
        1
      );
      let nextSpotToCheck = 0;

      let page;
      while (true) {
        page = await handleListGiftActions({
          giftVariantId: giftVarUnderTest.id,
          cursor: nextCursor,
          pageSize,
        });
        expect(page.status).toBe("ok");
        expect(page.giftActions.length).toBeLessThanOrEqual(pageSize);
        for (const giftAction of page.giftActions) {
          expect(giftAction.variantId).toStrictEqual(giftVarUnderTest._id);
          expect(giftAction.type).toBe(
            giftVarHistoryUnderTest[nextSpotToCheck].type
          );
          expect(giftAction.giftId).toStrictEqual(
            mongoose.Types.ObjectId.createFromHexString(
              giftVarHistoryUnderTest[nextSpotToCheck].giftId
            )
          );
          expect(giftAction.buyerId).toStrictEqual(
            mongoose.Types.ObjectId.createFromHexString(
              giftVarHistoryUnderTest[nextSpotToCheck].buyerId
            )
          );
          if (giftVarHistoryUnderTest[nextSpotToCheck].recipientId) {
            expect(giftAction.recipientId).toStrictEqual(
              mongoose.Types.ObjectId.createFromHexString(
                giftVarHistoryUnderTest[nextSpotToCheck].recipientId
              )
            );
          } else {
            expect(giftAction.recipientId).toBeUndefined();
          }
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
      expect(nextSpotToCheck).toBe(giftVarHistoryUnderTest.length); // There were no missing items
    }
  );

  it("fails if supplied with a bad cursor", async () => {
    const badCursor = "eyAiZm9vIjogImJhciIgfQ==";
    const page = await handleListGiftActions({
      giftVariantId: giftVariantA.id,
      cursor: badCursor,
    });
    expect(page.giftActions).toStrictEqual([]);
    expect(page.status).toBe("error");
  });
});
