// Google Apps Script API Handler
// Ganti dengan URL Web App Anda dari Google Apps Script
const GAS_URL = 'https://script.google.com/macros/s/AKfycbz4_80DlESn-zfB6S5W8BLy2DG1Pqo-20evsNgzxCYd5Od6R3sgeZy1UFMCT-p3lEI/exec';

// Fungsi untuk mengambil data produk dari Google Sheets
async function fetchProducts() {
    try {
        const response = await fetch(GAS_URL + '?action=getProducts');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Fungsi untuk menambahkan produk ke Google Sheets
async function addProduct(product) {
    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'addProduct',
                ...product
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error adding product:', error);
        return { success: false };
    }
}

// Fungsi untuk mengambil data pesanan
async function fetchOrders() {
    try {
        const response = await fetch(GAS_URL + '?action=getOrders');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

// Fungsi untuk memperbarui status pesanan
async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'updateOrderStatus',
                orderId,
                status
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false };
    }
}

// Fungsi untuk menyimpan bukti pembayaran
async function savePaymentProof(orderId, proofBase64) {
    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'savePaymentProof',
                orderId,
                proof: proofBase64
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error saving payment proof:', error);
        return { success: false };
    }
}

// Fungsi untuk mengirim notifikasi WhatsApp
async function sendWhatsAppNotification(message) {
    try {
        // Menggunakan CallMeBot API
        const phoneNumber = '6283840556211'; // Ganti dengan nomor admin
        const apiKey = 'YOUR_CALLMEBOT_API_KEY'; // Ganti dengan API key Anda
        
        const response = await fetch(
            `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${encodeURIComponent(message)}&apikey=${apiKey}`
        );
        
        return response.ok;
    } catch (error) {
        console.error('Error sending WhatsApp notification:', error);
        return false;
    }
}