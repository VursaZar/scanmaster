import { db } from "/js/firebase-init.js";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

    let currentProductId = null;
    window.editMode = false;

    window.openAddModal = () => {
        console.log("✅ openAddModal вызвана");
      
        const modal = document.getElementById("addProductModal"); 
        const form = document.getElementById("addProductForm");
        const featureBox = document.getElementById("featuresContainer");
      
        if (!modal || !form || !featureBox) {
          console.error("❌ Модалка или форма не найдены");
          return;
        }
      
        modal.querySelector("h2").textContent = "Добавить товар";
      
        window.editMode = false;
        currentProductId = null;
      
        modal.classList.remove("hidden");
        modal.style.display = "flex";
      
        const imageBox = document.getElementById("imagesContainer");
        imageBox.innerHTML = '<h4 style="margin: 10px 0; color: #F96000;">Изображения</h4>';
        window.addImageRow();        

        form.reset();
        featureBox.innerHTML = '<h4 style="margin: 10px 0; color: #F96000;">Характеристики</h4>';
        setTimeout(() => {
          if (typeof updateAddButtonState === "function") updateAddButtonState();
        }, 0);
        window.addFeatureRow();
      };            

  window.openEditModal = (productId, data) => {
    console.log("✏️ openEditModal вызвана");
    const modal = document.getElementById("addProductModal");
    modal.querySelector("h2").textContent = "Редактировать товар";  
    const form = document.getElementById("addProductForm");

  if (!modal || !form) return;

  modal.classList.remove("hidden");
  modal.style.display = "flex";
  window.editMode = true;
  currentProductId = productId;

  const imageBox = document.getElementById("imagesContainer");
  imageBox.innerHTML = '<h4 style="margin: 10px 0; color: #F96000;">Изображения</h4>';
  (data.images || []).forEach(url => window.addImageRow(url));  

  const featureBox = document.getElementById("featuresContainer");
  featureBox.innerHTML = '<h4 style="margin: 10px 0; color: #F96000;">Характеристики</h4>';
  
  const features = data.features || {};
  Object.entries(features).forEach(([k, v]) => {
    window.addFeatureRow(k, v);
  });

  for (const [key, value] of Object.entries(data)) {
    const input = form.querySelector(`[name="${key}"]`);
    if (!input) continue;

    if (input.type === "checkbox") {
      input.checked = value === true;
    } else if (Array.isArray(value)) {
      input.value = value.join(", ");
    } else if (typeof value === "object" && value !== null) {
      continue;
    } else {
      input.value = value;
    }
  }
};

