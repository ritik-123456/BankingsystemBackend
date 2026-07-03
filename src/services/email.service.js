require('dotenv').config();
const { text } = require('express');
const nodemailer = require('nodemailer');

let transporter;

const isOAuth2Configured = process.env.EMAIL_USER && process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.REFRESH_TOKEN;

if (isOAuth2Configured) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.warn('\n⚠️  OAuth2 Email authentication failed (token expired or revoked). Falling back to Console Email Simulation.');
      transporter = {
        sendMail: async (options) => {
          console.log('\n✉️  [SIMULATED EMAIL SENT]');
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Content: ${options.text}`);
          console.log('-------------------------\n');
          return { messageId: 'simulated-' + Date.now() };
        }
      };
    } else {
      console.log('Email server is ready to send messages');
    }
  });
} else {
  console.log('\nℹ️  Email configuration not found. Using Console Email Simulation.');
  transporter = {
    sendMail: async (options) => {
      console.log('\n✉️  [SIMULATED EMAIL SENT]');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Content: ${options.text}`);
      console.log('-------------------------\n');
      return { messageId: 'simulated-' + Date.now() };
    }
  };
}

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail,name){
  const subject='welcome to Backend Ledger!';
  const text=`Hello, ${name} \n \n Thank you for registering at Backend Ledger.`
  const html=`<p>Hello ${name},</p><p>Thank you for registering at Backend Ledger.</p>`;

  await sendEmail(userEmail,subject,text,html);
}


async function sendTransactionEmail(userEmail,name,amount,toAccount){
  const subject='Transaction Completed';
  const text=`Your account has been debit by amount:${amount} to account ${toAccount}`
  const html=`<p>Thank for choosing our service .we provide smooth encrypted transaction.</p>`
  await sendEmail(userEmail,subject,text,html);
}


async function sendTransactionFailureEmail(userEmail,name,amount,toAccount){
  const subject='Transaction Completed';
  const text=`we regret to Inform you that your transaction of ${amount} to account: ${account} is failed`
  const html=`<p>We regret for that</p>`
  await sendEmail(userEmail,subject,text,html);
}

module.exports = {sendRegistrationEmail,sendTransactionFailureEmail,sendTransactionEmail};

// module.exports = transporter;