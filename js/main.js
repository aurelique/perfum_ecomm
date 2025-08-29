// ================================
// KONFIGURASI SUPABASE
// ================================
const SUPABASE_URL = "https://tmgkanevoumepdtezzit.supabase.co/"; // 🔑 ganti
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZ2thbmV2b3VtZXBkdGV6eml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODYxNzYsImV4cCI6MjA3MjA2MjE3Nn0.PhNEweJ6CPB8dOaS1gC4WFSGK9r7OlPuWgTcEjxxt78"; // 🔑 ganti
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ================================
// CART MANAGEMENT (LocalStorage)
// ================================
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
  let cart = getCart();
  const found = cart.find(item => item.id === product.id);
  if (found) {
    found.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  alert("✅ Produk ditambahkan ke keranjang!");
}

// ================================
// LOAD PRODUCTS
// ================================
async function loadProducts() {
  const { data: products, error } = await db
    .from("products")
    .select("*")
    .eq("active", true);

  if (error) {
    console.error("❌ Error load produk:", error);
    document.getElementById("product-list").innerHTML = "<p>Gagal load produk</p>";
    return;
  }

  const container = document.getElementById("product-list");
  container.innerHTML = "";

  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${p.image_url}" alt="${p.name}" width="200"/>
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p><strong>Rp ${p.price_idr.toLocaleString()}</strong></p>
      <button onclick='addToCart(${JSON.stringify(p)})'>+ Keranjang</button>
    `;
    container.appendChild(div);
  });
}

// ================================
// RENDER CART
// ================================
function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  container.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price_idr * item.qty;
    const div = document.createElement("div");
    div.innerHTML = `
      ${item.name} x ${item.qty} = Rp ${(item.price_idr * item.qty).toLocaleString()}
    `;
    container.appendChild(div);
  });

  totalEl.innerText = "Rp " + total.toLocaleString();
}

// ================================
// CHECKOUT
// ================================
async function checkout() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("⚠️ Keranjang kosong!");
    return;
  }

  const nama = document.getElementById("cust-name").value;
  const phone = document.getElementById("cust-phone").value;
  const address = document.getElementById("cust-address").value;
  const total = cart.reduce((sum, i) => sum + i.price_idr * i.qty, 0);

  const { data, error } = await db.from("orders").insert([
    {
      customer: nama,
      phone,
      address,
      items: cart,
      total_idr: total,
      status: "pending"
    }
  ]);

  if (error) {
    console.error("❌ Checkout gagal:", error);
    alert("Checkout gagal, coba lagi!");
    return;
  }

  alert("✅ Pesanan berhasil!");
  localStorage.removeItem("cart");
  window.location.href = "index.html";
}

// ================================
// PAGE INIT
// ================================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("product-list")) loadProducts();
  if (document.getElementById("cart-items")) renderCart();
  if (document.getElementById("checkout-btn")) {
    document.getElementById("checkout-btn").addEventListener("click", checkout);
  }
});
