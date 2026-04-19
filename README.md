# Tech Note

Markdown-first technical blog built with Next.js (App Router).

## Stack

- Next.js 16 + TypeScript
- Tailwind CSS 4
- Markdown rendering: `gray-matter` + `react-markdown` + `remark-gfm`

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Writing Posts

Create new markdown files in:

- `content/posts/*.md`
- `content/posts/*.mdx`

Required frontmatter fields:

```yaml
---
title: "Post title"
date: "2026-04-20"
summary: "Short summary"
tags:
  - nextjs
  - markdown
draft: false
---
```

## Routes

- `/` home page with latest posts
- `/blog` post list
- `/blog/[slug]` post detail page rendered from markdown

## Notes

- `draft: true` posts are excluded from list and static route generation.
- A sample post is included at `content/posts/welcome-to-tech-note.md`.

## Deployment (Git + systemd + Nginx + HTTPS)

This section documents a typical production setup:

- Bare Git repo on the server: `/opt/git/blog-note.git`
- App working directory on the server: `/var/www/blog-note`
- systemd service name: `blog-note`
- Public domain: `blog.helinyu.site`
- Nginx reverse proxy target: `http://127.0.0.1:3000`

Adjust paths, ports, domains, and branch names to match your environment.

### Local machine: push changes

Commit as usual:

```bash
git status
git add .
git commit -m "Describe your change"
```

Push to your self-hosted remote (example remote name `publish`):

```bash
git push publish main
```

If your default branch is not `main`, replace it with your actual branch name.

### Server: first-time setup (clone + build + run)

Create a working directory and clone from the bare repo on the same machine:

```bash
sudo mkdir -p /var/www/blog-note
sudo chown -R "$USER":"$USER" /var/www/blog-note
cd /var/www/blog-note

# If Git reports "dubious ownership" for the bare repo path, trust it once:
git config --global --add safe.directory /opt/git/blog-note.git

git clone /opt/git/blog-note.git .
npm ci
npm run build
```

Create a systemd unit (example runs as root for simplicity; prefer `www-data` later):

```bash
sudo tee /etc/systemd/system/blog-note.service > /dev/null <<'EOF'
[Unit]
Description=Blog Note Next.js App
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/var/www/blog-note
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start -- -p 3000
Restart=always
RestartSec=3
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable blog-note
sudo systemctl start blog-note
sudo systemctl status blog-note --no-pager -l
```

Sanity check locally on the server:

```bash
curl -I http://127.0.0.1:3000
```

### Nginx: HTTP reverse proxy first, then HTTPS

Use a temporary HTTP-only site until certificates exist:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name blog.helinyu.site;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable and reload:

```bash
sudo ln -sf /etc/nginx/sites-available/blog.helinyu.site /etc/nginx/sites-enabled/blog.helinyu.site
sudo nginx -t
sudo systemctl reload nginx
```

Issue a certificate (requires DNS `A` record pointing to the server, and ports 80/443 reachable):

```bash
sudo certbot --nginx -d blog.helinyu.site
sudo nginx -t
sudo systemctl reload nginx
```

### Server: routine updates after you push code

```bash
cd /var/www/blog-note
git pull
npm ci
npm run build
sudo systemctl restart blog-note
sudo systemctl status blog-note --no-pager -l
```

If something fails, check logs:

```bash
sudo journalctl -u blog-note -n 100 --no-pager
```

### Common pitfalls (quick fixes)

- **Port conflicts**: if `3000` is taken, pick another port for Next.js and update Nginx `proxy_pass` accordingly.
- **Certbot fails with missing cert files**: remove any `ssl_certificate` lines for a domain until the certificate exists; start from HTTP-only, then run certbot.
- **IPv6 listen conflicts**: prefer `listen 443 ssl;` + `listen [::]:443 ssl;` and avoid mixing `ipv6only=on` inconsistently across sites.
- **DNS not ready**: `dig +short blog.helinyu.site A` must return your server IP before certbot can succeed.
