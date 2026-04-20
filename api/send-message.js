const TELEGRAM_API = (token) =>
  `https://api.telegram.org/bot${token}/sendMessage`;

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ ok: false, error: "Server configuration error" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid JSON" });
    }
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: "Заполните все поля" });
  }

  const text = [
    "<b>Новое сообщение с сайта</b>",
    "",
    `<b>Имя:</b> ${escapeHtml(name)}`,
    `<b>Email:</b> ${escapeHtml(email)}`,
    "",
    `<b>Сообщение:</b>`,
    escapeHtml(message),
  ].join("\n");

  try {
    const tgRes = await fetch(TELEGRAM_API(token), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });

    const tgData = await tgRes.json().catch(() => ({}));

    if (!tgRes.ok || !tgData.ok) {
      return res.status(502).json({
        ok: false,
        debug: {
          status: tgRes.status,
          statusText: tgRes.statusText,
          telegram: tgData,
          chatId: chatId ? String(chatId).substring(0, 8) + '...' : 'EMPTY',
          tokenOk: !!token,
          textLength: text.length
        }
      });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, error: "Ошибка сети" });
  }
};

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
