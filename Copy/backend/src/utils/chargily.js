const axios = require('axios');

const chargily = axios.create({
  baseURL: 'https://pay.chargily.net/api/v2',
  headers: {
    Authorization: `Bearer ${process.env.CHARGILY_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

exports.createInvoice = async ({ amount, orderId, title }) => {
  const res = await chargily.post('/invoices', {
    amount,
    currency: 'DZD',
    description: `Buy book: ${title}`,
    metadata: { order_id: orderId },
    success_url: `${process.env.FRONTEND_URL}/success`,
    failure_url: `${process.env.FRONTEND_URL}/failed`
  });

  return res.data;
};
