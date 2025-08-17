<?php
// n8n Webhook URL'si
$n8nWebhookUrl = "https://n8nwork.dtekai.com/webhook/bc74f59e-54c2-4521-85a1-6e21a0438c31";

// Tarayıcıdan gelen JSON verisini yakala
$formData = file_get_contents('php://input');

// Tarayıcıdan gelen başlıkları yakala
$headers = getallheaders();
$forwardedHeaders = [];

foreach ($headers as $key => $value) {
    if (in_array(strtolower($key), ['host', 'content-type', 'content-length', 'user-agent', 'x-real-ip', 'x-forwarded-for'])) {
        $forwardedHeaders[] = "$key: $value";
    }
}

// n8n'e istek yap
$ch = curl_init($n8nWebhookUrl);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, $formData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $forwardedHeaders);

// SSL doğrulamasını devre dışı bırak
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

// Hata ayıklama kodları
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch); // Hata mesajını yakala

curl_close($ch);

// n8n'den gelen yanıtı tarayıcıya geri gönder
if ($httpcode == 200) {
    header('Content-Type: application/json');
    echo $response;
} else {
    // Hata oluşursa, hata mesajını tarayıcıya geri gönder
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => "Sunucu hatası: Curl hatası - $error", 'http_code' => $httpcode, 'response_body' => $response]);
}
?>
