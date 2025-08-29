// Google Apps Script API Handler
// GANTI dengan URL Web App Anda dari Google Apps Script
const GAS_URL = 'https://script.google.com/macros/s/AKfycbz4_80DlESn-zfB6S5W8BLy2DG1Pqo-20evsNgzxCYd5Od6R3sgeZy1UFMCT-p3lEI/exec';

// Fungsi untuk mengambil data produk dari Google Sheets
async function fetchProducts() {
    try {
        console.log('Fetching products from:', GAS_URL + '?action=getProducts');
        
        // Tambahkan timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik timeout
        
        const response = await fetch(GAS_URL + '?action=getProducts', {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Products fetched:', data);
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - server tidak merespon');
        }
        throw error;
    }
}

// Fungsi untuk menambahkan produk ke Google Sheets
async function addProduct(product) {
    try {
        console.log('Adding product:', product);
        
        // Tambahkan timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 detik timeout
        
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'addProduct',
                ...product
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Product added response:', data);
        return data;
    } catch (error) {
        console.error('Error adding product:', error);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - server tidak merespon');
        }
        throw error;
    }
}

// Fungsi untuk membuat pesanan
async function createOrder(orderData) {
    try {
        console.log('Creating order:', orderData);
        
        // Tambahkan timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 detik timeout
        
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'createOrder',
                ...orderData
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Order created response:', data);
        return data;
    } catch (error) {
        console.error('Error creating order:', error);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - server tidak merespon');
        }
        throw error;
    }
}

// Fungsi untuk mengambil data pesanan
async function fetchOrders() {
    try {
        console.log('Fetching orders from:', GAS_URL + '?action=getOrders');
        
        // Tambahkan timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik timeout
        
        const response = await fetch(GAS_URL + '?action=getOrders', {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Orders fetched:', data);
        return data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - server tidak merespon');
        }
        throw error;
    }
}

// Fungsi untuk memperbarui status pesanan
async function updateOrderStatus(orderId, status) {
    try {
        console.log('Updating order status:', { orderId, status });
        
        // Tambahkan timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik timeout
        
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'updateOrderStatus',
                orderId,
                status
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Order status updated response:', data);
        return data;
    } catch (error) {
        console.error('Error updating order status:', error);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - server tidak merespon');
        }
        throw error;
    }
}

// Fungsi untuk menyimpan bukti pembayaran
async function savePaymentProof(orderId, proofBase64) {
    try {
        console.log('Saving payment proof for order:', orderId);
        
        // Tambahkan timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 detik timeout
        
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'savePaymentProof',
                orderId,
                proof: proofBase64
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Payment proof saved response:', data);
        return data;
    } catch (error) {
        console.error('Error saving payment proof:', error);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - server tidak merespon');
        }
        throw error;
    }
}