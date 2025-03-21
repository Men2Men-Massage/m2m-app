import { NextApiRequest, NextApiResponse } from 'next';
import { createTransport } from 'nodemailer';

// Define the HolidayRequestEmail type
interface HolidayRequestEmail {
  userName: string;
  userEmail: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

/**
 * API endpoint for sending holiday requests
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
    const { userName, userEmail, startDate, endDate, notes } = req.body as HolidayRequestEmail;

    // Validation
    if (!userName || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if start date is at least 31 days in the future
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 31);
    
    const requestStartDate = new Date(startDate);
    if (requestStartDate < minDate) {
      return res.status(400).json({ 
        error: 'Holiday requests must be made at least 31 days in advance'
      });
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

    // Format dates for display
    const formattedStartDate = new Date(startDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const formattedEndDate = new Date(endDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include the end date

    // Email content
    const emailContent = `
      <h2>Holiday Request</h2>
      <p><strong>Therapist:</strong> ${userName}</p>
      <p><strong>Email:</strong> ${userEmail || 'Not provided'}</p>
      <p><strong>Period:</strong> From ${formattedStartDate} to ${formattedEndDate} (${diffDays} days)</p>
      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      <hr>
      <p style="font-size: 0.9em; color: #666;">This request was sent automatically from the M2M Payment Calculator app.</p>
    `;

    // Email options
    const mailOptions = {
      from: `"${userName}" <men2men.center@gmail.com>`,
      to: 'info@men2men.center',
      subject: `Holiday Request from ${userName} (${formattedStartDate} - ${formattedEndDate})`,
      html: emailContent
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);

    return res.status(200).json({ 
      success: true, 
      message: 'Holiday request sent successfully',
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
