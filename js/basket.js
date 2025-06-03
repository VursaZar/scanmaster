import { db } from '/js/firebase-init.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

document.addEventListener("DOMContentLoaded", () => {
  const basketItemsDiv = document.getElementById('basketItems');
  const totalPriceEl = document.getElementById('totalPrice');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const modal = document.getElementById('orderModal');
  const confirmBtn = document.getElementById('submitOrder');
  const closeModalBtn = document.getElementById("closeModalBtn");

  let basket = JSON.parse(localStorage.getItem('basket')) || [];

  function renderBasket() {
    basketItemsDiv.innerHTML = '';
    let total = 0;

    basket.forEach(item => {
      total += item.price * item.quantity;

      const div = document.createElement('div');
      div.classList.add('basket-item');

      div.innerHTML = `
        <p><strong>${item.slug}</strong> — ${item.price} ₽ ×</p>
        <div class="quantity-controls" data-slug="${item.slug}">
          <button class="decrease">−</button>
          <input type="number" class="quantity-input" min="1" value="${item.quantity}" data-slug="${item.slug}" />
          <button class="increase">+</button>
          <button class="delete-btn" title="Удалить"><img src="/assets/img/Del.svg" alt="Удалить"></button>
        </div>
      `;

      basketItemsDiv.appendChild(div);
    });

    totalPriceEl.textContent = total;
    attachHandlers(); // 👈 Обязательно после каждой перерисовки
  }

  function attachHandlers() {
    document.querySelectorAll(".quantity-controls").forEach(ctrl => {
      const slug = ctrl.dataset.slug;
      const minus = ctrl.querySelector(".decrease");
      const plus = ctrl.querySelector(".increase");
      const remove = ctrl.querySelector(".delete-btn");
      const input = ctrl.querySelector(".quantity-input");

      minus.onclick = () => {
        const index = basket.findIndex(p => p.slug === slug);
        if (basket[index].quantity > 1) {
          basket[index].quantity--;
          saveAndRender();
        }
      };

      plus.onclick = () => {
        const index = basket.findIndex(p => p.slug === slug);
        basket[index].quantity++;
        saveAndRender();
      };

      remove.onclick = () => {
        basket = basket.filter(p => p.slug !== slug);
        saveAndRender();
      };

      input.onchange = () => {
        const val = parseInt(input.value, 10);
        const index = basket.findIndex(p => p.slug === slug);
        if (isNaN(val) || val < 1) {
          basket = basket.filter(p => p.slug !== slug);
        } else {
          basket[index].quantity = val;
        }
        saveAndRender();
      };
    });
  }

  function saveAndRender() {
    localStorage.setItem('basket', JSON.stringify(basket));
    renderBasket();
  }

  if (basket.length === 0) {
    basketItemsDiv.innerHTML = '<p>Корзина пуста.</p>';
    checkoutBtn.style.display = 'none';
  } else {
    renderBasket();
  }

  checkoutBtn.onclick = () => {
    modal.style.display = "flex";
  };

  closeModalBtn.onclick = () => {
    modal.style.display = "none";
  };

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  confirmBtn.addEventListener('click', async () => {
    const FIO = document.getElementById('fio').value.trim();
    const email = document.getElementById('email').value.trim();
    const tel = document.getElementById('tel').value.trim();

    const priceAll = basket.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const quantityAll = basket.reduce((acc, item) => acc + item.quantity, 0);

    if (!FIO || !email || !tel || basket.length === 0) {
      alert('Заполните все поля и добавьте товары.');
      return;
    }

    try {
      await addDoc(collection(db, 'orders_basket'), {
        FIO, email, tel,
        priceAll,
        quantityAll,
        products: basket,
        status: 'Новый заказ',
        timestamp: serverTimestamp(),
      });

      localStorage.removeItem('basket');
      alert('✅ Заказ отправлен!');
      window.location.href = "/main/catalog.html";
    } catch (err) {
      console.error('❌ Ошибка при оформлении заказа:', err);
      alert('Ошибка при отправке. Попробуйте ещё раз.');
    }
  });
});
