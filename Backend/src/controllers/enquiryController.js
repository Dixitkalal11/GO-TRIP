const { sequelize, EnquiryMessage } = require('../models');

exports.createEnquiry = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const { name, email, phone, subject, message, category, referenceId } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure table exists (first-run safety in environments without migrations)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS enquiry_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(180) NOT NULL,
        phone VARCHAR(32) NULL,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'open',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure required columns exist if table was created previously with a different shape
    try { await sequelize.query(`ALTER TABLE enquiry_messages ADD COLUMN IF NOT EXISTS user_id INT NULL`); } catch (_) {}
    try { await sequelize.query(`ALTER TABLE enquiry_messages ADD COLUMN IF NOT EXISTS phone VARCHAR(32) NULL`); } catch (_) {}
    try { await sequelize.query(`ALTER TABLE enquiry_messages ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'open'`); } catch (_) {}
    try { await sequelize.query(`ALTER TABLE enquiry_messages ADD COLUMN IF NOT EXISTS created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`); } catch (_) {}
    try { await sequelize.query(`ALTER TABLE enquiry_messages ADD COLUMN IF NOT EXISTS updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`); } catch (_) {}
    const subjectWithCategory = category ? `[${category}${referenceId ? ` #${referenceId}` : ''}] ${subject}` : subject;
    let created;
    try {
      created = await EnquiryMessage.create({ user_id: userId, name, email, phone, subject: subjectWithCategory, message, status: 'open' });
    } catch (ormErr) {
      console.warn('ORM insert failed, retrying with adaptive raw SQL:', ormErr?.message);
      // Discover existing columns
      const [cols] = await sequelize.query(
        `SELECT COLUMN_NAME as name FROM INFORMATION_SCHEMA.COLUMNS \
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'enquiry_messages'`
      );
      const colNames = (cols || []).map(c => c.name || c.COLUMN_NAME);
      const hasUserId = colNames.includes('user_id');
      const hasPhone = colNames.includes('phone');
      const hasStatus = colNames.includes('status');
      const hasCreatedAt = colNames.includes('created_at');
      const hasUpdatedAt = colNames.includes('updated_at');

      const fields = ['name','email','subject','message'];
      const values = [':name',':email',':subject',':message'];
      const replacements = { name, email, subject: subjectWithCategory, message };
      if (hasUserId) { fields.unshift('user_id'); values.unshift(':user_id'); replacements.user_id = userId; }
      if (hasPhone) { fields.push('phone'); values.push(':phone'); replacements.phone = phone || null; }
      if (hasStatus) {
        // Inspect status column to avoid ENUM truncation errors
        let columnInfo;
        try {
          const [rows] = await sequelize.query(
            `SELECT COLUMN_DEFAULT as def, COLUMN_TYPE as typ FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'enquiry_messages' AND COLUMN_NAME='status'`
          );
          columnInfo = rows && rows[0];
        } catch (_) {}

        const rawType = (columnInfo?.typ || '').toString();
        const enumMatch = rawType.match(/enum\((.*)\)/i);
        let allowed = [];
        if (enumMatch && enumMatch[1]) {
          allowed = enumMatch[1]
            .split(',')
            .map(s => s.trim().replace(/^'/,'').replace(/'$/,''));
        }
        const def = columnInfo?.def;
        const prefer = allowed.find(v => v.toLowerCase() === 'open') || def || allowed[0] || 'open';
        fields.push('status');
        values.push(':status');
        replacements.status = prefer;
      }
      if (hasCreatedAt) { fields.push('created_at'); values.push('NOW()'); }
      if (hasUpdatedAt) { fields.push('updated_at'); values.push('NOW()'); }

      const sql = `INSERT INTO enquiry_messages (${fields.join(', ')}) VALUES (${values.join(', ')})`;
      const [result] = await sequelize.query(sql, { replacements });
      const insertId = result?.insertId || result;
      const [[row]] = await sequelize.query(`SELECT * FROM enquiry_messages WHERE id = :id`, { replacements: { id: insertId } });
      created = row;
    }
    res.json({ message: 'Enquiry submitted', enquiry: created });
  } catch (e) {
    console.error('createEnquiry error', e);
    res.status(500).json({ error: 'Failed to submit enquiry' });
  }
};

exports.getAdminEnquiries = async (_req, res) => {
  try {
    const [rows] = await sequelize.query(`SELECT * FROM enquiry_messages ORDER BY created_at DESC`);
    res.json({ enquiries: rows });
  } catch (e) {
    console.error('getAdminEnquiries error', e);
    res.status(500).json({ error: 'Failed to load enquiries' });
  }
};

