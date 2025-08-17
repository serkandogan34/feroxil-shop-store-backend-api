const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// *** 1. YENİ SATIR: Coolify'ın proxy'sine güvenmesini sağlıyoruz ***
app.set('trust proxy', true);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

function getTrafficSourceInfo(refererUrl) {
    if (!refererUrl) return {};
    try {
        const url = new URL(refererUrl);
        const params = new URLSearchParams(url.search);
        const info = {};
        if (params.has('utm_source')) info.utm_source = params.get('utm_source');
        if (params.has('utm_medium')) info.utm_medium = params.get('utm_medium');
        if (params.has('utm_campaign')) info.utm_campaign = params.get('utm_campaign');
        if (params.has('utm_term')) info.utm_term = params.get('utm_term');
        if (params.has('utm_content')) info.utm_content = params.get('utm_content');
        if (url.hostname.includes('google.com') && params.has('q')) {
            info.arama_kelimesi = params.get('q');
        }
        return info;
    } catch (e) {
        return {};
    }
}

app.post('/api/order', async (req, res) => {
    try {
        const siparisID = `SIP-${new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '')}`;

        const { name, phone } = req.body;
        const referer = req.headers['referer'] || 'Direkt Giriş';
        const trafikKaynakBilgisi = getTrafficSourceInfo(referer);

        const requestData = {
            siparisID: siparisID,
            isim: name,
            telefon: phone,
            // *** 2. DEĞİŞEN SATIR: IP'yi 'req.ip' ile daha akıllı bir şekilde alıyoruz ***
            ip: req.ip, 
            cihazBilgisi: req.headers['user-agent'],
            gelenSite: referer,
            ...trafikKaynakBilgisi,
            zamanDamgasi: new Date().toISOString()
        };
        
        console.log('Toplanan veriler:', requestData);

        const n8nResponse = await axios.post(N8N_WEBHOOK_URL, requestData);
        
        console.log('n8n yanıtı:', n8nResponse.data);

        res.status(200).json({ success: true, message: 'Siparişiniz başarıyla alındı!' });
    } catch (error) {
        console.error('n8n\'e veri gönderme hatası:', error.message);
        res.status(500).json({ success: false, message: 'Siparişiniz gönderilirken bir hata oluştu.' });
    }
});

app.listen(port, () => {
    console.log(`Backend sunucusu ${port} portunda çalışıyor.`);
});
