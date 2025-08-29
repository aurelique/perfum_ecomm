// ----------------- CART -----------------
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ----------------- INDEX PAGE -----------------
async function pageIndex() {
  try {
    const products = await getProducts();
    if (!Array.isArray(products)) throw new Error("Format salah");

    const list = document.getElementById("product-list");
    list.innerHTML = "";

    products.forEach(p => {
      const div = document.createElement("div");
      div.className = "product";
      div.innerHTML = `
        <img src="${p.image_url}" alt="${p.name}" />
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <strong>Rp ${p.price_idr.toLocaleString()}</strong>
        <button onclick="addToCart('${p.id}','${p.name}',${p.price_idr})">Add to Cart</button>
      `;
      list.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    alert("Gagal load produk");
  }
}

function addToCart(id, name, price) {
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  saveCart(cart);
  alert("Produk ditambahkan ke cart!");
}

// ----------------- CART PAGE -----------------
function pageCart() {
  const cart = getCart();
  const list = document.getElementById("cart-list");
  list.innerHTML = "";

  let total = 0;
  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    const li = document.createElement("li");
    li.innerHTML = `${item.name} x${item.qty} - Rp ${item.price.toLocaleString()} 
      <button onclick="removeFromCart(${idx})">Remove</button>`;
    list.appendChild(li);
  });

  document.getElementById("cart-total").innerText = "Rp " + total.toLocaleString();
}

function removeFromCart(idx) {
  const cart = getCart();
  cart.splice(idx, 1);
  saveCart(cart);
  pageCart();
}

// ----------------- CHECKOUT PAGE -----------------
async function pageCheckout() {
  const cart = getCart();
  let total = 0;
  cart.forEach(i => total += i.price * i.qty);
  document.getElementById("checkout-total").innerText = "Rp " + total.toLocaleString();

  document.getElementById("checkout-form").addEventListener("submit", async e => {
    e.preventDefault();
    const name = e.target.name.value;
    const phone = e.target.phone.value;
    const address = e.target.address.value;

    try {
      const res = await addOrder({ name, phone, address, items: cart, total });
      if (res.success) {
        alert("Order berhasil! ID: " + res.orderId);
        localStorage.removeItem("cart");

        // redirect ke wa.me admin
        const adminNumber = "6281234567890"; // ganti dengan nomor admin
        const waText = encodeURIComponent(`Halo, saya ${name}, order ID ${res.orderId}, total Rp ${total.toLocaleString()}`);
        window.location.href = `https://wa.me/${adminNumber}?text=${waText}`;
      } else {
        alert("Checkout gagal: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Checkout gagal (network error)");
    }
  });
}