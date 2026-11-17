# Portfolio Next.js + espace Admin (Supabase)

Site public minimaliste + `/admin` privé avec cloche de notifications en temps réel.

## Structure

```
portfolio-next/
├─ supabase/schema.sql          ← tables, trigger, RLS, realtime, stockage
├─ middleware.js                ← protège /admin côté serveur
├─ lib/
│  ├─ supabase/{client,server,admin,public}.js
│  ├─ tracker.js                ← suivi côté visiteur (après consentement)
│  └─ stats.js · notif.js · mail.js · content.js · defaults.js
├─ components/
│  ├─ Portfolio.jsx · ConsentBanner.jsx          ← site public
│  └─ admin/{AdminShell,NotificationBell,StatsView,VisitsChart,AdminRoot}.jsx
└─ app/
   ├─ page.js · layout.js · site.css · admin.css
   ├─ api/track/route.js        ← enregistre les événements (clé service_role)
   ├─ api/contact/route.js      ← enregistre les messages du formulaire
   └─ admin/
      ├─ login/page.js · signout/route.js
      └─ (panel)/ page.js · notifications · messages · projects · stats · settings
```

## Lancer en local

```bash
cd portfolio-next
cp .env.example .env.local      # puis remplir les 3 clés Supabase
npm install
npm run dev                     # http://localhost:3000   (admin : /admin)
```

Sans clés Supabase, le site public s'affiche quand même (contenu par défaut), mais
le suivi, le formulaire et l'admin sont inactifs.

## Mise en place Supabase (une seule fois)

1. Créez un projet sur https://supabase.com.
2. **SQL Editor** → collez tout `supabase/schema.sql` → **Run**.
3. **Authentication → Users → Add user** : votre email + mot de passe (cochez « Auto Confirm »).
4. Dans le SQL Editor, autorisez ce compte comme admin :
   ```sql
   insert into public.admins (email) values ('votre@email.com');
   ```
5. **Project Settings → API** : copiez l'URL, la clé `anon` et la clé `service_role`.
6. (Conseil) **Authentication → Providers → Email** : désactivez « Allow new users to sign up ».

## Déploiement sur Vercel

1. Poussez le dépôt sur GitHub (le projet est dans le sous-dossier `portfolio-next`).
2. https://vercel.com/new → importez le dépôt.
3. **Root Directory** : `portfolio-next` — Framework : Next.js (détecté).
4. **Environment Variables** (Production + Preview) :
   | Nom | Valeur |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL du projet |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé `anon` |
   | `SUPABASE_SERVICE_ROLE_KEY` | clé `service_role` (**secrète**) |
   | `RESEND_API_KEY`, `NOTIFY_EMAIL_TO`, `NOTIFY_EMAIL_FROM` | optionnel — emails d'alerte |
5. **Deploy**, puis ouvrez `https://votre-site.vercel.app/admin` et connectez-vous.
6. Supabase → **Authentication → URL Configuration** : mettez l'URL Vercel dans *Site URL*.
7. Mettez votre CV dans `public/cv.pdf` (sinon « Télécharger mon CV » renvoie une 404).

Le pays des visiteurs vient de l'en-tête `x-vercel-ip-country` : il n'apparaît qu'en production sur Vercel.

## Emails d'alerte (optionnel)

Compte sur https://resend.com, clé API, puis les 3 variables ci-dessus. Un email part pour
chaque **message** et chaque **visiteur intéressé**.

## Vie privée / RGPD

- Aucune adresse IP n'est lue ni stockée : seuls le pays approximatif, le type d'appareil et un
  identifiant aléatoire anonyme (localStorage) sont enregistrés.
- Le suivi ne démarre qu'après « Accepter » ; « Refuser » efface l'identifiant. Le lien
  « Gérer les cookies » du footer rouvre le choix.
- Le message du formulaire est envoyé volontairement et n'est lié à aucun identifiant de suivi.
- Ajoutez une page « mentions légales / confidentialité » avant la mise en production.

## Sécurité

- `/admin` : middleware (session) + layout serveur (email dans `admins`) + RLS en base.
- `events`, `notifications`, `messages` : lisibles uniquement par un admin.
- Insertions publiques via les routes API (validation, limites de taille, champ piège anti-robot).
- La clé `service_role` n'est utilisée que dans `lib/supabase/admin.js` (routes API serveur).

## Limites connues

- Pas de limitation de débit sur `/api/track` et `/api/contact` (ajoutez Upstash Ratelimit ou le pare-feu Vercel si besoin).
- Les statistiques lisent les 20 000 derniers événements sur 30 jours.
- Témoignages et listes expérience/formation sont dans `components/Portfolio.jsx` (non éditables depuis l'admin).
