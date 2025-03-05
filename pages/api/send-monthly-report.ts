import { NextApiRequest, NextApiResponse } from 'next';
import { createTransport } from 'nodemailer';

// Define the MonthlyReportRequest type
interface MonthlyReportRequest {
  userName: string;
  userEmail: string;
  month: string; // Format: "YYYY-MM"
  payments: {
    date: string;
    dueAmount: number;
    giftCardAmount: number;
    note?: string;
  }[];
  totalDue: number;
  totalGiftCard: number;
  totalEarnings: number;
}

/**
 * API endpoint for sending monthly payment reports
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
    const { 
      userName, 
      userEmail, 
      month, 
      payments, 
      totalDue, 
      totalGiftCard, 
      totalEarnings 
    } = req.body as MonthlyReportRequest;

    // Validation
    if (!userName || !userEmail || !month || !payments) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Extract year and month from the month string (YYYY-MM)
    const [year, monthNum] = month.split('-');
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    // Month is 0-indexed in JavaScript Date, but our month string is 1-indexed
    const monthName = monthNames[parseInt(monthNum) - 1];
    const monthNameYear = `${monthName} ${year}`;

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

    // Generate payment rows for email
    let paymentRows = '';
    payments.forEach(payment => {
      // Format date from YYYY-MM-DD to DD/MM/YYYY for display
      const formattedDate = payment.date.split('-').reverse().join('/');
      
      paymentRows += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${formattedDate}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">€${payment.dueAmount.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">€${payment.giftCardAmount.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${payment.note || ''}</td>
        </tr>
      `;
    });

    // Email content
    const emailContent = `
      <h2>M2M Payment Report - ${monthNameYear}</h2>
      <p><strong>Therapist:</strong> ${userName}</p>
      
      <h3>Payment Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; border: 1px solid #ddd;">Date</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Due Amount (40%)</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Gift Card</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Note</th>
          </tr>
        </thead>
        <tbody>
          ${paymentRows}
        </tbody>
        <tfoot>
          <tr style="background-color: #f2f2f2; font-weight: bold;">
            <td style="padding: 10px; border: 1px solid #ddd;">Total</td>
            <td style="padding: 10px; border: 1px solid #ddd;">€${totalDue.toFixed(2)}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">€${totalGiftCard.toFixed(2)}</td>
            <td style="padding: 10px; border: 1px solid #ddd;"></td>
          </tr>
        </tfoot>
      </table>
      
      <p><strong>Total Earnings:</strong> €${totalEarnings.toFixed(2)}</p>
      <p><em>This is an automatically generated report from the M2M Payment Calculator.</em></p>
    `;

    // Email options
    const mailOptions = {
      from: `"M2M Payment Calculator" <men2men.center@gmail.com>`,
      to: userEmail,
      subject: `M2M Payment Report - ${monthNameYear}`,
      html: emailContent
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);

    return res.status(200).json({ 
      success: true, 
      message: 'Report email sent successfully',
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
