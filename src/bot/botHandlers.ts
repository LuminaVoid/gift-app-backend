import { CommandContext, Context, InlineKeyboard } from "grammy";
import { getUserProfilePhoto, uploadProfilePhoto } from "./botUtils.js";
import User from "../db/user.js";
import { t } from "./botTextStrings.js";

const welcomePhotoId =
  "AgACAgQAAxkBAAMaZy942-JqiL1-zAg6qE7d-BffMhcAArXHMRsGjYFR58QYJArd9AoBAAMCAANtAAM2BA";

const MINI_APP_LINK = "https://t.me/lumina_private_giftapp_bot/gift_app";

export const onStartCmd = async (ctx: CommandContext<Context>) => {
  const user = ctx.from;
  if (user === undefined) {
    console.error("User is undefined, ctx = ", ctx);
    ctx.reply("Something went wrong, please try again.");
    return;
  }
  if (user.is_bot) {
    ctx.reply(
      "Sorry, it looks like you're a bot, this app is built for humans only"
    );
    return;
  }

  const inlineKeyboard = new InlineKeyboard().url("Open App", MINI_APP_LINK);

  const dbUser = await User.find({ userId: user.id }, { lean: true });
  const caption =
    user.language_code === "ru" ? t.ru.description : t.en.description;
  if (dbUser.length !== 0) {
    ctx.replyWithPhoto(welcomePhotoId, {
      caption: caption,
      reply_markup: inlineKeyboard,
    });
  } else {
    try {
      const profilePicFileId = await getUserProfilePhoto(ctx);
      let profilePic = null;
      if (profilePicFileId) {
        profilePic = await uploadProfilePhoto(ctx, profilePicFileId, user.id);
      }
      await User.create({
        userId: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        ...(profilePic && { profilePic }),
        isPremium: user.is_premium,
        languageCode: user.language_code !== "ru" ? "en" : "ru", // avoid setting to unsupported language
      });
      ctx.replyWithPhoto(welcomePhotoId, {
        caption: caption,
        reply_markup: inlineKeyboard,
      });
    } catch (error) {
      ctx.reply("Something went wrong, please try again.");
    }
  }
};
