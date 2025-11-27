#!/bin/bash
# Generate self-signed SSL certificates for SaleSpider
# Platform-agnostic solution - certificates are generated once and reused

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get script directory and SSL directory
# Support both local execution and container execution
if [ -n "$SSL_DIR" ]; then
    # SSL_DIR explicitly set (from deploy script)
    SSL_DIR="$SSL_DIR"
elif [ -d "/ssl" ]; then
    # Running in container
    SSL_DIR="/ssl"
else
    # Running locally
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    SSL_DIR="${SCRIPT_DIR}/../../ssl"
fi

# Create SSL directory at the very beginning
mkdir -p "${SSL_DIR}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       SaleSpider Self-Signed Certificate Generator        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}✓ SSL directory ready: ${SSL_DIR}${NC}"
echo ""

# Load environment variables (only when running locally)
if [ -z "$DOMAIN" ] && [ -f "${SCRIPT_DIR}/../../../.env" ]; then
    source "${SCRIPT_DIR}/../../../.env"
fi

DOMAIN="${DOMAIN:-salespider.local}"
HOST_IP="${HOST_IP:-127.0.0.1}"
CERT_DAYS="${CERT_DAYS:-3650}"  # 10 years

# Auto-detect or validate HOST_IP
if [ "$HOST_IP" = "auto" ]; then
    echo -e "${BLUE}Auto-detecting server IP address...${NC}"
    # Try to get the server's external IP
    HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || hostname -i 2>/dev/null | awk '{print $1}' || ip route get 1 2>/dev/null | awk '{print $7; exit}' || echo "127.0.0.1")
    echo -e "${GREEN}Detected IP: $HOST_IP${NC}"
elif ! echo "$HOST_IP" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$'; then
    echo -e "${YELLOW}⚠ Invalid HOST_IP format: $HOST_IP${NC}"
    echo -e "${BLUE}Using fallback IP: 127.0.0.1${NC}"
    HOST_IP="127.0.0.1"
fi

# Check if certificates already exist
if [ -f "${SSL_DIR}/cert.pem" ] && [ -f "${SSL_DIR}/key.pem" ]; then
    echo -e "${YELLOW}⚠ Certificates already exist!${NC}"
    
    # Skip interactive prompt in container/CI environment
    if [ -t 0 ]; then
        # Interactive terminal available
        echo ""
        read -p "$(echo -e ${YELLOW}Do you want to regenerate them? [y/N]: ${NC})" -n 1 -r
        echo ""
        if [ "$REPLY" != "y" ] && [ "$REPLY" != "Y" ]; then
            echo -e "${BLUE}Using existing certificates${NC}"
            exit 0
        fi
        echo ""
    else
        # Non-interactive (container/CI)
        echo -e "${BLUE}Using existing certificates (non-interactive mode)${NC}"
        exit 0
    fi
fi

echo -e "${YELLOW}→ Generating self-signed certificate...${NC}"
echo -e "  Domain: ${GREEN}${DOMAIN}${NC}"
echo -e "  IP: ${GREEN}${HOST_IP}${NC}"
echo -e "  Valid for: ${GREEN}${CERT_DAYS} days (~10 years)${NC}"
echo ""

# Create OpenSSL configuration file
cat > "${SSL_DIR}/openssl.cnf" <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
x509_extensions = v3_req
distinguished_name = dn

[dn]
C = US
ST = State
L = City
O = SaleSpider
OU = Development
CN = ${DOMAIN}
emailAddress = admin@${DOMAIN}

[v3_req]
subjectAltName = @alt_names
basicConstraints = CA:FALSE
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth, clientAuth

[alt_names]
DNS.1 = ${DOMAIN}
DNS.2 = *.${DOMAIN}
DNS.3 = localhost
DNS.4 = *.localhost
IP.1 = ${HOST_IP}
IP.2 = 127.0.0.1
IP.3 = ::1
EOF

# Generate private key
echo -e "${YELLOW}→ Generating private key...${NC}"
openssl genrsa -out "${SSL_DIR}/key.pem" 2048

# Generate certificate
echo -e "${YELLOW}→ Generating certificate...${NC}"
openssl req -new -x509 \
    -key "${SSL_DIR}/key.pem" \
    -out "${SSL_DIR}/cert.pem" \
    -days ${CERT_DAYS} \
    -config "${SSL_DIR}/openssl.cnf"

# Set proper permissions
chmod 644 "${SSL_DIR}/cert.pem"
chmod 600 "${SSL_DIR}/key.pem"
chmod 644 "${SSL_DIR}/openssl.cnf"

echo -e "${GREEN}✓ Certificates generated successfully!${NC}"
echo ""
echo -e "${BLUE}Certificate files created:${NC}"
echo -e "  • ${SSL_DIR}/cert.pem (public certificate)"
echo -e "  • ${SSL_DIR}/key.pem (private key)"
echo -e "  • ${SSL_DIR}/openssl.cnf (configuration)"
echo ""

# Display certificate info
echo -e "${BLUE}Certificate details:${NC}"
openssl x509 -in "${SSL_DIR}/cert.pem" -noout -subject -issuer -dates -ext subjectAltName | sed 's/^/  /'
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                   CERTIFICATES READY!                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Restart proxy: ${GREEN}docker compose restart proxy${NC}"
echo -e "  2. Access app: ${GREEN}https://${DOMAIN}${NC}"
echo -e "  3. Accept browser security warning (one-time per browser)"
echo ""
echo -e "${BLUE}Note:${NC} These certificates are self-signed, so browsers will show"
echo -e "a security warning. This is normal and expected for development."
echo -e "Simply click 'Advanced' → 'Proceed to site' to continue."
echo ""
