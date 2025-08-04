<?php
// Bu URL tarayıcıya gönderilmez ve güvenli bir şekilde saklanır
$n8nWebhookUrl = "YOUR_N8N_WEBHOOK_URL";

// Tarayıcıdan gelen JSON verisini yakala
$formData = file_get_contents('php://input');

// n8n'e istek yap
$ch = curl_init($n8nWebhookUrl);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, $formData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'Content-Length: ' . strlen($formData)
));

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// n8n'den gelen yanıtı tarayıcıya geri gönder
if ($httpcode == 200) {
    header('Content-Type: application/json');
    echo $response;
} else {
    // n8n'e istek başarısız olursa bir hata döndür
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Sunucu hatası: Siparişiniz gönderilemedi.']);
}
?>
