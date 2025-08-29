// Google Apps Script API Handler
// GANTI dengan URL Web App Anda dari Google Apps Script
const GAS_URL = 'https://script.google.com/macros/s/AKfycbz4_80DlESn-zfB6S5W8BLy2DG1Pqo-20evsNgzxCYd5Od6R3sgeZy1UFMCT-p3lEI/exec';

// Fungsi untuk mengambil data produk dari Google Sheets
async function fetchProducts() {
    try {
        console.log('Fetching products from:', GAS_URL + '?action=getProducts');
        const response = await fetch(GAS_URL + '?action=getProducts');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Products fetched:', data);
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

// Fungsi untuk menambahkan produk ke Google Sheets
async function addProduct(product) {
    try {
        console.log('Adding product:', product);
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
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Product added response:', data);
        return data;
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
}

// Fungsi untuk membuat pesanan
async function createOrder(orderData) {
    try {
        console.log('Creating order:', orderData);
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'createOrder',
                ...orderData
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Order created response:', data);
        return data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

// Fungsi untuk mengambil data pesanan
async function fetchOrders() {
    try {
        console.log('Fetching orders from:', GAS_URL + '?action=getOrders');
        const response = await fetch(GAS_URL + '?action=getOrders');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Orders fetched:', data);
        return data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
}

// Fungsi untuk memperbarui status pesanan
async function updateOrderStatus(orderId, status) {
    try {
        console.log('Updating order status:', { orderId, status });
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
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Order status updated response:', data);
        return data;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

// Fungsi untuk menyimpan bukti pembayaran
async function savePaymentProof(orderId, proofBase64) {
    try {
        console.log('Saving payment proof for order:', orderId);
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
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Payment proof saved response:', data);
        return data;
    } catch (error) {
        console.error('Error saving payment proof:', error);
        throw error;
    }
}