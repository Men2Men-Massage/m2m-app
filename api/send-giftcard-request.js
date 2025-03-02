// api/send-giftcard-request.js
const axios = require('axios');

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

    // Costruisci il corpo dell'email
    const emailData = {
      sender: { name: userName, email: "noreply@m2m-app.com" },
      to: [{ email: "info@men2men.center" }],
      subject: `Gift Card Payment Request from ${userName}`,
      htmlContent: `
        <h2>Gift Card Payment Request</h2>
        <p><strong>Therapist:</strong> ${userName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Gift Card Amount:</strong> €${parseFloat(amount).toFixed(2)}</p>
        ${giftCardNumber ? `<p><strong>Gift Card Number:</strong> ${giftCardNumber}</p>` : ''}
        <p><strong>Comment:</strong> ${comment}</p>
      `
    };

    // Configura l'intestazione per l'API di Brevo
    const headers = {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY, // Legge la chiave dalle variabili d'ambiente
      'content-type': 'application/json'
    };

    // Invia l'email tramite l'API di Brevo
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email', 
      emailData, 
      { headers }
    );

    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message 
    });
  }
}
