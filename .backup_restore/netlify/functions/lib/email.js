import { getBlob, setBlob } from './store.js';

export async function sendEmailMessage({ to, recipient_name, subject, html, text, template_id = 'custom', type = 'transactional' }) {
  const emailConfig = (await getBlob('email_config')) || {};
  const resendApiKey = process.env.RESEND_API_KEY || emailConfig.resend_api_key || '';
  const senderEmail = emailConfig.sender_email || 'support@webnasir.com';
  const senderName = emailConfig.sender_name || 'Web Nasir Academy';

  let status = 'simulated';
  let providerResponse = null;

  if (resendApiKey && resendApiKey.trim().length > 0) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${senderName} <${senderEmail}>`,
          to: [to],
          subject: subject,
          html: html || (text ? text.replace(/\n/g, '<br>') : '<p>Hello from Web Nasir Academy</p>'),
          text: text || '',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        status = 'delivered';
        providerResponse = data;
      } else {
        status = 'failed';
        providerResponse = data;
      }
    } catch (err) {
      status = 'failed';
      providerResponse = { error: err.message };
    }
  } else {
    // Simulated delivery with full payload audit
    status = 'simulated';
    providerResponse = {
      message: 'Simulated dispatch (Ready for live delivery once RESEND_API_KEY is configured in Admin Email Center or ENV).',
      preview_subject: subject,
      preview_recipient: to,
    };
  }

  // Record in emails_history audit log
  const history = (await getBlob('emails_history')) || [];
  const logEntry = {
    id: 'eml-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    to: String(to).toLowerCase().trim(),
    recipient_name: recipient_name || to.split('@')[0],
    subject,
    template_id,
    type,
    status,
    sent_at: new Date().toISOString(),
    provider: resendApiKey ? 'resend' : 'simulated',
    provider_response: providerResponse,
  };
  history.unshift(logEntry);
  await setBlob('emails_history', history.slice(0, 500));

  return logEntry;
}

export function renderEmailTemplate(templateBody, data = {}) {
  let rendered = templateBody;
  for (const [key, value] of Object.entries(data)) {
    const reg = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(reg, String(value ?? ''));
  }
  return rendered;
}
