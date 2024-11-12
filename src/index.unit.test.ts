import { setUpFastify } from "./index.js";

describe("index.ts", () => {
  it("GET /health route", async () => {
    const app = await setUpFastify();
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });
    expect(response.statusCode).toStrictEqual(200);
    expect(response.json()).toEqual({ health: "OK" });
  });
});
