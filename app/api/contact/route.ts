import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendTelegramMessage(text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) return;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const service = String(formData.get("service") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !service || !message) {
      return NextResponse.redirect(
        new URL("/?message=missing-fields#contact", request.url),
        303
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || "Not provided");
    const safeService = escapeHtml(service);
    const safeMessage = escapeHtml(message);

    await resend.emails.send({
      from:
        process.env.CONTACT_EMAIL_FROM ||
        "ZANE IT Solutions <onboarding@resend.dev>",
      to: [process.env.CONTACT_EMAIL_TO || "reymartdungca.dev@gmail.com"],
      replyTo: email,
      subject: `New ZANE inquiry from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;">
          <h2>New Website Inquiry</h2>

          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Phone:</strong> ${safePhone}</p>
          <p><strong>Service Needed:</strong> ${safeService}</p>

          <hr />

          <p><strong>Project Details:</strong></p>
          <p>${safeMessage.replaceAll("\n", "<br />")}</p>
        </div>
      `,
    });

    await sendTelegramMessage(
      [
        "🚀 <b>New ZANE Website Inquiry</b>",
        "",
        `<b>Name:</b> ${safeName}`,
        `<b>Email:</b> ${safeEmail}`,
        `<b>Phone:</b> ${safePhone}`,
        `<b>Service:</b> ${safeService}`,
        "",
        "<b>Message:</b>",
        safeMessage,
      ].join("\n")
    );

    return NextResponse.redirect(
      new URL("/?message=success#contact", request.url),
      303
    );
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.redirect(
      new URL("/?message=error#contact", request.url),
      303
    );
  }
}