function closeModal() {
    const modal = document.getElementById("addProductModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.style.display = "none";
    }
  }
  window.closeModal = closeModal;  

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("addProductModal");
    const form = document.getElementById("addProductForm");
    const modalContent = document.querySelector(".modal-content");

    const addImageBtn = document.getElementById("addImageBtn");
    addImageBtn.addEventListener("click", () => {
    window.addImageRow();
    });

    if (!form) {
      console.error("❌ Форма #addProductForm не найдена");
      return;
    }
  
    // Закрытие по фону
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    }
  
    // Кнопка "Закрыть"
    const closeBtn = modal?.querySelector("button:last-child");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
      
      modalContent.addEventListener("click", (e) => {
        // если клик внутри кнопки "удалить характеристику" — обрабатываем и не закрываем
        if (e.target.classList.contains("feature-remove")) {
          e.preventDefault();
          e.stopPropagation();
          const row = e.target.closest(".feature-row");
          if (row) row.remove();
          updateAddButtonState();
          return;
        }
      });      
  
      // === ФОТО через гугл драйв===

      window.addImageRow = (url = "") => {
        const container = document.getElementById("imagesContainer");
      
        const row = document.createElement("div");
        row.classList.add("feature-row");
        row.innerHTML = `
          <input type="text" placeholder="https://..." class="image-url" value="${url}">
          <button type="button" class="feature-remove">−</button>
        `;
      
        row.querySelector(".feature-remove").addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          row.remove();
        });
      
        container.appendChild(row);
      };

      function autoConvertGoogleDriveLinks() {
        const observer = new MutationObserver(() => {
          document.querySelectorAll(".image-url").forEach((input) => {
            input.removeEventListener("input", handleDriveConversion);
            input.addEventListener("input", handleDriveConversion);
          });
        });
      
        function handleDriveConversion(e) {
          const val = e.target.value.trim();
          const match = val.match(/\/d\/([a-zA-Z0-9_-]+)\//);
          if (match) {
            const id = match[1];
            const converted = `https://drive.google.com/uc?export=view&id=${id}`;
            e.target.value = converted;
            console.log("🔁 Ссылка сконвертирована:", converted);
          }
        }
      
        observer.observe(document.getElementById("imagesContainer"), {
          childList: true,
          subtree: true
        });
      }      

    // === ХАРАКТЕРИСТИКИ ===
  
    function updateAddButtonState() {
      const addBtn = document.getElementById("addFeatureBtn");
      const container = document.getElementById("featuresContainer");
      const last = container.querySelector(".feature-row:last-child");
      if (!last) {
        addBtn.disabled = false;
        return;
      }
      const k = last.querySelector(".feature-key")?.value.trim();
      const v = last.querySelector(".feature-value")?.value.trim();
      addBtn.disabled = !k || !v;
    }
  
    window.addFeatureRow = (key = "", value = "") => {
      const container = document.getElementById("featuresContainer");
  
      const row = document.createElement("div");
      row.classList.add("feature-row");
      row.innerHTML = `
        <input type="text" placeholder="Название" class="feature-key" value="${key}">
        <input type="text" placeholder="Значение" class="feature-value" value="${value}">
        <button type="button" class="feature-remove">−</button>
      `;
  
      row.querySelector(".feature-remove").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        row.remove();
        updateAddButtonState();
      });      
  
      row.querySelector(".feature-key").addEventListener("input", updateAddButtonState);
      row.querySelector(".feature-value").addEventListener("input", updateAddButtonState);
  
      container.appendChild(row);
      updateAddButtonState();
      autoConvertGoogleDriveLinks();
    };
  
    const addBtn = document.getElementById("addFeatureBtn");
    addBtn.addEventListener("click", () => {
      window.addFeatureRow();
    });
  
    updateAddButtonState();
  
    // === SUBMIT ===
  
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("📩 SUBMIT сработал");
  
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
  
      data.available = formData.get("available") === "on";
      data.bestseller = formData.get("bestseller") === "on";
      data.hidden = formData.get("hidden") === "on";
      data.createdAt = Timestamp.now();
  
      data.tags = data.tags ? data.tags.split(";").map(t => t.trim()) : [];
      data.images = [];
        document.querySelectorAll(".image-url").forEach(input => {
            const val = input.value.trim();
            if (val) data.images.push(val);
        });
  
      data.price = Number(data.price);
      data.oldPrice = Number(data.oldPrice);
      data.priority = Number(data.priority);
      data.position = Number(data.position);
      data.discount = Math.round(100 * ((data.oldPrice - data.price) / data.oldPrice)) || 0;
      data.towb = formData.get("towb") || "";
      data.tooz = formData.get("tooz") || "";
      data.toym = formData.get("toym") || "";
  
      // === FEATURES ===
      const featuresMap = {};
      let hasEmptyFeature = false;
  
      document.querySelectorAll(".feature-row").forEach(row => {
        const key = row.querySelector(".feature-key")?.value.trim();
        const value = row.querySelector(".feature-value")?.value.trim();
        if ((key && !value) || (!key && value)) {
          hasEmptyFeature = true;
        }
        if (key && value) featuresMap[key] = value;
      });
  
      if (hasEmptyFeature) {
        alert("❗ Пожалуйста, заполните все характеристики или удалите пустые.");
        return;
      }
  
      data.features = featuresMap;
  

      data.images = [];
        document.querySelectorAll(".image-url").forEach(input => {
        let val = input.value.trim();
        const match = val.match(/\/d\/([a-zA-Z0-9_-]+)\//);
        if (match) {
            const id = match[1];
            val = `https://drive.google.com/uc?export=view&id=${id}`;
        }
        if (val) data.images.push(val);
        });

      // === ДОКУМЕНТЫ ===
      data.documents = {
        driver: data.driver,
        manual: data.manual
      };
  
      // === СОХРАНЕНИЕ ===
      try {
        if (window.editMode === true && currentProductId !== null) {
          const ref = doc(db, "products", currentProductId);
          await updateDoc(ref, data);
          alert("✅ Товар обновлён");
        } else {
          await addDoc(collection(db, "products"), data);
          alert("✅ Товар успешно добавлен");
        }
        closeModal();
        form.reset();
        window.editMode = false;
        currentProductId = null;
      } catch (err) {
        console.error("❌ Ошибка:", err);
        alert("❌ Ошибка при сохранении товара: " + err.message);
      }      
    });
  });
  