require('dotenv').config();
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
          if (options.html) {
            console.log(`\n--- HTML Body Preview ---`);
            console.log(options.html);
          }
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
      if (options.html) {
        console.log(`\n--- HTML Body Preview ---`);
        console.log(options.html);
      }
      console.log('-------------------------\n');
      return { messageId: 'simulated-' + Date.now() };
    }
  };
}

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Simple bank ledger" <${process.env.EMAIL_USER || 'no-reply@simplebankledger.com'}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = 'Welcome to Simple bank ledger!';
  
  const text = `Hello, ${name}!\n\n` +
    `Thank you for registering at Simple bank ledger.\n\n` +
    `Experience the next generation of decentralized ledgers built with:\n` +
    `- Double-Entry Aggregations: Balances are computed instantly via immutable transaction registers. Zero floating variables, zero reconciliation issues.\n` +
    `- Atomic Money Routing: All transactions execute through strict Mongo session gates, guaranteeing atomic deposits and withdrawals.\n` +
    `- Real-Time Auditing: Review debits, credits, and target accounts inside your live dashboard timeline with complete transparency.\n\n` +
    `You can now access your dashboard console to manage your bank accounts.`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to Simple bank ledger</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, sans-serif; color: #0f172a;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Simple bank ledger</h1>
              <p style="color: #93c5fd; margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Secure Digital Vaults</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Welcome, ${name}!</h2>
              <p style="color: #475569; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
                Thank you for registering at <strong>Simple bank ledger</strong>. Your security-focused ledger profile has been established successfully.
              </p>
              
              <!-- Features matching website -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px; background-color: #f1f5f9; border-radius: 8px; display: block; margin-bottom: 12px;">
                    <strong style="color: #2563eb; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Double-Entry Aggregations</strong>
                    <span style="color: #475569; font-size: 13px; line-height: 18px; display: block;">Balances are computed instantly via immutable transaction registers. Zero floating variables, zero reconciliation issues.</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f1f5f9; border-radius: 8px; display: block; margin-bottom: 12px;">
                    <strong style="color: #2563eb; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Atomic Money Routing</strong>
                    <span style="color: #475569; font-size: 13px; line-height: 18px; display: block;">All transactions execute through strict Mongo session gates, guaranteeing atomic deposits and withdrawals.</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f1f5f9; border-radius: 8px; display: block;">
                    <strong style="color: #2563eb; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Real-Time Auditing</strong>
                    <span style="color: #475569; font-size: 13px; line-height: 18px; display: block;">Review debits, credits, and target accounts inside your live dashboard timeline with complete transparency.</span>
                  </td>
                </tr>
              </table>

              <p style="color: #475569; font-size: 15px; line-height: 22px; margin: 0 0 24px 0;">
                You can now access your dashboard console to configure custom banking cards, make transfers, and audit transactions in real-time.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #cbd5e1; padding: 24px 32px; text-align: center;">
              <p style="color: #94a3b8; margin: 0; font-size: 12px; line-height: 18px;">
                This is an automated system email from Simple bank ledger.<br>
                Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount, remainingBalance, currency = 'INR') {
  const subject = 'Transaction Completed - Simple bank ledger';
  
  const text = `Hello, ${name}!\n\n` +
    `Your transaction has been completed successfully.\n\n` +
    `Transaction Details:\n` +
    `- Amount Transferred: ${amount.toLocaleString()} ${currency}\n` +
    `- Beneficiary Account: ${toAccount}\n` +
    `- Remaining Balance: ${remainingBalance.toLocaleString()} ${currency}\n\n` +
    `Thank you for choosing Simple bank ledger.`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Transaction Successful - Simple bank ledger</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, sans-serif; color: #0f172a;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Simple bank ledger</h1>
              <p style="color: #93c5fd; margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Secure Digital Vaults</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; background-color: #d1fae5; color: #065f46; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Debit Successful
                </span>
                <h2 style="color: #0f172a; margin: 12px 0 0 0; font-size: 20px; font-weight: 600;">Transaction Completed</h2>
              </div>
              
              <p style="color: #475569; font-size: 15px; line-height: 22px; margin: 0 0 24px 0; text-align: center;">
                Hello <strong>${name}</strong>, a transfer transaction has been executed successfully from your account.
              </p>

              <!-- Transaction Summary Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; width: 40%; color: #475569; font-size: 14px; font-weight: 500;">Amount Transferred</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 16px; font-weight: 700;">${amount.toLocaleString()} ${currency}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 14px; font-weight: 500;">Beneficiary Account</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-family: monospace; font-weight: 600;">${toAccount}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 12px 16px; color: #475569; font-size: 14px; font-weight: 500;">Remaining Balance</td>
                  <td style="padding: 12px 16px; color: #10b981; font-size: 16px; font-weight: 700;">${remainingBalance.toLocaleString()} ${currency}</td>
                </tr>
              </table>

              <!-- Tech copy -->
              <p style="color: #94a3b8; font-size: 12px; line-height: 18px; margin: 0; text-align: center;">
                Secured by our <strong>Double-Entry Ledger Architecture</strong> with atomic Mongo session verification. Check your live dashboard timeline for a detailed audit trail.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #cbd5e1; padding: 24px 32px; text-align: center;">
              <p style="color: #94a3b8; margin: 0; font-size: 12px; line-height: 18px;">
                This is an automated system email from Simple bank ledger.<br>
                Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount, currency = 'INR') {
  const subject = 'Transaction Failed - Simple bank ledger';
  
  const text = `Hello, ${name}!\n\n` +
    `We regret to inform you that your attempted transaction of ${amount.toLocaleString()} ${currency} to account ${toAccount} has failed.\n\n` +
    `No funds have been debited from your account. Please review your balance and account configurations before retrying.`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Transaction Failed - Simple bank ledger</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, sans-serif; color: #0f172a;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Simple bank ledger</h1>
              <p style="color: #93c5fd; margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Secure Digital Vaults</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; background-color: #fee2e2; color: #991b1b; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Transaction Failed
                </span>
                <h2 style="color: #0f172a; margin: 12px 0 0 0; font-size: 20px; font-weight: 600;">Transaction Unsuccessful</h2>
              </div>
              
              <p style="color: #475569; font-size: 15px; line-height: 22px; margin: 0 0 24px 0; text-align: center;">
                Hello <strong>${name}</strong>, we regret to inform you that your transaction could not be processed.
              </p>

              <!-- Transaction Summary Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; width: 40%; color: #475569; font-size: 14px; font-weight: 500;">Attempted Amount</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 16px; font-weight: 700;">${amount.toLocaleString()} ${currency}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #475569; font-size: 14px; font-weight: 500;">Target Account</td>
                  <td style="padding: 12px 16px; color: #0f172a; font-size: 14px; font-family: monospace; font-weight: 600;">${toAccount}</td>
                </tr>
              </table>

              <p style="color: #ef4444; font-size: 14px; font-weight: 500; text-align: center; margin: 0 0 24px 0;">
                No funds were debited from your account. Please check your balance or verify the beneficiary account status.
              </p>

              <p style="color: #94a3b8; font-size: 12px; line-height: 18px; margin: 0; text-align: center;">
                Secured by our <strong>Double-Entry Ledger Architecture</strong> with atomic Mongo session verification.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #cbd5e1; padding: 24px 32px; text-align: center;">
              <p style="color: #94a3b8; margin: 0; font-size: 12px; line-height: 18px;">
                This is an automated system email from Simple bank ledger.<br>
                Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = { sendRegistrationEmail, sendTransactionFailureEmail, sendTransactionEmail };