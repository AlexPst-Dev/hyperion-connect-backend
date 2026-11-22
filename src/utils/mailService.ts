import nodemailer from "nodemailer";
import { config } from "../config/config";

// Without SMTP settings (local development, public demo), e-mails are not sent:
// the message is logged instead, so every flow keeps working.
const transporter =
  config.smtp.host && config.smtp.user
    ? nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: { user: config.smtp.user, pass: config.smtp.pass },
      })
    : null;

export const sendMail = async (to: string, subject: string, html: string) => {
  if (!transporter) {
    console.info(`[mail disabled] "${subject}" to ${to}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"${config.appName}" <${config.smtp.user}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Mail sending failed:", error);
  }
};
