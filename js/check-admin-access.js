import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { app } from "/scanmaster/js/firebase-init.js";

const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    blockAccess();
    return;
  }

  const adminRef = doc(db, "admins", user.uid);
  const adminSnap = await getDoc(adminRef);

  if (!adminSnap.exists()) {
    blockAccess();
  }
});

function blockAccess() {
  document.body.innerHTML = `
    <h1 style="color:white; text-align:center; margin-top:100px;">⛔ Тебе сюда нельзя</h1>
  `;
}
