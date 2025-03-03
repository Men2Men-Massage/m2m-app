import { NextApiRequest, NextApiResponse } from 'next';
import { createTransport } from 'nodemailer';

// Define the GiftCardEmailRequest type
interface GiftCardEmailRequest {
  userName: string;
  date: string;
  amount: number;
  giftCardNumber?: string;
  comment: string;
}

/**
 * API endpoint for sending gift card payment requests
 */
export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
): Promise<void> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  try {
    const { userName, date, amount, giftCardNumber, comment } = req.body as GiftCardEmailRequest;

    // Validation
    if (!userName || !date || !amount || !comment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Configure SMTP transporter
    const transporter = createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'men2men.center@gmail.com',
        pass: process.env.BREVO_SMTP_KEY,
      },
    });

    // Email content
    const emailContent = `
      <h2>Gift Card Payment Request</h2>
      <p><strong>Therapist:</strong> ${userName}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Gift Card Amount:</strong> €${parseFloat(amount.toString()).toFixed(2)}</p>
      ${giftCardNumber ? `<p><strong>Gift Card Number:</strong> ${giftCardNumber}</p>` : ''}
      <p><strong>Comment:</strong> ${comment}</p>
    `;

    // Email options
    const mailOptions = {
      from: `"${userName}" <men2men.center@gmail.com>`,
      to: 'info@men2men.center',
      subject: `Gift Card Payment Request from ${userName}`,
      html: emailContent
    };

    // Send email
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
      details: (error as Error).message 
    });
  }
}
