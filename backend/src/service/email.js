require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  }, 


});




async function sendEmail(to, subject, text, html) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };


  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} with subject "${subject}"`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    // Removed throw error; so the app doesn't crash if the Gmail token expires
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
 
 
