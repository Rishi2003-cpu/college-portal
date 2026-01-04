"""
Gunicorn configuration for College Portal
"""
import os

bind = "0.0.0.0:" + os.environ.get("PORT", "5000")
workers = 2
timeout = 120
keepalive = 5
accesslog = "-"
errorlog = "-"
loglevel = "info"
capture_output = True
enable_stdio_inheritance = True

