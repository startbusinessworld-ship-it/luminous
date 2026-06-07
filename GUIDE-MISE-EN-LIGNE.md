# 🚀 Guide de mise en ligne — Luminous

## Ce que vous avez dans ce dossier

```
luminous/
├── public/
│   ├── index.html       ← Le site complet
│   └── success.html     ← Page après paiement
├── api/
│   ├── checkout.js      ← Crée la session de paiement Stripe
│   └── webhook.js       ← Reçoit les confirmations Stripe
├── vercel.json          ← Configuration Vercel
├── package.json         ← Dépendances
└── .env.example         ← Variables d'environnement (modèle)
```

---

## ÉTAPE 1 — Acheter votre domaine

### Option recommandée : Namecheap (.com) ou Gandi (.hk)

**Pour un domaine .hk (plus pro pour votre activité) :**
→ https://www.gandi.net  
→ Recherchez `luminous.hk`  
→ Prix : ~40 $/an pour .hk, ~12 $/an pour .com

**Alternative .com moins chère :**
→ https://www.namecheap.com  
→ Recherchez `luminous-hk.com` ou `luminoushk.com`

---

## ÉTAPE 2 — Créer un compte Vercel (gratuit)

1. Allez sur **https://vercel.com**
2. Cliquez **Sign Up** → choisissez **GitHub** (recommandé)
3. Créez un compte GitHub si vous n'en avez pas : https://github.com

---

## ÉTAPE 3 — Mettre le site sur GitHub

1. Allez sur **https://github.com/new**
2. Nommez le dépôt : `luminous-website`
3. Choisissez **Private** → cliquez **Create repository**
4. Uploadez tous les fichiers du dossier `luminous/` (glisser-déposer)

---

## ÉTAPE 4 — Déployer sur Vercel

1. Sur Vercel, cliquez **Add New Project**
2. Importez votre dépôt GitHub `luminous-website`
3. Cliquez **Deploy** (Vercel détecte automatiquement la config)
4. En 2 minutes, votre site est en ligne sur `luminous-website.vercel.app`

---

## ÉTAPE 5 — Configurer Stripe

### 5a. Créer votre compte Stripe
→ https://dashboard.stripe.com/register  
→ Remplissez vos informations d'entreprise

### 5b. Récupérer vos clés API
→ Stripe Dashboard → **Developers → API keys**  
→ Copiez :
  - `Publishable key` → commence par `pk_live_...`
  - `Secret key` → commence par `sk_live_...`

### 5c. Ajouter les variables dans Vercel
→ Vercel Dashboard → votre projet → **Settings → Environment Variables**

| Variable | Valeur |
|----------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | (voir étape 5d) |

### 5d. Configurer le Webhook Stripe
→ Stripe Dashboard → **Developers → Webhooks → Add endpoint**  
→ URL : `https://votre-domaine.com/api/webhook`  
→ Events : cochez `checkout.session.completed`  
→ Copiez le **Signing secret** (`whsec_...`) → ajoutez-le dans Vercel

---

## ÉTAPE 6 — Connecter votre domaine

### Sur Vercel :
1. Votre projet → **Settings → Domains**
2. Tapez votre domaine (ex: `luminous.hk`) → **Add**
3. Vercel vous donne 2 enregistrements DNS à copier

### Sur Namecheap/Gandi :
1. Allez dans la gestion DNS de votre domaine
2. Ajoutez les enregistrements fournis par Vercel (A record + CNAME)
3. Attendez 5–30 minutes → votre domaine est actif avec HTTPS automatique ✓

---

## ÉTAPE 7 — Mettre à jour le numéro WhatsApp

Dans `public/index.html`, remplacez toutes les occurrences de :
```
https://wa.me/85200000000
```
par votre vrai numéro, ex :
```
https://wa.me/33612345678
```
(format international sans le +, sans espaces)

---

## ÉTAPE 8 — Test final

✅ Visitez votre site sur le domaine  
✅ Cliquez "Payer maintenant" → vérifiez que Stripe s'ouvre  
✅ Faites un paiement test avec la carte `4242 4242 4242 4242` (mode test Stripe)  
✅ Vérifiez que vous arrivez sur `/success`  
✅ Testez le bouton WhatsApp  

---

## Récapitulatif des coûts

| Service | Coût |
|---------|------|
| Vercel (hébergement) | **Gratuit** |
| Domaine .com (Namecheap) | ~12 $/an |
| Domaine .hk (Gandi) | ~40 $/an |
| Stripe (paiement) | **0 €/mois** + 2.9% + 0.30$ par transaction |

---

## 💳 Encaissement Airwallex (remplace Stripe)

L'encaissement client passe désormais par **Airwallex** (page de paiement hébergée).
Stripe Connect reste utilisé uniquement pour **payer les affiliés**.

### Fichiers
- `api/airwallex-checkout.js` — crée le Payment Intent et renvoie l'URL de la page de paiement hébergée.
- `api/airwallex-webhook.js` — reçoit `payment_intent.succeeded`, crée le client/dossier + commission affilié.

### Variables d'environnement à ajouter sur Vercel (Settings → Environment Variables)
```
AIRWALLEX_CLIENT_ID        = <votre Client ID Airwallex>
AIRWALLEX_API_KEY          = <votre API Key Airwallex>
AIRWALLEX_WEBHOOK_SECRET   = <secret du webhook Airwallex>
# Optionnel — pour basculer en mode test :
AIRWALLEX_BASE_URL         = https://api-demo.airwallex.com
AIRWALLEX_CHECKOUT_URL     = https://checkout-demo.airwallex.com
```
> En production, laissez `AIRWALLEX_BASE_URL` / `AIRWALLEX_CHECKOUT_URL` vides (valeurs par défaut = prod).
> ⚠️ Ne jamais committer ces clés dans le code — uniquement dans Vercel.

### Configurer le webhook dans Airwallex
1. Dashboard Airwallex → **Developer → Webhooks → Add webhook**.
2. URL : `https://VOTRE-DOMAINE/api/airwallex-webhook`
3. Événement : `payment_intent.succeeded`.
4. Copier le **Webhook Secret** généré → le coller dans `AIRWALLEX_WEBHOOK_SECRET` sur Vercel.

### Test
✅ Connectez-vous au dashboard → cliquez "Create my company" → la page Airwallex doit s'ouvrir.
✅ Faites un paiement test (cartes de test Airwallex en mode demo).
✅ Vérifiez l'arrivée sur `/success` et la création du dossier dans Supabase.

---

## Support

En cas de problème, contactez-nous sur WhatsApp ou ouvrez une issue sur GitHub.

**Luminous — 徕米诺 · Hong Kong Corporate Services**
