
# MintBank — E‑Banking Demo (Academic Project)

> A front‑end web app that simulates common e‑banking flows — account overview, wallet (cards & external bank accounts), P2P payments, transaction history, and profile — implemented with HTML/CSS/JavaScript and Firebase (Auth + Firestore).

## TL;DR
- **Live demo:** _add your deployed URL here_
- **Stack:** HTML, CSS, JavaScript, Firebase Auth, Firestore
- **Status:** Academic demo — **do NOT use with real banking data**

## Screenshots
Drop screenshots into `docs/screenshots/` and reference them here:
- Home
- Sign in / Sign up
- Account (balance + recent transactions)
- Wallet (link card / link bank)
- Send Payment (amount / currency / method / review / success)
- Profile (edit personal info)

## Features
- Email/Password & Google authentication
- Account overview with recent transactions
- Link/unlink **credit cards** and **external bank accounts**
- P2P payments: send / request
- Transaction history and basic support messaging

## Architecture (high‑level)
- **Front end:** static HTML/CSS/JS
- **Backend-as-a-Service:** Firebase
  - **Auth:** Email/Password + Google provider
  - **Firestore:** core data
  - (Optional) **Storage:** for profile photos

```
/ (static hosting)
├─ /assets
├─ /js
│  ├─ firebaseConfig.js      # Client-side Firebase config
│  ├─ auth.js                # Sign-in/up, session
│  ├─ wallet.js              # Cards / bank accounts
│  ├─ account.js             # Balance + recent tx
│  ├─ payments.js            # Send / request flows
│  └─ profile.js             # Update user info
├─ index.html
├─ login.html
├─ account.html
├─ wallet.html
├─ payment.html
├─ profile.html
└─ docs/
   └─ screenshots/
```

## Firestore Data Model (suggested)
Collections and example documents aligned to the thesis spec, adapted for Firestore:

- `users/{uid}`
  ```json
  {
    "uid": "abc123",
    "firstName": "Omar",
    "lastName": "Morsli",
    "email": "user@example.com",
    "country": "DZ",
    "currency": "DZD",
    "phone": "+213...",
    "zip": "09000",
    "photoURL": "..."
  }
  ```
- `accounts/{accountId}`
  ```json
  {
    "owner": "uid",
    "balance": 150000,
    "currency": "DZD",
    "updatedAt": 1717430400
  }
  ```
- `cards/{cardId}`
  ```json
  {
    "userId": "uid",
    "brand": "VISA",
    "last4": "4242",
    "expMonth": 12,
    "expYear": 2027,
    "createdAt": 1717430400
  }
  ```
- `bankAccounts/{bankId}`
  ```json
  {
    "userId": "uid",
    "routingNumber": "XXX",
    "accountNumberSuffix": "6789",
    "bankName": "Bank X"
  }
  ```
- `transactions/{txId}`
  ```json
  {
    "sender": "uidA",
    "receiver": "uidB",
    "amount": 2500,
    "currency": "DZD",
    "method": "balance|card|bank",
    "status": "success|failed|pending",
    "createdAt": 1717430400,
    "note": "Dinner"
  }
  ```
- `messages/{messageId}` (support messages)
  ```json
  {
    "sender": "uid",
    "content": "Issue with payment...",
    "createdAt": 1717430400
  }
  ```

## Firebase Security Rules (starter)
> Tighten these before any public demo. Test thoroughly with the Firebase Emulator.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isSelf(uid) { return isSignedIn() && request.auth.uid == uid; }

    match /users/{uid} {
      allow read: if isSelf(uid);
      allow create: if isSelf(request.resource.data.uid);
      allow update, delete: if isSelf(resource.data.uid);
    }

    match /accounts/{id} {
      allow read, write: if isSignedIn() && request.auth.uid == resource.data.owner;
    }

    match /cards/{id} {
      allow read, write: if isSignedIn() && request.auth.uid == resource.data.userId;
    }

    match /bankAccounts/{id} {
      allow read, write: if isSignedIn() && request.auth.uid == resource.data.userId;
    }

    match /transactions/{id} {
      allow create: if isSignedIn() && request.resource.data.sender == request.auth.uid;
      allow read: if isSignedIn() && (
        request.auth.uid == resource.data.sender ||
        request.auth.uid == resource.data.receiver
      );
      // No updates/deletes by clients
    }

    match /messages/{id} {
      allow create: if isSignedIn();
      allow read: if isSignedIn() && request.auth.token.admin == true;
    }
  }
}
```

Save as `firebase.rules` and deploy with:
```bash
firebase deploy --only firestore:rules
```

## Local Setup

1) **Clone & install tools**
```bash
git clone https://github.com/<you>/mintbank.git
cd mintbank
# Optional: if you use npm tooling for lint/minify, init your project
npm init -y
```

2) **Create Firebase project**
- Go to console.firebase.google.com → **Add project**.
- Enable **Authentication** (Email/Password + Google).
- Create **Cloud Firestore** in production or test mode (prefer test + tight rules above).
- (Optional) Enable **Storage** for avatars.

3) **Add web app & config**
- Project Settings → **General** → Your apps → **Web** → Register app → copy config.
- Create `js/firebaseConfig.js` with:
```js
// js/firebaseConfig.js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
firebase.initializeApp(firebaseConfig);
// Then initialize the services you use (auth, firestore, storage)...
```

4) **Run locally (static)**
```bash
# Simple Python server (any OS with Python 3)
python3 -m http.server 5173
# or
npx http-server -p 5173
# then open http://localhost:5173
```

## Deployment Options

### Option A — Firebase Hosting (recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting  # choose existing project; set public dir to . or dist; SPA? usually N
firebase deploy
```
**firebase.json** (static site example):
```json
{
  "hosting": {
    "public": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

**GitHub Actions** (auto‑deploy on push to `main`):
- Add `FIREBASE_TOKEN` (from `firebase login:ci`) and `PROJECT_ID` in repo **Settings → Secrets → Actions**.
- `.github/workflows/firebase-hosting.yml`:
```yaml
name: Deploy to Firebase Hosting
on:
  push:
    branches: [ "main" ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm i -g firebase-tools
      - name: Deploy
        env:
          PROJECT_ID: ${{ secrets.PROJECT_ID }}
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
        run: |
          firebase deploy --only hosting --project "$PROJECT_ID" --token "$FIREBASE_TOKEN"
```

### Option B — GitHub Pages (static)
If you don’t need custom Firebase Hosting features, you can serve the static site directly.

- **.github/workflows/gh-pages.yml**
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ "main" ]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - uses: actions/deploy-pages@v4
```

Then enable **Settings → Pages → Deploy from GitHub Actions**.

### Option C — Netlify / Vercel
Connect your repo, set build to **none** (static) and publish directory to `/`. Add Firebase config via environment variables if you prefer injecting it at build time.

## Development Notes
- Keep **secrets** out of the repo. For client Firebase config, use runtime injection or a minimal public config (still safe for client SDK).
- Validate user input and show masked card numbers (`last4`), never store full PAN/cvv in Firestore.
- This project is a **demo**; remove any real‑world banking wording in the UI.

## Roadmap
- Add currency conversion service with a free rates API (mock in demo mode).
- Add unit tests for flows (e.g., link card, send payment).
- Use a module bundler (Vite) for cleaner structure and cache busting.
- Add analytics & error reporting.

## License
MIT © <your‑name>

## Credits
Original academic work by the authors credited in the thesis; this repo re‑packages the demo for public presentation.
