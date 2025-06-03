import { db } from "/js/firebase-init.js";
import { collection, getDocs, updateDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const ordersList = document.getElementById("ordersList");
  const showArchivedBtn = document.getElementById("showArchivedBtn");
  let showArchived = false;
  let allOrders = [];

  showArchivedBtn.onclick = () => {
    showArchived = !showArchived;
    showArchivedBtn.textContent = showArchived ? "Скрыть архивные" : "Показать архивные";
    renderOrders();
  };

  async function loadOrders() {
    // Заказы из корзины
    const basketSnap = await getDocs(query(collection(db, "orders_basket")));
    const basketOrders = [];
    basketSnap.forEach(docSnap => {
      const data = docSnap.data();
      basketOrders.push({
        id: docSnap.id,
        type: "basket",
        ...data,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : (data.timestamp || new Date(0)),
        archived: data.archived || false
      });
    });

    // Заявки на сотрудничество
    const optoSnap = await getDocs(query(collection(db, "optovikam_form")));
    const optoOrders = [];
    optoSnap.forEach(docSnap => {
      const data = docSnap.data();
      optoOrders.push({
        id: docSnap.id,
        type: "opto",
        ...data,
        timestamp: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date(0)),
        archived: data.archived || false
      });
    });

    allOrders = [...basketOrders, ...optoOrders].sort((a, b) => b.timestamp - a.timestamp);
    renderOrders();
  }

  async function archiveOrder(order) {
    const col = order.type === "basket" ? "orders_basket" : "optovikam_form";
    await updateDoc(doc(db, col, order.id), { archived: true });
    order.archived = true;
    renderOrders();
  }

  function renderOrders() {
    ordersList.innerHTML = "";
    const filtered = allOrders.filter(o => showArchived ? o.archived : !o.archived);
    if (filtered.length === 0) {
      ordersList.innerHTML = `<p style="color:#aaa;">Нет заявок</p>`;
      return;
    }
    filtered.forEach(order => {
      const div = document.createElement("div");
      div.className = "order-card";
      div.style = "background:#181818;padding:18px 20px;margin-bottom:18px;border-radius:12px;box-shadow:0 2px 8px #0002;";
      let html = "";
      if (order.type === "basket") {
        html += `<b>Заказ из корзины</b> <span style='color:#F96000;'>${order.status||"Новый заказ"}</span><br>`;
        html += `<b>ФИО:</b> ${order.FIO||"-"}<br>`;
        html += `<b>Телефон:</b> ${order.tel||"-"}<br>`;
        html += `<b>Email:</b> ${order.email||"-"}<br>`;
        html += `<b>Товары:</b><ul style='margin:4px 0 8px 16px;'>`;
        (order.products||[]).forEach(p => {
          html += `<li>${p.slug||"-"} — ${p.price||"-"}₽ × ${p.quantity||1}</li>`;
        });
        html += `</ul>`;
        html += `<b>Сумма:</b> ${order.priceAll||0}₽<br>`;
        html += `<b>Время:</b> ${order.timestamp instanceof Date ? order.timestamp.toLocaleString() : order.timestamp}<br>`;
      } else {
        html += `<b>Заявка на сотрудничество</b><br>`;
        html += `<b>Компания:</b> ${order.company||"-"}<br>`;
        html += `<b>Телефон:</b> ${order.phone||"-"}<br>`;
        html += `<b>Email:</b> ${order.email||"-"}<br>`;
        html += `<b>Telegram:</b> ${order.telegram||"-"}<br>`;
        html += `<b>Сообщение:</b> ${order.message||"-"}<br>`;
        html += `<b>Время:</b> ${order.timestamp instanceof Date ? order.timestamp.toLocaleString() : order.timestamp}<br>`;
      }
      if (!order.archived) {
        html += `<button class='archive-btn' style='margin-top:8px;'>В архив</button>`;
      } else {
        html += `<span style='color:#888;margin-top:8px;display:inline-block;'>В архиве</span>`;
      }
      div.innerHTML = html;
      if (!order.archived) {
        div.querySelector('.archive-btn').onclick = () => archiveOrder(order);
      }
      ordersList.appendChild(div);
    });
  }

  loadOrders();
}); 