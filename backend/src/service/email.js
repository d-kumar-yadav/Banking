require('dotenv').config();
const axios = require('axios');

async function sendEmail(to, subject, text, html) {
  try {
    // 1. Get Access Token via OAuth2
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      refresh_token: process.env.REFRESH_TOKEN,
      grant_type: 'refresh_token'
    });
    const accessToken = tokenResponse.data.access_token;

    // 2. Build MIME message
    const boundary = 'foo_bar_baz';
    const emailLines = [
      `To: ${to}`,
      `From: ${process.env.EMAIL_USER}`,
      `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      '',
      text,
      '',
      `--${boundary}`,
      `Content-Type: text/html; charset="UTF-8"`,
      '',
      html,
      '',
      `--${boundary}--`
    ];
    
    // 3. Base64url encode the raw message
    const raw = Buffer.from(emailLines.join('\r\n')).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // 4. Send via Gmail API over HTTPS (port 443) which bypasses Render's blocked ports
    await axios.post(
      'https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send',
      { raw: raw },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`Email sent to ${to} with subject "${subject}"`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.response ? error.response.data : error.message);
  }
}


// Generic email service
 async  function  emailservice(to, subject, text) {
  const htmlBody = (text || '').replace(/\n/g, '<br>'); // Prevent crash if text is undefined
  const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <div style="background-color: #0056b3; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">${subject}</h2>
          </div>
          <div style="padding: 20px; color: #333333; line-height: 1.6;">
            ${htmlBody}
            <p>Best regards,<br><strong>The Banking Team</strong></p>
          </div>
        </div>
      </div>`;
  await sendEmail(to, subject, text, html);
} 

async  function  email_payment_notification(to, name, amount, otherAccount, date, time, transaction_id, isSender) {
  let subject, text, html;

  if (isSender) {
    subject = 'Payment Sent Successfully';
    text = `Dear ${name},

Your payment of ${amount} INR has been successfully sent.

Payment Details:
- Amount: ${amount} INR
- Recipient Account: ${otherAccount}
- Date: ${date}
- Time: ${time}
- Transaction ID: ${transaction_id}

If you did not authorize this transaction, please contact our support team immediately.

Best regards,
The Banking Team`;

    html = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <div style="background-color: #0056b3; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Payment Sent Successfully</h2>
          </div>
          <div style="padding: 20px; color: #333333; line-height: 1.6;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Your payment of <strong style="color: #0056b3;">${amount} INR</strong> has been successfully sent.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0056b3;">
              <h3 style="margin-top: 0; color: #0056b3;">Payment Details:</h3>
              <ul style="list-style-type: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 10px;"><strong>Amount:</strong> ${amount} INR</li>
                <li style="margin-bottom: 10px;"><strong>Recipient Account:</strong> ${otherAccount}</li>
                <li style="margin-bottom: 10px;"><strong>Date:</strong> ${date}</li>
                <li style="margin-bottom: 10px;"><strong>Time:</strong> ${time}</li>
                <li style="margin-bottom: 0;"><strong>Transaction ID:</strong> ${transaction_id}</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #d9534f;">If you did not authorize this transaction, please contact our support team immediately.</p>
            <p>Best regards,<br><strong>The Banking Team</strong></p>
          </div>
        </div>
      </div>`;
  } else {
    subject = 'Payment Received';
    text = `Dear ${name},

You have received a payment of ${amount} INR.

Payment Details:
- Amount: ${amount} INR
- Sender Account: ${otherAccount}
- Date: ${date}
- Time: ${time}
- Transaction ID: ${transaction_id}

If you were not expecting this payment, please contact our support team.

Best regards,
The Banking Team`;

    html = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <div style="background-color: #28a745; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Payment Received</h2>
          </div>
          <div style="padding: 20px; color: #333333; line-height: 1.6;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>You have received a payment of <strong style="color: #28a745;">${amount} INR</strong>.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="margin-top: 0; color: #28a745;">Payment Details:</h3>
              <ul style="list-style-type: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 10px;"><strong>Amount:</strong> ${amount} INR</li>
                <li style="margin-bottom: 10px;"><strong>Sender Account:</strong> ${otherAccount}</li>
                <li style="margin-bottom: 10px;"><strong>Date:</strong> ${date}</li>
                <li style="margin-bottom: 10px;"><strong>Time:</strong> ${time}</li>
                <li style="margin-bottom: 0;"><strong>Transaction ID:</strong> ${transaction_id}</li>
              </ul>
            </div>
            
            <p style="font-size: 14px;">If you were not expecting this payment, please contact our support team.</p>
            <p>Best regards,<br><strong>The Banking Team</strong></p>
          </div>
        </div>
      </div>`;
  }

  await sendEmail(to, subject, text, html);
}

module.exports = { transporter, emailservice, email_payment_notification };
 
 
