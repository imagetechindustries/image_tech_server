const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send email notification for new form inquiries/submissions
 * @param {Object} data 
 */
const sendInquiryEmail = async (data) => {
  try {
    const { type, fullName, companyName, email, phone, productInterest, industry, message, sourceWebsite } = data;
    const recipientEmails = process.env.EMAIL_TO || process.env.EMAIL_USER;

    const subject = `New ${type === 'quote' ? 'Quote Request' : 'Contact Inquiry'} from ${sourceWebsite || 'Website'} - ${fullName}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">New Inquiry Received</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.85;">Source Website: <strong>${sourceWebsite || 'N/A'}</strong></p>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 35%; color: #4b5563;">Inquiry Type:</td>
              <td style="padding: 8px 0; text-transform: capitalize;">${type || 'Contact'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Full Name:</td>
              <td style="padding: 8px 0;">${fullName || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Company Name:</td>
              <td style="padding: 8px 0;">${companyName || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Email Address:</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Phone Number:</td>
              <td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #2563eb;">${phone}</a></td>
            </tr>
            ${productInterest ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Product Interest:</td>
              <td style="padding: 8px 0;">${productInterest}</td>
            </tr>` : ''}
            ${industry ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Industry:</td>
              <td style="padding: 8px 0;">${industry}</td>
            </tr>` : ''}
          </table>

          <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #1e293b;">Message / Requirement:</p>
            <p style="margin: 0; white-space: pre-wrap; color: #334155;">${message || 'No additional message provided.'}</p>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 12px 20px; text-align: center; font-size: 12px; color: #64748b;">
          This is an automated notification from ImageTech Server Lead Management.
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"ImageTech Lead System" <${process.env.EMAIL_USER}>`,
      to: recipientEmails,
      replyTo: email,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Inquiry email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending inquiry email:', error);
  }
};

module.exports = {
  sendInquiryEmail,
};

