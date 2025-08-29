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

// Logout - Kembali ke homepage
function logout() {
    localStorage.removeItem('adminLoggedIn');
    isAdminLoggedIn = false;
    window.location.href = '../index.html';
}

// Load admin products
async function loadAdminProducts() {
    try {
        const products = await fetchProducts();
        const container = document.getElementById('admin-products-container');
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
                    <div class="admin-product-actions">
                        <button class="action-btn">Edit</button>
                        <button class="action-btn" style="background: #dc3545;">Hapus</button>
                    </div>
                </div>
            `;
            container.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error loading admin products:', error);
    }
}

// Tambah produk baru
async function addNewProduct() {
    const name = document.getElementById('product-name').value;
    const price = document.getElementById('product-price').value;
    const description = document.getElementById('product-description').value;
    const image = document.getElementById('product-image').value;
    
    if (!name || !price || !description || !image) {
        alert('Harap lengkapi semua field');
        return;
    }
    
    try {
        const productData = {
            name: name,
            price: parseFloat(price),
            description: description,
            image_url: image
        };
        
        const response = await addProduct(productData);
        
        if (response.success) {
            alert(`Produk "${name}" berhasil ditambahkan!`);
            document.getElementById('add-product-form').reset();
            loadAdminProducts();
        } else {
            alert('Gagal menambahkan produk: ' + (response.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Terjadi kesalahan saat menambahkan produk');
    }
}

// Load orders
async function loadOrders() {
    try {
        const statusFilter = document.getElementById('status-filter').value;
        const sortOrder = document.getElementById('sort-order').value;
        
        const orders = await fetchOrders();
        
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
                    return b.total_price - a.total_price;
                case 'amount-asc':
                    return a.total_price - b.total_price;
                default:
                    return 0;
            }
        });
        
        filteredOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.customer_name}</td>
                <td>Rp ${parseInt(order.total_price).toLocaleString('id-ID')}</td>
                <td><span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span></td>
                <td>${new Date(order.date).toLocaleDateString('id-ID')}</td>
                <td>
                    ${order.status === 'Proof Uploaded' ? 
                        `<button class="action-btn view-proof" onclick="viewProof('${order.id}')">Lihat Bukti</button>` : 
                        `<button class="action-btn update-status" onclick="updateOrderStatus('${order.id}')">Update Status</button>`
                    }
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Lihat bukti pembayaran
async function viewProof(orderId) {
    // Untuk saat ini, kita hanya menampilkan pesan
    // Dalam implementasi nyata, Anda bisa mengambil base64 dari Google Sheets
    alert('Fitur lihat bukti pembayaran akan menampilkan gambar dari database');
    
    // Contoh implementasi jika Anda ingin menampilkan gambar:
    // 1. Ambil base64 dari Google Sheets
    // 2. Decode base64 ke gambar
    // 3. Tampilkan di modal
}

// Update status pesanan
async function updateOrderStatus(orderId) {
    try {
        const response = await updateOrderStatusAPI(orderId, 'Paid');
        
        if (response.success) {
            alert(`Status pesanan ${orderId} telah diperbarui menjadi Paid!`);
            loadOrders(); // Reload orders
        } else {
            alert('Gagal memperbarui status pesanan');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Terjadi kesalahan saat memperbarui status pesanan');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    
    // Load products if on dashboard
    if (document.getElementById('admin-products-container')) {
        loadAdminProducts();
    }
    
    // Load orders if on orders page
    if (document.getElementById('orders-table-body')) {
        loadOrders();
    }
});