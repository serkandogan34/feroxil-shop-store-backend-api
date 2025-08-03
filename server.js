const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware'leri kullanma
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// n8n Webhook URL'nizi Coolify ortam değişkenlerinden okuyun
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

// Formdan gelen verileri işleyecek API endpoint'i
app.post('/api/order', async (req, res) => {
    try {
        const formData = req.body;
        console.log('Alınan form verileri:', formData);

        // n8n'e POST isteği gönderme
        const n8nResponse = await axios.post(N8N_WEBHOOK_URL, formData);
        
        console.log('n8n yanıtı:', n8nResponse.data);

        // Müşteriye başarılı yanıt gönderme
        res.status(200).json({ success: true, message: 'Siparişiniz başarıyla alındı!' });
    } catch (error) {
        console.error('n8n\'e veri gönderme hatası:', error.message);
        res.status(500).json({ success: false, message: 'Siparişiniz gönderilirken bir hata oluştu.' });
    }
});

app.listen(port, () => {
    console.log(`Backend sunucusu http://localhost:${port} adresinde çalışıyor.`);
});
