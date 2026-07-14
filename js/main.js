/**
 * Point d'entrée : charge les données (JSON local ↔ futur Sanity) et
 * orchestre le rendu des différentes sections du site.
 */
import { getMenu, getReviews, getHours, getRestaurantInfo, getGallery } from './dataSource.js';
import { initNav } from './nav.js';
import { renderMenu } from './menu.js';
import { renderReviews } from './reviews.js';
import { renderStatusPill, renderHoursTable } from './hours.js';
import { renderGallery } from './gallery.js';

function renderRestaurantInfo(info) {
  document.querySelectorAll('[data-info="phone"]').forEach((el) => {
    el.textContent = info.phone;
    if (el.tagName === 'A') el.href = `tel:${info.phone.replace(/\s+/g, '')}`;
  });

  document.querySelectorAll('[data-info="email"]').forEach((el) => {
    el.textContent = info.email;
    if (el.tagName === 'A') el.href = `mailto:${info.email}`;
  });

  document.querySelectorAll('[data-info="address"]').forEach((el) => {
    el.textContent = `${info.address.street}, ${info.address.postalCode} ${info.address.city}`;
  });

  document.querySelectorAll('[data-info="directions"]').forEach((el) => {
    el.href = info.googleMapsDirectionsUrl;
  });

  document.querySelectorAll('[data-info="map-embed"]').forEach((el) => {
    el.src = info.googleMapsEmbedUrl;
  });

  if (info.logo) {
    document.querySelectorAll('[data-info="logo"]').forEach((el) => {
      el.src = info.logo;
    });
  }

  if (info.heroImage) {
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      heroEl.style.setProperty('--hero-image', `url("${info.heroImage}")`);
      heroEl.classList.add('has-bg-image');
    }
  }

  const fb = document.querySelector('[data-social="facebook"]');
  if (fb) fb.href = info.socialLinks.facebook;

  const ig = document.querySelector('[data-social="instagram"]');
  if (ig) ig.href = info.socialLinks.instagram;

  const ta = document.querySelector('[data-social="tripadvisor"]');
  if (ta) ta.href = info.socialLinks.tripadvisor;
}

function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Pas de backend pour la démo : on simule l'envoi.
    // À brancher plus tard sur un endpoint (Formspree, fonction serverless, etc.)
    const successEl = form.querySelector('.form-success');
    form.reset();
    if (successEl) successEl.classList.add('is-visible');
  });
}

function initHeaderScrollState() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => {
    header.style.boxShadow = window.scrollY > 12 ? '0 8px 24px rgba(0,0,0,0.35)' : 'none';
  };
  document.addEventListener('scroll', onScroll, { passive: true });
}

function setFooterYear() {
  const el = document.querySelector('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

async function init() {
  initNav();
  initContactForm();
  initHeaderScrollState();
  setFooterYear();

  try {
    const [categories, reviewsData, hoursData, info, gallery] = await Promise.all([
      getMenu(),
      getReviews(),
      getHours(),
      getRestaurantInfo(),
      getGallery(),
    ]);

    renderMenu(categories, {
      gridEl: document.querySelector('#menu-grid'),
      filtersEl: document.querySelector('#menu-filters'),
    });

    renderReviews(reviewsData, {
      summaryEl: document.querySelector('#reviews-summary'),
      trackEl: document.querySelector('#reviews-track'),
    });

    renderHoursTable(hoursData, document.querySelector('#hours-table-body'));

    const statusEls = document.querySelectorAll('[data-status-pill]');
    statusEls.forEach((el) => renderStatusPill(hoursData, el));
    // Rafraîchit le statut chaque minute
    setInterval(() => statusEls.forEach((el) => renderStatusPill(hoursData, el)), 60000);

    renderRestaurantInfo(info);

    renderGallery(gallery, {
      sectionEl: document.querySelector('#galerie'),
      trackEl: document.querySelector('#gallery-track'),
    });
  } catch (err) {
    console.error('Erreur lors du chargement des données du site :', err);
  }
}

document.addEventListener('DOMContentLoaded', init);
