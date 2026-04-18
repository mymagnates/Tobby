# Handout Admin Console (Independent App)

This is a standalone admin frontend project.

## Run

```bash
cd admin-console
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy To Firebase (Independent Admin App)

```bash
firebase login --reauth
cd admin-console
npm run build
firebase deploy --only hosting --config firebase.json --project tobbythebutler
```

## Env

- `VITE_ADMIN_API_BASE_URL`: backend API base URL (example: `https://api.yourdomain.com/api`)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

## Deployment

Deploy this app to an independent domain/subdomain such as:

- `admin.yourdomain.com`

## Default Login

- Use Firebase email/password sign-in.
- Account must have custom claim: `admin: true`.
