(() => {
  const categoryNames = {
    smartphones: 'Смартфони',
    laptops: 'Ноутбуки',
    tablets: 'Планшети'
  };
  const categoryKeys = {
    smartphones: 'smartphones',
    laptops: 'laptops',
    tablets: 'tablets'
  };
  const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const money = amount => `${Number(amount).toLocaleString('uk-UA')} ₴`;

  function showStorageError(message) {
    console.error(`TechPulse: ${message}`);
    let notice = document.getElementById('storageNotice');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'storageNotice';
      notice.className = 'alert alert-warning storage-notice';
      notice.setAttribute('role', 'alert');
      document.body.append(notice);
    }
    notice.textContent = message;
  }

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      showStorageError('Не вдалося прочитати дані браузера. Перевірте налаштування сховища.');
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      showStorageError('Не вдалося зберегти дані у браузері. Перевірте налаштування сховища.');
      return false;
    }
  }

  function getObject(key) {
    const value = read(key, {});
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  function toast(message) {
    const text = document.getElementById('toastText');
    const element = document.getElementById('toast');
    if (!text || !element || !window.bootstrap) return;
    text.textContent = message;
    bootstrap.Toast.getOrCreateInstance(element, { delay: 2500 }).show();
  }

  function renderHeader() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    const page = location.pathname.split('/').pop() || 'index.html';
    const active = name => page === name ? ' aria-current="page"' : '';

    header.innerHTML = `
      <div class="topbar">
        <div class="container d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span><i class="bi bi-truck me-1" aria-hidden="true"></i> Доставка за 1 гривню</span>
          <span><i class="bi bi-shield-check me-1" aria-hidden="true"></i> Офіційна гарантія</span>
          <span><i class="bi bi-arrow-repeat me-1" aria-hidden="true"></i> Trade-in зі знижкою</span>
          <span><i class="bi bi-credit-card me-1" aria-hidden="true"></i> Розстрочка від 0%</span>
        </div>
      </div>
      <header class="sticky-top bg-white shadow-sm py-2">
        <div class="container header-content d-flex align-items-center gap-3 flex-wrap">
          <a class="brand" href="index.html#top"${active('index.html')} aria-label="TechPulse — на головну">
            <i class="bi bi-phone text-success" aria-hidden="true"></i> TechPulse
          </a>
          <button class="header-toggle ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#headerMenu" aria-controls="headerMenu" aria-expanded="false" aria-label="Відкрити меню">
            <i class="bi bi-list" aria-hidden="true"></i>
          </button>
          <div class="collapse header-menu flex-grow-1" id="headerMenu">
            <form class="search-form" id="searchForm" role="search" action="index.html">
              <div class="input-group">
                <input type="search" id="searchInput" name="q" class="form-control rounded-start-pill border-end-0 ps-3" placeholder="Пошук смартфонів та гаджетів..." aria-label="Пошук">
                <button class="btn btn-green rounded-end-pill px-4" type="submit" id="searchBtn" aria-label="Шукати"><i class="bi bi-search" aria-hidden="true"></i></button>
              </div>
            </form>
            <nav class="header-actions" aria-label="Швидкі дії">
              <a href="trade-in.html" class="hico"${active('trade-in.html')}><i class="bi bi-arrow-repeat" aria-hidden="true"></i><span>Trade-in</span></a>
              <a href="compare.html" class="hico"${active('compare.html')}><i class="bi bi-bar-chart" aria-hidden="true"></i><span>Порівняти</span><span class="bdg" id="cmpN" hidden aria-live="polite">0</span></a>
              <a href="favorites.html" class="hico"${active('favorites.html')}><i class="bi bi-heart" aria-hidden="true"></i><span>Обране</span><span class="bdg" id="favN" hidden aria-live="polite">0</span></a>
              <button type="button" class="hico" data-bs-toggle="offcanvas" data-bs-target="#cartOffcanvas" aria-controls="cartOffcanvas" title="Кошик"><i class="bi bi-cart3" aria-hidden="true"></i><span>Кошик</span><span class="bdg" id="cartN" hidden aria-live="polite">0</span></button>
            </nav>
          </div>
        </div>
      </header>`;

    document.body.insertAdjacentHTML('beforeend', `
      <div class="offcanvas offcanvas-end" tabindex="-1" id="cartOffcanvas" aria-labelledby="cartOffcanvasLabel">
        <div class="offcanvas-header border-bottom">
          <h2 class="offcanvas-title fs-5 fw-bold" id="cartOffcanvasLabel"><i class="bi bi-cart3 text-success me-2" aria-hidden="true"></i>Ваш кошик</h2>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Закрити"></button>
        </div>
        <div class="offcanvas-body d-flex flex-column">
          <div id="cartItems" class="flex-grow-1 overflow-auto pe-1"></div>
          <div class="border-top pt-3 mt-auto">
            <div class="d-flex justify-content-between align-items-center mb-3"><span class="fw-bold">Разом до сплати:</span><span id="cartTotal" class="text-success fs-4 fw-extrabold">0 ₴</span></div>
            <button type="button" id="goCheckout" class="btn btn-green w-100 rounded-pill py-2 fw-semibold" disabled>Оформити замовлення</button>
          </div>
        </div>
      </div>
      <div class="toast-wrap position-fixed bottom-0 end-0 p-3">
        <div id="toast" class="toast text-white bg-success border-0 shadow-lg" role="status" aria-live="polite" aria-atomic="true">
          <div class="d-flex align-items-center"><div class="toast-body" id="toastText"></div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Закрити" data-bs-theme="dark"></button></div>
        </div>
      </div>`);
  }

  function initializeStore(products) {
    const normalized = products.map(product => ({
      ...product,
      cat: categoryKeys[product.category],
      short: product.name.replace(/^(Смартфон|Чохол|Бездротові навушники|Смарт-годинник)\s+/, ''),
      old: product.oldPrice,
      r: product.rating,
      n: product.reviews,
      popularity: product.popularity,
      img: product.image,
      specs: product.specs || {}
    }));

    window.TechPulseStore = {
      PRODUCTS: normalized,
      CATEGORY_NAMES: categoryNames,
      read,
      write,
      money
    };

    if (location.protocol === 'file:') {
      showStorageError('Сайт відкрито як file://. Для завантаження products.json і збереження даних відкрийте папку через локальний вебсервер.');
    }
    return normalized;
  }

  function initializeShell(products) {
    const productById = id => products.find(product => product.id === Number(id));

    function renderCart() {
      const cart = getObject('cart');
      const items = Object.entries(cart).filter(([id, quantity]) =>
        productById(id) && Number.isInteger(quantity) && quantity > 0
      );
      const count = items.reduce((total, [, quantity]) => total + quantity, 0);
      const favorites = read('fav', []);
      const comparisons = read('cmp', []);
      const cartBadge = document.getElementById('cartN');
      const favoriteBadge = document.getElementById('favN');
      const compareBadge = document.getElementById('cmpN');
      cartBadge.textContent = count;
      cartBadge.hidden = count === 0;
      favoriteBadge.textContent = Array.isArray(favorites) ? favorites.length : 0;
      favoriteBadge.hidden = favoriteBadge.textContent === '0';
      compareBadge.textContent = Array.isArray(comparisons) ? comparisons.length : 0;
      compareBadge.hidden = compareBadge.textContent === '0';
      document.getElementById('cartItems').innerHTML = items.length ? items.map(([id, quantity]) => {
        const item = productById(id);
        return `<div class="d-flex gap-2 align-items-center border-bottom py-2">
          <img src="${escapeHTML(item.img)}" width="54" height="54" class="rounded object-fit-contain" alt="" loading="lazy">
          <div class="flex-grow-1 min-w-0"><div class="fw-semibold small text-truncate">${escapeHTML(item.short)}</div><div class="small text-success fw-bold">${money(item.price)}</div></div>
          <div class="btn-group btn-group-sm" role="group" aria-label="Кількість товару ${escapeHTML(item.short)}">
            <button type="button" class="btn btn-outline-secondary" data-q="${id}" data-d="-1" aria-label="Зменшити кількість ${escapeHTML(item.short)}">−</button>
            <span class="px-2 align-self-center" aria-live="polite">${quantity}</span>
            <button type="button" class="btn btn-outline-secondary" data-q="${id}" data-d="1" aria-label="Збільшити кількість ${escapeHTML(item.short)}">+</button>
          </div>
        </div>`;
      }).join('') : '<p class="text-muted text-center my-5">Ваш кошик порожній</p>';
      document.getElementById('cartTotal').textContent = money(items.reduce(
        (total, [id, quantity]) => total + productById(id).price * quantity, 0
      ));
      document.getElementById('goCheckout').disabled = items.length === 0;
    }

    window.TechPulseShell = { refresh: renderCart };
    document.getElementById('goCheckout').addEventListener('click', () => {
      if (!document.getElementById('goCheckout').disabled) location.href = 'checkout.html';
    });
    document.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest('[data-q]');
      if (!button) return;
      const cart = getObject('cart');
      const id = button.dataset.q;
      cart[id] = (cart[id] || 0) + Number(button.dataset.d);
      if (cart[id] < 1) delete cart[id];
      if (write('cart', cart)) {
        renderCart();
        window.dispatchEvent(new CustomEvent('techpulse-cart-updated'));
      }
    });

    const menu = document.getElementById('headerMenu');
    menu.addEventListener('shown.bs.collapse', () => {
      const toggle = document.querySelector('.header-toggle');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Закрити меню');
      toggle.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>';
    });
    menu.addEventListener('hidden.bs.collapse', () => {
      const toggle = document.querySelector('.header-toggle');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Відкрити меню');
      toggle.innerHTML = '<i class="bi bi-list" aria-hidden="true"></i>';
    });
    window.addEventListener('storage', renderCart);
    renderCart();
  }

  function initializeCatalog(products) {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
    const { CATEGORY_NAMES: categories } = window.TechPulseStore;
    let cart = read('cart', {});
    let favorites = read('fav', []);
    let comparisons = read('cmp', []);
    const ratings = read('rate', {});
    const myRatings = read('mine', {});
    const productById = id => products.find(product => product.id === Number(id));

    cart = cart && typeof cart === 'object' && !Array.isArray(cart)
      ? Object.fromEntries(Object.entries(cart).filter(([id, quantity]) =>
        productById(id) && Number.isInteger(quantity) && quantity > 0
      )) : {};
    favorites = Array.isArray(favorites) ? [...new Set(favorites.filter(id => productById(id)))] : [];
    comparisons = Array.isArray(comparisons) ? [...new Set(comparisons.filter(id => productById(id)))] : [];

    const ratingData = product => ratings[product.id] || { sum: product.r * product.n, n: product.n };
    const average = product => ratingData(product).sum / ratingData(product).n;
    const starsHTML = product => {
      const currentAverage = Math.round(average(product));
      const selectedRating = myRatings[product.id] || 0;
      const stars = [1, 2, 3, 4, 5].map(value => `
        <button type="button" class="star-btn" role="radio" data-s="${value}" aria-label="Оцінити ${value} з 5" aria-checked="${selectedRating === value}" tabindex="${selectedRating === value || (!selectedRating && value === 1) ? '0' : '-1'}">
          <i class="bi bi-star${value <= currentAverage ? '-fill' : ''}" aria-hidden="true"></i>
        </button>`).join('');
      return `<span class="stars" role="radiogroup" aria-label="Оцінити ${escapeHTML(product.short)}" data-id="${product.id}">${stars}</span>
        <small class="text-muted ms-1">${average(product).toFixed(1)} (${ratingData(product).n})</small>`;
    };

    function cardHTML(product) {
      const isFavorite = favorites.includes(product.id);
      const specs = Object.entries(product.specs).slice(0, 4);
      return `<article class="product" data-product-id="${product.id}">
        <div class="product-img">
          ${product.old ? `<span class="discount">-${Math.round(100 - product.price / product.old * 100)}%</span>` : ''}
          <button type="button" class="fav-btn" data-fav="${product.id}" aria-label="${isFavorite ? 'Вилучити з обраного' : 'Додати в обране'}" aria-pressed="${isFavorite}">
            <i class="bi bi-heart${isFavorite ? '-fill' : ''}" aria-hidden="true"></i>
          </button>
          <img src="${escapeHTML(product.img)}" alt="${escapeHTML(product.short)}" width="500" height="500" loading="lazy">
          <ul class="specs">${specs.map(([key, value]) => `<li><dl class="m-0"><dt>${escapeHTML(key)}</dt><dd class="m-0">${escapeHTML(value)}</dd></dl></li>`).join('')}</ul>
        </div>
        <div class="p-3 d-flex flex-column flex-grow-1">
          <span class="text-muted small">${categories[product.cat]} • ${escapeHTML(product.brand)}${product.inStock ? '' : ' • Немає в наявності'}</span>
          <h3 class="fs-6 fw-bold my-1 text-truncate" title="${escapeHTML(product.name)}">${escapeHTML(product.short)}</h3>
          <div class="mb-2 d-flex align-items-center">${starsHTML(product)}</div>
          <div class="mt-auto pt-2 d-flex justify-content-between align-items-center border-top">
            <div><span class="fs-5 fw-extrabold">${money(product.price)}</span>
              ${product.old ? `<div class="old-price text-decoration-line-through text-muted">${money(product.old)}</div>` : ''}
            </div>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-outline-secondary rounded-pill btn-sm" data-cmp="${product.id}" aria-label="${comparisons.includes(product.id) ? 'Вилучити з порівняння' : 'Додати до порівняння'}" aria-pressed="${comparisons.includes(product.id)}">
                <i class="bi bi-bar-chart" aria-hidden="true"></i>
              </button>
              <button type="button" class="btn btn-green rounded-pill btn-sm px-3 py-2" data-add="${product.id}" aria-label="Додати ${escapeHTML(product.short)} до кошика" ${product.inStock ? '' : 'disabled'}>
                <i class="bi bi-cart-plus me-1" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      </article>`;
    }

    function refresh() {
      write('cart', cart);
      write('fav', favorites);
      write('cmp', comparisons);
      const cartCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0);
      $('#cartN').textContent = cartCount;
      $('#cartN').hidden = cartCount === 0;
      $('#favN').textContent = favorites.length;
      $('#favN').hidden = favorites.length === 0;
      $('#cmpN').textContent = comparisons.length;
      $('#cmpN').hidden = comparisons.length === 0;
      const ids = Object.keys(cart).filter(id => productById(id));
      $('#cartItems').innerHTML = ids.length ? ids.map(id => {
        const product = productById(id);
        return `<div class="d-flex gap-2 align-items-center border-bottom py-2">
          <img src="${escapeHTML(product.img)}" width="54" height="54" class="rounded object-fit-contain" alt="${escapeHTML(product.short)}">
          <div class="flex-grow-1 min-w-0"><div class="fw-semibold small text-truncate">${escapeHTML(product.short)}</div><div class="small text-success fw-bold">${money(product.price)}</div></div>
          <div class="btn-group btn-group-sm" aria-label="Кількість товару ${escapeHTML(product.short)}">
            <button type="button" class="btn btn-outline-secondary" data-q="${id}" data-d="-1" aria-label="Зменшити кількість">−</button>
            <span class="px-2 align-self-center" aria-live="polite">${cart[id]}</span>
            <button type="button" class="btn btn-outline-secondary" data-q="${id}" data-d="1" aria-label="Збільшити кількість">+</button>
          </div>
        </div>`;
      }).join('') : '<p class="text-muted text-center my-5">Ваш кошик порожній</p>';
      $('#cartTotal').textContent = money(ids.reduce((sum, id) => sum + productById(id).price * cart[id], 0));
      $('#goCheckout').disabled = ids.length === 0;
      $$('#grid [data-product-id]').forEach(card => {
        const id = Number(card.dataset.productId);
        const favoriteButton = card.querySelector('[data-fav]');
        const isFavorite = favorites.includes(id);
        favoriteButton.setAttribute('aria-pressed', String(isFavorite));
        favoriteButton.setAttribute('aria-label', isFavorite ? 'Вилучити з обраного' : 'Додати в обране');
        favoriteButton.innerHTML = `<i class="bi bi-heart${isFavorite ? '-fill' : ''}" aria-hidden="true"></i>`;
        const compareButton = card.querySelector('[data-cmp]');
        const isCompared = comparisons.includes(id);
        compareButton.setAttribute('aria-pressed', String(isCompared));
        compareButton.setAttribute('aria-label', isCompared ? 'Вилучити з порівняння' : 'Додати до порівняння');
      });
    }

    function renderCatalog() {
      const query = $('#searchInput').value.trim().toLowerCase();
      const selectedCategories = $$('.filter-cat:checked').map(input => input.value);
      const selectedBrands = $$('.filter-brand:checked').map(input => input.value);
      const onlyInStock = $('#inStockFilter').checked;
      const minPrice = Number($('#minPrice').value) || 0;
      const maxPrice = Number($('#maxPrice').value) || Infinity;
      const sort = $('#sort').value;
      const list = products.filter(product => {
        const matchesQuery = !query || `${product.name} ${product.brand} ${categories[product.cat]} ${product.description}`.toLowerCase().includes(query);
        return matchesQuery &&
          (!selectedCategories.length || selectedCategories.includes(product.cat)) &&
          (!selectedBrands.length || selectedBrands.includes(product.brand)) &&
          (!onlyInStock || product.inStock === true) &&
          product.price >= minPrice && product.price <= maxPrice;
      });
      list.sort((a, b) => {
        if (sort === 'asc') return a.price - b.price;
        if (sort === 'desc') return b.price - a.price;
        if (sort === 'rate') return average(b) - average(a);
        return b.popularity - a.popularity;
      });
      $('#count').textContent = list.length;
      const activeElement = document.activeElement;
      const focusSelector = activeElement?.dataset?.add ? `[data-add="${activeElement.dataset.add}"]`
        : activeElement?.dataset?.fav ? `[data-fav="${activeElement.dataset.fav}"]`
          : activeElement?.dataset?.cmp ? `[data-cmp="${activeElement.dataset.cmp}"]` : null;
      $('#grid').innerHTML = list.map(cardHTML).join('');
      $('#notFound').hidden = list.length !== 0;
      if (focusSelector) $('#grid').querySelector(focusSelector)?.focus();
    }

    $('#brandsList').innerHTML = [...new Set(products.map(product => product.brand))].map((brand, index) => `
      <div class="form-check mb-1">
        <input class="form-check-input filter-brand" type="checkbox" value="${escapeHTML(brand)}" id="brand-${index}">
        <label class="form-check-label" for="brand-${index}">${escapeHTML(brand)}</label>
      </div>`).join('');
    const hits = [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
    $('#hitsInd').innerHTML = hits.map((product, index) => `
      <button type="button" data-bs-target="#hitsCar" data-bs-slide-to="${index}" class="${index === 0 ? 'active' : ''}" aria-current="${index === 0}" aria-label="Слайд ${index + 1}"></button>`).join('');
    $('#hitsInner').innerHTML = hits.map((product, index) => `
      <div class="carousel-item ${index === 0 ? 'active' : ''}">
        <div class="row align-items-center g-4 px-md-5">
          <div class="col-md-5 text-center"><img src="${escapeHTML(product.img)}" class="img-fluid hit-img" alt="${escapeHTML(product.short)}" width="500" height="500"></div>
          <div class="col-md-7">
            <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 mb-2 fw-semibold"><i class="bi bi-fire me-1" aria-hidden="true"></i> Хіт продажів</span>
            <h3 class="fs-4 fw-bold mb-2">${escapeHTML(product.short)}</h3>
            <div class="mb-3 d-flex align-items-center">${starsHTML(product)}</div>
            <p class="text-muted small mb-4">${Object.values(product.specs).slice(0, 3).map(escapeHTML).join(' • ')}</p>
            <div class="d-flex flex-wrap align-items-center gap-3"><span class="fs-3 fw-extrabold text-success">${money(product.price)}</span>
              <button type="button" class="btn btn-green rounded-pill px-4 py-2" data-add="${product.id}" ${product.inStock ? '' : 'disabled'}><i class="bi bi-cart-plus me-1" aria-hidden="true"></i> Купити</button>
            </div>
          </div>
        </div>
      </div>`).join('');

    document.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return;
      const addButton = event.target.closest('[data-add]');
      const favoriteButton = event.target.closest('[data-fav]');
      const starButton = event.target.closest('[data-s]');
      const compareButton = event.target.closest('[data-cmp]');
      if (addButton) {
        const id = addButton.dataset.add;
        cart[id] = (cart[id] || 0) + 1;
        toast('Товар успішно додано до кошика!');
        refresh();
      } else if (compareButton) {
        const id = Number(compareButton.dataset.cmp);
        comparisons = comparisons.includes(id) ? comparisons.filter(value => value !== id) : [...comparisons, id];
        toast(comparisons.includes(id) ? 'Товар додано до порівняння' : 'Товар вилучено з порівняння');
        refresh();
      } else if (favoriteButton) {
        const id = Number(favoriteButton.dataset.fav);
        favorites = favorites.includes(id) ? favorites.filter(value => value !== id) : [...favorites, id];
        toast(favorites.includes(id) ? 'Додано в обране' : 'Видалено з обраного');
        refresh();
      } else if (starButton) {
        const stars = starButton.closest('.stars');
        if (!stars) return;
        const id = Number(stars.dataset.id);
        const product = productById(id);
        const value = Number(starButton.dataset.s);
        if (!product) return;
        const current = ratingData(product);
        const previous = myRatings[id] || 0;
        ratings[id] = { sum: current.sum - previous + value, n: current.n + (previous ? 0 : 1) };
        myRatings[id] = value;
        write('rate', ratings);
        write('mine', myRatings);
        toast('Дякуємо за вашу оцінку!');
        const rating = Math.round(average(product));
        $$('.stars[data-id="' + id + '"]').forEach(ratingStars => {
          ratingStars.querySelectorAll('.star-btn').forEach(button => {
            const starValue = Number(button.dataset.s);
            button.setAttribute('aria-checked', String(myRatings[id] === starValue));
            button.tabIndex = myRatings[id] === starValue ? 0 : -1;
            button.innerHTML = `<i class="bi bi-star${starValue <= rating ? '-fill' : ''}" aria-hidden="true"></i>`;
          });
          if (ratingStars.nextElementSibling) {
            ratingStars.nextElementSibling.textContent = `${average(product).toFixed(1)} (${ratingData(product).n})`;
          }
        });
      }
    });

    document.addEventListener('keydown', event => {
      if (!(event.target instanceof Element)) return;
      const star = event.target.closest('.star-btn');
      if (!star) return;
      const buttons = [...star.closest('.stars').querySelectorAll('.star-btn')];
      const index = buttons.indexOf(star);
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = (index + 1) % buttons.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      buttons[next].focus();
      buttons[next].click();
    });

    $('#searchForm').addEventListener('submit', event => {
      event.preventDefault();
      renderCatalog();
    });
    $('#searchInput').addEventListener('input', renderCatalog);
    $('#sort').addEventListener('change', renderCatalog);
    $('#filtersForm').addEventListener('input', renderCatalog);
    $('#resetFilters').addEventListener('click', () => {
      $$('#filtersForm input[type="checkbox"]').forEach(input => { input.checked = false; });
      $('#minPrice').value = '';
      $('#maxPrice').value = '';
      $('#searchInput').value = '';
      $('#sort').value = 'pop';
      renderCatalog();
    });
    window.addEventListener('techpulse-cart-updated', () => {
      cart = read('cart', {});
      refresh();
    });
    window.addEventListener('storage', () => {
      cart = read('cart', {});
      favorites = read('fav', []);
      comparisons = read('cmp', []);
      refresh();
      renderCatalog();
    });
    $('#hitsPause').addEventListener('click', event => {
      const carousel = bootstrap.Carousel.getOrCreateInstance($('#hitsCar'));
      const isPaused = event.currentTarget.getAttribute('aria-pressed') !== 'true';
      if (isPaused) carousel.pause();
      else carousel.cycle();
      event.currentTarget.setAttribute('aria-pressed', String(isPaused));
      event.currentTarget.setAttribute('aria-label', isPaused ? 'Продовжити автоматичне гортання' : 'Призупинити автоматичне гортання');
      event.currentTarget.innerHTML = `<i class="bi bi-${isPaused ? 'play' : 'pause'}-fill" aria-hidden="true"></i>`;
    });
    const query = new URLSearchParams(location.search).get('q');
    if (query) $('#searchInput').value = query;
    const carousel = bootstrap.Carousel.getOrCreateInstance($('#hitsCar'), { interval: 5000, ride: 'carousel' });
    carousel.cycle();
    refresh();
    renderCatalog();
  }

  function initializeFavorites(products) {
    const store = window.TechPulseStore;
    const productById = id => products.find(product => product.id === Number(id));
    const grid = document.getElementById('favoritesGrid');
    const selected = new Set();
    let activeCollection = null;
    const getFavorites = () => {
      const value = read('fav', []);
      return Array.isArray(value) ? [...new Set(value.filter(id => productById(id)))] : [];
    };
    const getCollections = () => {
      const value = read('wishlistCollections', []);
      return Array.isArray(value) ? value.filter(collection =>
        collection && typeof collection.id === 'string' &&
        typeof collection.name === 'string' && Array.isArray(collection.productIds)
      ) : [];
    };

    function renderFavorites() {
      const favorites = getFavorites();
      const collection = activeCollection && getCollections().find(item => item.id === activeCollection);
      const items = collection ? collection.productIds.map(productById).filter(Boolean) : favorites.map(productById);
      document.getElementById('collectionViewControls').hidden = !collection;
      document.getElementById('collectionForm').hidden = Boolean(collection);
      document.getElementById('favoritesHeading').textContent = collection ? collection.name : 'Ваше обране';
      if (!items.length) {
        grid.innerHTML = `<div class="empty-state"><i class="bi bi-heart display-4 text-success" aria-hidden="true"></i><p class="fs-5 mt-3">${collection ? 'У цій збірці поки немає товарів.' : 'Обране поки порожнє.'}</p><p class="text-muted">Додавайте гаджети сердечком у каталозі.</p><a href="index.html#catalog" class="btn btn-green rounded-pill">До каталогу</a></div>`;
        return;
      }
      grid.innerHTML = items.map(product => `
        <article class="product">
          <div class="product-img"><img src="${escapeHTML(product.img)}" class="favorite-image" alt="${escapeHTML(product.short)}" width="500" height="500" loading="lazy"></div>
          <div class="p-3 d-flex flex-column flex-grow-1">
            ${collection ? '' : `<label class="form-check mb-2"><input class="form-check-input collection-select" type="checkbox" value="${product.id}" ${selected.has(product.id) ? 'checked' : ''}><span class="form-check-label">Додати до збірки</span></label>`}
            <span class="text-muted small">${escapeHTML(product.brand)}</span>
            <h3 class="fs-6 fw-bold my-1">${escapeHTML(product.short)}</h3>
            <p class="text-success fw-bold mb-3">${money(product.price)}</p>
            <div class="d-flex flex-wrap gap-2 mt-auto">
              <button type="button" class="btn btn-green btn-sm rounded-pill" data-add-favorite="${product.id}" ${product.inStock ? '' : 'disabled'}><i class="bi bi-cart-plus me-1" aria-hidden="true"></i>До кошика</button>
              ${collection ? '' : `<button type="button" class="btn btn-outline-danger btn-sm rounded-pill" data-remove-favorite="${product.id}"><i class="bi bi-trash me-1" aria-hidden="true"></i>Видалити з обраного</button>`}
            </div>
          </div>
        </article>`).join('');
    }

    function renderCollections() {
      const collections = getCollections();
      const target = document.getElementById('collectionsList');
      if (!collections.length) {
        target.innerHTML = '<p class="text-muted">Збережених збірок поки немає. Створіть першу зі свого обраного.</p>';
        return;
      }
      target.innerHTML = collections.map(collection => {
        const items = collection.productIds.map(productById).filter(Boolean);
        const amount = items.reduce((total, product) => total + product.price, 0);
        return `<article class="collection-card">
          <div><h3 class="fs-5 fw-bold mb-1">${escapeHTML(collection.name)}</h3><p class="text-muted mb-0">${items.length} товар(ів) · ${money(amount)}</p></div>
          <div class="d-flex flex-wrap gap-2">
            <button type="button" class="btn btn-outline-success btn-sm rounded-pill" data-view-collection="${escapeHTML(collection.id)}">Переглянути</button>
            <button type="button" class="btn btn-outline-secondary btn-sm rounded-pill" data-export-collection="${escapeHTML(collection.id)}"><i class="bi bi-download me-1" aria-hidden="true"></i>Завантажити список</button>
            <button type="button" class="btn btn-outline-danger btn-sm rounded-pill" data-delete-collection="${escapeHTML(collection.id)}" aria-label="Видалити збірку ${escapeHTML(collection.name)}"><i class="bi bi-trash" aria-hidden="true"></i></button>
          </div>
        </article>`;
      }).join('');
    }

    document.getElementById('collectionForm').addEventListener('submit', event => {
      event.preventDefault();
      const name = document.getElementById('collectionName').value.trim();
      const productIds = [...selected].filter(id => getFavorites().includes(id));
      if (!name || !productIds.length) {
        window.alert('Введіть назву збірки та позначте щонайменше один товар.');
        return;
      }
      const collections = getCollections();
      collections.push({ id: crypto.randomUUID(), name, productIds, createdAt: new Date().toISOString() });
      if (write('wishlistCollections', collections)) {
        selected.clear();
        event.currentTarget.reset();
        renderFavorites();
        renderCollections();
      }
    });
    document.addEventListener('change', event => {
      if (!(event.target instanceof Element) || !event.target.matches('.collection-select')) return;
      const id = Number(event.target.value);
      if (event.target.checked) selected.add(id);
      else selected.delete(id);
    });
    document.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return;
      const remove = event.target.closest('[data-remove-favorite]');
      const add = event.target.closest('[data-add-favorite]');
      const view = event.target.closest('[data-view-collection]');
      const download = event.target.closest('[data-export-collection]');
      const removeCollection = event.target.closest('[data-delete-collection]');
      if (remove) {
        const id = Number(remove.dataset.removeFavorite);
        if (write('fav', getFavorites().filter(favoriteId => favoriteId !== id))) {
          selected.delete(id);
          renderFavorites();
          window.TechPulseShell.refresh();
        }
      } else if (add) {
        const cart = getObject('cart');
        const id = add.dataset.addFavorite;
        cart[id] = (Number(cart[id]) || 0) + 1;
        if (write('cart', cart)) {
          window.TechPulseShell.refresh();
          toast('Товар додано до кошика');
        }
      } else if (view) {
        activeCollection = view.dataset.viewCollection;
        renderFavorites();
        document.getElementById('favoritesHeading').scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (download) {
        const collection = getCollections().find(item => item.id === download.dataset.exportCollection);
        if (!collection) return;
        const data = {
          name: collection.name,
          createdAt: collection.createdAt,
          products: collection.productIds.map(productById).filter(Boolean).map(product => ({
            name: product.name,
            price: product.price,
            specifications: product.specs
          }))
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${collection.name.replace(/[^\p{L}\p{N}-]+/gu, '-').replace(/^-|-$/g, '') || 'techpulse-collection'}.json`;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (removeCollection) {
        const id = removeCollection.dataset.deleteCollection;
        if (write('wishlistCollections', getCollections().filter(collection => collection.id !== id))) {
          if (activeCollection === id) activeCollection = null;
          renderFavorites();
          renderCollections();
        }
      } else if (event.target.closest('#showFavorites')) {
        activeCollection = null;
        renderFavorites();
      }
    });
    window.addEventListener('storage', () => {
      renderFavorites();
      renderCollections();
    });
    renderFavorites();
    renderCollections();
  }

  function initializeCompare(products) {
    const container = document.getElementById('fullCompareContainer');
    const productById = id => products.find(product => product.id === Number(id));

    function renderComparePage() {
      const saved = read('cmp', []);
      const items = Array.isArray(saved) ? [...new Set(saved.filter(id => productById(id)))] : [];
      const compared = items.map(productById);
      if (!compared.length) {
        container.innerHTML = '<div class="empty-state"><i class="bi bi-bar-chart display-4 text-success" aria-hidden="true"></i><p class="fs-5 mt-3">Порівняння поки порожнє.</p><p class="text-muted">Додайте будь-яку кількість товарів до порівняння з каталогу.</p><a href="index.html#catalog" class="btn btn-green rounded-pill">Перейти до каталогу</a></div>';
        return;
      }
      const specKeys = [...new Set(compared.flatMap(product => Object.keys(product.specs)))];
      const rows = [
        { label: 'Категорія', value: product => window.TechPulseStore.CATEGORY_NAMES[product.cat] },
        { label: 'Бренд', value: product => product.brand },
        { label: 'Ціна зараз', value: product => product.price, format: money, best: 'min' },
        { label: 'Ціна до знижки', value: product => product.old || null, format: value => value ? money(value) : '—' },
        { label: 'Знижка', value: product => product.old ? Math.round((1 - product.price / product.old) * 100) : 0, format: value => value ? `${value}%` : '—', best: 'max' },
        { label: 'Рейтинг покупців', value: product => product.r, format: value => `${value.toFixed(1)} / 5`, best: 'max' },
        { label: 'Кількість відгуків', value: product => product.n, format: value => value.toLocaleString('uk-UA') },
        ...specKeys.map(label => ({ label, value: product => product.specs[label] || '—' }))
      ];
      const bestValues = Object.fromEntries(rows.filter(row => row.best).map(row => {
        const values = compared.map(row.value).filter(value => typeof value === 'number' && value > 0);
        return [row.label, row.best === 'min' ? Math.min(...values) : Math.max(...values)];
      }));
      container.innerHTML = `<div class="comparison-card"><div class="table-responsive">
        <table class="table table-bordered align-middle comparison-table mb-0">
          <thead><tr><th scope="col" class="comparison-label">Характеристика</th>
            ${compared.map(product => `<th scope="col" class="comparison-product">
              <button type="button" class="comparison-remove" data-remove-compare="${product.id}" aria-label="Вилучити ${escapeHTML(product.short)} з порівняння"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
              <img src="${escapeHTML(product.img)}" width="112" height="112" loading="lazy" alt="" class="comparison-image">
              <span class="d-block">${escapeHTML(product.short)}</span><span class="d-block text-success fw-bold mt-1">${money(product.price)}</span>
            </th>`).join('')}
          </tr></thead><tbody>${rows.map(row => {
            const values = compared.map(row.value);
            const different = new Set(values.map(value => String(value))).size > 1;
            return `<tr class="${different ? 'comparison-different' : ''}"><th scope="row">${escapeHTML(row.label)}</th>
              ${compared.map(product => {
                const value = row.value(product);
                const best = row.best && value === bestValues[row.label] && value > 0;
                return `<td class="${best ? 'comparison-best' : ''}">${escapeHTML(row.format ? row.format(value) : value)}</td>`;
              }).join('')}</tr>`;
          }).join('')}</tbody>
        </table></div></div>`;
    }

    container.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest('[data-remove-compare]');
      if (!button) return;
      const ids = read('cmp', []);
      if (write('cmp', Array.isArray(ids) ? ids.filter(id => Number(id) !== Number(button.dataset.removeCompare)) : [])) {
        renderComparePage();
        window.TechPulseShell.refresh();
      }
    });
    window.addEventListener('storage', renderComparePage);
    renderComparePage();
  }

  function initializeCheckout(products) {
    const productById = id => products.find(product => product.id === Number(id));
    const cart = read('cart', {});
    const items = cart && typeof cart === 'object' && !Array.isArray(cart)
      ? Object.entries(cart).filter(([id, quantity]) =>
        productById(id) && Number.isInteger(quantity) && quantity > 0
      ) : [];
    const list = document.getElementById('checkoutItemsList');
    const subtotal = items.reduce((sum, [id, quantity]) => sum + productById(id).price * quantity, 0);
    const delivery = 1;
    document.getElementById('emptyCheckout').hidden = items.length > 0;
    document.getElementById('checkoutContent').hidden = items.length === 0;
    list.innerHTML = items.map(([id, quantity]) => {
      const product = productById(id);
      return `<li class="d-flex justify-content-between gap-3 border-bottom py-2">
        <span>${escapeHTML(product.short)} <span class="text-muted">× ${quantity}</span></span>
        <strong class="text-nowrap">${money(product.price * quantity)}</strong>
      </li>`;
    }).join('');
    document.getElementById('checkoutSubtotal').textContent = money(subtotal);
    document.getElementById('checkoutDelivery').textContent = money(delivery);
    document.getElementById('checkoutTotal').textContent = money(subtotal + delivery);
    document.getElementById('checkoutForm').addEventListener('submit', event => {
      event.preventDefault();
      if (!items.length || !write('cart', {})) return;
      document.getElementById('orderSuccessAlert').hidden = false;
      document.getElementById('confirmOrder').disabled = true;
      window.TechPulseShell.refresh();
    });
  }

  function initializeTradeIn() {
    document.getElementById('tradeInFullForm').addEventListener('submit', event => {
      event.preventDefault();
      const model = document.getElementById('deviceModel').value.trim();
      const price = Number(document.getElementById('devicePrice').value);
      const factor = Number(document.getElementById('deviceCondition').value);
      const phone = document.getElementById('userContact').value.trim();
      const result = Math.round(price * factor);
      const output = document.getElementById('tradeInOutput');
      output.textContent = `Попередній розрахунок для пристрою «${model}»: ${result.toLocaleString('uk-UA')} ₴. Контакт для зв’язку: ${phone}. У демоверсії заявка не надсилається менеджеру; остаточна сума залежить від огляду пристрою.`;
      output.hidden = false;
    });
  }

  async function initialize() {
    renderHeader();
    const response = await fetch('products.json');
    if (!response.ok) throw new Error(`Не вдалося завантажити products.json (HTTP ${response.status}).`);
    const data = await response.json();
    if (!Array.isArray(data) || data.some(product =>
      !product || !Number.isInteger(product.id) || typeof product.name !== 'string' ||
      !categoryKeys[product.category] || !Number.isFinite(product.price) ||
      (product.oldPrice !== null && !Number.isFinite(product.oldPrice)) ||
      typeof product.brand !== 'string' || !Number.isFinite(product.rating) ||
      !Number.isFinite(product.popularity) || typeof product.image !== 'string' ||
      typeof product.inStock !== 'boolean' || typeof product.description !== 'string'
    )) {
      throw new Error('Файл products.json має неправильну структуру товарів.');
    }
    const products = initializeStore(data);
    initializeShell(products);
    if (document.getElementById('grid')) initializeCatalog(products);
    if (document.getElementById('favoritesGrid')) initializeFavorites(products);
    if (document.getElementById('fullCompareContainer')) initializeCompare(products);
    if (document.getElementById('checkoutForm')) initializeCheckout(products);
    if (document.getElementById('tradeInFullForm')) initializeTradeIn();
  }

  initialize().catch(error => {
    console.error('TechPulse: не вдалося ініціалізувати сторінку.', error);
    showStorageError(`Не вдалося завантажити каталог товарів. ${error.message} Запустіть сайт через локальний вебсервер і перевірте products.json.`);
  });
})();
