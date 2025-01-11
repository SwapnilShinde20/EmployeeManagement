
import dotenv from 'dotenv'
import sgMail from "@sendgrid/mail"
dotenv.config()

const emailAPIURL= process.env.EMAIL_API_URL // Add your email API URL to .env
const sendGridAPIKey = process.env.SENDGRID_API_KEY; // Add your SendGrid API key to .env

sgMail.setApiKey('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')


const sendEmail = async (data) => {
  const emailData = {
    personalizations: [
      {
        to: [{ email:  data.employee.email}], // Recipient's email
        subject: 'Hello from MakeUFit!',
      },
    ],
    from: { email: process.env.SENDGRID_FROM_EMAIL }, // Sender's email
    content: [
      {
        type: 'text/plain',
        value: data.action,
      },
    ],
  };

    sgMail
    .send(emailData)
    .then(() => {
      console.log('Email sent successfully');
    })
    .catch((error) => {
      console.error('Error sending email:', error);
    });
    // console.log('Email sent successfully:', response.data);
  
};


export  {
    emailAPIURL,
    sendEmail
};
