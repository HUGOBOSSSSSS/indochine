/**
 * Menu : rendu des catégories/plats + filtres par catégorie.
 *
 * Deux styles d'affichage par catégorie (cat.displayStyle) :
 * - "list" : liste classique, numéro + nom + description + prix. Les plats
 *            consécutifs partageant le même cat.dishes[].subgroup (ex: "Gambas
 *            géantes — 10 sauces différentes") sont regroupés sous un même
 *            prix, façon carte d'origine du restaurant. Les autres plats
 *            s'affichent en ligne autonome avec leur propre prix.
 * - "grid" : cartes individuelles avec photo. Non utilisé actuellement (toutes
 *            les catégories sont en "list" vu le nombre de plats), mais
 *            reste disponible si une catégorie a un jour de vraies photos
 *            pour chaque plat — il suffit de changer displayStyle dans Sanity.
 */

function badgesHTML(dish) {
  const badges = [];
  if (dish.isSignature) badges.push('<span class="badge badge-signature">★ Spécialité</span>');
  if (dish.isSpicy) badges.push('<span class="badge badge-spicy">🌶 Épicé</span>');
  if (dish.isVegetarian) badges.push('<span class="badge badge-veggie">🌱 Végé</span>');
  return badges.join('');
}

function dishCardHTML(dish) {
  const media = dish.image
    ? `<div class="dish-card__media">
        <img src="${dish.image}" alt="${dish.name}" loading="lazy" width="400" height="300"
             onerror="this.closest('.dish-card__media').style.background='var(--color-bg-alt)'; this.remove();">
      </div>`
    : '<div class="dish-card__media"></div>';

  return `
    <article class="dish-card">
      ${media}
      <div class="dish-card__body">
        <div class="dish-card__top">
          <h3 class="dish-card__name">${dish.name}</h3>
          <span class="dish-card__price">${dish.price.toFixed(2)} €</span>
        </div>
        ${dish.description ? `<p class="dish-card__desc">${dish.description}</p>` : ''}
        <div class="dish-card__badges">${badgesHTML(dish)}</div>
      </div>
    </article>`;
}

/** Ligne d'une déclinaison à l'intérieur d'un sous-groupe (prix partagé, affiché une fois dans l'en-tête). */
function variationRowHTML(dish) {
  return `
    <li class="menu-list__item">
      ${dish.menuNumber ? `<span class="menu-list__number">${dish.menuNumber}</span>` : ''}
      <span class="menu-list__name">${dish.name}</span>
      <span class="menu-list__badges">${badgesHTML(dish)}</span>
    </li>`;
}

/** Ligne d'un plat autonome (son propre prix + description), pour les catégories sans déclinaisons. */
function standaloneRowHTML(dish) {
  return `
    <li class="menu-list__item menu-list__item--standalone">
      ${dish.menuNumber ? `<span class="menu-list__number">${dish.menuNumber}</span>` : ''}
      <div class="menu-list__main">
        <div class="menu-list__name-row">
          <span class="menu-list__name">${dish.name}</span>
          <span class="menu-list__badges">${badgesHTML(dish)}</span>
        </div>
        ${dish.description ? `<p class="menu-list__desc">${dish.description}</p>` : ''}
      </div>
      <span class="menu-list__price">${dish.price.toFixed(2)} €</span>
    </li>`;
}

/** Regroupe les plats consécutifs partageant un même sous-groupe (plat de base + déclinaisons). */
function groupBySubgroup(dishes) {
  const groups = [];
  let current = null;
  dishes.forEach((dish) => {
    const isNewGroup = !dish.subgroup || !current || current.title !== dish.subgroup;
    if (isNewGroup) {
      current = { title: dish.subgroup || null, price: dish.price, note: dish.subgroupNote, items: [] };
      groups.push(current);
    }
    current.items.push(dish);
  });
  return groups;
}

function groupHTML(group) {
  if (!group.title) {
    return `<ul class="menu-list">${group.items.map(standaloneRowHTML).join('')}</ul>`;
  }
  return `
    <div class="menu-subgroup">
      <div class="menu-subgroup__header">
        <h4 class="menu-subgroup__title">${group.title}</h4>
        <span class="menu-subgroup__price">${group.price.toFixed(2)} €</span>
      </div>
      ${group.note ? `<p class="menu-subgroup__note">${group.note}</p>` : ''}
      <ul class="menu-list">${group.items.map(variationRowHTML).join('')}</ul>
    </div>`;
}

function categoryBodyHTML(cat) {
  const available = cat.dishes.filter((d) => d.isAvailable);

  if (cat.displayStyle === 'grid') {
    return `<div class="menu-grid">${available.map(dishCardHTML).join('')}</div>`;
  }

  const groups = groupBySubgroup(available);
  return `<div class="menu-subgroups">${groups.map(groupHTML).join('')}</div>`;
}

export function renderMenu(categories, { gridEl, filtersEl }) {
  if (!gridEl) return;

  gridEl.innerHTML = categories
    .map(
      (cat) => `
        <div class="menu-category" data-category-group="${cat.slug}">
          <h3 class="menu-category-title font-display">${cat.title}</h3>
          ${cat.note ? `<p class="menu-category-note">${cat.note}</p>` : ''}
          ${categoryBodyHTML(cat)}
        </div>`
    )
    .join('');

  if (!filtersEl) return;

  const filters = [{ slug: 'all', title: 'Tout voir' }, ...categories.map((c) => ({ slug: c.slug, title: c.title }))];

  filtersEl.innerHTML = filters
    .map(
      (f, i) =>
        `<button type="button" class="menu-filter" data-filter="${f.slug}" aria-pressed="${i === 0}">${f.title}</button>`
    )
    .join('');

  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.menu-filter');
    if (!btn) return;

    filtersEl.querySelectorAll('.menu-filter').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');

    const filter = btn.dataset.filter;
    gridEl.querySelectorAll('.menu-category').forEach((group) => {
      const show = filter === 'all' || group.dataset.categoryGroup === filter;
      group.style.display = show ? '' : 'none';
    });

    if (filter !== 'all') {
      gridEl.querySelector(`[data-category-group="${filter}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}
