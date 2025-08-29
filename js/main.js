// Variabel global
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbz4_80DlESn-zfB6S5W8BLy2DG1Pqo-20evsNgzxCYd5Od6R3sgeZy1UFMCT-p3lEI/exec'; // Ganti dengan URL Web App Anda

// Fungsi untuk memuat produk
async function loadProducts() {
    try {
        // Simulasi data produk (sebenarnya akan diambil dari Google Sheets)
        const products = [
            {
                id: 'P001',
                name: 'Midnight Oud',
                description: 'Parfum elegan dengan aroma kayu yang hangat dan sensual',
                price: 450000,
                image: 'https://images.unsplash.com/photo-1597045382136-97c99954945a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
            },
            {
                id: 'P002',
                name: 'Rose Garden',
                description: 'Aroma bunga mawar yang segar dan memikat',
                price: 380000,
                image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
            },
            {
                id: 'P003',
                name: 'Ocean Breeze',
                description: 'Wangi segar seperti angin laut di pagi hari',
                price: 320000,
                image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
            },
            {
                id: 'P004',
                name: 'Vanilla Dream',
                description: 'Aroma vanilla manis yang hangat dan menggoda',
                price: 350000,
                image: 'https://images.unsplash.com/photo-1597045079143-195555b0d71a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
            }
        ];
        
        const container = document.getElementById('products-container');
        container.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">Rp ${product.price.toLocaleString('id-ID')}</div>
                    <button class="add-to-cart" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image}')">Tambah ke Keranjang</button>
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
            price,
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
function processCheckout() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    
    if (!name || !phone || !address) {
        alert('Harap lengkapi semua informasi pembeli');
        return;
    }
    
    // Simpan informasi pelanggan
    const orderData = {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        items: cart,
        total: cart.reduce((total, item) => total + (item.price * item.quantity), 0) + 15000
    };
    
    localStorage.setItem('orderData', JSON.stringify(orderData));
    window.location.href = 'payment.html';
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

