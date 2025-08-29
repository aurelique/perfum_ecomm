// Variabel global
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbz4_80DlESn-zfB6S5W8BLy2DG1Pqo-20evsNgzxCYd5Od6R3sgeZy1UFMCT-p3lEI/exec'; // Ganti dengan URL Web App Anda

// Fungsi untuk memuat produk
async function loadProducts() {
    try {
        const products = await fetchProducts();
        const container = document.getElementById('products-container');
        container.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image_url}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">Rp ${parseInt(product.price).toLocaleString('id-ID')}</div>
                    <button class="add-to-cart" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image_url}')">Tambah ke Keranjang</button>
                </div>
            `;
            container.appendChild(productCard);
        });
        
        updateCartCount();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Fungsi untuk menambahkan produk ke keranjang
function addToCart(id, name, price, image) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id,
            name,
            price: parseInt(price),
            image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`${name} telah ditambahkan ke keranjang!`);
}

// Fungsi untuk memperbarui jumlah item di keranjang
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Fungsi untuk memuat item keranjang
function loadCartItems() {
    const container = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="text-center">Keranjang Anda kosong</p>';
        subtotalElement.textContent = 'Rp 0';
        totalElement.textContent = 'Rp 0';
        return;
    }
    
    container.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
            <div class="remove-item" onclick="removeFromCart('${item.id}')">
                <i class="fas fa-trash"></i>
            </div>
        `;
        container.appendChild(cartItem);
    });
    
    const total = subtotal + 15000; // Ongkos kirim
    subtotalElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    totalElement.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// Fungsi untuk memperbarui jumlah item
function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== id);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartItems();
    }
}

// Fungsi untuk menghapus item dari keranjang
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartItems();
    updateCartCount();
}

// Fungsi untuk memproses checkout
async function processCheckout() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    
    if (!name || !phone || !address) {
        alert('Harap lengkapi semua informasi pembeli');
        return;
    }
    
    // Hitung total
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const total = subtotal + 15000; // Ongkos kirim
    
    // Buat data pesanan
    const orderData = {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        items: cart,
        total: total
    };
    
    try {
        const response = await createOrder(orderData);
        if (response.success) {
            // Simpan orderId untuk pembayaran
            localStorage.setItem('currentOrderId', response.orderId);
            localStorage.setItem('orderTotal', total);
            
            // Kosongkan keranjang
            cart = [];
            localStorage.removeItem('cart');
            
            // Redirect ke payment page
            window.location.href = 'payment.html';
        } else {
            alert('Gagal membuat pesanan. Silakan coba lagi.');
        }
    } catch (error) {
        console.error('Error creating order:', error);
        alert('Terjadi kesalahan. Silakan coba lagi.');
    }
}

// Fungsi untuk upload bukti pembayaran
async function uploadPaymentProof() {
    const fileInput = document.getElementById('payment-proof');
    const orderId = localStorage.getItem('currentOrderId');
    const total = localStorage.getItem('orderTotal');
    
    if (!fileInput.files[0]) {
        alert('Harap pilih file bukti pembayaran');
        return;
    }
    
    if (!orderId) {
        alert('ID pesanan tidak ditemukan');
        return;
    }
    
    try {
        // Konversi gambar ke base64
        const reader = new FileReader();
        reader.onload = async function() {
            const base64 = reader.result.split(',')[1]; // Hapus prefix image/*
            
            // Simpan bukti pembayaran
            const response = await savePaymentProof(orderId, base64);
            
            if (response.success) {
                // Kirim WhatsApp langsung ke admin
                const adminPhone = '628123456789'; // Ganti dengan nomor admin
                const message = `🔔 NOTIFIKASI PEMBAYARAN BARU 🔔\n\nID Pesanan: ${orderId}\nStatus: Bukti Pembayaran Diupload\n\nSilakan cek bukti pembayaran di Google Sheets.`;
                
                // Buka WhatsApp dengan pesan
                window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
                
                alert('Bukti pembayaran berhasil diupload! Anda akan diarahkan ke WhatsApp untuk mengirim notifikasi.');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            } else {
                alert('Gagal mengupload bukti pembayaran. Silakan coba lagi.');
            }
        };
        reader.readAsDataURL(fileInput.files[0]);
    } catch (error) {
        console.error('Error uploading payment proof:', error);
        alert('Terjadi kesalahan saat mengupload bukti pembayaran.');
    }
}

// Fungsi untuk toggle menu mobile
function toggleMenu() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('active');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load products if on homepage
    if (document.getElementById('products-container')) {
        loadProducts();
    }
    
    // Update cart count
    updateCartCount();
    
    // Toggle menu mobile
    document.querySelector('.menu-toggle').addEventListener('click', toggleMenu);
});

