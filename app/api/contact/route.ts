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

  if (!botToken || !chatId) {
    console.warn("Telegram config missing.");
    return;
  }

  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(telegramUrl, {
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

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Telegram notification failed:", errorText);
  }
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
        new URL("/?message=missing-fields#contact", request.url)
      );
    }

    if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL_TO) {
      console.error("Missing Resend config.");
      return NextResponse.redirect(
        new URL("/?message=config-error#contact", request.url)
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || "Not provided");
    const safeService = escapeHtml(service);
    const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

    await resend.emails.send({
      from:
        process.env.CONTACT_EMAIL_FROM ||
        "ZANE IT Solutions <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL_TO,
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
          <p>${safeMessage}</p>
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
        `<b>Message:</b>`,
        escapeHtml(message),
      ].join("\n")
    );

    return NextResponse.redirect(
      new URL("/?message=success#contact", request.url)
    );
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.redirect(
      new URL("/?message=error#contact", request.url)
    );
  }
}