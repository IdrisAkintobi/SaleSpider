# HTTPS Setup Guide for SaleSpider

The SaleSpider deployment uses self-signed SSL certificates for HTTPS. These certificates are generated once and work across all platforms without needing to trust a CA on each machine.

## Quick Start

1. **Generate SSL certificates** (one-time setup):
   ```bash
   cd .docker/scripts/setup
   chmod +x setup-ssl.sh
   ./setup-ssl.sh
   ```

2. **Start/restart the proxy**:
   ```bash
   docker compose restart proxy
   ```

3. **Access your application**:
   - Domain: `https://salespider.local`
   - IP: `https://192.168.1.133`

4. **Accept browser security warning** (one-time per browser) - see instructions below

---

## Trusting the Certificate

### Option 1: Browser Exception (Quickest)

#### Chrome/Edge/Brave
1. Visit `https://salespider.local`
2. Click **"Advanced"** or **"Show details"**
3. Click **"Proceed to salespider.local (unsafe)"** or **"Continue to site"**
4. Done! The warning won't appear again for this site.

#### Firefox
1. Visit `https://salespider.local`
2. Click **"Advanced"**
3. Click **"Accept the Risk and Continue"**
4. Done!

#### Safari
1. Visit `https://salespider.local`
2. Click **"Show Details"**
3. Click **"visit this website"**
4. Click **"Visit Website"** again to confirm
5. Done!

---

### Option 2: System-Wide Trust (Optional - Advanced)

This makes the certificate trusted across all browsers and applications on your machine.

#### macOS

1. **Trust the certificate system-wide**:
   ```bash
   sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain .docker/ssl/cert.pem
   ```

2. **Or manually via Keychain Access**:
   - Open **Keychain Access** app
   - Drag `.docker/ssl/cert.pem` to the **System** keychain
   - Double-click the certificate
   - Expand **Trust** section
   - Set **"When using this certificate"** to **"Always Trust"**
   - Close and enter your password

3. **Restart your browser** for changes to take effect

#### Linux (Ubuntu/Debian)

```bash
# Copy certificate to system trust store
sudo cp .docker/ssl/cert.pem /usr/local/share/ca-certificates/salespider.crt

# Update CA certificates
sudo update-ca-certificates

# Restart browser
```

#### Linux (Fedora/RHEL/CentOS)

```bash
# Copy certificate to system trust store
sudo cp .docker/ssl/cert.pem /etc/pki/ca-trust/source/anchors/salespider.crt

# Update CA trust
sudo update-ca-trust

# Restart browser
```

#### Windows

1. **Install certificate**:
   - Double-click `.docker\ssl\cert.pem`
   - Click **"Install Certificate"**
   - Select **"Local Machine"** → Next
   - Choose **"Place all certificates in the following store"**
   - Click **"Browse"** → Select **"Trusted Root Certification Authorities"**
   - Click **"Next"** → **"Finish"**
   - Click **"Yes"** to confirm

2. **Restart browser**

---

## Mobile Device Access

### iOS/iPhone/iPad

1. **Transfer certificate to iOS device**:
   - Email `.docker/ssl/cert.pem` to yourself
   - Or use AirDrop from Mac
   - Or upload to cloud storage (iCloud, Dropbox, etc.)

2. **Install profile**:
   - Open the `.pem` file on your device
   - Go to **Settings** → **Profile Downloaded**
   - Tap **"Install"** → Enter passcode
   - Tap **"Install"** again → **"Done"**

3. **Trust certificate**:
   - Go to **Settings** → **General** → **About** → **Certificate Trust Settings**
   - Enable the switch for **salespider.local**
   - Tap **"Continue"**

4. **Access**: `https://192.168.1.133` (use your server's IP address)

### Android

1. **Transfer certificate to Android device**:
   - Email `.docker/ssl/cert.pem` to yourself
   - Or use file transfer app
   - Or upload to cloud storage

2. **Install certificate**:
   - Go to **Settings** → **Security** → **Encryption & credentials**
   - Tap **"Install a certificate"** → **"CA certificate"**
   - Tap **"Install anyway"**
   - Browse and select `cert.pem`
   - Enter a name (e.g., "SaleSpider")

3. **Access**: `https://192.168.1.133` (use your server's IP address)

---

## Troubleshooting

### Certificates Not Found

If Caddy can't find the certificates:

```bash
# Check if certificates exist
ls -la .docker/ssl/

# If missing, generate them
cd .docker/scripts/setup
./setup-ssl.sh

# Restart proxy
docker compose restart proxy
```

### Still Getting SSL Errors

1. **Clear browser cache**:
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   - Firefox: Settings → Privacy → Clear Data → Cached Web Content

2. **Check certificate in browser**:
   - Click the padlock icon → Certificate
   - Verify it's issued to your domain (salespider.local)

3. **Verify Caddy configuration**:
   ```bash
   docker exec salespider-proxy cat /etc/caddy/Caddyfile | grep "tls /etc/caddy/certs"
   docker logs salespider-proxy | tail -20
   ```

### Domain Not Resolving

If `salespider.local` doesn't work:

1. **Add to hosts file**:
   ```bash
   # macOS/Linux
   echo "192.168.1.133 salespider.local" | sudo tee -a /etc/hosts
   
   # Windows (run as Administrator)
   echo 192.168.1.133 salespider.local >> C:\Windows\System32\drivers\etc\hosts
   ```

2. **Or use IP directly**: `https://192.168.1.133`

---

## Internal Production Deployment

For internal production deployment with a real domain, simply update `.env`:

```bash
# Use your real internal domain
DOMAIN=salespider.yourcompany.com
```

The system will continue using self-signed certificates, which is appropriate for internal tools where:
- Users can trust the certificate in their browsers/systems (see instructions above)
- The domain is only accessible within your organization
- You want to avoid external CA dependencies

Then restart:
```bash
docker compose restart proxy
```

### Public Production (External Access)

If you need to deploy this for external/public access, you would need to modify the Caddyfile to use Let's Encrypt:

```bash
# In Caddyfile, change:
# tls /etc/caddy/certs/cert.pem /etc/caddy/certs/key.pem
# to:
# tls your-email@example.com
```

---

## Security Notes

- **Self-signed certificates** are perfect for development and internal networks
- They provide the same encryption as real certificates
- The browser warning is just because the certificate isn't issued by a trusted CA
- For production, use Let's Encrypt (automatic with Caddy and a real domain)
- Never ignore certificate warnings on public websites!

---

## Quick Commands

```bash
# Generate certificates (one-time)
cd .docker/scripts/setup && ./setup-ssl.sh

# Restart proxy
docker compose restart proxy

# View Caddy logs
docker logs salespider-proxy

# Check certificate details
openssl x509 -in .docker/ssl/cert.pem -noout -text

# Reload Caddy configuration
docker exec salespider-proxy caddy reload --config /etc/caddy/Caddyfile
```

---

**Need help?** Check the logs: `docker logs salespider-proxy`
