const nodemailer = require('nodemailer');

function buildTransport() {
  // Prefer basic SMTP if creds provided
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (host && port && user && pass) {
    return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  }

  // Gmail OAuth2 fallback if configured
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const accessToken = process.env.GOOGLE_ACCESS_TOKEN; // optional
  const sender = process.env.GOOGLE_SENDER || process.env.SMTP_FROM;

  if (clientId && clientSecret && (refreshToken || accessToken) && sender) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: sender,
        clientId,
        clientSecret,
        refreshToken,
        accessToken
      }
    });
  }

  // Last resort: no auth transport (use local MTA if available)
  return nodemailer.createTransport({ sendmail: true, newline: 'unix', path: '/usr/sbin/sendmail' });
}

const transporter = buildTransport();

async function sendMail({ to, subject, html, text, attachments }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GOOGLE_SENDER || 'no-reply@gotrip.local';
  return transporter.sendMail({ from, to, subject, html, text, attachments });
}

module.exports = { sendMail };



