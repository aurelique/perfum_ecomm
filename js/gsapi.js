// Ganti dengan URL Web App dari Google Apps Script (yang /exec)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4_80DlESn-zfB6S5W8BLy2DG1Pqo-20evsNgzxCYd5Od6R3sgeZy1UFMCT-p3lEI/exec";

async function apiGet(action) {
  const url = `${SCRIPT_URL}?action=${action}`;
  const res = await fetch(url);
  return res.json();
}

async function apiPost(action, data = {}) {
  data.action = action;
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });
  return res.json();
}

// API ENDPOINTS
async function getProducts() { return await apiGet("getProducts"); }
async function addOrder(orderData) { return await apiPost("addOrder", orderData); }
async function uploadProof(orderId, proofBase64) { return await apiPost("uploadProof", { orderId, proof: proofBase64 }); }
async function getOrders() { return await apiGet("getOrders"); }
async function updateOrderStatus(orderId, status) { return await apiPost("updateOrderStatus", { orderId, status }); }

// Export global
window.getProducts = getProducts;
window.addOrder = addOrder;
window.uploadProof = uploadProof;
window.getOrders = getOrders;
window.updateOrderStatus = updateOrderStatus;
