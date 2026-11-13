const API_BASE_URL = "http://localhost:3333/health";
const USE_MOCK = false;

const state = {
  products: [
    {
      id: 1,
      sku: "NPM-001",
      name: "Bomba Hidráulica 1/2 CV",
      category: "Bombas",
      price: 489.9,
      stock: 18,
      active: true,
    },
    {
      id: 2,
      sku: "NPM-002",
      name: "Motor Elétrico 2 CV",
      category: "Motores",
      price: 829.9,
      stock: 7,
      active: true,
    },
    {
      id: 3,
      sku: "NPM-003",
      name: "Painel de Comando Trifásico",
      category: "Painéis",
      price: 1199.0,
      stock: 3,
      active: true,
    },
    {
      id: 4,
      sku: "NPM-004",
      name: "Válvula Solenoide 1/2",
      category: "Válvulas",
      price: 159.9,
      stock: 0,
      active: false,
    },
  ],
  ads: [
    {
      id: 1,
      product: "Bomba Hidráulica 1/2 CV",
      marketplace: "Mercado Livre",
      status: "published",
      price: 489.9,
      updated: "26/09/2026",
    },
    {
      id: 2,
      product: "Motor Elétrico 2 CV",
      marketplace: "Shopee",
      status: "pending",
      price: 829.9,
      updated: "26/09/2026",
    },
    {
      id: 3,
      product: "Painel de Comando Trifásico",
      marketplace: "Amazon",
      status: "error",
      price: 1199,
      updated: "25/09/2026",
    },
    {
      id: 4,
      product: "Válvula Solenoide 1/2",
      marketplace: "Mercado Livre",
      status: "published",
      price: 159.9,
      updated: "24/09/2026",
    },
  ],
  marketplaces: ["Mercado Livre", "Shopee", "Amazon"],
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const savedTheme = localStorage.getItem("nipomaq-theme");
if (savedTheme === "dark") document.body.classList.add("dark");
function updateThemeButton() {
  const dark = document.body.classList.contains("dark");
  $("#themeIcon").textContent = dark ? "☀" : "☾";
  $("#themeText").textContent = dark ? "Modo claro" : "Modo escuro";
}
$("#themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "nipomaq-theme",
    document.body.classList.contains("dark") ? "dark" : "light",
  );
  updateThemeButton();
};
updateThemeButton();

const money = (n) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function statusBadge(s) {
  const labels = { published: "Publicado", pending: "Pendente", error: "Erro" };
  return `<span class="badge ${s}">${labels[s] || s}</span>`;
}
function showToast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2600);
}
function navigate(page) {
  $$(".page").forEach((p) => p.classList.remove("active"));
  $(`#page-${page}`).classList.add("active");
  $$(".nav-item").forEach((b) =>
    b.classList.toggle("active", b.dataset.page === page),
  );
  const titles = {
    dashboard: "Dashboard",
    products: "Produtos",
    ads: "Anúncios",
    create: "Criar anúncio",
  };
  $("#pageTitle").textContent = titles[page];
  if (page === "dashboard") renderDashboard();
  if (page === "products") renderProducts();
  if (page === "ads") renderAds("all");
  if (page === "create") prepareForm();
}
$$(".nav-item").forEach((b) => (b.onclick = () => navigate(b.dataset.page)));
$$("[data-go]").forEach((b) => (b.onclick = () => navigate(b.dataset.go)));

function renderDashboard() {
  $("#statProducts").textContent = state.products.length;
  $("#statPublished").textContent = state.ads.filter(
    (a) => a.status === "published",
  ).length;
  $("#statPending").textContent = state.ads.filter(
    (a) => a.status === "pending",
  ).length;
  $("#statError").textContent = state.ads.filter(
    (a) => a.status === "error",
  ).length;
  $("#recentAds").innerHTML =
    `<table class="table"><thead><tr><th>Produto</th><th>Marketplace</th><th>Status</th><th>Preço</th></tr></thead><tbody>${state.ads
      .slice(0, 5)
      .map(
        (a) =>
          `<tr><td><b>${a.product}</b></td><td>${a.marketplace}</td><td>${statusBadge(a.status)}</td><td>${money(a.price)}</td></tr>`,
      )
      .join("")}</tbody></table>`;
  $("#marketplaceCards").innerHTML = state.marketplaces
    .map(
      (m) =>
        `<div class="marketplace"><div class="logo">${m === "Mercado Livre" ? "ML" : m === "Shopee" ? "SH" : "AM"}</div><div><strong>${m}</strong><small>Conexão disponível</small></div><i class="dot"></i></div>`,
    )
    .join("");
}

