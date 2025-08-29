// Ganti dengan URL Web App dari Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw7YiMy8fLh_q5qk_1OpMv4SjO9XVJsTzSO1w7km2XMCv4RYjxdKHMJYNRU9EclY_fH/exec";

/**
 * Fungsi GET (baca data dari Apps Script)
 * @param {string} action - nama aksi (ex: getProducts)
 * @param {object} params - parameter tambahan (optional)
 */
async function apiGet(action){
  const url = `https://script.google.com/macros/s/AKfycbw7YiMy8fLh_q5qk_1OpMv4SjO9XVJsTzSO1w7km2XMCv4RYjxdKHMJYNRU9EclY_fH/exec?action=${action}`;
  const res = await fetch(url);
  return res.json(); // harus array langsung
}
/**
 * Fungsi POST (kirim data ke Apps Script)
 * @param {string} action - nama aksi (ex: addOrder)
 * @param {object} data - data JSON yang dikirim
 */
async function apiPost(action, data = {}) {
  data.action = action;

  let res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) throw new Error("API POST error " + res.status);
  return await res.json();
}

// -----------------------------
// API ENDPOINTS
// -----------------------------

// Ambil semua produk
async function getProducts() {
  return await apiGet("getProducts");
}

// Tambah order baru
async function addOrder(orderData) {
  return await apiPost("addOrder", orderData);
}

// Upload bukti pembayaran (base64)
async function uploadProof(orderId, proofBase64) {
  return await apiPost("uploadProof", { orderId, proof: proofBase64 });
}

// Ambil semua order (admin)
async function getOrders() {
  return await apiGet("getOrders");
}

// Update status order (admin)
async function updateOrderStatus(orderId, status) {
  return await apiPost("updateOrderStatus", { orderId, status });
}

// -----------------------------
// Export ke global supaya bisa dipanggil dari main.js
// -----------------------------
window.getProducts = getProducts;
window.addOrder = addOrder;
window.uploadProof = uploadProof;
window.getOrders = getOrders;
window.updateOrderStatus = updateOrderStatus;