const nodemailer = require('nodemailer');

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const base = {
    host,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    tls: { minVersion: 'TLSv1.2' },
    auth: user && pass ? { user, pass } : undefined
  };
  if (host.includes('gmail.com')) {
    return nodemailer.createTransport({
      ...base,
      service: 'gmail'
    });
  }
  return nodemailer.createTransport(base);
}

exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'solved', resolutionNote = '' } = req.body;

    // Adapt status to ENUM/default of current table to avoid truncation
    let useStatus = status;
    let hasStatusColumn = true;
    let hasAdminResponse = false;
    try {
      const [rows] = await sequelize.query(
        `SELECT COLUMN_DEFAULT as def, COLUMN_TYPE as typ FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'enquiry_messages' AND COLUMN_NAME='status'`
      );
      const info = rows && rows[0];
      hasStatusColumn = !!info;
      const rawType = (info?.typ || '').toString();
      const enumMatch = rawType.match(/enum\((.*)\)/i);
      let allowed = [];
      if (enumMatch && enumMatch[1]) {
        allowed = enumMatch[1].split(',').map(s => s.trim().replace(/^'/,'').replace(/'$/,''));
      }
      if (allowed.length) {
        if (!allowed.includes(useStatus)) {
          useStatus = allowed.find(v => ['solved','resolved','closed','done','completed'].includes(v.toLowerCase())) || info?.def || allowed[0];
        }
      }
      // detect admin_response column
      const [cols2] = await sequelize.query(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='enquiry_messages' AND COLUMN_NAME='admin_response'`
      );
      hasAdminResponse = !!(cols2 && cols2.length);
    } catch(_) {}

    // Build adaptive update
    const setParts = ['updated_at = NOW()'];
    const repl = { id };
    if (hasStatusColumn) { setParts.unshift('status = :status'); repl.status = useStatus; }
    if (hasAdminResponse) { setParts.unshift('admin_response = :resp'); repl.resp = resolutionNote || null; }
    const sql = `UPDATE enquiry_messages SET ${setParts.join(', ')} WHERE id = :id`;
    const [result] = await sequelize.query(sql, { replacements: repl });
    console.log('Enquiry update result:', result);

    // Fetch the updated enquiry
    const [[enquiry]] = await sequelize.query(`SELECT * FROM enquiry_messages WHERE id = :id`, { replacements: { id } });
    console.log('Updated enquiry row:', enquiry);

    // Send email (best-effort)
    let emailSent = false; let emailError = '';
    if (enquiry && useStatus && enquiry.email) {
      try {
        const transporter = getTransporter();
        const subject = `GoTrip Support • Enquiry ${useStatus.toString().toUpperCase()}`;
        const bodyHtml = `
          <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#f7f9fc;padding:24px">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e6ebf2;overflow:hidden">
              <tr>
                <td style="background:#2563eb;color:#fff;padding:18px 20px;font-size:18px;font-weight:700">GoTrip Support</td>
              </tr>
              <tr>
                <td style="padding:22px 20px;color:#0f172a">
                  <p style="margin:0 0 8px 0;font-size:16px">Hi ${enquiry.name || 'there'},</p>
                  <p style="margin:0 0 14px 0;color:#334155">Your enquiry has been updated to <strong style="color:#16a34a">${useStatus}</strong>.</p>
                  <div style="background:#f8fafc;border:1px solid #e6ebf2;border-radius:8px;padding:12px 14px;margin-bottom:14px">
                    <div style="font-size:14px;color:#475569;margin-bottom:6px">Subject</div>
                    <div style="font-size:15px;font-weight:600;color:#111827">${enquiry.subject}</div>
                  </div>
                  ${resolutionNote ? `<div style="background:#f0fdf4;border:1px solid #dcfce7;border-radius:8px;padding:12px 14px;margin-bottom:14px"><div style=\"font-size:14px;color:#166534;margin-bottom:6px\">Resolution note</div><div style=\"font-size:15px;color:#065f46\">${resolutionNote}</div></div>` : ''}
                  <p style="margin:12px 0 0 0;color:#475569;font-size:14px">If you need more help, just reply to this email and we’ll reopen the ticket.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;color:#64748b;font-size:12px;background:#f8fafc">© ${new Date().getFullYear()} GoTrip</td>
              </tr>
            </table>
          </div>
        `;
        await transporter.sendMail({
          from: process.env.SMTP_FROM || (process.env.SMTP_USER || 'no-reply@gotrip.local'),
          to: enquiry.email,
          subject,
          html: bodyHtml
        });
        emailSent = true;
      } catch (mailErr) {
        console.error('Failed to send enquiry resolution email:', mailErr);
        emailError = (mailErr && mailErr.message) || 'email error';
      }
    }

    res.json({ message: 'Enquiry updated', result, enquiry, emailSent, emailError });
  } catch (e) {
    console.error('updateEnquiryStatus error', e);
    res.status(500).json({ error: 'Failed to update enquiry' });
  }
};


