import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: `"Hyperion Connect - " <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log("✅ Mail envoyé !");
  } catch (error) {
    console.error("❌ Erreur envoi mail :", error);
  }
};
