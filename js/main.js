// ================================
// KONFIGURASI SUPABASE
// ================================
const SUPABASE_URL = "https://tmgkanevoumepdtezzit.supabase.co"; // ⚡ tanpa slash
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZ2thbmV2b3VtZXBkdGV6eml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODYxNzYsImV4cCI6MjA3MjA2MjE3Nn0.PhNEweJ6CPB8dOaS1gC4WFSGK9r7OlPuWgTcEjxxt78";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ================================
// LOAD PRODUCTS
// ================================
async function loadProducts() {
  const { data: products, error } = await db
    .from("products")
    .select("*"); // ⚡ hapus filter active

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
      <p>${p.description || ""}</p>
      <p><strong>Rp ${p.price_idr.toLocaleString("id-ID")}</strong></p>
      <button onclick='addToCart(${JSON.stringify(p)})'>+ Keranjang</button>
    `;
    container.appendChild(div);
  });
}
