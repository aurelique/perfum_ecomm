// ============================
// MAIN.JS
// ============================

// Load produk dari Google Sheets
async function loadProducts() {
  try {
    const products = await getProducts(); // dari gsapi.js
    const container = document.getElementById("product-list");
    if (!container) return;

    container.innerHTML = "";

    products.forEach(p => {
      if (!p.active) return;
      container.innerHTML += `
        <div class="product-card">
          <img src="${p.image_url}" alt="${p.name}" />
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <strong>Rp ${Number(p.price_idr).toLocaleString("id-ID")}</strong>
          <button onclick="addToCart('${p.id}','${p.name}',${p.price_idr})">Tambah ke Keranjang</button>
        </div>
      `;
    });
  } catch (err) {
    console.error("Gagal load produk", err);
    document.getElementById("product-list").innerHTML = "<p>Gagal load produk.</p>";
  }
}

// ============================
// CART (pakai sessionStorage)
// ============================

function getCart() {
  return JSON.parse(sessionStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  sessionStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(id, name, price) {
  let cart = getCart();
  let existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  saveCart(cart);
  alert("Produk ditambahkan ke keranjang!");
}

// Render cart di cart.html
function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cart-list");
  const totalBox = document.getElementById("cart-total");

  if (!container) return;

  container.innerHTML = "";
  let total = 0;

  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    container.innerHTML += `
      <div class="cart-item">
        <span>${item.name}</span>
        <span>Rp ${item.price.toLocaleString("id-ID")}</span>
        <span>Qty: ${item.qty}</span>
        <button onclick="removeCartItem(${idx})">Hapus</button>
      </div>
    `;
  });

  totalBox.innerText = "Total: Rp " + total.toLocaleString("id-ID");
}

function removeCartItem(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// ============================
// CHECKOUT
// ============================

async function handleCheckout() {
  const name = document.getElementById("cust-name").value;
  const phone = document.getElementById("cust-phone").value;
  const address = document.getElementById("cust-address").value;
  const proofFile = document.getElementById("payment-proof").files[0];

  if (!name || !phone || !address || !proofFile) {
    alert("Lengkapi semua field dan upload bukti transfer!");
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    alert("Keranjang kosong!");
    return;
  }

  // Convert bukti ke base64
  const reader = new FileReader();
  reader.onloadend = async function() {
    const proofBase64 = reader.result.split(",")[1];

    const orderData = {
      customer_name: name,
      customer_phone: phone,
      customer_address: address,
      cart: cart,
      total: cart.reduce((s, i) => s + i.price * i.qty, 0)
    };

    try {
      const res = await addOrder(orderData);
      await uploadProof(res.orderId, proofBase64);

      // Clear cart
      sessionStorage.removeItem("cart");

      // Redirect ke WhatsApp admin
      const adminPhone = "6283840556211"; // ganti nomor admin
      const text = `Halo admin, saya ${name} sudah transfer untuk order #${res.orderId}. Mohon dicek ya.`;
      window.location.href = `https://wa.me/${adminPhone}?text=${encodeURIComponent(text)}`;
    } catch (err) {
      console.error(err);
      alert("Checkout gagal!");
    }
  };
  reader.readAsDataURL(proofFile);
}
