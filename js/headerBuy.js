document.addEventListener("DOMContentLoaded", () => {
    const icon = document.getElementById("cartIcon");
    if (!icon) return;
  
    const basket = JSON.parse(localStorage.getItem("basket") || "[]");
    icon.style.display = basket.length > 0 ? "inline-flex" : "none";
  });
  