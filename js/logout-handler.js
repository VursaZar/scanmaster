import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { app } from "/scanmaster/js/firebase-init.js";

// Подожди появления logout-кнопки
const waitForLogoutLink = setInterval(() => {
  const logoutLink = document.getElementById("logout-link");

  if (logoutLink) {
    clearInterval(waitForLogoutLink);

    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      console.log("🚪 Кнопка 'Выйти' нажата");

      try {
        const auth = getAuth(app);
        console.log("🔐 Текущий пользователь:", auth.currentUser);

        await signOut(auth);
        console.log("✅ Успешный выход");

        alert("Вы вышли из аккаунта.");
        window.location.href = "/scanmaster/main/main.html";
      } catch (error) {
        console.error("❌ Ошибка при выходе:", error);
        alert("Ошибка при выходе. Открой консоль, чтобы увидеть причину.");
      }
    });
  }
}, 300);
