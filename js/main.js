// =========================
// MAIN.JS FRONTEND
// =========================

// Simpan keranjang di localStorage
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}
function addToCart(product) {
  let cart = getCart();
  let existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  alert("Ditambahkan ke keranjang!");
}

// Render produk di index.html
async function pageIndex() {
  const productList = document.getElementById("product-list");
  if (!productList) return;

  try {
    let products = await getProducts(); // dari gsapi.js
    console.log("Produk dari API:", products);

    if (!Array.isArray(products)) {
      productList.innerHTML = "<p>Gagal load produk (format salah).</p>";
      return;
    }

    if (products.length === 0) {
      productList.innerHTML = "<p>Belum ada produk tersedia.</p>";
      return;
    }

    productList.innerHTML = products.map(p => `
      <div class="product-card">
        <img src="${p.image_url}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <p><strong>Rp ${Number(p.price_idr).toLocaleString("id-ID")}</strong></p>
        <button onclick='addToCart(${JSON.stringify(p)})'>Tambah ke Cart</button>
      </div>
    `).join("");

  } catch (err) {
    console.error("Error load produk:", err);
    productList.innerHTML = "<p>Error mengambil produk.</p>";
  }
}

// Render keranjang di cart.html
function pageCart() {
  const cartItems = document.getElementById("cart-items");
  if (!cartItems) return;

  let cart = getCart();
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Keranjang kosong.</p>";
    document.getElementById("cart-total").innerText = "Rp 0";
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    let sub = item.qty * Number(item.price_idr);
    total += sub;
    return `
      <div class="cart-row">
        <span>${item.name} x ${item.qty}</span>
        <span>Rp ${sub.toLocaleString("id-ID")}</span>
      </div>
    `;
  }).join("");

  document.getElementById("cart-total").innerText = 
    "Rp " + total.toLocaleString("id-ID");
}

// Proses checkout di checkout.html
function pageCheckout() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let cart = getCart();
    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }

    let data = {
      name: form.name.value,
      phone: form.phone.value,
      address: form.address.value,
      cart: cart
    };

    try {
      let res = await addOrder(data);
      console.log("Order berhasil:", res);

      // reset keranjang
      saveCart([]);
      alert("Pesanan berhasil dibuat!");

      // redirect ke WA admin
      let msg = `Halo admin, saya pesan:\n\n${cart.map(i => `- ${i.name} x ${i.qty}`).join("\n")}\n\nNama: ${data.name}\nTelp: ${data.phone}\nAlamat: ${data.address}`;
      window.location.href = `https://wa.me/62XXXXXXXXXX?text=${encodeURIComponent(msg)}`;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Gagal membuat pesanan.");
    }
  });
}

// =========================
// AUTO INIT PAGE
// =========================
document.addEventListener("DOMContentLoaded", () => {
  pageIndex();
  pageCart();
  pageCheckout();
});
