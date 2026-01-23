const nodemailer = require('nodemailer');

const createTransporter = () => {
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

const sendPasswordResetEmail = async (email, firstName, resetUrl) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request',
    html: `<!DOCTYPE html>
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
</html>`
  };
  await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to Our Platform!',
      html: `<p>Hi ${firstName || 'there'},</p><p>Thank you for registering with us!</p>`
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Welcome email error:', error);
  }
};

const sendOtpEmail = async (email, firstName, otp) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM,
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
  } catch (error) {
    console.error('OTP email error:', error);
    throw new Error('Failed to send OTP',error);
  }
};

module.exports = { sendPasswordResetEmail, sendWelcomeEmail, sendOtpEmail };
