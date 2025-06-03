const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Укажи здесь свою почту Gmail и сгенерированный "App Password"
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-admin-email@gmail.com',         // <-- твоя почта Gmail
    pass: 'your-app-password'                   // <-- пароль приложения (НЕ обычный пароль от почты!)
  }
});

// Твой основной email, куда придут уведомления
const recipientEmail = 'your-admin-email@gmail.com';

// Функция: Срабатывает при добавлении нового документа в pending_admins
exports.sendAdminRequestNotification = functions.firestore
  .document('pending_admins/{docId}')
  .onCreate(async (snap, context) => {
    const newRequest = snap.data();

    const mailOptions = {
      from: '"SCANMASTER" <your-admin-email@gmail.com>',
      to: recipientEmail,
      subject: 'Новый запрос на регистрацию администратора',
      text: `Поступил новый запрос на регистрацию:\n\nEmail: ${newRequest.email}\nДата запроса: ${newRequest.requestedAt?.toDate()}\n\nПроверьте заявки.`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Письмо успешно отправлено');
    } catch (error) {
      console.error('Ошибка при отправке письма:', error);
    }
  });
