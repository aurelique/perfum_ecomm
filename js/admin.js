// Admin functions
let isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';

// Redirect if not logged in
function checkAdminAuth() {
    if (!isAdminLoggedIn && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
    } else if (isAdminLoggedIn && window.location.pathname.includes('login.html')) {
        window.location.href = 'dashboard.html';
    }
}

// Admin login
function adminLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simulasi login (sebenarnya akan diverifikasi dengan Google Sheets)
    if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('adminLoggedIn', 'true');
        isAdminLoggedIn = true;
        window.location.href = 'dashboard.html';
    } else {
        alert('Username atau password salah!');
    }
}

// Logout
function logout() {
    localStorage.removeItem('adminLoggedIn');
    isAdminLoggedIn = false;
    window.location.href = 'login.html';
}

// Load admin products
function loadAdminProducts() {
    // Simulasi data produk
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
        }
    ];
    
    const container = document.getElementById('admin-products-container');
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
                <div class="admin-product-actions">
                    <button class="action-btn">Edit</button>
                    <button class="action-btn" style="background: #dc3545;">Hapus</button>
                </div>
            </div>
        `;
        container.appendChild(productCard);
    });
}

// Tambah produk baru
function addNewProduct() {
    const name = document.getElementById('product-name').value;
    const price = document.getElementById('product-price').value;
    const description = document.getElementById('product-description').value;
    const image = document.getElementById('product-image').value;
    
    if (!name || !price || !description || !image) {
        alert('Harap lengkapi semua field');
        return;
    }
    
    // Simulasi penambahan produk
    alert(`Produk "${name}" berhasil ditambahkan!`);
    document.getElementById('add-product-form').reset();
    loadAdminProducts();
}

// Load orders
function loadOrders() {
    const statusFilter = document.getElementById('status-filter').value;
    const sortOrder = document.getElementById('sort-order').value;
    
    // Simulasi data pesanan
    const orders = [
        {
            id: 'ORD001',
            customer: 'Andi Prasetyo',
            total: 900000,
            status: 'Pending',
            date: '2023-05-15'
        },
        {
            id: 'ORD002',
            customer: 'Budi Santoso',
            total: 760000,
            status: 'Proof Uploaded',
            date: '2023-05-16'
        },
        {
            id: 'ORD003',
            customer: 'Citra Dewi',
            total: 1250000,
            status: 'Paid',
            date: '2023-05-17'
        }
    ];
    
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = '';
    
    // Filter dan sort orders
    let filteredOrders = orders;
    if (statusFilter) {
        filteredOrders = orders.filter(order => order.status === statusFilter);
    }
    
    // Sort orders
    filteredOrders.sort((a, b) => {
        switch (sortOrder) {
            case 'newest':
                return new Date(b.date) - new Date(a.date);
            case 'oldest':
                return new Date(a.date) - new Date(b.date);
            case 'amount-desc':
                return b.total - a.total;
            case 'amount-asc':
                return a.total - b.total;
            default:
                return 0;
        }
    });
    
    filteredOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>Rp ${order.total.toLocaleString('id-ID')}</td>
            <td><span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span></td>
            <td>${order.date}</td>
            <td>
                ${order.status === 'Proof Uploaded' ? 
                    `<button class="action-btn view-proof" onclick="viewProof('${order.id}')">Lihat Bukti</button>` : 
                    `<button class="action-btn update-status" onclick="updateOrderStatus('${order.id}')">Update Status</button>`
                }
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Lihat bukti pembayaran
function viewProof(orderId) {
    // Simulasi gambar bukti pembayaran
    const proofImage = 'https://images.unsplash.com/photo-1612831876377-6159c35b0c0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80';
    document.getElementById('proof-image').src = proofImage;
    document.getElementById('proof-modal').style.display = 'block';
    
    // Set action untuk tombol konfirmasi
    document.getElementById('confirm-payment').onclick = function() {
        confirmPayment(orderId);
    };
}

// Konfirmasi pembayaran
function confirmPayment(orderId) {
    alert(`Pembayaran untuk pesanan ${orderId} telah dikonfirmasi!`);
    document.getElementById('proof-modal').style.display = 'none';
    loadOrders(); // Reload orders
}

// Update status pesanan
function updateOrderStatus(orderId) {
    alert(`Status pesanan ${orderId} telah diperbarui!`);
    loadOrders(); // Reload orders
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
});