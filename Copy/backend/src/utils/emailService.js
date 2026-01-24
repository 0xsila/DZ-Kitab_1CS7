const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Initialize Resend client (used if RESEND_API_KEY is set)
const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const createTransporter = () => {
  // Use 'gmail' service for better deliverability with App Passwords
  // This automatically handles host, port, and secure settings
  return nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/* 
// Legacy configuration (kept for reference)
const createTransporterLegacy = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};
*/

const sendPasswordResetEmail = async (email, firstName, resetUrl) => {
  const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe</title>
    
    <style>
/* Base de l'email */
.email-container {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    color: #333;
}

.header {
    background-color: #2A4074;
    color: #ffffff;
    padding: 20px;
    text-align: center;
}

.body {
    padding: 30px;
    line-height: 1.6;
}

/* Style du bouton */
.button {
    display: block;
    width: fit-content;
    margin: 30px auto;
    padding: 15px 25px;
    background-color: #2A4074;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
    text-align: center;
}

.link {
    font-size: 12px;
    color: #2A4074;
    word-break: break-all;
}

.footer {
    background-color: #f9f9f9;
    padding: 15px;
    text-align: center;
    font-size: 12px;
    color: #777;
}
    </style>
</head>
<body>

    <div class="email-container">
        <div class="header">
            <h2>Réinitialisation de mot de passe</h2>
        </div>
        <div class="body">
            <p>Bonjour ${firstName || ''},</p>
            <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Cliquez sur le bouton ci-dessous pour en choisir un nouveau :</p>
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            </div>
        <div class="footer">
            <p>Si vous n'avez pas demandé ce changement, aucune action n'est requise de votre part.</p>
        </div>
    </div>

</body>
</html>`;

  if (resendClient) {
    await resendClient.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Réinitialisation de mot de passe - DZ-Kitab',
      html: htmlContent
    });
  } else {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"DZ-Kitab Support" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Password Reset Request',
      html: htmlContent
    });
  }
};

const sendWelcomeEmail = async (email, firstName) => {
  try {
    const htmlContent = `<p>Hi ${firstName || 'there'},</p><p>Thank you for registering with us!</p>`;
    
    if (resendClient) {
      await resendClient.emails.send({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Bienvenue sur DZ-Kitab!',
        html: htmlContent
      });
    } else {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"DZ-Kitab Support" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Welcome to Our Platform!',
        html: htmlContent
      });
    }
  } catch (error) {
    console.error('Welcome email error:', error);
  }
};

const sendOtpEmail = async (email, firstName, otp) => {
  try {
    // Use Resend if available (for production/cloud), otherwise use Gmail (for local dev)
    if (resendClient) {
      await resendClient.emails.send({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Code de vérification - DZ-Kitab',
        html: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de vérification</title>
    
    <style>
.email-container {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    color: #333;
}

.header {
    background-color: #2A4074;
    color: #ffffff;
    padding: 20px;
    text-align: center;
}

.body {
    padding: 30px;
    line-height: 1.6;
}

.otp-code {
    text-align: center;
    margin: 30px 0;
    padding: 15px 30px;
    font-size: 32px;
    font-weight: bold;
    letter-spacing: 5px;
    color: #2A4074;
    background-color: #f4f7ff;
    border: 2px dashed #2A4074;
    border-radius: 4px;
}

.footer {
    background-color: #f9f9f9;
    padding: 15px;
    text-align: center;
    font-size: 12px;
    color: #777;
}
    </style>
</head>
<body>

    <div class="email-container">
        <div class="header">
            <h2>Bienvenue parmi nous !</h2>
        </div>
        <div class="body">
            <p>Merci de vous être inscrit. Pour finaliser la création de votre compte, veuillez utiliser le code de confirmation suivant :</p>
            <div class="otp-code">${otp}</div>
            <p>Ce code est valable pendant 10 minutes. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 DZ-kitab. Tous droits réservés.</p>
        </div>
    </div>
    </body>
</html>`
      });
    } else {
      // Fallback to Gmail SMTP for local development
      const transporter = createTransporter();
      const mailOptions = {
        from: `"DZ-Kitab Support" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Your OTP Code',
        html: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email OTP</title>
    
    <style>
/* Base de l'email */
.email-container {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    color: #333;
}

.header {
    background-color: #2A4074;
    color: #ffffff;
    padding: 20px;
    text-align: center;
}

.body {
    padding: 30px;
    line-height: 1.6;
    text-align: center;
}

/* Style spécifique au code OTP */
.otp-code {
    display: inline-block;
    margin: 20px 0;
    padding: 15px 30px;
    font-size: 32px;
    font-weight: bold;
    letter-spacing: 5px;
    color: #2A4074;
    background-color: #f4f7ff;
    border: 2px dashed #2A4074;
    border-radius: 4px;
}

.footer {
    background-color: #f9f9f9;
    padding: 15px;
    text-align: center;
    font-size: 12px;
    color: #777;
}
    </style>
</head>
<body>

    <div class="email-container">
        <div class="header">
            <h2>Bienvenue parmi nous !</h2>
        </div>
        <div class="body">
            <p>Merci de vous être inscrit. Pour finaliser la création de votre compte, veuillez utiliser le code de confirmation suivant :</p>
            <div class="otp-code">${otp}</div>
            <p>Ce code est valable pendant 10 minutes. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 DZ-kitab. Tous droits réservés.</p>
        </div>
    </div>
    </body>
</html>`
      };
      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error('OTP email error:', error);
    throw new Error('Failed to send OTP',error);
  }
};

