# Deploying with Docker

The site runs as **one container** (a standalone Next.js server) with **one volume** (`/data`) that holds everything that changes: the SQLite database with all content, admin accounts, uploaded photos and uploaded videos. There is no separate database server, file storage or cache to run.

```
                 HTTPS                        HTTP :3000
Visitors ───▶ reverse proxy (Caddy/nginx) ───▶ container "web" ───▶ /data/iwan-sukses.db
              (your domain, TLS)                (node server.js)     (Docker volume)
```

## 1. Requirements

- A Linux server (VPS) with Docker Engine 24+ and the Compose plugin (`docker compose version`).
- A domain pointing to the server, e.g. `iwansukses.com`.
- A reverse proxy for HTTPS (Caddy or nginx, examples below). Google sign-in only works on `https://` (or `http://localhost`).
- About 1 GB RAM to build the image. Disk: the image is small; plan for the volume to grow with uploaded videos (up to 150 MB each).

## 2. Volume map

| Container path | Mount | Contents |
| --- | --- | --- |
| `/data` | named volume `data` (in `compose.yaml`) or a host folder | `iwan-sukses.db`: all site content, admin users and invites, uploaded photos (`media` table) and videos (`videos` / `video_chunks` tables) |

That is the only path that needs to persist. Everything else in the container is rebuilt from the image.

- **Named volume (default):** `compose.yaml` mounts `data:/data`. Docker stores it under `/var/lib/docker/volumes/<project>_data/`.
- **Host folder instead:** replace the volume line with e.g. `- /srv/iwan-sukses/data:/data`. The container runs as the `node` user (uid **1000**), so the folder must be writable by it:

  ```bash
  sudo mkdir -p /srv/iwan-sukses/data
  sudo chown 1000:1000 /srv/iwan-sukses/data
  ```

On every start the server creates the database if it is missing, applies new migrations and fills empty tables with the default content. Existing content is never overwritten.

## 3. Environment variables

Put these in a `.env` file next to `compose.yaml` (it is git-ignored). `compose.yaml` refuses to start if a required one is missing.

| Variable | Required | When it is read | What it is |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **yes** in production | **build time** (baked into the image) | Public address of the site, e.g. `https://iwansukses.com`. Used for canonical URLs, `og:image`, the sitemap, and the Google sign-in redirect address. No trailing slash. Changing it requires a rebuild (`--build`). |
| `SESSION_SECRET` | **yes** | runtime | Random string of 32+ characters that signs admin login cookies. Generate with `openssl rand -base64 32`. Changing it logs every admin out. |
| `GOOGLE_CLIENT_ID` | **yes** | runtime | OAuth client ID from Google Cloud (see step 4). |
| `GOOGLE_CLIENT_SECRET` | **yes** | runtime | OAuth client secret from the same client. |
| `PORT` | no (default `3000`) | compose only | Host port the container is published on. The app inside always listens on 3000. |
| `DATABASE_URL` | no | runtime | Defaults to `file:/data/iwan-sukses.db`. Only set it to use a remote libSQL/Turso database instead (`libsql://…`); the `/data` volume is then unused. Add it to `environment:` in `compose.yaml` if you do. |
| `DATABASE_AUTH_TOKEN` | only with Turso | runtime | Auth token for a `libsql://` database. |

Example `.env`:

```dotenv
NEXT_PUBLIC_SITE_URL=https://iwansukses.com
SESSION_SECRET=paste-output-of-openssl-rand-base64-32-here
GOOGLE_CLIENT_ID=1234567890-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
PORT=3000
```

## 4. Google sign-in (one-time setup)

Admins sign in only with Google, so this must be done before the first login.

1. Open [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials) (create a project if needed).
2. If asked, configure the **OAuth consent screen**: type *External*, app name "Iwan Sukses Admin", your support email. Scopes: none beyond the defaults (`openid`, `email`, `profile`). Publish the app (a consent screen left in *Testing* only lets the test users you list sign in).
3. **Create credentials → OAuth client ID → Web application.**
4. Under **Authorized redirect URIs** add exactly:

   ```
   https://iwansukses.com/admin/login/google/callback
   ```

   It must match `NEXT_PUBLIC_SITE_URL` + `/admin/login/google/callback` character for character. For local development, also add `http://localhost:3000/admin/login/google/callback`.
5. Copy the client ID and secret into `.env`.

## 5. First deployment

```bash
git clone <repo-url> iwan-sukses && cd iwan-sukses
cp .env.example .env        # then fill in the values from step 3
docker compose up -d --build
docker compose logs -f web  # wait for "cache: konten disegarkan dari database"
```

On a fresh volume the log shows the default content being added (`db: 8 produk ditambahkan`, …).

**Then sign in right away.** Open `https://<your-domain>/admin/login` and click **Masuk dengan Google**. While there are no accounts yet, the first Google account that signs in becomes the admin, so do this before sharing the address. Other admins are added afterwards under **Pengguna** by their Google email.

## 6. Reverse proxy (HTTPS)

Uploads go through the proxy: photos up to 10 MB per request, videos in 4 MB pieces. Make sure the proxy allows request bodies of at least 12 MB.

**Caddy** (gets certificates automatically), `/etc/caddy/Caddyfile`:

```caddyfile
iwansukses.com {
    request_body {
        max_size 12MB
    }
    reverse_proxy 127.0.0.1:3000
}
```

**nginx** (with certbot for the certificate):

```nginx
server {
    server_name iwansukses.com;
    client_max_body_size 12m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    # listen 443 ssl; ... (added by certbot)
}
```

If the proxy runs on the same host, consider publishing the container only on localhost: change the port line in `compose.yaml` to `"127.0.0.1:${PORT:-3000}:3000"`.

## 7. Updating

```bash
git pull
docker compose up -d --build
```

Migrations run automatically on start; content in `/data` is kept. The old container keeps serving until the new image is built.

## 8. Backup and restore

All state is the single file `/data/iwan-sukses.db`.

```bash
# Consistent backup: stop briefly, copy, start again (a few seconds of downtime)
docker compose stop web
docker compose cp web:/data/iwan-sukses.db ./backup-$(date +%F).db
docker compose start web
```

Restore:

```bash
docker compose stop web
docker compose cp ./backup-2026-10-20.db web:/data/iwan-sukses.db
docker compose start web
```

Keep backups off the server (videos make the file large, so check its size: `docker compose exec web ls -lh /data`).

## 9. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Google shows `Error 400: redirect_uri_mismatch` | The redirect URI in Google Cloud doesn't match `NEXT_PUBLIC_SITE_URL` + `/admin/login/google/callback`. Fix one of them; if you change `NEXT_PUBLIC_SITE_URL`, rebuild with `docker compose up -d --build`. |
| Login page says "Login Google belum diatur" | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` missing in `.env`. |
| "Akun Google ini belum diundang" | An admin already exists. Ask them to invite your Google email under **Pengguna**. |
| Locked out (only admin lost access to their Google account) | Back up and copy the database out (step 8), run `sqlite3 backup.db "DELETE FROM users;"` on your machine, copy it back and start. The next Google login becomes the first admin again. |
| `required variable … is missing` on `compose up` | A required value is empty in `.env`. |
| `SQLITE_CANTOPEN` / permission denied on `/data` | Host-folder mount not writable by uid 1000; see step 2. |
| Uploads fail with "413 Request Entity Too Large" | Raise the proxy body size (step 6). |
| Old content shown right after a restore | Restart the container; it refreshes the page cache from the database on start. |
| Port already in use | Set another `PORT` in `.env`. |
