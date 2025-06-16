import {
    collection,
    query,
    orderBy,
    getDocs,
    deleteDoc,
    doc
  } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
  
  import { db } from "/js/firebase-init.js";
  
  document.addEventListener("DOMContentLoaded", () => {
    const catalogContainer = document.getElementById("productGrid");
    const searchInput = document.getElementById("searchInput");
  
    if (!db || !catalogContainer) {
      console.error("❌ Firebase или контейнер не найден");
      return;
    }

    const waitForOpenAddModal = setInterval(() => {
      if (typeof window.openAddModal === "function") {
        clearInterval(waitForOpenAddModal);

        searchInput.addEventListener("input", debounce(() => loadCatalog(catalogContainer), 300));
        document.querySelectorAll('.filters input[type="checkbox"]').forEach(cb => {
          cb.addEventListener("change", () => loadCatalog(catalogContainer));
        });
  
        loadCatalog(catalogContainer);
      }
    }, 10);
  });
  
  
  function renderAddCard(container) {
    const card = document.createElement("div");
    card.className = "product-card add-card";
    card.innerHTML = `
      <div class="image-container">
        <div class="plus-icon">+</div>
      </div>
      <div class="product-info">
        <h3>Добавить товар</h3>
      </div>
    `;

    card.addEventListener("click", () => {
      console.log("🧱 Добавлена карточка ДОБАВИТЬ", card);
      console.log("🟠 Клик по карточке ДОБАВИТЬ");
      if (typeof window.openAddModal === "function") {
        window.openAddModal();
      }
    });
  
    container.appendChild(card);
  }  
  
  async function loadCatalog(container) {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const filters = getActiveFilters();
  
    container.innerHTML = ""; // очистка каталога перед отрисовкой
  
    renderAddCard(container); // перерисовка кнопки "Добавить"
  
    const q = query(collection(db, "products"), orderBy("priority", "desc"));
    const snapshot = await getDocs(q);
  
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const productId = docSnap.id;
  
      // Фильтрация
      if (data.hidden) return;
      if (search && !data.name.toLowerCase().includes(search)) return;
      if (filters.category.length && !filters.category.includes(data.category)) return;
      if (filters.available.length && !data.available) return;
      if (filters.bestseller.length && !data.bestseller) return;
      if (filters.color.length && !filters.color.includes(data.color)) return;
      if (
        filters.features.length &&
        !filters.features.some(f => Object.values(data.features || {}).join(" ").includes(f))
      ) return;
  
      renderProduct(data, container, productId);
    });
  }
  
  function isValidImage(src) {
    return typeof src === "string" && (src.startsWith("/") || src.startsWith("http"));
  }
  
  function renderProduct(product, container, productId) {
    const { name, slug, price, oldPrice, images, hidden, towb, tooz, toym } = product;
  
    if (hidden) return;
  
    let imageSrc = Array.isArray(images) && images.length > 0
    ? images[0]
    : "/assets/img/placeholder.jpg";

    // Автоконвертация Google Drive
    const match = imageSrc.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    if (match) {
    const id = match[1];
    imageSrc = `https://drive.google.com/uc?export=view&id=${id}`;
    }
  
    const card = document.createElement("div");
    card.className = "product-card";
  
    card.innerHTML = `
      <a href="#" class="product-link" tabindex="-1" style="pointer-events:none">
        <div class="image-container">
          <img src="${imageSrc}" alt="${name}" 
            onerror="this.onerror=null; this.src='/assets/img/placeholder.jpg';" />
        </div>
        <div class="product-info">
          <h3>${name}</h3>
          <div class="price-block">
            <strong class="price">${price} ₽</strong>
            ${oldPrice ? `<span class="old-price">${oldPrice} ₽</span>` : ""}
          </div>
        </div>
      </a>
      <div class="marketplace-buttons">
        ${towb ? `<a href="${towb}" target="_blank" class="mp-btn wb"></a>` : ""}
        ${tooz ? `<a href="${tooz}" target="_blank" class="mp-btn ozon"></a>` : ""}
        ${toym ? `<a href="${toym}" target="_blank" class="mp-btn ym"></a>` : ""}
      </div>
    `;
  
    // Обработчик клика по карточке (кроме иконок)
    card.addEventListener("click", (e) => {
      if (e.target.closest('.edit-icon, .delete-icon')) return;
      window.location.href = `/products/product.html?slug=${slug}`;
    });
  
    // 🔧 Добавляем только если это не "add-card"
    const actionBar = document.createElement("div");
    actionBar.className = "card-actions";
  
    const editIcon = document.createElement("span");
    editIcon.className = "edit-icon";
    editIcon.innerHTML = "✏️";
  
    const deleteIcon = document.createElement("span");
    deleteIcon.className = "delete-icon";
    deleteIcon.innerHTML = "🗑️";
  
    editIcon.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.openEditModal === "function") {
        window.openEditModal(productId, product);
      }
    });
  
    deleteIcon.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const confirmDelete = confirm(`Удалить товар "${name}"?`);
      if (!confirmDelete) return;
      try {
        await deleteDoc(doc(db, "products", productId));
        card.remove();
        alert("✅ Товар удалён");
      } catch (err) {
        alert("❌ Ошибка при удалении");
      }
    });
  
    actionBar.appendChild(editIcon);
    actionBar.appendChild(deleteIcon);
    card.appendChild(actionBar);
  
    container.appendChild(card);
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
  