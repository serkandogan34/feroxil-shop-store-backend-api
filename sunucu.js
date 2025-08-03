const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

app.post('/api/order', async (req, res) => {
    try {
        const formData = req.body;
        console.log('Alınan form verileri:', formData);

        const n8nResponse = await axios.post(N8N_WEBHOOK_URL, formData);

        console.log('n8n yanıtı:', n8nResponse.data);

        res.status(200).json({ success: true, message: 'Siparişiniz başarıyla alındı!' });
    } catch (error) {
        console.error('n8n\'e veri gönderme hatası:', error.message);
        res.status(500).json({ success: false, message: 'Siparişiniz gönderilirken bir hata oluştu.' });
    }
});

app.listen(port, () => {
    console.log(`Backend sunucusu http://localhost:${port} adresinde çalışıyor.`);
});
