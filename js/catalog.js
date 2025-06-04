import {
    collection,
    query,
    where,
    getDocs
  } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
  
  import { db } from "/scanmaster/js/firebase-init.js";
  import { addToBasket, getBasketQuantity, setBasketQuantity } from "/scanmaster/js/basket-utils.js";

document.addEventListener('DOMContentLoaded', () => {
  const catalogContainer = document.getElementById("productGrid");
  document.getElementById('searchInput').addEventListener('input', debounce(loadCatalog, 300));
  const filterCheckboxes = document.querySelectorAll(".filters input[type='checkbox']");
  
  if (!db || !catalogContainer) {
    console.error("❌ Firebase или контейнер не найден");
  } else {
    loadCatalog();
  }
  
  searchInput.addEventListener("input", loadCatalog);
  filterCheckboxes.forEach(cb => {
    cb.addEventListener("change", loadCatalog);
  });
  
  function renderBuySection(card, product, quantity) {
    const { slug, price, towb, tooz, toym } = product;
    const buySection = card.querySelector('.buy-section');
    if (!buySection) return;
    buySection.innerHTML = `
      <div class="buy-controls">
        ${quantity > 0 ? `
          <div class="quantity-controls" data-slug="${slug}">
            <button class="decrease">−</button>
            <input type="number" class="quantity-input" min="1" value="${quantity}" data-slug="${slug}" />
            <button class="increase">+</button>
          </div>
        ` : `
          <a href="#" class="buy-btn">Купить</a>
        `}
      </div>
      <div class="marketplace-buttons">
        ${towb ? `<a href="${towb}" target="_blank" class="mp-btn wb"><img src="/scanmaster/assets/img/BuyT.svg" alt="wb" /></a>` : ""}
        ${tooz ? `<a href="${tooz}" target="_blank" class="mp-btn ozon"><img src="/scanmaster/assets/img/BuyT.svg" alt="ozon" /></a>` : ""}
        ${toym ? `<a href="${toym}" target="_blank" class="mp-btn ym"><img src="/scanmaster/assets/img/BuyT.svg" alt="ym" /></a>` : ""}
      </div>
    `;
    attachBuyHandlers(card, product);
  }
  
  function attachBuyHandlers(card, product) {
    const { slug, price } = product;
    const buyBtn = card.querySelector('.buy-btn');
    if (buyBtn) {
      buyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addToBasket({ slug, price });
        renderBuySection(card, product, getBasketQuantity(slug));
      });
    }
    const controls = card.querySelector('.quantity-controls');
    if (controls) {
      const input = controls.querySelector('.quantity-input');
      const minus = controls.querySelector('.decrease');
      const plus = controls.querySelector('.increase');
      minus.onclick = () => {
        let val = parseInt(input.value, 10) - 1;
        setBasketQuantity(slug, val);
        renderBuySection(card, product, getBasketQuantity(slug));
      };
      plus.onclick = () => {
        let val = parseInt(input.value, 10) + 1;
        setBasketQuantity(slug, val);
        renderBuySection(card, product, getBasketQuantity(slug));
      };
      input.onchange = () => {
        let val = parseInt(input.value, 10);
        setBasketQuantity(slug, val);
        renderBuySection(card, product, getBasketQuantity(slug));
      };
    }
  }
  
  function renderProduct(product) {
    const { name, slug, price, oldPrice, images, hidden, towb, tooz, toym } = product;
    if (hidden) return;
  
    let imageSrc = Array.isArray(images) && images.length > 0
      ? images[0]
      : "/scanmaster/assets/img/placeholder.jpg";

    const match = imageSrc.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    if (match) {
        const id = match[1];
        imageSrc = `https://drive.google.com/uc?export=view&id=${id}`;
    }
  
    const card = document.createElement("div");
    card.className = "product-card";
  
    // Проверяем, есть ли товар в корзине
    const quantity = getBasketQuantity(slug);

    console.log('Генерирую карточку:', name, 'slug:', slug, 'href:', `/scanmaster/products/product.html?slug=${slug}`);
    card.innerHTML = `
  <a class="product-link" href="/scanmaster/products/product.html?slug=${slug}" style="cursor:pointer">
    <div class="image-container">
      <img src="${imageSrc}" alt="${name}" 
        onerror="this.onerror=null; this.src='/scanmaster/assets/img/placeholder.jpg';" />
    </div>
    <div class="product-info">
      <h3>${name}</h3>
      <div class="price-block">
        <strong class="price">${price} ₽</strong>
        ${oldPrice ? `<span class="old-price">${oldPrice} ₽</span>` : ""}
      </div>
    </div>
  </a>
  <div class="buy-section"></div>
`;

    renderBuySection(card, product, quantity);

    catalogContainer.appendChild(card);
  }
  
  async function loadCatalog() {
    const search = searchInput.value.toLowerCase();
    const filters = getActiveFilters();
    catalogContainer.innerHTML = "";
  
    const q = query(collection(db, "products"), where("hidden", "==", false));
    const snapshot = await getDocs(q);
  
    snapshot.forEach(doc => {
      const product = doc.data();
      if (!product.name.toLowerCase().includes(search)) return;
      if (filters.category.length && !filters.category.includes(product.category)) return;
      if (filters.available.length && !product.available) return;
      if (filters.bestseller.length && !product.bestseller) return;
      if (filters.color.length && !filters.color.includes(product.color)) return;
      if (filters.features.length && !filters.features.some(f =>
        Object.values(product.features || {}).join(" ").includes(f))) return;
  
      renderProduct(product);
    });
  }
  
  function getActiveFilters() {
    const filterData = {
      category: [],
      available: [],
      bestseller: [],
      color: [],
      features: []
    };
  
    document.querySelectorAll('.filters input[type="checkbox"]:checked').forEach(cb => {
      filterData[cb.name].push(cb.value);
    });
  
    return filterData;
  }

  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }
});
  