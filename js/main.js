// simpan cart di localStorage
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}
function addToCart(product) {
  let cart = getCart();
  cart.push(product);
  saveCart(cart);
  alert("Produk ditambahkan ke cart");
}

// halaman index
async function pageIndex() {
  try {
    const products = await getProducts();
    const list = document.getElementById("product-list");
    list.innerHTML = "";
    products.forEach(p => {
      const div = document.createElement("div");
      div.className = "product";
      div.innerHTML = `
        <img src="${p.image_url}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <strong>Rp ${p.price_idr}</strong><br>
        <button onclick='addToCart(${JSON.stringify(p)})'>Tambah</button>
      `;
      list.appendChild(div);
    });
  } catch(err) {
    document.getElementById("product-list").innerText = "Gagal load produk";
    console.error(err);
  }
}

// halaman cart
function pageCart() {
  let cart = getCart();
  const list = document.getElementById("cart-list");
  let total = 0;
  list.innerHTML = "";
  cart.forEach((p, i) => {
    total += Number(p.price_idr);
    let li = document.createElement("li");
    li.innerHTML = `${p.name} - Rp ${p.price_idr} 
      <button onclick="removeFromCart(${i})">Hapus</button>`;
    list.appendChild(li);
  });
  document.getElementById("cart-total").innerText = total;
}

function removeFromCart(i) {
  let cart = getCart();
  cart.splice(i, 1);
  saveCart(cart);
  pageCart();
}

// halaman checkout
function pageCheckout() {
  let cart = getCart();
  let total = cart.reduce((s, p) => s + Number(p.price_idr), 0);
  document.getElementById("checkout-total").innerText = total;

  document.getElementById("checkout-form").onsubmit = async (e) => {
    e.preventDefault();
    let data = {
      name: e.target.name.value,
      phone: e.target.phone.value,
      address: e.target.address.value,
      items: cart,
      total
    };
    try {
      let res = await addOrder(data);
      if(res.success) {
        alert("Pesanan berhasil! Cart dikosongkan.");
        localStorage.removeItem("cart");
        window.location.href = "index.html";
      } else {
        alert("Checkout gagal");
      }
    } catch(err) {
      alert("Checkout error: " + err);
      console.error(err);
    }
  };
}
