import sgMail, { MailDataRequired } from "@sendgrid/mail";

let initDone = false;

function validKey(key?: string): key is string {
  return !!key && key.startsWith("SG.");
}

function ensureInit() {
  if (initDone) return;
  const key = process.env.SENDGRID_API_KEY;
  if (validKey(key)) {
    sgMail.setApiKey(key);
    initDone = true;
  } else {
    if (process.env.NODE_ENV !== "production") {
      // Tránh spam log lúc build
      console.warn("SENDGRID_API_KEY missing/invalid – email sending is disabled.");
    }
  }
}

/** Gửi mail; nếu chưa cấu hình key hợp lệ sẽ trả về ok:false nhưng không throw. */
export async function sendMail(data: MailDataRequired) {
  ensureInit();
  if (!initDone) {
    return { ok: false as const, reason: "missing_or_invalid_key" as const };
  }
  await sgMail.send(data);
  return { ok: true as const };
}
