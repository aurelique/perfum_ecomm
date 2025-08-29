// Variabel global
let cart = JSON.parse(localStorage.getItem('cart')) || [];

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

// Fungsi untuk memuat item keranjang (di bagian summary checkout)
function loadCartItems() {
    const container = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    
    // Jika di halaman cart
    if (container) {
        if (cart.length === 0) {
            container.innerHTML = '<p class="text-center">Keranjang Anda kosong</p>';
            if (subtotalElement) subtotalElement.textContent = 'Rp 0';
            if (totalElement) totalElement.textContent = 'Rp 0';
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
        if (subtotalElement) subtotalElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
        if (totalElement) totalElement.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }
    // Jika hanya di halaman checkout (summary)
    else if (subtotalElement && totalElement) {
        if (cart.length === 0) {
            subtotalElement.textContent = 'Rp 0';
            totalElement.textContent = 'Rp 0';
            return;
        }
        
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        
        const total = subtotal + 15000; // Ongkos kirim
        subtotalElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
        totalElement.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }
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

// Fungsi untuk memproses checkout dengan pembayaran langsung
async function processCheckoutWithPayment() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const fileInput = document.getElementById('payment-proof');
    
    if (!name || !phone || !address) {
        alert('Harap lengkapi semua informasi pembeli');
        return;
    }
    
    if (!fileInput.files[0]) {
        alert('Harap upload bukti pembayaran');
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
        // Buat pesanan dulu
        const orderResponse = await createOrder(orderData);
        if (orderResponse.success) {
            const orderId = orderResponse.orderId;
            
            // Konversi gambar ke base64
            const reader = new FileReader();
            reader.onload = async function() {
                const base64 = reader.result.split(',')[1]; // Hapus prefix image/*
                
                // Simpan bukti pembayaran
                const paymentResponse = await savePaymentProof(orderId, base64);
                
                if (paymentResponse.success) {
                    // Kosongkan keranjang
                    cart = [];
                    localStorage.removeItem('cart');
                    
                    // Redirect ke WhatsApp admin dengan pesan otomatis
                    const adminPhone = '628123456789'; // Ganti dengan nomor admin Anda
                    const message = `🔔 NOTIFIKASI PEMBAYARAN BARU 🔔\n\nID Pesanan: ${orderId}\nNama: ${name}\nTotal: Rp ${total.toLocaleString('id-ID')}\nStatus: Bukti Pembayaran Diupload\n\nSilakan cek bukti pembayaran di Google Sheets.`;
                    const encodedMessage = encodeURIComponent(message);
                    
                    // Buka WhatsApp dengan pesan
                    window.open(`https://wa.me/${adminPhone}?text=${encodedMessage}`, '_blank');
                    
                    alert('Pesanan berhasil dibuat dan bukti pembayaran telah diupload! Anda akan diarahkan ke WhatsApp untuk mengirim notifikasi ke admin.');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 3000);
                } else {
                    alert('Gagal mengupload bukti pembayaran. Pesanan tetap dibuat.');
                    // Kosongkan keranjang
                    cart = [];
                    localStorage.removeItem('cart');
                    window.location.href = 'index.html';
                }
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            alert('Gagal membuat pesanan: ' + (orderResponse.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error processing checkout:', error);
        alert('Terjadi kesalahan. Silakan coba lagi.');
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
    
    // Load cart items if on cart or checkout page
    if (document.getElementById('cart-items') || 
        (document.getElementById('subtotal') && document.getElementById('total'))) {
        loadCartItems();
    }
    
    // Toggle menu mobile
    document.querySelector('.menu-toggle').addEventListener('click', toggleMenu);
    
    // Form submit listener
    if (document.getElementById('checkout-form')) {
        document.getElementById('checkout-form').addEventListener('submit', function(e) {
            e.preventDefault();
            processCheckoutWithPayment();
        });
    }
});