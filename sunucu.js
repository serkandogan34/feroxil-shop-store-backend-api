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
        // Formdan gelen isim ve telefon bilgisi
        const { name, phone } = req.body;

        // Otomatik olarak toplanacak ek bilgiler
        const requestData = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2), // Benzersiz bir ID oluşturma
            isim: name,
            telefon: phone,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress, // İstemcinin IP adresini al
            cihazBilgisi: req.headers['user-agent'], // Kullanıcının cihazı ve tarayıcı bilgisi
            gelenSite: req.headers['referer'] || 'Direkt Giriş', // Hangi siteden geldiği
            zamanDamgasi: new Date().toISOString() // İstek zamanı
        };
        
        console.log('Toplanan veriler:', requestData);

        // n8n'e POST isteği gönderme
        const n8nResponse = await axios.post(N8N_WEBHOOK_URL, requestData);
        
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
