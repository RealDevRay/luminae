import ipaddress
import logging
from urllib.parse import urlparse

logger = logging.getLogger("luminae.validators")

# Maximum file size: 25MB base64 ≈ ~18MB raw file
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB base64

# Blocked URL schemes
BLOCKED_SCHEMES = {"file", "ftp", "gopher", "data", "javascript", "vbscript"}

# Private/reserverd IP ranges to block (SSRF prevention)
PRIVATE_IP_RANGES = [
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),  # link-local
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("::1/128"),  # IPv6 loopback
    ipaddress.ip_network("fc00::/7"),  # IPv6 private
    ipaddress.ip_network("fe80::/10"),  # IPv6 link-local
]

BLOCKED_HOSTNAMES = {"localhost", "0.0.0.0", "127.0.0.1", "[::1]", "metadata.google.internal"}


def validate_url(url: str) -> tuple[bool, str]:
    """
    Validate a URL for SSRF safety.
    Returns (is_valid, error_message).
    """
    if not url or not isinstance(url, str):
        return False, "URL is required"

    url = url.strip()

    try:
        parsed = urlparse(url)
    except Exception:
        return False, "Invalid URL format"

    # Check scheme
    scheme = (parsed.scheme or "").lower()
    if scheme in BLOCKED_SCHEMES:
        return False, f"URL scheme '{scheme}' is not allowed"
    if scheme not in ("http", "https"):
        return False, f"Only HTTP and HTTPS URLs are supported, got '{scheme}'"

    # Check hostname
    hostname = (parsed.hostname or "").lower()
    if not hostname:
        return False, "URL must include a hostname"

    if hostname in BLOCKED_HOSTNAMES:
        return False, f"Hostname '{hostname}' is not allowed"

    # Check for private IP addresses
    try:
        ip = ipaddress.ip_address(hostname)
        for network in PRIVATE_IP_RANGES:
            if ip in network:
                return False, "Private/reserved IP addresses are not allowed"
    except ValueError:
        # Not an IP address — it's a hostname, which is fine
        pass

    # Block common metadata endpoints
    if "metadata" in hostname and (
        "google" in hostname or "aws" in hostname or "azure" in hostname
    ):
        return False, "Cloud metadata endpoints are not allowed"

    return True, ""


def validate_file_size(file_base64: str) -> tuple[bool, str]:
    """
    Validate that the base64-encoded file doesn't exceed the size limit.
    Returns (is_valid, error_message).
    """
    if not file_base64:
        return True, ""

    size = len(file_base64)
    if size > MAX_FILE_SIZE_BYTES:
        max_mb = MAX_FILE_SIZE_BYTES / (1024 * 1024)
        actual_mb = size / (1024 * 1024)
        return False, f"File too large: {actual_mb:.1f}MB exceeds {max_mb:.0f}MB limit"

    return True, ""
