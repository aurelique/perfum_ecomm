// ====== INDEX: LIST PRODUK ======
async function pageIndex(){
  const grid = document.getElementById('product-grid'); 
  if(!grid) return;

  const products = await getProducts(); // pakai wrapper dari gsapi.js
  const items = getCart();

  function add(pid){
    const f = items.find(x=>x.product_id===pid);
    if(f) f.qty+=1; else items.push({product_id:pid, qty:1});
    saveCart(items);
    alert('Ditambahkan ke keranjang');
  }

  grid.innerHTML = products.map(p=>`
    <div class="card" data-reveal>
      <img class="round" src="${p.imageURL||''}" alt="${p.name}" style="width:100%;height:180px;object-fit:cover"/>
      <h3>${p.name}</h3>
      <p class="muted">${p.description||''}</p>
      <div class="row" style="justify-content:space-between">
        <span class="price">${fmtIDR(p.price)}</span>
        <button class="btn" data-id="${p.id}">Add</button>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('button[data-id]').forEach(b=> 
    b.addEventListener('click', ()=> add(b.dataset.id))
  );
}

// ====== CART PAGE ======
async function pageCart(){
  const list = document.getElementById('cart-list'); 
  if(!list) return;

  const totalEl = document.getElementById('cart-total');
  const items = getCart();
  const products = await getProducts(); 
  const map={}; 
  products.forEach(p=>map[p.id]=p);

  function render(){
    let total=0;
    list.innerHTML = items.map(it=>{
      const p = map[it.product_id]; if(!p) return '';
      const sub = (p.price||0)*(it.qty||1); total+=sub;
      return `<div class="card row" style="justify-content:space-between">
        <div class="row" style="gap:12px">
          <img src="${p.imageURL}" class="round" style="width:64px;height:64px;object-fit:cover"/>
          <div><div>${p.name}</div>
          <div class="muted">${fmtIDR(p.price)} × <input type="number" min="1" value="${it.qty}" data-id="${it.product_id}" style="width:64px"/></div></div>
        </div>
        <strong>${fmtIDR(sub)}</strong>
      </div>`;
    }).join('');
    totalEl.textContent = fmtIDR(total);
    list.querySelectorAll('input[type="number"]').forEach(inp=>{
      inp.addEventListener('change', ()=>{
        const x = items.find(i=>i.product_id===inp.dataset.id);
        x.qty = Math.max(1, parseInt(inp.value||'1',10));
        saveCart(items); render();
      });
    });
  }
  render();
}

// ====== CHECKOUT PAGE ======
async function pageCheckout(){
  const form = document.getElementById('checkout-form'); 
  if(!form) return;

  // sementara: setting manual (karena belum ada endpoint getSettings)
  const st = { 
    bca_account_number: "1234567890",
    admin_whatsapp_number: "6281234567890"
  };
  const bcaInfo = document.getElementById('bca-info'); 
  if(bcaInfo) bcaInfo.textContent = `Transfer BCA: ${st.bca_account_number}`;

  let lastOrder = null;

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const items = getCart(); 
    if(items.length===0){ alert('Keranjang kosong'); return; }

    const fd = new FormData(form);
    const customer = {
      name: fd.get('name'), phone: fd.get('phone'),
      email: fd.get('email'), address: fd.get('address'),
      city: fd.get('city'), postal_code: fd.get('postal_code')
    };

    const res = await addOrder({ customer, items, payment_proof_base64: null });
    lastOrder = res;

    document.getElementById('order-msg').textContent = 
      `Pesanan dibuat: ${res.order_id} • Total ${fmtIDR(res.total)}. ` + 
      `Silakan transfer ke ${st.bca_account_number}, lalu upload bukti di bawah.`;
    document.getElementById('after-order').style.display = 'block';
  });

  // Upload bukti transfer → WA redirect
  document.getElementById('btn-upload-proof').addEventListener('click', async ()=>{
    if(!lastOrder){ alert('Buat pesanan dulu'); return; }
    const file = document.getElementById('proof-file').files[0];
    if(!file){ alert('Pilih gambar bukti'); return; }
    const base64 = await fileToBase64Compressed(file, 1200, 0.8);

    try{
      await uploadProof(lastOrder.order_id, base64);
    }catch(e){ console.error(e); }

    const txt =
`Halo Admin, saya sudah transfer.
Nama: ${document.querySelector('[name="name"]').value}
Order ID: ${lastOrder.order_id}
Total: ${fmtIDR(lastOrder.total)}
No. WA: ${document.querySelector('[name="phone"]').value}`;
    const wa = `https://wa.me/${st.admin_whatsapp_number}?text=${encodeURIComponent(txt)}`;

    saveCart([]);
    location.href = wa;
  });
}

// ====== BOOT ======
document.addEventListener('DOMContentLoaded', ()=>{
  pageIndex();
  pageCart();
  pageCheckout();
});
