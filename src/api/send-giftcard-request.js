// api/send-giftcard-request.js
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Solo richieste POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  try {
    const { userName, date, amount, giftCardNumber, comment } = req.body;

    // Validazione
    if (!userName || !date || !amount || !comment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Configura il trasportatore SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // true per 465, false per altre porte
      auth: {
        user: 'men2men.center@gmail.com',
        pass: process.env.BREVO_SMTP_KEY,
      },
    });

    // Contenuto dell'email
    const emailContent = `
      <h2>Gift Card Payment Request</h2>
      <p><strong>Therapist:</strong> ${userName}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Gift Card Amount:</strong> €${parseFloat(amount).toFixed(2)}</p>
      ${giftCardNumber ? `<p><strong>Gift Card Number:</strong> ${giftCardNumber}</p>` : ''}
      <p><strong>Comment:</strong> ${comment}</p>
    `;

    // Opzioni email
    const mailOptions = {
      from: `"${userName}" <men2men.center@gmail.com>`,
      to: 'info@men2men.center',
      subject: `Gift Card Payment Request from ${userName}`,
      html: emailContent
    };

    // Invia email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);

    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message 
    });
  }
}