async function sendAdminPromotionRequest(adminEmail, targetUser, confirmationToken) {
  const transporter = createTransporter();
  // IMPORTANT: For Render, backend URL is inferred or set via API_URL or RENDER_EXTERNAL_URL
  const apiUrl = process.env.VITE_API_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000';
  
  const approveLink = `${apiUrl}/api/admin/approve-promotion?token=${confirmationToken}&decision=approve`;
  const denyLink = `${apiUrl}/api/admin/approve-promotion?token=${confirmationToken}&decision=deny`;

  const mailOptions = {
    from: `"DZ-Kitab Admin" <${process.env.EMAIL_FROM}>`,
    to: adminEmail,
    subject: 'Action Required: Admin Promotion Request',
    html: `
      <h2>Admin Promotion Request</h2>
      <p>An admin has requested to promote the following user to Admin status:</p>
      <ul>
        <li><strong>Name:</strong> ${targetUser.first_name} ${targetUser.last_name}</li>
        <li><strong>Email:</strong> ${targetUser.email}</li>
        <li><strong>ID:</strong> ${targetUser.id}</li>
      </ul>
      <p>Please click one of the buttons below:</p>
      <div style="margin: 20px 0;">
        <a href="${approveLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; margin-right: 10px; border-radius: 5px;">Approve</a>
        <a href="${denyLink}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Deny</a>
      </div>
      <p>This link is valid for 24 hours.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

const sendAdminRequestEmail = async (userEmail, name, message, superAdminEmail, token, user) => {
  const transporter = createTransporter();
  const apiUrl = process.env.VITE_API_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000';
  
  const approveLink = `${apiUrl}/api/admin/approve-promotion?token=${token}&decision=approve`;
  const denyLink = `${apiUrl}/api/admin/approve-promotion?token=${token}&decision=deny`;

  const mailOptions = {
    from: `"DZ-Kitab System" <${process.env.EMAIL_FROM}>`,
    to: superAdminEmail,
    replyTo: userEmail,
    subject: `New Admin Access Request: ${name}`,
    html: `
      <h2>New Admin Access Request</h2>
      <p>A user has requested admin access via the Login Page form.</p>
      <ul>
        <li><strong>Name:</strong> ${name} (Registered as ${user.first_name} ${user.last_name})</li>
        <li><strong>Email:</strong> ${userEmail}</li>
        <li><strong>User ID:</strong> ${user.id}</li>
      </ul>
      <h3>Motivation Message:</h3>
      <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #2A4074; font-style: italic;">
        "${message.replace(/\n/g, '<br>')}"
      </p>
      
      <h3>Action Required:</h3>
      <p>Do you want to grant Admin privileges to this user?</p>
      <div style="margin: 20px 0;">
        <a href="${approveLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; margin-right: 10px; border-radius: 5px;">Approve (Make Admin)</a>
        <a href="${denyLink}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Deny</a>
      </div>
      <p><em>These links are valid for 24 hours.</em></p>
    `
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail, sendWelcomeEmail, sendOtpEmail, sendAdminPromotionRequest, sendAdminRequestEmail };
