/**
 * Galerie photo défilante : aperçu visuel des plats, en complément de la
 * carte (qui n'affiche pas de photo par plat vu le nombre de plats).
 * La section est masquée tant qu'aucune photo n'est renseignée dans Sanity.
 */

function imageCardHTML(item) {
  return `
    <figure class="gallery-card">
      <img src="${item.image}" alt="${item.caption || 'Photo d\'un plat de L\'Indochine'}" loading="lazy" width="320" height="240">
      ${item.caption ? `<figcaption class="gallery-card__caption">${item.caption}</figcaption>` : ''}
    </figure>`;
}

export function renderGallery(images, { sectionEl, trackEl }) {
  if (!sectionEl || !trackEl) return;

  if (!images || images.length === 0) {
    sectionEl.hidden = true;
    return;
  }

  sectionEl.hidden = false;
  trackEl.innerHTML = images.map(imageCardHTML).join('');
}
