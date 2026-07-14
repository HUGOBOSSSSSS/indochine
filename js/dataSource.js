/**
 * Couche d'abstraction des données.
 *
 * Source principale : l'API HTTP publique de Sanity (GROQ), interrogée
 * directement en fetch() — pas besoin du SDK @sanity/client pour de la
 * simple lecture, ce qui garde le site 100% vanilla JS sans étape de build.
 * Le contenu (menu, horaires, avis, infos restaurant) se modifie depuis le
 * Studio : /studio-l'indochine (npm run dev).
 *
 * Si l'appel à Sanity échoue (hors-ligne, dataset vide...), on retombe sur
 * les fichiers JSON locaux de /js/data/ qui servent de filet de sécurité et
 * de jeu de données de démo.
 */

const USE_SANITY = true;

const SANITY_PROJECT_ID = '6x1re4kq';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-01-01';
const SANITY_QUERY_URL = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;

async function sanityFetch(query) {
  const url = `${SANITY_QUERY_URL}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Requête Sanity échouée (${res.status})`);
  const { result } = await res.json();
  return result;
}

const MENU_QUERY = `*[_type == "menuCategory"] | order(order asc) {
  _id, title, "slug": slug.current, order, displayStyle, note,
  "dishes": *[_type == "dish" && references(^._id) && isAvailable == true] | order(order asc) {
    _id, name, "slug": slug.current, description, price,
    "image": image.asset->url, isSpicy, isVegetarian, isSignature, isAvailable, order,
    menuNumber, subgroup, subgroupNote
  }
}`;

const REVIEWS_QUERY = `{
  "reviews": *[_type == "googleReview"] | order(featured desc, date desc) {
    _id, authorName, rating, text, date, source, featured
  },
  "averageRating": round(math::avg(*[_type == "googleReview"].rating) * 10) / 10,
  "reviewCount": count(*[_type == "googleReview"])
}`;

const HOURS_QUERY = `*[_type == "openingHours"][0] { schedule, exceptionalClosures }`;

const INFO_QUERY = `*[_type == "restaurantInfo"][0] {
  name, tagline, description, address, phone, email, geopoint,
  googleMapsEmbedUrl, googleMapsDirectionsUrl, socialLinks,
  "logo": logo.asset->url
}`;

const GALLERY_QUERY = `*[_type == "galleryImage"] | order(order asc) {
  _id, caption, "image": image.asset->url
}`;

async function withFallback(sanityCall, fallbackFile, fallbackMap) {
  if (USE_SANITY) {
    try {
      return await sanityCall();
    } catch (err) {
      console.warn(`Sanity indisponible, repli sur ${fallbackFile} :`, err.message);
    }
  }
  const res = await fetch(`js/data/${fallbackFile}`);
  if (!res.ok) throw new Error(`Impossible de charger ${fallbackFile}.`);
  const data = await res.json();
  return fallbackMap ? fallbackMap(data) : data;
}

export async function getMenu() {
  return withFallback(() => sanityFetch(MENU_QUERY), 'menu.json', (data) => data.categories);
}

export async function getReviews() {
  return withFallback(() => sanityFetch(REVIEWS_QUERY), 'reviews.json');
}

export async function getHours() {
  return withFallback(() => sanityFetch(HOURS_QUERY), 'hours.json');
}

export async function getRestaurantInfo() {
  return withFallback(() => sanityFetch(INFO_QUERY), 'restaurant-info.json');
}

export async function getGallery() {
  return withFallback(() => sanityFetch(GALLERY_QUERY), 'gallery.json', (data) => data.images);
}
