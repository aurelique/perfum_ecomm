// ==============================
// CART (in-memory, tanpa localStorage)
// ==============================
let cart = [];

// Tambah produk ke cart
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  alert(`${product.name} ditambahkan ke keranjang!`);
}

// Ambil cart (supaya bisa dipakai di cart.html & checkout.html)
function getCart() {
  return cart;
}

// ==============================
// RENDER PRODUK DI INDEX
// ==============================
async function pageIndex() {
  try {
    const products = await getProducts();

    const container = document.getElementById("product-list");
    container.innerHTML = "";

    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML = "<p>Tidak ada produk tersedia.</p>";
      return;
    }

    products.forEach(p => {
      // hanya tampilkan produk aktif
      if (p.active && (p.active.toString().toLowerCase() === "true" || p.active === "1")) {
        const card = document.createElement("div");
        card.className = "product-card";
        card.setAttribute("data-aos", "fade-up");

        card.innerHTML = `
          <img src="${p.image_url}" alt="${p.name}" class="product-img" />
          <h3>${p.name}</h3>
          <p class="price">Rp ${Number(p.price_idr).toLocaleString("id-ID")}</p>
          <p class="desc">${p.description}</p>
          <button class="btn-add">Tambah ke Keranjang</button>
        `;

        // event tombol add to cart
        card.querySelector(".btn-add").addEventListener("click", () => addToCart(p));

        container.appendChild(card);
      }
    });
  } catch (err) {
    console.error("Error load produk:", err);
    document.getElementById("product-list").innerHTML = "<p>Gagal load produk.</p>";
  }
}

// ==============================
// HALAMAN CART
// ==============================
function pageCart() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Keranjang kosong.</p>";
    totalEl.innerText = "Rp 0";
    return;
  }

  let total = 0;
  cart.forEach(item => {
    total += item.qty * item.price_idr;

    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <span>${item.name}</span>
      <span>${item.qty} x Rp ${Number(item.price_idr).toLocaleString("id-ID")}</span>
    `;
    container.appendChild(row);
  });

  totalEl.innerText = "Rp " + total.toLocaleString("id-ID");
}

// ==============================
// HALAMAN CHECKOUT
// ==============================
function pageCheckout() {
  const form = document.getElementById("checkout-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }

    const customerName = form.querySelector("[name='name']").value;
    const customerPhone = form.querySelector("[name='phone']").value;
    const customerAddress = form.querySelector("[name='address']").value;

    const orderData = {
      name: customerName,
      phone: customerPhone,
      address: customerAddress,
      cart: cart,
      total: cart.reduce((sum, item) => sum + (item.qty * item.price_idr), 0),
      status: "Pending"
    };

    try {
      const res = await addOrder(orderData);
      alert("Pesanan berhasil dibuat! Silakan transfer ke rekening BCA 1234567890 a/n Parfumeria");

      // Redirect ke WhatsApp admin dengan pesan otomatis
      const waText = encodeURIComponent(
        `Halo Admin, saya sudah checkout parfum.\n\nNama: ${customerName}\nTotal: Rp ${orderData.total.toLocaleString("id-ID")}\nMohon konfirmasi.`
      );
      window.location.href = `https://wa.me/6281234567890?text=${waText}`;
    } catch (err) {
      console.error("Error checkout:", err);
      alert("Checkout gagal. Coba lagi!");
    }
  });
}

// ==============================
// DETEKSI HALAMAN & JALANKAN
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.contains(document.getElementById("product-list"))) {
    pageIndex();
  }
  if (document.body.contains(document.getElementById("cart-items"))) {
    pageCart();
  }
  if (document.body.contains(document.getElementById("checkout-form"))) {
    pageCheckout();
  }
});

// ==============================
// EXPORT GLOBAL
// ==============================
window.getCart = getCart;
window.addToCart = addToCart;
