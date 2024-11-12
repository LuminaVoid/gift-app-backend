import * as crypto from "node:crypto";
import User from "../db/user.js";
import handleListUsers from "./handleListUsers.js";

const unsortedGiftCounts = [5, 5, 0, 2, 0, 4, 3, 7, 18, 8];
const sortedGiftCounts = [18, 8, 7, 5, 5, 4, 3, 2, 0, 0];

describe("handleListUsers", () => {
  const randomUsers = [...Array(unsortedGiftCounts.length).keys()].map((i) => ({
    username: crypto.randomBytes(8).toString("hex"),
    receivedGiftCount: unsortedGiftCounts[i],
  }));
  beforeEach(async () => {
    await User.create(randomUsers);
  });

  it.each([[1], [2], [3], [4], [5], [6], [9], [10], [11]])(
    "returns sorted list with proper pagination, pageSize=%i",
    async (pageSize) => {
      let nextCursor;
      let totalRequest = 0;
      const expectedTotalRequests = Math.ceil(randomUsers.length / pageSize);
      let nextSpotToCheck = 0;
      const presentUsers = [];

      let page;
      while (true) {
        page = await handleListUsers({ cursor: nextCursor, pageSize });
        expect(page.status).toBe("ok");
        expect(page.users.length).toBeLessThanOrEqual(pageSize);
        for (const user of page.users) {
          expect(user.receivedGiftCount).toBe(
            sortedGiftCounts[nextSpotToCheck]
          );
          presentUsers.push(user.username);
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
      // No users are missed or duplicated
      expect(presentUsers.sort()).toEqual(
        randomUsers.map((u) => u.username).sort()
      );
    }
  );

  it("fails if supplied with a bad cursor", async () => {
    const badCursor = "eyAiZm9vIjogImJhciIgfQ==";
    const page = await handleListUsers({ cursor: badCursor });
    expect(page.users).toStrictEqual([]);
    expect(page.status).toBe("error");
  });
});
