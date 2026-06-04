// Telegram Bot API helpers for outbound messages (match reminders, leaderboard
// updates). Token + bot/app identifiers come from env.

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_USERNAME = process.env.BOT_USERNAME ?? "pocket_worldcup_bot";
const MINIAPP_SHORT_NAME = process.env.MINIAPP_SHORT_NAME ?? "PocketWC";

/** Direct-link into the Mini App with a startapp param (deep link / referral). */
export function miniAppLink(startParam: string): string {
  return `https://t.me/${BOT_USERNAME}/${MINIAPP_SHORT_NAME}?startapp=${encodeURIComponent(startParam)}`;
}

export function botConfigured(): boolean {
  return Boolean(TOKEN);
}

/** Send a single message with a deep-link button back into the Mini App.
 *  Returns true on success. Never throws — callers can fan out safely. */
export async function sendBotMessage(
  chatId: number,
  text: string,
  startParam: string,
  buttonText = "Open WC26 Fantasy",
): Promise<boolean> {
  if (!TOKEN) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
        reply_markup: { inline_keyboard: [[{ text: buttonText, url: miniAppLink(startParam) }]] },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Fan out to many chats in small concurrent batches. Returns count sent. */
export async function broadcast(
  chatIds: number[],
  build: (chatId: number) => { text: string; startParam: string; buttonText?: string },
  batchSize = 25,
): Promise<number> {
  let sent = 0;
  for (let i = 0; i < chatIds.length; i += batchSize) {
    const slice = chatIds.slice(i, i + batchSize);
    const results = await Promise.all(
      slice.map((id) => {
        const m = build(id);
        return sendBotMessage(id, m.text, m.startParam, m.buttonText);
      }),
    );
    sent += results.filter(Boolean).length;
  }
  return sent;
}
