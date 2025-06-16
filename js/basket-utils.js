// /js/basket-utils.js

export function addToBasket(product) {
    const basket = JSON.parse(localStorage.getItem("basket")) || [];
  
    const existing = basket.find(p => p.slug === product.slug);
    if (existing) {
      existing.quantity += 1;
    } else {
      basket.push({
        slug: product.slug,
        price: product.price,
        quantity: 1
      });
    }
  
    localStorage.setItem("basket", JSON.stringify(basket));
    console.log("🛒 Товар добавлен в корзину:", product.slug);
  
    renderCartIcon();
  }

  export function renderCartIcon() {
    const nav = document.querySelector("header nav");
    if (!nav) return;

    if (nav.querySelector(".cart-icon")) return;
  
    const basket = JSON.parse(localStorage.getItem("basket")) || [];
    if (basket.length === 0) return;
  
    const link = document.createElement("a");
    link.href = "/main/basket.html";
    link.className = "cart-icon";
    link.innerHTML = `<img src="/assets/img/BuyT.svg" alt="Корзина" style="width: 26px; height: 26px;">`;
    nav.prepend(link);
  }

  export function getBasketQuantity(slug) {
    const basket = JSON.parse(localStorage.getItem("basket")) || [];
    const item = basket.find(p => p.slug === slug);
    return item ? item.quantity : 0;
  }

  export function setBasketQuantity(slug, quantity) {
    let basket = JSON.parse(localStorage.getItem("basket")) || [];
    if (quantity < 1) {
      basket = basket.filter(p => p.slug !== slug);
    } else {
      const item = basket.find(p => p.slug === slug);
      if (item) {
        item.quantity = quantity;
      } else {
        basket.push({ slug, price: 0, quantity }); // price обновится при добавлении через addToBasket
      }
    }
    localStorage.setItem("basket", JSON.stringify(basket));
  }
  