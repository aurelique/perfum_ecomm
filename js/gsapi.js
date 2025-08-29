// ==============================
// KONFIGURASI
// ==============================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw7YiMy8fLh_q5qk_1OpMv4SjO9XVJsTzSO1w7km2XMCv4RYjxdKHMJYNRU9EclY_fH/exec";

// ==============================
// FUNGSI DASAR API
// ==============================

/**
 * Fungsi GET (baca data dari Apps Script)
 * @param {string} action - nama aksi (ex: listProducts)
 */
async function apiGet(action){
  const url = `${SCRIPT_URL}?action=${action}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("API GET error " + res.status);
  return res.json(); // langsung return array/object
}

/**
 * Fungsi POST (kirim data ke Apps Script)
 * @param {string} action - nama aksi (ex: addOrder)
 * @param {object} data - payload JSON
 */
async function apiPost(action, data = {}) {
  data.action = action;

  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) throw new Error("API POST error " + res.status);
  return res.json();
}

// ==============================
// API KHUSUS (sesuai kebutuhan sistem)
// ==============================

// Produk
async function listProducts() {
  return await apiGet("listProducts"); // dipakai di pageIndex()
}

// Order
async function addOrder(orderData) {
  return await apiPost("addOrder", orderData);
}

async function uploadProof(orderId, proofBase64) {
  return await apiPost("uploadProof", { orderId, proof: proofBase64 });
}

async function listOrders() {
  return await apiGet("listOrders");
}

async function updateOrderStatus(orderId, status) {
  return await apiPost("updateOrderStatus", { orderId, status });
}

// Settings (misalnya nomor WA admin, nomor rekening BCA)
async function getSettings() {
  return await apiGet("settings");
}

// ==============================
// EKSPOR KE GLOBAL
// ==============================
window.apiGet = apiGet;
window.apiPost = apiPost;

window.listProducts = listProducts;
window.addOrder = addOrder;
window.uploadProof = uploadProof;
window.listOrders = listOrders;
window.updateOrderStatus = updateOrderStatus;
window.getSettings = getSettings;
