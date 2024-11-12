export const t = {
  en: {
    name: "Gift App",
    description: "🎁 Here you can buy and send gifts to your friends.",
    shortDescription: "🎁 Here you can buy and send gifts to your friends.",
    purchaseText: (giftName: string) =>
      `✅ You have purchased the gift of ${giftName}`,
    giftReceivedText: (recipient: string, giftName: string) =>
      `👌 ${recipient} received your gift of ${giftName}`,
  },
  ru: {
    name: "Приложение Подарков",
    description: "🎁 Здесь вы можете купить и отправить подарки своим друзьям.",
    shortDescription:
      "🎁 Здесь вы можете купить и отправить подарки своим друзьям.",
    purchaseText: (giftName: string) => `✅ Вы купили подарок ${giftName}`,
    giftReceivedText: (recipient: string, giftName: string) =>
      `👌 ${recipient} получил(а) ваш подарок ${giftName}`,
  },
} as const;

const youReceiveGift = (sender: string, giftName: string) =>
  `⚡️ ${sender} has given you the gift of ${giftName}`;
