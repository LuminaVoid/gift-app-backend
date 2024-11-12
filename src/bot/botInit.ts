import { Bot, InlineKeyboard, InlineQueryResultBuilder } from "grammy";
import { onStartCmd } from "./botHandlers.js";
import { mongoSetup } from "../db/schema.js";
import { t } from "./botTextStrings.js";

const bot = new Bot(process.env.TG_BOT_TOKEN);

const APP_URL = "https://t.me/lumina_private_giftapp_bot/gift_app";

const setBotInfo = async () => {
  try {
    // Set English (+ all other unsupported) text strings
    const nameSetOk = await bot.api.setMyName(t["en"]["name"]);
    console.log(
      `Name ('en') set to: ${t["en"]["name"]} -> ${nameSetOk ? "OK" : "Failed"}`
    );
    const descriptionSetOk = await bot.api.setMyDescription(
      t["en"]["description"]
    );
    console.log(
      `Description ('en') set to: ${t["en"]["description"]} -> ${
        descriptionSetOk ? "OK" : "Failed"
      }`
    );
    const shortDesciptionSetOk = await bot.api.setMyShortDescription(
      t["en"]["shortDescription"]
    );
    console.log(
      `Short description ('en') set to: ${t["en"]["shortDescription"]} -> ${
        shortDesciptionSetOk ? "OK" : "Failed"
      }`
    );

    // Set Russian text strings
    const ruNameSetOk = await bot.api.setMyName(t["ru"]["name"], {
      language_code: "ru",
    });
    console.log(
      `Name ('ru') set to: ${t["ru"]["name"]} -> ${
        ruNameSetOk ? "OK" : "Failed"
      }`
    );
    const ruDescriptionSetOk = await bot.api.setMyDescription(
      t["ru"]["description"],
      {
        language_code: "ru",
      }
    );
    console.log(
      `Description ('ru') set to: ${t["ru"]["description"]} -> ${
        ruDescriptionSetOk ? "OK" : "Failed"
      }`
    );
    const ruShortDesciptionSetOk = await bot.api.setMyShortDescription(
      t["ru"]["shortDescription"],
      {
        language_code: "ru",
      }
    );
    console.log(
      `Short description ('ru') set to: ${t["ru"]["shortDescription"]} -> ${
        ruShortDesciptionSetOk ? "OK" : "Failed"
      }`
    );
  } catch (error) {
    console.log("Error during setBotConfigs.");
    console.error(error);
    console.log("The bot will continue on, but with old info.");
  }
};

const setBotCommands = async () => {
  await bot.api.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "open_app", description: "Open Gift App mini app" },
  ]);
};

export const botInit = async (resetBotInfo = false, initMongo = true) => {
  console.info("🎁 Starting Gift App Telegram Bot 🤖");

  if (initMongo) {
    try {
      await mongoSetup();
    } catch (error) {
      console.log("Mongo setup failed");
      console.error(error);
    }
  }

  if (resetBotInfo) {
    await setBotInfo();
    await setBotCommands();
  }

  bot.inlineQuery(/gift_*/, async (ctx) => {
    try {
      const giftId = ctx.update.inline_query.query.split("_")[1];
      const result = InlineQueryResultBuilder.article(
        "id:send-gift",
        "Send Gift",
        {
          description: "Send a gift of Delicious Cake",
          thumbnail_url:
            "https://gift-app-bucket.fra1.cdn.digitaloceanspaces.com/gift_app_icon.png",
          reply_markup: new InlineKeyboard().url(
            "Receive Gift",
            `${APP_URL}?startapp=gift_${giftId}`
          ),
        }
      ).text(
        `🎁 I have a <b>gift</b> for you! Tap the button below to open it.`,
        { parse_mode: "HTML" }
      );
      await ctx.answerInlineQuery([result]);
    } catch (error) {
      console.log("Failed to respond to query (probably expired)");
      console.error(error);
    }
  });

  bot.command("start", onStartCmd);

  bot.on("message", (ctx) => {
    ctx.reply("👀");
  });
  bot.start();
};

export const sendPurchaseNotification = async (
  chatId: number,
  giftName: string,
  lang: "en" | "ru"
) => {
  try {
    await bot.api.sendMessage(chatId, t[lang].purchaseText(giftName));
  } catch (error) {
    console.log("bot.api.sendMessage failed to send notification");
    console.log(error);
  }
};

export const sendGiftReceivedNotification = async (
  chatId: number,
  giftName: string,
  recipientName: string,
  lang: "en" | "ru"
) => {
  try {
    await bot.api.sendMessage(
      chatId,
      t[lang].giftReceivedText(recipientName, giftName)
    );
  } catch (error) {
    console.log("bot.api.sendMessage failed to send notification");
    console.log(error);
  }
};
