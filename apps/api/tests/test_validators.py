import pytest
import base64
from src.utils.validators import validate_url, validate_file_size

def test_validate_url_valid():
    is_valid, msg = validate_url("https://arxiv.org/pdf/2401.0001.pdf")
    assert is_valid is True
    assert msg == ""

def test_validate_url_invalid_scheme():
    is_valid, msg = validate_url("ftp://example.com/file.pdf")
    assert is_valid is False
    assert "not allowed" in msg

def test_validate_url_local_network():
    is_valid, msg = validate_url("http://127.0.0.1/file.pdf")
    assert is_valid is False
    assert "not allowed" in msg

    is_valid, msg = validate_url("http://localhost:8080/file.pdf")
    assert is_valid is False
    assert "not allowed" in msg

def test_validate_file_size_valid():
    # 1MB mock payload
    payload = base64.b64encode(b"0" * 1024 * 1024).decode('utf-8')
    is_valid, msg = validate_file_size(payload)
    assert is_valid is True
    assert msg == ""

def test_validate_file_size_too_large():
    # Attempt simulated >25MB payload size without using 25MB memory
    # limit in validators is 25MB so pass 26MB
    is_valid, msg = validate_file_size("A" * 26 * 1024 * 1024)
    assert is_valid is False
    assert "exceeds" in msg
