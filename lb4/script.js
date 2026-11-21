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

  function animateElements(container, selector) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    container.querySelectorAll(selector).forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(8px)';
      window.setTimeout(() => {
        if (!element.isConnected) return;
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 10);
    });
  }

  document.addEventListener('error', event => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.fallback) return;
    image.dataset.fallback = 'true';
    image.src = 'images/cat-phone.png';
  }, true);

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

  function toast(message, type = 'success') {
    showMessage(message, type);
  }

  // Керування індикатором завантаження каталогу.
  function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'flex';
  }

  function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
  }

  // Створює єдине фіксоване сповіщення для дій користувача та помилок.
  function showMessage(text, type = 'success') {
    const alertType = ['success', 'danger', 'warning', 'info'].includes(type) ? type : 'info';
    let container = document.getElementById('messageContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'messageContainer';
      container.className = 'position-fixed top-0 start-50 translate-middle-x p-3 d-grid gap-2';
      container.style.width = 'calc(100% - 1rem)';
      container.style.maxWidth = '36rem';
      container.style.zIndex = '1090';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'false');
      document.body.append(container);
    }

    const alert = document.createElement('div');
    alert.className = `alert alert-${alertType} alert-dismissible fade show shadow`;
    alert.setAttribute('role', alertType === 'danger' ? 'alert' : 'status');
    alert.append(document.createTextNode(text));

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close';
    closeButton.setAttribute('data-bs-dismiss', 'alert');
    closeButton.setAttribute('aria-label', 'Закрити повідомлення');
    closeButton.addEventListener('click', () => {
      if (!window.bootstrap?.Alert) alert.remove();
    });
    alert.append(closeButton);
    container.prepend(alert);

    window.setTimeout(() => {
      if (!alert.isConnected) return;
      if (window.bootstrap?.Alert) bootstrap.Alert.getOrCreateInstance(alert).close();
      else alert.remove();
    }, 3000);
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
                <input type="search" id="searchInput" name="q" maxlength="100" class="form-control rounded-start-pill border-end-0 ps-3" placeholder="Пошук смартфонів та гаджетів..." aria-label="Пошук">
                <button class="btn btn-green rounded-end-pill px-4" type="submit" id="searchBtn" aria-label="Шукати"><i class="bi bi-search" aria-hidden="true"></i></button>
              </div>
            </form>
            <nav class="header-actions" aria-label="Швидкі дії">
              <a href="index.html#top" class="hico home-link"${active('index.html')}><i class="bi bi-house-door" aria-hidden="true"></i><span>Головна</span></a>
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
        <div class="offcanvas-header cart-drawer-heading">
          <div><span class="section-eyebrow">Ваш вибір</span><h2 class="offcanvas-title fs-5 fw-bold mt-1" id="cartOffcanvasLabel"><i class="bi bi-cart3 text-success me-2" aria-hidden="true"></i>Кошик</h2></div>
          <span class="cart-items-badge" id="cartCountValue" aria-live="polite">0</span>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Закрити"></button>
        </div>
        <div class="offcanvas-body d-flex flex-column">
          <div id="cartItems" class="flex-grow-1 overflow-auto pe-1"></div>
          <div class="cart-summary mt-auto">
            <div class="cart-delivery-note"><i class="bi bi-truck me-2" aria-hidden="true"></i>Доставка по Україні — 1 ₴</div>
            <div class="d-flex justify-content-between align-items-center mb-3"><span class="fw-bold">Разом із доставкою</span><span id="cartTotal" class="text-success fs-4 fw-extrabold">0 ₴</span></div>
            <button type="button" id="goCheckout" class="btn btn-green w-100 rounded-pill py-2 fw-semibold" disabled><i class="bi bi-lock me-2" aria-hidden="true"></i>До оформлення</button>
            <button type="button" class="cart-back-link btn btn-link" data-cart-continue>Продовжити покупки</button>
          </div>
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

    // Синхронізує кошик, лічильники header і localStorage.
    function renderCart() {
      const cart = getObject('cart');
      const items = Object.entries(cart).filter(([id, quantity]) =>
        productById(id) && Number.isInteger(quantity) && quantity > 0
      );
      const count = items.reduce((total, [, quantity]) => total + quantity, 0);
      const subtotal = items.reduce((total, [id, quantity]) => total + productById(id).price * quantity, 0);
      const favorites = read('fav', []);
      const comparisons = read('cmp', []);
      const cartBadge = document.getElementById('cartN');
      const favoriteBadge = document.getElementById('favN');
      const compareBadge = document.getElementById('cmpN');
      cartBadge.textContent = count;
      cartBadge.hidden = count === 0;
      document.getElementById('cartCountValue').textContent = count;
      favoriteBadge.textContent = Array.isArray(favorites) ? favorites.length : 0;
      favoriteBadge.hidden = favoriteBadge.textContent === '0';
      compareBadge.textContent = Array.isArray(comparisons) ? comparisons.length : 0;
      compareBadge.hidden = compareBadge.textContent === '0';
      const cartItems = document.getElementById('cartItems');
      const cartMarkup = items.length ? items.map(([id, quantity]) => {
        const item = productById(id);
        return `<article class="cart-line">
          <img src="${escapeHTML(item.img)}" width="88" height="88" class="cart-line-image" alt="${escapeHTML(item.short)}" loading="lazy">
          <div class="cart-line-content">
            <div class="d-flex align-items-start justify-content-between gap-2">
              <div class="min-w-0"><span class="cart-line-brand">${escapeHTML(item.brand)}</span><h3 class="cart-line-title">${escapeHTML(item.short)}</h3></div>
              <button type="button" class="cart-remove" data-cart-remove="${id}" aria-label="Видалити ${escapeHTML(item.short)} з кошика"><i class="bi bi-trash3" aria-hidden="true"></i></button>
            </div>
            <strong class="cart-line-price">${money(item.price * quantity)}</strong>
            <div class="cart-stepper" role="group" aria-label="Кількість товару ${escapeHTML(item.short)}">
              <button type="button" data-q="${id}" data-d="-1" aria-label="Зменшити кількість">−</button>
              <span aria-live="polite">${quantity}</span>
              <button type="button" data-q="${id}" data-d="1" aria-label="Збільшити кількість">+</button>
            </div>
          </div>
        </article>`;
      }) .join('') : `<div class="cart-empty">
          <img src="images/cat-nothing.png" alt="" width="210" height="158">
          <h3>Кошик чекає на покупки</h3>
          <p>Додавайте сюди техніку, яка вам сподобалась.</p>
        </div>`;
      if (cartItems.innerHTML !== cartMarkup) {
        cartItems.style.opacity = '0';
        cartItems.innerHTML = cartMarkup;
        window.requestAnimationFrame(() => {
          cartItems.style.transition = 'opacity 0.22s ease';
          cartItems.style.opacity = '1';
        });
      }
      document.getElementById('cartTotal').textContent = money(subtotal + (items.length ? 1 : 0));
      document.getElementById('goCheckout').disabled = items.length === 0;
    }

    window.TechPulseShell = { refresh: renderCart };
    document.getElementById('goCheckout').addEventListener('click', () => {
      if (!document.getElementById('goCheckout').disabled) location.href = 'checkout.html';
    });
    document.querySelector('[data-cart-continue]').addEventListener('click', () => {
      const drawer = document.getElementById('cartOffcanvas');
      if (drawer && window.bootstrap?.Offcanvas) {
        bootstrap.Offcanvas.getOrCreateInstance(drawer).hide();
      }
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    document.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return;
      const removeButton = event.target.closest('[data-cart-remove]');
      if (removeButton) {
        const cart = getObject('cart');
        const product = productById(removeButton.dataset.cartRemove);
        delete cart[removeButton.dataset.cartRemove];
        if (write('cart', cart)) {
          console.log('TechPulse: товар видалено з кошика', {
            productId: product ? product.id : removeButton.dataset.cartRemove
          });
          renderCart();
          window.dispatchEvent(new CustomEvent('techpulse-cart-updated'));
        }
        return;
      }
      const button = event.target.closest('[data-q]');
      if (!button) return;
      const cart = getObject('cart');
      const id = button.dataset.q;
      const previousQuantity = cart[id] || 0;
      cart[id] = (cart[id] || 0) + Number(button.dataset.d);
      if (cart[id] < 1) delete cart[id];
      if (write('cart', cart)) {
        console.log('TechPulse: змінено кількість товару в кошику', {
          productId: Number(id),
          previousQuantity,
          quantity: cart[id] || 0
        });
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
    const filterPanel = $('#catalogFilterPanel');
    if (filterPanel) {
      const compactLayout = window.matchMedia('(max-width: 991.98px)');
      const syncFilterPanel = () => { filterPanel.open = !compactLayout.matches; };
      syncFilterPanel();
      if (compactLayout.addEventListener) compactLayout.addEventListener('change', syncFilterPanel);
      else compactLayout.addListener(syncFilterPanel);
    }

    cart = cart && typeof cart === 'object' && !Array.isArray(cart)
      ? Object.fromEntries(Object.entries(cart).filter(([id, quantity]) =>
        productById(id) && Number.isInteger(quantity) && quantity > 0
      )) : {};
    favorites = Array.isArray(favorites) ? [...new Set(favorites.filter(id => productById(id)))] : [];
    comparisons = Array.isArray(comparisons) ? [...new Set(comparisons.filter(id => productById(id)))] : [];

    const ratingData = product => ratings[product.id] || { sum: product.r * product.n, n: product.n };
    const average = product => ratingData(product).sum / ratingData(product).n;
    const starsHTML = product => {
      const selectedRating = myRatings[product.id] || 0;
      const stars = [1, 2, 3, 4, 5].map(value => `
        <button type="button" class="star-btn${value <= selectedRating ? ' is-selected' : ''}" role="radio" data-s="${value}" aria-label="Оцінити ${value} з 5" aria-checked="${selectedRating === value}" tabindex="${selectedRating === value || (!selectedRating && value === 1) ? '0' : '-1'}">
          <i class="bi bi-star${value <= selectedRating ? '-fill' : ''}" aria-hidden="true"></i>
        </button>`).join('');
      return `<span class="stars" role="radiogroup" aria-label="Оцінити ${escapeHTML(product.short)}" data-id="${product.id}">${stars}</span>
        <small class="text-muted ms-1 rating-summary">${average(product).toFixed(1)} (${ratingData(product).n})</small>
        ${selectedRating ? '<button type="button" class="star-remove" data-star-remove aria-label="Прибрати свою оцінку" title="Прибрати оцінку"><i class="bi bi-x-lg" aria-hidden="true"></i></button>' : ''}`;
    };

    // Формує розмітку картки товару для каталогу й хітів продажів.
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
      const cartSaved = write('cart', cart);
      write('fav', favorites);
      write('cmp', comparisons);
      window.TechPulseShell.refresh();
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
      return cartSaved;
    }

    // Застосовує пошук, одночасні фільтри та обране сортування до масиву товарів.
    function renderCatalog() {
      const rawQuery = $('#searchInput').value;
      const query = typeof rawQuery === 'string'
        ? rawQuery.trim().replace(/\s+/g, ' ').toLocaleLowerCase('uk-UA').slice(0, 100)
        : '';
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
      console.log('TechPulse: пошук і фільтри каталогу', {
        query,
        categories: selectedCategories,
        brands: selectedBrands,
        onlyInStock,
        minPrice,
        maxPrice,
        sort,
        results: list.length
      });
      const activeElement = document.activeElement;
      const focusSelector = activeElement?.dataset?.add ? `[data-add="${activeElement.dataset.add}"]`
        : activeElement?.dataset?.fav ? `[data-fav="${activeElement.dataset.fav}"]`
          : activeElement?.dataset?.cmp ? `[data-cmp="${activeElement.dataset.cmp}"]` : null;
      $('#grid').innerHTML = list.map(cardHTML).join('');
      animateElements($('#grid'), '.product');
      $('#notFound').hidden = list.length !== 0;
      if (focusSelector) $('#grid').querySelector(focusSelector)?.focus();
    }

    $('#brandsList').innerHTML = [...new Set(products.map(product => product.brand))].map((brand, index) => `
      <div class="form-check mb-1">
        <input class="form-check-input filter-brand" type="checkbox" value="${escapeHTML(brand)}" id="brand-${index}">
        <label class="form-check-label" for="brand-${index}">${escapeHTML(brand)}</label>
      </div>`).join('');
    const hits = [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
    const hitsSection = $('#hitsCar').closest('section');
    if (hitsSection) hitsSection.hidden = hits.length === 0;
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
      const starRemoveButton = event.target.closest('[data-star-remove]');
      const compareButton = event.target.closest('[data-cmp]');
      if (addButton) {
        const id = addButton.dataset.add;
        const product = productById(id);
        if (!product || product.inStock !== true) {
          console.warn('TechPulse: спроба додати недоступний товар до кошика', { productId: id });
          toast('Цей товар зараз недоступний.', 'warning');
          return;
        }
        cart[id] = (cart[id] || 0) + 1;
        if (!refresh()) {
          toast('Не вдалося зберегти кошик. Перевірте налаштування сховища браузера.', 'warning');
          return;
        }
        console.log('TechPulse: товар додано до кошика', {
          productId: product.id,
          name: product.name,
          quantity: cart[id]
        });
        showMessage('Товар додано до кошика!', 'success');
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
      } else if (starRemoveButton) {
        const stars = starRemoveButton.parentElement?.querySelector('.stars');
        if (!stars) return;
        const id = Number(stars.dataset.id);
        const product = productById(id);
        if (!product) return;
        const previous = myRatings[id] || 0;
        if (!previous) return;
        const current = ratingData(product);
        const nextN = Math.max(product.n, current.n - 1);
        ratings[id] = {
          sum: Math.max(0, current.sum - previous),
          n: nextN
        };
        delete myRatings[id];
        write('rate', ratings);
        write('mine', myRatings);
        toast('Вашу оцінку прибрано', 'info');
        $$('.stars[data-id="' + id + '"]').forEach(ratingStars => {
          ratingStars.querySelectorAll('.star-btn').forEach(button => {
            button.classList.remove('is-selected');
            button.setAttribute('aria-checked', 'false');
            button.tabIndex = Number(button.dataset.s) === 1 ? 0 : -1;
            button.innerHTML = '<i class="bi bi-star" aria-hidden="true"></i>';
          });
          ratingStars.parentElement.querySelector('.star-remove')?.remove();
          const summary = ratingStars.parentElement.querySelector('.rating-summary');
          if (summary) summary.textContent = `${average(product).toFixed(1)} (${ratingData(product).n})`;
        });
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
        $$('.stars[data-id="' + id + '"]').forEach(ratingStars => {
          ratingStars.querySelectorAll('.star-btn').forEach(button => {
            const starValue = Number(button.dataset.s);
            button.classList.toggle('is-selected', starValue <= myRatings[id]);
            button.setAttribute('aria-checked', String(myRatings[id] === starValue));
            button.tabIndex = myRatings[id] === starValue ? 0 : -1;
            button.innerHTML = `<i class="bi bi-star${starValue <= myRatings[id] ? '-fill' : ''}" aria-hidden="true"></i>`;
          });
          if (ratingStars.nextElementSibling) {
            ratingStars.nextElementSibling.textContent = `${average(product).toFixed(1)} (${ratingData(product).n})`;
            ratingStars.nextElementSibling.classList.add('rating-summary');
          }
          if (!ratingStars.parentElement.querySelector('.star-remove')) {
            ratingStars.parentElement.insertAdjacentHTML('beforeend',
              '<button type="button" class="star-remove" data-star-remove aria-label="Прибрати свою оцінку" title="Прибрати оцінку"><i class="bi bi-x-lg" aria-hidden="true"></i></button>');
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
    $('#filtersForm').addEventListener('change', event => {
      if (event.target.matches('.filter-cat, .filter-brand, #inStockFilter, #minPrice, #maxPrice')) {
        $('#catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    $('#resetFilters').addEventListener('click', () => {
      $$('#filtersForm input[type="checkbox"]').forEach(input => { input.checked = false; });
      $('#minPrice').value = '';
      $('#maxPrice').value = '';
      $('#searchInput').value = '';
      $('#sort').value = 'pop';
      renderCatalog();
      $('#catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      if (!hits.length) return;
      const carousel = bootstrap.Carousel.getOrCreateInstance($('#hitsCar'));
      const isPaused = event.currentTarget.getAttribute('aria-pressed') !== 'true';
      if (isPaused) carousel.pause();
      else carousel.cycle();
      event.currentTarget.setAttribute('aria-pressed', String(isPaused));
      event.currentTarget.setAttribute('aria-label', isPaused ? 'Продовжити автоматичне гортання' : 'Призупинити автоматичне гортання');
      event.currentTarget.innerHTML = `<i class="bi bi-${isPaused ? 'play' : 'pause'}-fill" aria-hidden="true"></i>`;
    });
    const query = new URLSearchParams(location.search).get('q');
    if (typeof query === 'string') $('#searchInput').value = query.slice(0, 100);
    if (hits.length) {
      const carousel = bootstrap.Carousel.getOrCreateInstance($('#hitsCar'), { interval: 5000, ride: 'carousel' });
      carousel.cycle();
    }
    refresh();
    renderCatalog();
  }

  function initializeFavorites(products) {
    const productById = id => products.find(product => product.id === Number(id));
    const grid = document.getElementById('favoritesGrid');
    const selected = new Set();
    let activeCollection = null;
    const selectionStatus = document.getElementById('collectionSelectionStatus');
    const createCollectionButton = document.getElementById('createCollectionBtn');
    const clearSelectionButton = document.getElementById('clearCollectionSelection');
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

    function syncCollectionSelection() {
      const count = selected.size;
      selectionStatus.textContent = count
        ? `Вибрано товарів: ${count}. Збірки залишаються на цьому пристрої.`
        : 'Познач товари, які хочеш зібрати в окремий список.';
      createCollectionButton.disabled = count === 0;
      clearSelectionButton.hidden = count === 0;
    }

    function renderFavorites() {
      const favorites = getFavorites();
      const comparisons = read('cmp', []);
      const collections = getCollections();
      for (const id of selected) {
        if (!favorites.includes(id)) selected.delete(id);
      }
      const collection = activeCollection && collections.find(item => item.id === activeCollection);
      const items = collection ? collection.productIds.map(productById).filter(Boolean) : favorites.map(productById);
      const hero = document.getElementById('favoritesHero');
      if (hero) hero.hidden = Boolean(collection);
      const collectionsSection = document.getElementById('collectionsSection');
      if (collectionsSection) collectionsSection.hidden = false;
      document.body.classList.toggle('favorites-collection-view', Boolean(collection));
      document.getElementById('favoritesBreadcrumb').innerHTML = collection
        ? `<li class="breadcrumb-item"><a href="index.html">Головна</a></li>
          <li class="breadcrumb-item"><a href="favorites.html">Обране</a></li>
          <li class="breadcrumb-item active" aria-current="page">Збірка «${escapeHTML(collection.name)}»</li>`
        : `<li class="breadcrumb-item"><a href="index.html">Головна</a></li>
          <li class="breadcrumb-item active" aria-current="page">Обране</li>`;
      document.getElementById('collectionViewControls').hidden = !collection;
      document.getElementById('collectionForm').hidden = Boolean(collection) || favorites.length === 0;
      document.getElementById('favoritesHeading').textContent = collection ? collection.name : 'Ваше обране';
      document.getElementById('favoritesDescription').textContent = collection
        ? `Товарів у цій збірці: ${items.length}.`
        : 'Позначте товари, щоб зібрати їх в окремий список.';
      syncCollectionSelection();
      if (!items.length) {
        grid.innerHTML = `<section class="empty-state-visual">
          <div><span class="section-eyebrow"><i class="bi bi-heart me-1" aria-hidden="true"></i> Ще є місце для знахідок</span>
            <h3>${collection ? 'У цій збірці поки порожньо' : 'Обране поки порожнє'}</h3>
            <p>${collection ? 'Поверніться до обраного та додайте товари до цієї збірки.' : 'Натисніть сердечко на картці товару, щоб зберегти його тут.'}</p>
            <a href="index.html#catalog" class="btn btn-green rounded-pill"><i class="bi bi-search me-2" aria-hidden="true"></i>Знайти гаджет</a>
          </div>
          <img src="images/cat-nothing.png" alt="Кіт чекає на нові гаджети" loading="lazy">
        </section>`;
        animateElements(grid, '.empty-state-visual');
        return;
      }
      grid.innerHTML = items.map(product => `
        <article class="product favorite-product">
          <div class="product-img favorite-product-media">
            ${product.old ? `<span class="discount">-${Math.round(100 - product.price / product.old * 100)}%</span>` : ''}
            <img src="${escapeHTML(product.img)}" class="favorite-image" alt="${escapeHTML(product.short)}" width="500" height="500" loading="lazy">
          </div>
          <div class="favorite-product-body">
            ${collection ? '' : `<label class="favorite-select"><input class="form-check-input collection-select" type="checkbox" value="${product.id}" ${selected.has(product.id) ? 'checked' : ''}><span><i class="bi bi-folder-plus me-1" aria-hidden="true"></i>До збірки</span></label>`}
            <span class="text-muted small">${escapeHTML(product.brand)} · ${categoryNames[product.category]}</span>
            <h3 title="${escapeHTML(product.name)}">${escapeHTML(product.short)}</h3>
            <div class="favorite-price">${money(product.price)}${product.old ? `<del>${money(product.old)}</del>` : ''}</div>
            <span class="stock-label ${product.inStock ? 'is-available' : 'is-unavailable'}"><i class="bi bi-${product.inStock ? 'check-circle' : 'x-circle'} me-1" aria-hidden="true"></i>${product.inStock ? 'Є в наявності' : 'Немає в наявності'}</span>
            <div class="favorite-actions">
              <button type="button" class="btn btn-green rounded-pill" data-add-favorite="${product.id}" ${product.inStock ? '' : 'disabled'}><i class="bi bi-cart-plus me-1" aria-hidden="true"></i>До кошика</button>
              <button type="button" class="btn btn-outline-secondary rounded-pill" data-compare-favorite="${product.id}" aria-pressed="${Array.isArray(comparisons) && comparisons.includes(product.id)}"><i class="bi bi-bar-chart me-1" aria-hidden="true"></i>${Array.isArray(comparisons) && comparisons.includes(product.id) ? 'У порівнянні' : 'Порівняти'}</button>
              ${collection ? '' : `<button type="button" class="favorite-remove" data-remove-favorite="${product.id}" aria-label="Видалити ${escapeHTML(product.short)} з обраного"><i class="bi bi-heartbreak" aria-hidden="true"></i></button>`}
            </div>
          </div>
        </article>`).join('');
      animateElements(grid, '.favorite-product');
    }

    function renderCollections() {
      const collections = getCollections();
      const target = document.getElementById('collectionsList');
      if (!collections.length) {
        target.innerHTML = '<div class="collection-empty"><i class="bi bi-folder2-open" aria-hidden="true"></i><span>Збірок ще немає. Познач товари вище й створи першу.</span></div>';
        return;
      }
      target.innerHTML = collections.map((collection, index) => {
        const items = collection.productIds.map(productById).filter(Boolean);
        const amount = items.reduce((total, product) => total + product.price, 0);
        return `<article class="collection-card">
          <div class="collection-card-info">
            <span class="collection-card-icon"><i class="bi bi-folder2-open" aria-hidden="true"></i></span>
            <div><span class="collection-card-label">Збірка ${index + 1}</span><h3>${escapeHTML(collection.name)}</h3><p>${items.length} товарів · ${money(amount)}</p></div>
          </div>
          <div class="collection-actions">
            <button type="button" class="btn btn-outline-success btn-sm rounded-pill" data-view-collection="${escapeHTML(collection.id)}"><i class="bi bi-arrow-up-right me-1" aria-hidden="true"></i>Відкрити</button>
            <button type="button" class="btn btn-outline-danger btn-sm rounded-pill" data-delete-collection="${escapeHTML(collection.id)}" aria-label="Видалити збірку ${escapeHTML(collection.name)}"><i class="bi bi-trash" aria-hidden="true"></i></button>
          </div>
        </article>`;
      }).join('');
      animateElements(target, '.collection-card');
    }

    document.getElementById('collectionForm').addEventListener('submit', event => {
      event.preventDefault();
      const name = document.getElementById('collectionName').value.trim();
      const productIds = [...selected].filter(id => getFavorites().includes(id));
      if (!name || !productIds.length) {
        toast('Спочатку позначте товари для збірки.', 'warning');
        return;
      }
      const collections = getCollections();
      const collection = { id: crypto.randomUUID(), name, productIds, createdAt: new Date().toISOString() };
      collections.push(collection);
      if (write('wishlistCollections', collections)) {
        selected.clear();
        event.currentTarget.reset();
        activeCollection = collection.id;
        renderFavorites();
        renderCollections();
        document.getElementById('favoritesHeading').scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast('Збірку створено');
      }
    });
    document.addEventListener('change', event => {
      if (!(event.target instanceof Element) || !event.target.matches('.collection-select')) return;
      const id = Number(event.target.value);
      if (event.target.checked) selected.add(id);
      else selected.delete(id);
      syncCollectionSelection();
    });
    document.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return;
      const remove = event.target.closest('[data-remove-favorite]');
      const add = event.target.closest('[data-add-favorite]');
      const view = event.target.closest('[data-view-collection]');
      const removeCollection = event.target.closest('[data-delete-collection]');
      if (event.target.closest('#selectAllFavorites')) {
        getFavorites().forEach(id => selected.add(id));
        renderFavorites();
      } else if (event.target.closest('#clearCollectionSelection')) {
        selected.clear();
        renderFavorites();
      } else if (remove) {
        const id = Number(remove.dataset.removeFavorite);
        if (write('fav', getFavorites().filter(favoriteId => favoriteId !== id))) {
          selected.delete(id);
          const card = remove.closest('.favorite-product');
          if (card && !card.classList.contains('is-removing')) {
            card.classList.add('is-removing');
            window.setTimeout(renderFavorites, 250);
          } else if (!card) {
            renderFavorites();
          }
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
      } else if (event.target.closest('[data-compare-favorite]')) {
        const button = event.target.closest('[data-compare-favorite]');
        const id = Number(button.dataset.compareFavorite);
        const comparisons = read('cmp', []);
        const next = Array.isArray(comparisons) ? comparisons : [];
        const updated = next.includes(id) ? next.filter(item => item !== id) : [...next, id];
        if (write('cmp', updated)) {
          window.TechPulseShell.refresh();
          renderFavorites();
          toast(updated.includes(id) ? 'Товар додано до порівняння' : 'Товар вилучено з порівняння');
        }
      } else if (view) {
        activeCollection = view.dataset.viewCollection;
        renderFavorites();
        document.getElementById('favoritesHeading').scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        document.getElementById('collectionsHeading').scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    const compareCount = document.getElementById('compareCount');
    const onlyDifferent = document.getElementById('compareOnlyDifferent');
    const clearButton = document.getElementById('clearComparison');
    const productById = id => products.find(product => product.id === Number(id));

    function renderComparePage() {
      const saved = read('cmp', []);
      const items = Array.isArray(saved) ? [...new Set(saved.filter(id => productById(id)))] : [];
      const compared = items.map(productById);
      const countWord = compared.length === 1 ? 'товар' : compared.length > 1 && compared.length < 5 ? 'товари' : 'товарів';
      compareCount.textContent = `${compared.length} ${countWord}`;
      clearButton.disabled = compared.length === 0;
      onlyDifferent.disabled = compared.length < 2;
      if (onlyDifferent.disabled) onlyDifferent.checked = false;
      if (!compared.length) {
        container.innerHTML = `<section class="empty-state-visual">
          <div><span class="section-eyebrow"><i class="bi bi-bar-chart me-1" aria-hidden="true"></i> Порівняй характеристики</span>
            <h2>Поки немає товарів для порівняння</h2>
            <p>Натисни кнопку порівняння на картках товарів — і ми покажемо різницю в цінах та характеристиках.</p>
            <a href="index.html#catalog" class="btn btn-green rounded-pill"><i class="bi bi-plus-lg me-2" aria-hidden="true"></i>Обрати товари</a>
          </div>
          <img src="images/cat-nothing.png" alt="Кіт зі смартфоном" loading="lazy">
        </section>`;
        animateElements(container, '.empty-state-visual');
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
        { label: 'Популярність', value: product => product.popularity, format: value => value.toLocaleString('uk-UA'), best: 'max' },
        { label: 'Наявність', value: product => product.inStock ? 'Є в наявності' : 'Немає в наявності' },
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
              <span class="comparison-brand">${escapeHTML(product.brand)} · ${window.TechPulseStore.CATEGORY_NAMES[product.cat]}</span>
              <span class="comparison-title">${escapeHTML(product.short)}</span><span class="comparison-price">${money(product.price)}</span>
              <span class="stock-label ${product.inStock ? 'is-available' : 'is-unavailable'}"><i class="bi bi-${product.inStock ? 'check-circle' : 'x-circle'} me-1" aria-hidden="true"></i>${product.inStock ? 'Є в наявності' : 'Немає в наявності'}</span>
            </th>`).join('')}
          </tr></thead><tbody>${rows.map(row => {
            const values = compared.map(row.value);
            const different = new Set(values.map(value => String(value))).size > 1;
            if (onlyDifferent.checked && !different) return '';
            return `<tr class="${different ? 'comparison-different' : ''}"><th scope="row">${escapeHTML(row.label)}</th>
              ${compared.map(product => {
                const value = row.value(product);
                const best = row.best && value === bestValues[row.label] && value > 0;
                return `<td class="${best ? 'comparison-best' : ''}">${escapeHTML(row.format ? row.format(value) : value)}</td>`;
              }).join('')}</tr>`;
          }).join('')}</tbody>
        </table></div></div>`;
      animateElements(container, '.comparison-card');
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
    clearButton.addEventListener('click', () => {
      if (write('cmp', [])) {
        renderComparePage();
        window.TechPulseShell.refresh();
      }
    });
    onlyDifferent.addEventListener('change', renderComparePage);
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
      return `<li class="checkout-item">
        <img src="${escapeHTML(product.img)}" alt="" width="68" height="68" loading="lazy">
        <div class="checkout-item-copy">
          <strong>${escapeHTML(product.short)}</strong>
          <span>${quantity} шт. × ${money(product.price)}</span>
        </div>
        <strong class="checkout-item-total">${money(product.price * quantity)}</strong>
      </li>`;
    }).join('');
    document.getElementById('checkoutSubtotal').textContent = money(subtotal);
    document.getElementById('checkoutDelivery').textContent = money(delivery);
    document.getElementById('checkoutTotal').textContent = money(subtotal + delivery);
    const checkoutForm = document.getElementById('checkoutForm');
    const validationMessage = document.getElementById('checkoutValidationMessage');
    checkoutForm.querySelectorAll('.form-control, .form-select').forEach(field => {
      const updateFieldState = () => {
        const empty = field.value.trim() === '';
        field.classList.toggle('is-invalid', !empty && !field.checkValidity());
        field.classList.toggle('is-valid', !empty && field.checkValidity());
      };
      field.addEventListener('input', updateFieldState);
      field.addEventListener('change', updateFieldState);
    });
    checkoutForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!checkoutForm.checkValidity()) {
        checkoutForm.querySelectorAll('.form-control, .form-select').forEach(field => {
          field.classList.toggle('is-invalid', !field.checkValidity());
          field.classList.toggle('is-valid', field.value.trim() !== '' && field.checkValidity());
        });
        if (validationMessage) validationMessage.hidden = false;
        checkoutForm.querySelector(':invalid')?.focus();
        return;
      }
      if (validationMessage) validationMessage.hidden = true;
      if (!items.length || !write('cart', {})) return;
      const orderNumber = `TP-${Date.now().toString().slice(-8)}`;
      const success = document.getElementById('orderSuccessScreen');
      success.innerHTML = `<div class="order-success-copy">
        <span class="order-success-icon"><i class="bi bi-check2" aria-hidden="true"></i></span>
        <span class="section-eyebrow">Дякуємо за замовлення</span>
        <h2>Все готово!</h2>
        <p>Замовлення <strong>${orderNumber}</strong> успішно оформлено.</p>
        <a href="index.html#catalog" class="btn btn-green rounded-pill"><i class="bi bi-arrow-left me-2" aria-hidden="true"></i>Повернутися до каталогу</a>
      </div>
      <img src="images/cat-successful-order.png" alt="Кіт вітає з оформленням замовлення" loading="lazy">`;
      document.getElementById('checkoutContent').hidden = true;
      success.hidden = false;
      const steps = document.querySelectorAll('.checkout-steps li');
      steps.forEach((step, index) => {
        step.classList.remove('is-current');
        step.classList.add('is-complete');
        step.setAttribute('aria-current', index === steps.length - 1 ? 'step' : 'false');
      });
      window.TechPulseShell.refresh();
    });
  }

  function initializeTradeIn() {
    const scrollButton = document.getElementById('tradeInScrollButton');
    const calculator = document.getElementById('tradeInCalculator');
    scrollButton?.addEventListener('click', event => {
      event.preventDefault();
      calculator?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => document.getElementById('deviceModel')?.focus({ preventScroll: true }), 650);
    });
    document.getElementById('tradeInFullForm').addEventListener('submit', event => {
      event.preventDefault();
      const model = document.getElementById('deviceModel').value.trim();
      const price = Number(document.getElementById('devicePrice').value);
      const selectedCondition = event.currentTarget.querySelector('input[name="deviceCondition"]:checked');
      if (!selectedCondition) return;
      const factor = Number(selectedCondition.value);
      const result = Math.round(price * factor);
      const output = document.getElementById('tradeInOutput');
      output.textContent = `Попередня оцінка пристрою «${model}»: ${result.toLocaleString('uk-UA')} ₴. Остаточна сума може змінитися після огляду пристрою.`;
      output.hidden = false;
    });
  }

  async function initialize() {
    renderHeader();
    const catalogGrid = document.getElementById('grid');
    const notFound = document.getElementById('notFound');
    let loading = false;

    function showLoading() {
      if (notFound) notFound.hidden = true;
      if (catalogGrid) catalogGrid.innerHTML = '';
      showLoader();
    }

    function showLoadError() {
      if (catalogGrid) {
        if (notFound) notFound.hidden = true;
        catalogGrid.innerHTML = `
          <div class="catalog-feedback catalog-feedback-error" role="alert">
            <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
            <p class="mb-1">Не вдалося завантажити товари. Перевірте з’єднання та спробуйте ще раз.</p>
            <button type="button" class="btn btn-green rounded-pill" id="retryCatalogLoad">
              <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>Оновити
            </button>
          </div>`;
      } else {
        showStorageError('Не вдалося завантажити каталог товарів. Перевірте з’єднання та оновіть сторінку.');
      }
    }

    // Завантажує JSON, перевіряє структуру даних і запускає модулі сторінки.
    async function loadAndInitialize() {
      if (loading) return;
      loading = true;
      try {
        showLoading();
        let data;
        try {
          console.info('TechPulse: завантаження товарів із products.json.');
          const response = await fetch('products.json');
          if (!response.ok) {
            throw new Error(`products.json повернув HTTP ${response.status}.`);
          }
          data = await response.json();
          if (!Array.isArray(data) || data.some(product =>
            !product || !Number.isInteger(product.id) ||
            typeof product.name !== 'string' || !product.name.trim() ||
            !Object.prototype.hasOwnProperty.call(categoryKeys, product.category) ||
            !Number.isFinite(product.price) || product.price < 0 ||
            (product.oldPrice !== null && (!Number.isFinite(product.oldPrice) || product.oldPrice < 0)) ||
            typeof product.brand !== 'string' || !product.brand.trim() ||
            !Number.isFinite(product.rating) || product.rating < 0 || product.rating > 5 ||
            !Number.isFinite(product.popularity) || typeof product.image !== 'string' || !product.image.trim() ||
            typeof product.inStock !== 'boolean' || typeof product.description !== 'string'
          ) || new Set(data.map(product => product.id)).size !== data.length) {
            throw new Error('products.json має неправильну структуру товарів або повторювані id.');
          }
          console.log('TechPulse: завантажені товари', {
            count: data.length,
            ids: data.map(product => product.id),
            products: data
          });
        } catch (error) {
          console.error('TechPulse: помилка завантаження products.json.', error);
          showLoadError();
          showMessage('Не вдалося завантажити products.json. Спробуйте ще раз.', 'danger');
          return;
        }

        try {
          const products = initializeStore(data);
          initializeShell(products);
          if (catalogGrid) initializeCatalog(products);
          if (document.getElementById('favoritesGrid')) initializeFavorites(products);
          if (document.getElementById('fullCompareContainer')) initializeCompare(products);
          if (document.getElementById('checkoutForm')) initializeCheckout(products);
          if (document.getElementById('tradeInFullForm')) initializeTradeIn();
        } catch (error) {
          console.error('TechPulse: помилка ініціалізації сторінки.', error);
          showStorageError('Не вдалося підготувати компоненти сторінки. Перевірте код у консолі DevTools.');
        }
      } finally {
        hideLoader();
        loading = false;
      }
    }

    document.addEventListener('click', event => {
      if (!(event.target instanceof Element) || !event.target.closest('#retryCatalogLoad')) return;
      void loadAndInitialize();
    });

    await loadAndInitialize();
  }

  function start() {
    initialize().catch(error => {
      console.error('TechPulse: не вдалося запустити сторінку.', error);
      showStorageError('Не вдалося запустити магазин. Перевірте код у консолі DevTools.');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
