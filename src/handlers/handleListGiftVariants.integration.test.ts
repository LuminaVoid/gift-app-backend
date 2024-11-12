import * as crypto from "node:crypto";
import GiftVariant from "../db/giftVariant.js";
import handleListGiftVariants from "./handleListGiftVariants.js";
import { TEST_GIFT_MEDIA, TEST_PRICE_10_USDT } from "../setup.integration.js";

const unsortedSupplies = [5, 5, 1, 2, 1, 4, 3, 7, 18, 8];
// TODO: Actually for variants its low->high order
const sortedSupplies = [18, 8, 7, 5, 5, 4, 3, 2, 1, 1];

describe("handleListGiftVariants", () => {
  const randomGiftVariants = [...Array(unsortedSupplies.length).keys()].map(
    (i) => ({
      name: {
        en: `en-${crypto.randomBytes(8).toString("hex")}`,
        ru: `ru-${crypto.randomBytes(8).toString("hex")}`,
      },
      slug: crypto.randomBytes(8).toString("hex"),
      totalSupply: unsortedSupplies[i],
      media: TEST_GIFT_MEDIA,
      price: TEST_PRICE_10_USDT,
    })
  );
  beforeEach(async () => {
    await GiftVariant.create(randomGiftVariants);
  });

  it.each([[1], [2], [3], [4], [5], [6], [9], [10], [11]])(
    "returns sorted list with proper pagination, pageSize=%i",
    async (pageSize) => {
      let nextCursor;
      let totalRequest = 0;
      const expectedTotalRequests = Math.ceil(
        randomGiftVariants.length / pageSize
      );
      let nextSpotToCheck = 0;
      const presentVariants = [];

      let page;
      while (true) {
        page = await handleListGiftVariants({ cursor: nextCursor, pageSize });
        expect(page.status).toBe("ok");
        expect(page.giftVariants.length).toBeLessThanOrEqual(pageSize);
        for (const giftVariant of page.giftVariants) {
          expect(giftVariant.totalSupply).toBe(sortedSupplies[nextSpotToCheck]);
          presentVariants.push(giftVariant.name.en);
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
      // No gift variants are missed or duplicated
      expect(presentVariants.sort()).toEqual(
        randomGiftVariants.map((u) => u.name.en).sort()
      );
    }
  );

  it("fails if supplied with a bad cursor", async () => {
    const badCursor = "eyAiZm9vIjogImJhciIgfQ==";
    const page = await handleListGiftVariants({ cursor: badCursor });
    expect(page.giftVariants).toStrictEqual([]);
    expect(page.status).toBe("error");
  });
});
