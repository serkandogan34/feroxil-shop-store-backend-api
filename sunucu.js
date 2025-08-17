// Gerekli kütüphaneleri import et
const express = require('express');
const axios = require('axios'); // Veri göndermek için popüler bir kütüphane
const cors = require('cors'); // Tarayıcıdan gelen isteklere izin vermek için

// Express uygulamasını başlat
const app = express();
const PORT = process.env.PORT || 3000; // Coolify genellikle portu kendi belirler

// Gelen JSON verilerini okuyabilmek için gerekli ayar
app.use(express.json());
// Farklı domainlerden gelen isteklere izin ver (CORS)
app.use(cors());

// n8n Webhook URL'si
const n8nWebhookUrl = "https://n8nwork.dtekai.com/webhook/bc74f59e-54c2-4521-85a1-6e21a0438c31";

// HTML formundan gelen siparişleri karşılayacak olan adres (/api/order)
app.post('/api/order', async (req, res) => {
  try {
    // 1. Tarayıcıdan gelen veriyi al
    const gelenVeri = req.body;

    // 2. Yeni, sayısal ve tarih bazlı bir sipariş ID'si oluştur
    const yeniSiparisID = `SIP-${Date.now()}`;

    // 3. Gelen veriye yeni sipariş ID'sini 'siparisID' adıyla ekle
    const gonderilecekVeri = {
      ...gelenVeri,
      siparisID: yeniSiparisID
    };

    // 4. Güncellenmiş veriyi n8n'e gönder
    const n8nYaniti = await axios.post(n8nWebhookUrl, gonderilecekVeri, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 5. n8n'den gelen yanıtı tarayıcıya (HTML formuna) geri gönder
    res.status(200).json(n8nYaniti.data);

  } catch (error) {
    console.error('Bir hata oluştu:', error.message);
    res.status(500).json({ success: false, message: 'Sunucuda bir hata oluştu.' });
  }
});

// Sunucuyu dinlemeye başla
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});
