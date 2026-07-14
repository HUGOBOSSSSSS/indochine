/**
 * Avis Google : note moyenne + grille des avis.
 */

function starsHTML(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function reviewCardHTML(review) {
  const date = new Date(review.date).toLocaleDateString('fr-BE', { year: 'numeric', month: 'long' });
  return `
    <article class="review-card">
      <div class="review-card__stars" aria-label="Note : ${review.rating} sur 5">${starsHTML(review.rating)}</div>
      <p class="review-card__text">« ${review.text} »</p>
      <div class="review-card__footer">
        <span class="review-card__author">${review.authorName}</span>
        <span>${date} · ${review.source}</span>
      </div>
    </article>`;
}

export function renderReviews(data, { summaryEl, trackEl }) {
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="reviews-summary__score">${data.averageRating.toFixed(1)}</div>
      <div>
        <div class="reviews-summary__stars" aria-hidden="true">${starsHTML(data.averageRating)}</div>
        <p class="section-subtitle">Basé sur ${data.reviewCount} avis Google</p>
      </div>`;
  }

  if (trackEl) {
    const featured = data.reviews.filter((r) => r.featured);
    const list = featured.length ? featured : data.reviews;
    trackEl.innerHTML = list.map(reviewCardHTML).join('');
  }
}
