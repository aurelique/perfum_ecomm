// URL Web App (hasil deploy Apps Script)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4_80DlESn-zfB6S5W8BLy2DG1Pqo-20evsNgzxCYd5Od6R3sgeZy1UFMCT-p3lEI/exec";

/**
 * Generic GET
 */
async function apiGet(action) {
  const url = `${SCRIPT_URL}?action=${action}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("API GET error " + res.status);
  return res.json();
}

/**
 * Generic POST
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

// ============================
// Endpoints
// ============================
async function getProducts() {
  return await apiGet("getProducts");
}

async function getOrders() {
  return await apiGet("getOrders");
}

async function addOrder(orderData) {
  return await apiPost("addOrder", orderData);
}

async function uploadProof(orderId, proofBase64) {
  return await apiPost("uploadProof", { orderId, proof: proofBase64 });
}

async function updateOrderStatus(orderId, status) {
  return await apiPost("updateOrderStatus", { orderId, status });
}

// expose ke global
window.getProducts = getProducts;
window.getOrders = getOrders;
window.addOrder = addOrder;
window.uploadProof = uploadProof;
window.updateOrderStatus = updateOrderStatus;
