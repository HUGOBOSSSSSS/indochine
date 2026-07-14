# L'Indochine Wavre — Site vitrine

Site vitrine du restaurant/traiteur vietnamien **L'Indochine** (Wavre, Belgique).
HTML / CSS / JS vanilla pour le site, [Sanity](https://www.sanity.io/) comme CMS (projet `6x1re4kq`, dataset `production`).

## Structure du projet

```
/                          Site (à servir tel quel, aucun build requis)
├── index.html
├── css/                   variables, base, components, layout, responsive
├── js/
│   ├── data/               jeu de données de secours (JSON) — repli si Sanity est indisponible
│   ├── dataSource.js        point d'entrée unique vers les données (Sanity ↔ JSON local)
│   ├── menu.js, reviews.js, hours.js, nav.js, main.js
├── images/                 logo, photos, motifs SVG
└── studio-l'indochine/     Studio Sanity (projet Node séparé, connecté au CMS réel)
```

## Lancer le site

Le site n'a besoin d'aucun build. Comme il utilise `fetch()`, il doit être
servi via un serveur local (et non ouvert en `file://`) :

```bash
npx serve .
# ou
python -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.

## Données : Sanity en source principale

Le site lit ses données (menu, avis, horaires, infos restaurant, logo)
directement depuis l'API publique de Sanity via `fetch()` (GROQ), sans SDK ni
étape de build — voir `js/dataSource.js`. Si la requête à Sanity échoue
(hors-ligne, etc.), le site retombe automatiquement sur les fichiers JSON de
secours dans `js/data/`.

- Project ID : `6x1re4kq`
- Dataset : `production` (lecture publique)
- Pour pointer vers le JSON local uniquement : passer `USE_SANITY = false`
  dans `js/dataSource.js`.

### CORS

Le navigateur appelle l'API Sanity en cross-origin : chaque domaine qui sert
le site doit être autorisé dans les origines CORS du projet. Déjà ajoutés :
`http://localhost:5500`, `http://localhost:3000`, `https://indochinewavre.be`,
`https://www.indochinewavre.be`. Pour ajouter un nouveau domaine (ex. preview
Vercel) :

```bash
cd studio-l'indochine
npx sanity cors add https://mon-domaine.example --no-credentials
```

## Studio Sanity (`/studio-l'indochine`)

Studio Sanity v6 connecté au projet réel, avec les schémas suivants :

- **`dish`** — plats (nom, description, prix, catégorie, image, épicé/végé,
  spécialité, **numéro de plat modifiable** via `menuNumber`, et `subgroup`
  pour les plats à déclinaisons type "Gambas géantes — 10 sauces différentes")
- **`menuCategory`** — catégories de la carte, avec un style d'affichage
  (`grid` = cartes avec photo, `list` = plat de base + déclinaisons)
- **`openingHours`** — document singleton, planning hebdomadaire + fermetures exceptionnelles
- **`googleReview`** — avis (auteur, note, texte, date, mise en avant)
- **`restaurantInfo`** — document singleton, coordonnées, réseaux sociaux, logo, carte

### Mise en route

```bash
cd studio-l'indochine
npm install
npm run dev   # http://localhost:3333
```

Le studio est déjà connecté (`projectId: 6x1re4kq`, `dataset: production`) et
le compte `jacqueminhugo01@gmail.com` y a accès (se connecter via "Google" sur
l'écran de login du studio — c'est un identifiant séparé de la session CLI).
Toute modification (texte, prix, numéro de plat, photo, horaires...) faite
dans le studio est reflétée sur le site au prochain chargement de page — pas
de redéploiement nécessaire.

⚠️ **Vite est figé à la version `8.0.5`** (champ `overrides` dans
`package.json`). La version `8.1.1` (installée par défaut par
`sanity@6.2.0`) plante au démarrage avec une erreur
`Pre-transform error... invalid JS syntax` sur les dépendances bundlées —
bug introduit entre les patchs `8.0.5` et `8.1.1` de Vite, pas lié au code du
projet. Ne pas retirer cet override sans re-tester `npm run dev`. Si une
mise à jour future de `sanity`/`vite` corrige le problème en amont,
l'override pourra être supprimé.

### Réimporter les données depuis les JSON de secours

Le dataset a été initialement peuplé avec le script `studio-l'indochine/scripts/seed.ts`
(lit `js/data/*.json` et écrit dans Sanity, *upsert* via `_id` fixes — donc
sûr à relancer) :

```bash
cd studio-l'indochine
npx sanity exec scripts/seed.ts --with-user-token
```

## À faire avant mise en production

- [ ] Remplacer le favicon par une version carrée recadrée du logo (actuellement le PNG complet est utilisé tel quel)
- [ ] Ajouter les vraies photos des plats depuis le Studio (`dish.image`) — aucune n'est encore renseignée
- [ ] Vérifier/mettre à jour l'adresse, le téléphone et les horaires réels dans le Studio (données de lancement à confirmer)
- [ ] Connecter le formulaire de contact à un service d'envoi (Formspree, fonction serverless, etc.)
- [ ] Mettre à jour les liens réseaux sociaux et l'URL Google Maps réels dans `restaurantInfo`
- [ ] Ajouter le(s) domaine(s) de production définitifs aux origines CORS du projet Sanity
