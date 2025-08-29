// Ganti dengan URL Web App Apps Script (Deploy → Web App → URL)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4_80DlESn-zfB6S5W8BLy2DG1Pqo-20evsNgzxCYd5Od6R3sgeZy1UFMCT-p3lEI/exec";

// Fungsi GET
async function apiGet(action) {
  const url = `${SCRIPT_URL}?action=${action}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

// Fungsi POST
async function apiPost(action, data = {}) {
  data.action = action;
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error("API POST error " + res.status);
  return await res.json();
}

// API Wrappers
async function listProducts() { return await apiGet("listProducts"); }
async function addOrder(orderData) { return await apiPost("addOrder", orderData); }
async function uploadProof(orderId, proofBase64) { return await apiPost("uploadProof", { orderId, proof: proofBase64 }); }
async function getOrders() { return await apiGet("getOrders"); }
async function updateOrderStatus(orderId, status) { return await apiPost("updateOrderStatus", { orderId, status }); }
async function getSettings() { return await apiGet("settings"); }

// Export global
window.listProducts = listProducts;
window.addOrder = addOrder;
window.uploadProof = uploadProof;
window.getOrders = getOrders;
window.updateOrderStatus = updateOrderStatus;
window.getSettings = getSettings;
