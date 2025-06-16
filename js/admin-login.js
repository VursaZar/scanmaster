import {
    getAuth,
    signInWithEmailAndPassword,
    signOut
  } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
  
  import {
    getFirestore,
    doc,
    getDoc
  } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
  
  import { app } from "./firebase-init.js"; 

  const auth = getAuth(app);
  const db = getFirestore(app);
  
  const allowedEmail = "scanmaster@yandex.ru";
  
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("admin-login-form");
  
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
  
      if (!email || !password) {
        alert("⚠️ Введите почту и пароль.");
        return;
      }
  
      if (email !== allowedEmail) {
        alert("⛔ Вход разрешён только для администратора SCANMASTER.");
        return;
      }
  
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        if (!user.emailVerified) {
          await user.sendEmailVerification();
          alert("📩 Письмо для подтверждения отправлено. Проверьте почту.");
          await signOut(auth);
          return;
        }
  
        const docRef = doc(db, "admins", user.uid);
        const adminDoc = await getDoc(docRef);
        console.log("🔥 Проверяем доступ по UID:", user.uid);
        console.log("👉 Документ:", adminDoc.exists() ? "Найден" : "НЕ найден");
  
        if (!adminDoc.exists()) {
          alert("⛔ У вас нет доступа к админ-панели.");
          await signOut(auth);
          return;
        }
  
        const adminData = adminDoc.data();
        alert(`✅ Добро пожаловать, ${adminData.name || "админ"}!`);
        window.location.href = "/Admins/admin-panel.html";
  
      } catch (error) {
        console.error("❌ Ошибка входа:", error);
        alert("❌ Ошибка входа: " + error.message);
      }
    });
  });
  