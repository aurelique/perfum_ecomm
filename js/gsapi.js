const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4_80DlESn-zfB6S5W8BLy2DG1Pqo-20evsNgzxCYd5Od6R3sgeZy1UFMCT-p3lEI/exec";

// Generic GET
async function apiGet(action){
  const res = await fetch(`${SCRIPT_URL}?action=${action}`);
  return res.json();
}

// Generic POST
async function apiPost(action, data = {}) {
  data.action = action;
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {"Content-Type": "application/json"}
  });
  return res.json();
}

// Exports
window.getProducts = ()=> apiGet("getProducts");
window.getOrders = ()=> apiGet("getOrders");
window.getSettings = ()=> apiGet("getSettings");
window.addOrder = (d)=> apiPost("addOrder", d);
window.updateOrderStatus = (id,status)=> apiPost("updateOrderStatus",{orderId:id,status});
