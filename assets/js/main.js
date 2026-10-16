/* House Hamburgueria — interações. Sem bibliotecas externas ou montagem insegura de HTML. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const config = HOUSE_CONFIG;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, className = '', text = '') => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const wrapAnchor = (label, linkType, className = 'button button-primary') => {
    const a = el('a', className, label);
    a.dataset.link = linkType;
    a.href = config[linkType] || '#cardapio';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  };

  // Link único, inclusive para botões criados dinamicamente.
  const whatsappBase = /^\d{12,13}$/.test(config.whatsappNumber)
    ? `https://wa.me/${config.whatsappNumber}` : '';
  const links = {
    delivery: DELIVERY_URL,
    club: config.club,
    instagram: config.instagram,
    maps: config.maps,
    whatsapp: whatsappBase,
    'whatsapp-msg': whatsappBase ? `${whatsappBase}?text=${encodeURIComponent(config.whatsappMessage)}` : ''
  };
  const bindLinks = (root = document) => {
    $$('[data-link]', root).forEach(anchor => {
      const url = links[anchor.dataset.link];
      if (!url) { // Nunca publicar link de contato malformado.
        anchor.removeAttribute('href');
        anchor.setAttribute('aria-disabled', 'true');
        anchor.title = 'Contato pendente de confirmação';
        return;
      }
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    });
  };
  bindLinks();
  /* Janela de delivery restaurada. O botão de acesso direto sempre funciona,
     mesmo quando o iFood bloqueia incorporação por política de segurança. */
  const deliveryModal = $('#deliveryModal');
  const deliveryFrame = $('#deliveryFrame');
  const deliveryOfficial = $('#deliveryOfficial');
  const deliveryClose = $('#deliveryClose');
  let deliveryLastFocus = null;
  deliveryOfficial.href = DELIVERY_URL;
  const closeDelivery = () => {
    if (deliveryModal.hidden) return;
    deliveryModal.classList.remove('is-open');
    deliveryModal.hidden = true;
    deliveryFrame.removeAttribute('src');
    document.body.classList.remove('is-locked');
    deliveryLastFocus?.focus?.();
  };
  const openDelivery = () => {
    closeMenu();
    deliveryLastFocus = document.activeElement;
    deliveryModal.hidden = false;
    requestAnimationFrame(() => deliveryModal.classList.add('is-open'));
    document.body.classList.add('is-locked');
    deliveryFrame.src = DELIVERY_URL;
    deliveryClose.focus();
  };
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[data-link="delivery"]');
    if (!anchor || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    openDelivery();
  });
  deliveryClose.addEventListener('click', closeDelivery);
  deliveryModal.addEventListener('click', event => { if (event.target === deliveryModal) closeDelivery(); });
  document.addEventListener('keydown', event => {
    if (deliveryModal.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closeDelivery(); }
    if (event.key === 'Tab') {
      const items = [deliveryClose, deliveryOfficial];
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items[1].focus(); }
      else if (!event.shiftKey && document.activeElement === items[1]) { event.preventDefault(); items[0].focus(); }
    }
  });
  $('#year').textContent = String(new Date().getFullYear());

  /* Menu mobile fora do elemento fixo do cabeçalho, sem clipping por blur. */
  const toggle = $('#menuToggle');
  const mobileNav = $('#mobileNav');
  const scrim = $('#mobileScrim');
  let menuOpen = false;
  let previousMenuFocus = null;
  const closeMenu = (restoreFocus = false) => {
    if (!menuOpen) return;
    menuOpen = false;
    mobileNav.hidden = true;
    mobileNav.inert = true;
    scrim.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('is-locked');
    if (restoreFocus && previousMenuFocus?.isConnected) previousMenuFocus.focus();
  };
  const openMenu = () => {
    if (menuOpen) return;
    menuOpen = true;
    previousMenuFocus = document.activeElement;
    mobileNav.hidden = false;
    mobileNav.inert = false;
    scrim.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    document.body.classList.add('is-locked');
    $('a', mobileNav)?.focus();
  };
  toggle.addEventListener('click', () => menuOpen ? closeMenu(true) : openMenu());
  scrim.addEventListener('click', () => closeMenu(true));
  $$('a', mobileNav).forEach(link => link.addEventListener('click', () => { if (link.dataset.link !== 'delivery') closeMenu(); }));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) closeMenu();
  });
  const header = $('#siteHeader');
  window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', window.scrollY > 24), { passive: true });
  header.classList.toggle('is-scrolled', window.scrollY > 24);

  const navLinks = $$('.desktop-nav a[href^="#"]');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const hash = `#${entry.target.id}`;
        navLinks.forEach(link => link.getAttribute('href') === hash
          ? link.setAttribute('aria-current', 'location')
          : link.removeAttribute('aria-current'));
      });
    }, { rootMargin: '-27% 0px -60% 0px' });
    $$('main section[id]').forEach(section => spy.observe(section));
  }

  /* Hero — sem avanço automático. Assim não há movimento compulsório nem necessidade de botão de pausa. */
  const heroPhotos = config.heroPhotos.filter(photo => photo && photo.src && photo.alt);
  const heroImg = $('#heroPhoto');
  const heroCaption = $('#heroCaption');
  const heroPlaceholder = $('#heroPlaceholder');
  const carousel = $('#heroCarousel');
  const dots = $('#heroDots');
  let heroIndex = 0;
  let photoRequest = 0;
  const showHero = (index) => {
    if (!heroPhotos.length) return;
    heroIndex = (index + heroPhotos.length) % heroPhotos.length;
    const photo = heroPhotos[heroIndex];
    const request = ++photoRequest;
    const preload = new Image();
    heroImg.classList.add('is-changing');
    preload.onload = () => {
      if (request !== photoRequest) return;
      heroImg.src = photo.src;
      heroImg.alt = photo.alt;
      heroImg.hidden = false;
      heroPlaceholder.hidden = true;
      heroCaption.textContent = photo.caption || '';
      heroCaption.hidden = !photo.caption;
      heroImg.classList.remove('is-changing');
    };
    preload.onerror = () => {
      if (request !== photoRequest) return;
      heroImg.hidden = true;
      heroImg.removeAttribute('src');
      heroPlaceholder.hidden = false;
      heroCaption.hidden = true;
      heroImg.classList.remove('is-changing');
    };
    preload.src = photo.src;
    $$('button', dots).forEach((button, i) => {
      button.setAttribute('aria-current', String(i === heroIndex));
      button.setAttribute('aria-label', `Exibir foto ${i + 1} de ${heroPhotos.length}${i === heroIndex ? ' (atual)' : ''}`);
    });
  };
  if (heroPhotos.length > 1) {
    carousel.hidden = false;
    heroPhotos.forEach((photo, i) => {
      const button = el('button');
      button.type = 'button';
      button.addEventListener('click', () => showHero(i));
      dots.append(button);
    });
    $('#heroPrev').addEventListener('click', () => showHero(heroIndex - 1));
    $('#heroNext').addEventListener('click', () => showHero(heroIndex + 1));
  }
  if (heroPhotos.length) showHero(0);
  // Toque na foto central para avançar rapidamente para o próximo hambúrguer.
  if (heroPhotos.length > 1) {
    heroImg.tabIndex = 0; heroImg.setAttribute('role','button');
    heroImg.setAttribute('aria-label','Selecionar próximo hambúrguer');
    heroImg.addEventListener('click', () => showHero(heroIndex + 1));
    heroImg.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showHero(heroIndex + 1); } });
  }

  /* Produtos reais: nenhuma fotografia, preço ou ingrediente é inventado por este código. */
  const products = config.products.filter(product => product && product.name && product.description);
  if (products.length) {
    $('#menuEmpty').hidden = true;
    const grid = $('#menuGrid');
    grid.hidden = false;
    $('#menuMore').hidden = false;
    products.forEach(product => {
      const card = el('article', 'menu-card');
      const media = el('div', 'menu-card-media');
      if (product.image) {
        const img = el('img');
        img.src = product.image;
        img.alt = product.alt || `Foto de ${product.name}`;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('error', () => {
          img.remove();
          const mark = el('img');
          mark.src = 'assets/images/logo-house.webp';
          mark.alt = '';
          mark.style.cssText = 'width:30%;height:auto;object-fit:contain';
          media.append(mark);
        }, { once: true });
        media.append(img);
      } else {
        const mark = el('img');
        mark.src = 'assets/images/logo-house.webp';
        mark.alt = '';
        mark.style.cssText = 'width:30%;height:auto;object-fit:contain';
        media.append(mark);
      }
      const body = el('div', 'menu-card-content');
      body.append(el('h3', '', product.name), el('p', '', product.description));
      if (product.price) body.append(el('strong', 'price', product.price));
      const order = wrapAnchor('Pedir no iFood ↗', 'delivery');
      order.href = DELIVERY_URL;
      body.append(order);
      card.append(media, body);
      grid.append(card);
    });
    bindLinks(grid);
  }

  /* Imagem do estabelecimento, caso haja fotografia da House autorizada. */
  if (config.aboutPhoto && config.aboutPhotoAlt) {
    const about = $('#aboutPhoto');
    about.src = config.aboutPhoto;
    about.alt = config.aboutPhotoAlt;
    about.onload = () => { about.hidden = false; $('#aboutPlaceholder').hidden = true; };
    about.onerror = () => { about.hidden = true; $('#aboutPlaceholder').hidden = false; };
  }

  /* Horário: só mostra dados confirmados e cadastrados manualmente. */
  if (config.hours.length) {
    const list = $('#hoursList');
    list.replaceChildren();
    config.hours.forEach(({day, time}) => {
      if (!day || !time) return;
      const row = el('li');
      row.append(el('span', '', day), el('strong', '', time));
      list.append(row);
    });
    if (list.children.length) {
      $('#footerHours').textContent = config.hours.map(h => `${h.day}: ${h.time}`).filter(Boolean).join(' · ');
    }
  }

  /* Maps: somente incorpora src oficial/HTTPS fornecido; o link de rota continua funcionando sem iframe. */
  if (config.mapEmbed) {
    try {
      const src = new URL(config.mapEmbed);
      if (src.protocol === 'https:' && /^(www\.)?google\.com$/.test(src.hostname) && src.pathname.startsWith('/maps/embed')) {
        const iframe = el('iframe');
        iframe.src = src.href;
        iframe.title = 'Mapa da House Hamburgueria em Porto Velho';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.allowFullscreen = true;
        $('#mapPanel').replaceChildren(iframe);
      }
    } catch { /* Endereço de incorporação inválido: usa cartão com rota. */ }
  }

  /* Galeria oficial. O lightbox retém foco, fecha com Esc e devolve foco ao botão de origem. */
  const photos = config.galleryPhotos.filter(photo => photo && photo.src && photo.alt);
  const gallery = $('#galleryGrid');
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImage');
  let galleryIndex = 0;
  let galleryLastFocus = null;
  const setLightboxPhoto = (i) => {
    galleryIndex = (i + photos.length) % photos.length;
    lightboxImg.src = photos[galleryIndex].src;
    lightboxImg.alt = photos[galleryIndex].alt;
    $('#lightboxCaption').textContent = photos[galleryIndex].caption || photos[galleryIndex].alt;
    $('#lightboxTitle').textContent = `Galeria House — ${galleryIndex + 1} de ${photos.length}`;
    const multiple = photos.length > 1;
    $('#lightboxPrevious').hidden = !multiple;
    $('#lightboxNext').hidden = !multiple;
  };
  const openLightbox = (i) => {
    galleryLastFocus = document.activeElement;
    gallery.hidden = false;
    setLightboxPhoto(i);
    lightbox.hidden = false;
    document.body.classList.add('is-locked');
    $('#lightboxClose').focus();
  };
  const closeLightbox = () => {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    lightboxImg.removeAttribute('src');
    document.body.classList.remove('is-locked');
    if (galleryLastFocus?.isConnected) galleryLastFocus.focus();
  };
  $('#lightboxClose').addEventListener('click', closeLightbox);
  $('#lightboxPrevious').addEventListener('click', () => setLightboxPhoto(galleryIndex - 1));
  $('#lightboxNext').addEventListener('click', () => setLightboxPhoto(galleryIndex + 1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  if (photos.length) {
    $('#galleryEmpty').hidden = true;
    gallery.hidden = false;
    photos.forEach((photo, i) => {
      const button = el('button', 'gallery-item');
      button.type = 'button';
      button.setAttribute('aria-label', `Ampliar fotografia: ${photo.alt}`);
      const img = el('img');
      img.src = photo.src;
      img.alt = photo.alt;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onerror = () => {
        button.remove();
        if (!gallery.children.length) { gallery.hidden = true; $('#galleryEmpty').hidden = false; }
      };
      button.append(img);
      button.addEventListener('click', () => openLightbox(i));
      gallery.append(button);
    });
  }
  const focusables = root => $$('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])', root)
    .filter(node => !node.hidden && node.getClientRects().length > 0);
  document.addEventListener('keydown', e => {
    if (!lightbox.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); return; }
      if (e.key === 'ArrowRight' && photos.length > 1) setLightboxPhoto(galleryIndex + 1);
      if (e.key === 'ArrowLeft' && photos.length > 1) setLightboxPhoto(galleryIndex - 1);
      if (e.key === 'Tab') {
        const items = focusables(lightbox);
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    if (menuOpen) {
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); return; }
      if (e.key === 'Tab') {
        const items = [toggle, ...focusables(mobileNav)];
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  });
  // Invalid hero/gallery photos fall back cleanly. No auto-scroll, animations or timed modal dependencies.
})();
