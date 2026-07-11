# Setup Supabase — Ale & Sasi Reviews

## 1. Crea il progetto
1. Vai su https://supabase.com, crea un account gratuito e un nuovo progetto.
2. Vai su **Project Settings > API** e copia:
   - `Project URL`
   - `anon public` key

## 2. Crea le tabelle
1. Vai su **SQL Editor**.
2. Incolla ed esegui il contenuto di `supabase-schema.sql`.
3. (Facoltativo) Incolla ed esegui `supabase-seed.sql` se vuoi ripartire con i tuoi esempi (Roma, Milano, ecc.).

## 3. Crea l'utente admin
1. Vai su **Authentication > Users > Add user**.
2. Inserisci la tua email e una password. Questo sarà l'unico account che potrà accedere alla pagina `#/admin`.
3. **Importante**: vai su **Authentication > Settings** e disattiva "Enable email signups" (o simile), così nessun altro potrà registrarsi da solo. L'unico modo per creare account resta il pannello admin di Supabase.

## 4. Collega il sito
1. Apri `app.js`.
2. Sostituisci:
   ```js
   const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
   const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
   ```
   con i valori copiati al punto 1.

## 5. Pubblica il sito
Puoi ospitare `index.html`, `app.js`, `styles.css` su un hosting statico qualsiasi (Netlify, Vercel, GitHub Pages, Cloudflare Pages). Non serve nessun server: tutto il backend è Supabase.

## Cosa cambia rispetto a prima
- I dati (località, ristoranti, punteggi) sono ora salvati in un database Postgres condiviso: tutti i visitatori vedono le stesse cose.
- La pagina `#/admin` chiede login (email + password). Solo tu puoi aggiungere/eliminare contenuti.
- Le foto caricate da file non sono più salvate come base64 dentro ai dati, ma caricate su **Supabase Storage** (bucket `photos`) e referenziate con un URL pubblico — molto più leggero ed efficiente.
- Il pulsante "Ripristina esempi" è stato rimosso: non ha senso su un database condiviso e pubblico (cancellerebbe i dati di tutti). Se vuoi ripartire da zero, esegui di nuovo `supabase-seed.sql` o cancella/reinserisci a mano dal pannello admin.

## Costi
Il piano gratuito di Supabase copre ampiamente un sito di questo tipo (database, auth, storage fino a 1GB, ecc.).