function renderProducts() {
  const q = ($("#productSearch").value || "").toLowerCase(),
    filter = $("#productFilter").value;
  const data = state.products.filter(
    (p) =>
      (!q || `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(q)) &&
      (filter === "all" ||
        (filter === "active" && p.active) ||
        (filter === "low" && p.stock <= 5)),
  );
  $("#productsTable").innerHTML =
    `<table class="table"><thead><tr><th>SKU</th><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th></tr></thead><tbody>${data.map((p) => `<tr><td>${p.sku}</td><td><b>${p.name}</b></td><td>${p.category}</td><td>${money(p.price)}</td><td>${p.stock}</td><td>${p.active ? '<span class="badge published">Ativo</span>' : '<span class="badge error">Inativo</span>'}</td></tr>`).join("")}</tbody></table>`;
}
$("#productSearch").oninput = renderProducts;
$("#productFilter").onchange = renderProducts;

function openProductModal() {
  $("#productModal").classList.add("open");
  $("#productForm").reset();
  $("#newActive").checked = true;
  const nextNumber = state.products.length + 1;
  $("#newSku").value = `NPM-${String(nextNumber).padStart(3, "0")}`;
  setTimeout(() => $("#newName").focus(), 50);
}
function closeProductModal() {
  $("#productModal").classList.remove("open");
}
$("#addProductBtn").onclick = openProductModal;
$("#closeProductModal").onclick = closeProductModal;
$("#cancelProduct").onclick = closeProductModal;
$("#productModal").onclick = (e) => {
  if (e.target.id === "productModal") closeProductModal;
};
$("#productForm").onsubmit = async (e) => {
  e.preventDefault();
  const sku = $("#newSku").value.trim();
  const name = $("#newName").value.trim();
  const category = $("#newCategory").value.trim();
  const price = Number($("#newPrice").value);
  const stock = Number($("#newStock").value);
  const active = $("#newActive").checked;

  if (
    !sku ||
    !name ||
    !category ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    showToast("Preencha os dados do produto corretamente.");
    return;
  }
  if (state.products.some((p) => p.sku.toLowerCase() === sku.toLowerCase())) {
    showToast("Já existe um produto com este SKU.");
    return;
  }

  const payload = { sku, name, category, price, stock, active };
  try {
    await api("/products", "POST", payload);
    state.products.push({ id: Date.now(), ...payload });
    closeProductModal();
    renderProducts();
    renderDashboard();
    showToast("Produto adicionado com sucesso.");
  } catch (err) {
    showToast("Erro: " + err.message);
  }
};

function renderAds(status = "all") {
  const data =
    status === "all" ? state.ads : state.ads.filter((a) => a.status === status);
  $("#adsTable").innerHTML =
    `<table class="table"><thead><tr><th>Produto</th><th>Marketplace</th><th>Status</th><th>Preço</th><th>Atualizado</th><th>Ação</th></tr></thead><tbody>${data.map((a) => `<tr><td><b>${a.product}</b></td><td>${a.marketplace}</td><td>${statusBadge(a.status)}</td><td>${money(a.price)}</td><td>${a.updated}</td><td><button class="text-btn" onclick="retryAd(${a.id})">${a.status === "error" ? "Tentar novamente" : "Atualizar"}</button></td></tr>`).join("")}</tbody></table>`;
}
$$(".tab").forEach(
  (t) =>
    (t.onclick = () => {
      $$(".tab").forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      renderAds(t.dataset.status);
    }),
);

function prepareForm() {
  $("#formProduct").innerHTML = state.products
    .map((p) => `<option value="${p.id}">${p.sku} — ${p.name}</option>`)
    .join("");
  $("#marketplaceSelect").innerHTML = state.marketplaces
    .map(
      (m, i) =>
        `<button type="button" class="market-option ${i === 0 ? "active" : ""}" data-market="${m}">${m}</button>`,
    )
    .join("");
  $$(".market-option").forEach(
    (b) =>
      (b.onclick = () => {
        $$(".market-option").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        $("#previewMarketplace").textContent = b.dataset.market;
      }),
  );
  fillFromProduct();
}
function fillFromProduct() {
  const p =
    state.products.find((x) => x.id === $("#formProduct").value) ||
    state.products[0];
  $("#formTitle").value = p.name;
  $("#formPrice").value = p.price;
  $("#formStock").value = p.stock;
  $("#formDescription").value = `${p.name} — produto Nipomaq.`;
  updatePreview();
}
$("#formProduct").onchange = fillFromProduct;
["formTitle", "formPrice", "formStock", "formDescription"].forEach(
  (id) => ($("#" + id).oninput = updatePreview),
);
function updatePreview() {
  $("#previewTitle").textContent = $("#formTitle").value || "Título do anúncio";
  $("#previewPrice").textContent = money(Number($("#formPrice").value) || 0);
  $("#previewStock").textContent = `Estoque: ${$("#formStock").value || 0}`;
  $("#previewDescription").textContent =
    $("#formDescription").value || "A descrição aparecerá aqui.";
}
$("#adForm").onsubmit = async (e) => {
  e.preventDefault();
  const product = state.products.find((p) => p.id === $("#formProduct").value);
  const marketplace = $(".market-option.active").dataset.market;
  const payload = {
    product_id: product.id,
    marketplace,
    title: $("#formTitle").value,
    price: Number($("#formPrice").value),
    stock: Number($("#formStock").value),
    description: $("#formDescription").value,
  };
  try {
    const result = await api("/ads", "POST", payload);
    state.ads.unshift({
      id: Date.now(),
      product: product.name,
      marketplace,
      status: "pending",
      price: payload.price,
      updated: "agora",
    });
    showToast(result.message || "Anúncio gerado e enviado para processamento.");
    navigate("ads");
  } catch (err) {
    showToast("Erro: " + err.message);
  }
};

async function api(path, method = "GET", body = null) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 350));
    return { ok: true, message: "Requisição simulada com sucesso." };
  }
  const res = await fetch(API_BASE_URL + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Erro na API");
  return data;
}
window.retryAd = async (id) => {
  const ad = state.ads.find((a) => a.id === id);
  if (!ad) return;
  try {
    await api(`/ads/${id}/publish`, "POST");
    ad.status = "pending";
    ad.updated = "agora";
    showToast(`Processamento de ${ad.product} iniciado.`);
    renderAds($(".tab.active").dataset.status);
    renderDashboard();
  } catch (e) {
    showToast(e.message);
  }
};

function clock() {
  $("#clock").textContent = new Date().toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
setInterval(clock, 1000);
clock();
renderDashboard();
