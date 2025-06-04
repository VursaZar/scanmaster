import { getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { db } from "/scanmaster/js/firebase-init.js";
import {
  getAuth,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

let currentUserId = null;
let currentUserEmail = null;

async function loadAdminData() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;
  currentUserId = user.uid;
  currentUserEmail = user.email;
  const snap = await getDoc(doc(db, "admins", user.uid));
  const data = snap.data();
  const form = document.getElementById("adminSettingsForm");
  form.name.value = data?.name || "";
  form.phone.value = data?.phone || "";
  form.email.value = user.email || "";
}

async function reauthenticateUser(currentPassword) {
  const auth = getAuth();
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
}

window.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(getAuth(), (user) => {
    if (!user) {
      alert("⛔ Не авторизован");
      location.href = "/scanmaster/admins/admin-login.html";
      return;
    }
    loadAdminData();
  });

  document.getElementById("adminSettingsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const auth = getAuth();
    const user = auth.currentUser;
    try {
      // Смена email
      if (form.email.value !== user.email) {
        if (!form.currentPassword.value) {
          alert("Введите текущий пароль для смены email");
          return;
        }
        await reauthenticateUser(form.currentPassword.value);
        await updateEmail(user, form.email.value);
        alert("Email успешно изменён!");
      }
      // Смена пароля
      if (form.newPassword.value) {
        if (!form.currentPassword.value) {
          alert("Введите текущий пароль для смены пароля");
          return;
        }
        await reauthenticateUser(form.currentPassword.value);
        await updatePassword(user, form.newPassword.value);
        alert("Пароль успешно изменён!");
      }
      // Обновление имени и телефона в Firestore
      await updateDoc(doc(db, "admins", user.uid), {
        name: form.name.value,
        phone: form.phone.value
      });
      alert("Данные успешно сохранены!");
      form.currentPassword.value = "";
      form.newPassword.value = "";
    } catch (err) {
      console.error("❌ Ошибка при сохранении:", err);
      alert("Ошибка: " + err.message);
    }
  });
});