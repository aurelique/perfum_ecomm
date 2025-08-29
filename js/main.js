// ====== INDEX: LIST PRODUK ======
async function pageIndex() {
  const grid = document.getElementById('product-grid'); if (!grid) return;
  const products = await listProducts();
  const items = getCart();

  function add(pid) {
    const f = items.find(x => x.product_id === pid);
    if (f) f.qty += 1; else items.push({ product_id: pid, qty: 1 });
    saveCart(items);
    alert('Ditambahkan ke keranjang');
  }

  grid.innerHTML = products.map(p => `
    <div class="card">
      <img src="${p.image_url || ''}" alt="${p.name}" style="width:100%;height:180px;object-fit:cover"/>
      <h3>${p.name}</h3>
      <p>${p.description || ''}</p>
      <div class="row" style="justify-content:space-between">
        <span class="price">${fmtIDR(p.price_idr)}</span>
        <button class="btn" data-id="${p.id}">Add</button>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('button[data-id]').forEach(b =>
    b.addEventListener('click', () => add(b.dataset.id))
  );
}

// ====== CART PAGE ======
async function pageCart() {
  const list = document.getElementById('cart-list'); if (!list) return;
  const totalEl = document.getElementById('cart-total');
  const items = getCart();
  const products = await listProducts(); const map = {}; products.forEach(p => map[p.id] = p);

  function render() {
    let total = 0;
    list.innerHTML = items.map(it => {
      const p = map[it.product_id]; if (!p) return '';
      const sub = (p.price_idr || 0) * (it.qty || 1); total += sub;
      return `<div class="card row" style="justify-content:space-between">
        <div class="row" style="gap:12px">
          <img src="${p.image_url}" style="width:64px;height:64px;object-fit:cover"/>
          <div>
            <div>${p.name}</div>
            <div class="muted">${fmtIDR(p.price_idr)} × 
              <input type="number" min="1" value="${it.qty}" data-id="${it.product_id}" style="width:64px"/>
            </div>
          </div>
        </div>
        <strong>${fmtIDR(sub)}</strong>
      </div>`;
    }).join('');
    totalEl.textContent = fmtIDR(total);
    list.querySelectorAll('input[type="number"]').forEach(inp => {
      inp.addEventListener('change', () => {
        const x = items.find(i => i.product_id === inp.dataset.id);
        x.qty = Math.max(1, parseInt(inp.value || '1', 10));
        saveCart(items); render();
      });
    });
  }
  render();
}

// ====== CHECKOUT PAGE ======
async function pageCheckout() {
  const form = document.getElementById('checkout-form'); if (!form) return;
  const st = await getSettings();
  const bcaInfo = document.getElementById('bca-info');
  if (bcaInfo) bcaInfo.textContent = `Transfer BCA: ${st.bca_account_number}`;

  let lastOrder = null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const items = getCart(); if (items.length === 0) { alert('Keranjang kosong'); return; }
    const fd = new FormData(form);
    const customer = Object.fromEntries(fd.entries());

    const res = await addOrder({ customer, items });
    lastOrder = res;
    document.getElementById('order-msg').textContent =
      `Pesanan dibuat: ${res.order_id} • Total ${fmtIDR(res.total_idr)}. ` +
      `Silakan transfer ke ${st.bca_account_number}, lalu upload bukti di bawah.`;
    document.getElementById('after-order').style.display = 'block';
  });

  document.getElementById('btn-upload-proof').addEventListener('click', async () => {
    if (!lastOrder) { alert('Buat pesanan dulu'); return; }
    const file = document.getElementById('proof-file').files[0];
    if (!file) { alert('Pilih gambar bukti'); return; }
    const base64 = await fileToBase64Compressed(file, 1200, 0.8);

    await uploadProof(lastOrder.order_id, base64);

    const txt = `Halo Admin, saya sudah transfer.
Nama: ${document.querySelector('[name="name"]').value}
Order ID: ${lastOrder.order_id}
Total: ${fmtIDR(lastOrder.total_idr)}
No. WA: ${document.querySelector('[name="phone"]').value}`;

    const wa = `https://wa.me/${st.admin_whatsapp_number}?text=${encodeURIComponent(txt)}`;

    saveCart([]);
    location.href = wa;
  });
}

// ====== HELPER ======
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}
function saveCart(items) {
  localStorage.setItem('cart', JSON.stringify(items));
}
function fmtIDR(num) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num || 0);
}
function fileToBase64Compressed(file, maxW, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxW / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality).split(",")[1]);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ====== BOOT ======
document.addEventListener('DOMContentLoaded', () => {
  pageIndex();
  pageCart();
  pageCheckout();
});
