// ===== Utils =====
// ====== CART STORAGE ======
function getCart(){
  try { return JSON.parse(localStorage.getItem('cart')||'[]'); }
  catch(e){ return []; }
}
function saveCart(items){
  localStorage.setItem('cart', JSON.stringify(items));
}
function fmtIDR(x){
  return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(x||0);
}

// ===== Index (Product Grid) =====
async function pageIndex(){
  const grid = document.getElementById("product-grid"); if(!grid) return;
  const products = await getProducts();
  const items = getCart();

  function add(pid){
    const f = items.find(x=>x.product_id===pid);
    if(f) f.qty+=1; else items.push({product_id:pid, qty:1});
    saveCart(items);
    alert("Ditambahkan ke keranjang");
  }

  grid.innerHTML = products.map(p=>`
    <div class="card">
      <img src="${p.image_url}" alt="${p.name}" style="width:100%;height:180px;object-fit:cover"/>
      <h3>${p.name}</h3>
      <p>${p.description||""}</p>
      <div class="row" style="justify-content:space-between">
        <span>${fmtIDR(p.price_idr)}</span>
        <button data-id="${p.id}">Add</button>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll("button[data-id]").forEach(b=>
    b.addEventListener("click", ()=> add(b.dataset.id)));
}

// ===== Cart =====
async function pageCart(){
  const list = document.getElementById("cart-list"); if(!list) return;
  const totalEl = document.getElementById("cart-total");
  const items = getCart();
  const products = await getProducts(); const map={}; products.forEach(p=>map[p.id]=p);

  function render(){
    let total=0;
    list.innerHTML = items.map(it=>{
      const p = map[it.product_id]; if(!p) return "";
      const sub = (p.price_idr||0)*(it.qty||1); total+=sub;
      return `<div class="row card">
        <div>${p.name} × <input type="number" min="1" value="${it.qty}" data-id="${it.product_id}" style="width:60px"/></div>
        <strong>${fmtIDR(sub)}</strong>
      </div>`;
    }).join("");
    totalEl.textContent = fmtIDR(total);
    list.querySelectorAll("input").forEach(inp=>{
      inp.addEventListener("change", ()=>{
        const x = items.find(i=>i.product_id===inp.dataset.id);
        x.qty = Math.max(1, parseInt(inp.value||"1",10));
        saveCart(items); render();
      });
    });
  }
  render();
}

// ===== Checkout =====
async function pageCheckout(){
  const form = document.getElementById("checkout-form"); if(!form) return;
  const st = await getSettings();
  document.getElementById("bca-info").textContent = "Transfer BCA: " + st.bca_account_number;

  let lastOrder=null;

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const items = getCart(); if(items.length===0){ alert("Keranjang kosong"); return; }
    const fd = new FormData(form);
    const customer={
      name:fd.get("name"), phone:fd.get("phone"),
      email:fd.get("email"), address:fd.get("address"),
      city:fd.get("city"), postal_code:fd.get("postal_code")
    };
    const res = await addOrder({customer, items, payment_proof_base64:null});
    lastOrder=res;
    document.getElementById("order-msg").textContent = `Pesanan ${res.order_id} • Total ${fmtIDR(res.total_idr)}. Transfer ke ${st.bca_account_number}.`;
    document.getElementById("after-order").style.display="block";
  });

  document.getElementById("btn-upload-proof").addEventListener("click", async ()=>{
    if(!lastOrder){ alert("Buat pesanan dulu"); return; }
    const file = document.getElementById("proof-file").files[0];
    if(!file){ alert("Pilih bukti"); return; }
    const reader = new FileReader();
    reader.onload= async ()=>{
      const base64=reader.result.split(",")[1];
      await addOrder({ // simpan dummy dengan proof
        customer:{name:"(proof only)",phone:""},
        items:[{product_id:"__proof__",qty:0,ref:lastOrder.order_id}],
        payment_proof_base64:base64
      });

      saveCart([]);
      const txt=`Halo Admin, saya sudah transfer.
Nama: ${form.querySelector("[name=name]").value}
Order ID: ${lastOrder.order_id}
Total: ${fmtIDR(lastOrder.total_idr)}
WA: ${form.querySelector("[name=phone]").value}`;
      location.href=`https://wa.me/${st.admin_whatsapp_number}?text=${encodeURIComponent(txt)}`;
    };
    reader.readAsDataURL(file);
  });
}

// ===== Boot =====
document.addEventListener("DOMContentLoaded", ()=>{
  pageIndex(); pageCart(); pageCheckout();
});
