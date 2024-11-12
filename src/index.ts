import Fastify, { FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import { CronJob } from "cron";
import checkEnvironment from "./utils/checkEnvironment.js";
import { CryptoPayInvoice } from "./db/common.js";
import { checkSignature } from "./utils/checkWebhookSignature.js";
import handleWebhookUpdate from "./handlers/handleWebhookUpdate.js";
import { IGiftVariant } from "./db/giftVariant.js";
import handleCreateGiftVariant from "./handlers/handleCreateGiftVariant.js";
import { mongoSetup } from "./db/schema.js";
import handleListGiftVariants from "./handlers/handleListGiftVariants.js";
import { handleGetGiftVariantById } from "./handlers/handleGetGiftVariantById.js";
import { handleGetUserByTelegramId } from "./handlers/handleGetUserByTelegramId.js";
import handleListUsers from "./handlers/handleListUsers.js";
import { handlePurchaseInvoice } from "./handlers/handlePurchase.js";
import { handleGetPurchaseStatus } from "./handlers/handleGetPurchaseStatus.js";
import handleListPurchasedGifts from "./handlers/handleListPurchasedGifts.js";
import { handleReceiveGift } from "./handlers/handleReceiveGift.js";
import { handleListReceivedGifts } from "./handlers/handleListReceivedGifts.js";
import { handleGetUserById } from "./handlers/handleGetUserById.js";
import handleListGiftActions from "./handlers/handleListGiftActions.js";
import { handleListUserHistory } from "./handlers/handleListUserHistory.js";
import { PaginationQueryParams, PathParamsWithId } from "./types.js";
import { handleNukeDb } from "./handlers/handleNukeDb.js";
import { botInit } from "./bot/botInit.js";
import { handleUnreserveExpiredInvoices } from "./handlers/handleUnreserveExpiredInvoices.js";
import { handleUpdateUserSettings } from "./handlers/handleUpdateUserSettings.js";

checkEnvironment();

export const setUpFastify = async (opts = {}) => {
  try {
    await mongoSetup();
  } catch (error) {
    console.log("Mongodb setup failed");
    console.error(error);
    process.exit(1);
  }
  botInit(false, false);

  // Cron Job is cleaning up reserved gifts that are abandoned by the buyer
  new CronJob("*/5 * * * *", handleUnreserveExpiredInvoices, null, true);
  const app = Fastify(opts);
  await app.register(cors, {
    origin: true,
  });

  app.get("/health", async function handler() {
    return { health: "OK" };
  });

  app.get(
    "/users",
    async (
      request: FastifyRequest<{
        Querystring: {
          cursor?: string;
          pageSize?: string;
          searchStr?: string;
        };
      }>,
      reply
    ) => {
      try {
        const resp = await handleListUsers({
          cursor: request.query.cursor,
          pageSize: request.query.pageSize
            ? parseInt(request.query.pageSize, 10)
            : undefined,
          searchStr: request.query.searchStr,
        });
        return reply.code(200).send(resp);
      } catch (error) {
        console.log(error);
        return reply.code(500).send();
      }
    }
  );

  app.get(
    "/users/:id",
    async (
      request: FastifyRequest<{
        Params: PathParamsWithId;
        Querystring: {
          isTelegramId: string;
        };
      }>,
      reply
    ) => {
      const { id } = request.params;
      const isTelegramId = request.query.isTelegramId?.toLowerCase() === "true";
      if (isTelegramId) {
        const resp = await handleGetUserByTelegramId(id);
        return reply.code(200).send(resp);
      }
      const resp = await handleGetUserById(id);
      return reply.code(200).send(resp);
    }
  );

  app.post(
    "/users/:id/update",
    async (
      request: FastifyRequest<{
        Params: PathParamsWithId;
        Body: {
          languageCode: string;
          theme: string;
        };
      }>,
      reply
    ) => {
      const resp = await handleUpdateUserSettings({
        userId: request.params.id,
        theme: request.body.theme,
        languageCode: request.body.languageCode,
      });
      return reply.code(200).send(resp);
    }
  );
  app.get(
    "/users/:id/history",
    async (
      request: FastifyRequest<{
        Params: PathParamsWithId;
        Querystring: PaginationQueryParams;
      }>,
      reply
    ) => {
      const resp = await handleListUserHistory({
        userId: request.params.id,
        cursor: request.query.cursor,
        pageSize: request.query.pageSize
          ? parseInt(request.query.pageSize, 10)
          : undefined,
      });
      return reply.code(200).send(resp);
    }
  );

  app.get(
    "/users/:id/gifts",
    async (
      request: FastifyRequest<{
        Params: PathParamsWithId;
        Querystring: {
          cursor?: string;
          pageSize?: string;
          isReceived?: string;
        };
      }>,
      reply
    ) => {
      try {
        const { id } = request.params;
        const queryParams = {
          cursor: request.query.cursor,
          pageSize: request.query.pageSize
            ? parseInt(request.query.pageSize, 10)
            : undefined,
          isReceived: request.query.isReceived === "true" ? true : false,
        };
        if (queryParams.isReceived) {
          const resp = await handleListReceivedGifts({
            userId: id,
            cursor: queryParams.cursor,
            pageSize: queryParams.pageSize,
          });
          return reply.code(200).send(resp);
        }
        const resp = await handleListPurchasedGifts({
          userId: id,
          cursor: queryParams.cursor,
          pageSize: queryParams.pageSize,
        });
        return reply.code(200).send(resp);
      } catch (error) {
        return reply.code(500).send();
      }
    }
  );

  app.get(
    "/purchase-status/:invoiceId",
    async (
      request: FastifyRequest<{
        Params: {
          invoiceId: string;
        };
      }>,
      reply
    ) => {
      const resp = await handleGetPurchaseStatus(request.params.invoiceId);
      return reply.code(200).send(resp);
    }
  );

  app.post(
    "/purchase-gift/:id",
    async (
      request: FastifyRequest<{
        Params: PathParamsWithId;
        Body: {
          buyerId: string;
        };
      }>,
      reply
    ) => {
      if (!request.body.buyerId) {
        return reply
          .code(400)
          .send({ status: "error", message: "no buyerId in body" });
      }
      const resp = await handlePurchaseInvoice({
        buyerId: request.body.buyerId,
        giftVariantId: request.params.id,
      });
      if (resp.status === "ok") {
        return reply.code(200).send(resp);
      } else {
        return reply
          .code(500)
          .send({ status: "error", message: "Internal server error" });
      }
    }
  );

  app.get(
    "/gift-variants",
    async (
      request: FastifyRequest<{
        Querystring: PaginationQueryParams;
      }>,
      reply
    ) => {
      try {
        const resp = await handleListGiftVariants({
          cursor: request.query.cursor,
          pageSize: request.query.pageSize
            ? parseInt(request.query.pageSize, 10)
            : undefined,
        });
        return reply.code(200).send(resp);
      } catch (error) {
        console.log(error);
        return reply.code(500).send();
      }
    }
  );

  app.post(
    "/gift-variants",
    async (
      request: FastifyRequest<{
        Body: IGiftVariant;
      }>,
      reply
    ) => {
      if (request.headers.authorization === process.env.ADMIN_AUTH) {
        const ok = await handleCreateGiftVariant(request.body);
        return reply.code(ok ? 200 : 500).send();
      }
      return reply.code(403).send();
    }
  );

  app.get(
    "/gift-variants/:id",
    async (
      request: FastifyRequest<{
        Params: PathParamsWithId;
      }>,
      reply
    ) => {
      try {
        const resp = await handleGetGiftVariantById(request.params.id);
        return reply.code(200).send(resp);
      } catch (error) {
        console.log(error);
        return reply.code(500).send();
      }
    }
  );

  app.get(
    "/gift-variants/:id/actions",
    async (
      request: FastifyRequest<{
        Params: PathParamsWithId;
        Querystring: PaginationQueryParams;
      }>,
      reply
    ) => {
      try {
        const resp = await handleListGiftActions({
          giftVariantId: request.params.id,
          cursor: request.query.cursor,
          pageSize: request.query.pageSize
            ? parseInt(request.query.pageSize, 10)
            : undefined,
        });
        return reply.code(200).send(resp);
      } catch (error) {
        return reply.code(500).send();
      }
    }
  );

  app.get(
    "/receive-gift/:giftId",
    async (
      request: FastifyRequest<{
        Querystring: {
          userId: string;
        };
        Params: {
          giftId: string;
        };
      }>,
      reply
    ) => {
      if (!request.params.giftId || !request.query.userId) {
        return reply.code(400).send();
      }
      const resp = await handleReceiveGift(
        request.params.giftId,
        request.query.userId
      );
      return reply.code(200).send(resp);
    }
  );

  app.post("/nuke", async (request, reply) => {
    if (request.headers.authorization === process.env.ADMIN_AUTH) {
      const ok = await handleNukeDb();
      return reply.code(ok ? 200 : 500).send();
    }
    return reply.code(403).send();
  });

  app.post(
    `/webhook/${process.env.CP_TOKEN}`,
    async (
      request: FastifyRequest<{
        Body: {
          update_type: string;
          payload: CryptoPayInvoice;
        };
      }>,
      reply
    ) => {
      if (request.body.update_type !== "invoice_paid") {
        console.log(
          `Webhook: unknown updateType "${request.body.update_type}" received (ignoring)`
        );
        return reply.code(400);
      }
      if (!request.body.payload) {
        console.log(`Webhook: received update without a payload`);
        return reply.code(400);
      }
      const isValidSignature = checkSignature(
        process.env.CP_TOKEN,
        request.body,
        request.headers
      );
      if (!isValidSignature) {
        console.log(`Webhook: signature is invalid`);
        return reply.code(400);
      }
      const success = await handleWebhookUpdate(request.body.payload);
      if (success) {
        return reply.code(200).send();
      }
      return reply.code(500).send();
    }
  );

  return app;
};

const fastify = await setUpFastify({
  logger: true,
});

try {
  await fastify.listen({
    host: process.env.HOST || "0.0.0.0",
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
