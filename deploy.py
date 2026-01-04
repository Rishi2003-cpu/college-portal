#!/usr/bin/env python3
"""
College Portal - Complete Deployment Automation Script

This script will:
1. Set up Git configuration
2. Commit all files
3. Create GitHub repository
4. Push to GitHub
5. Start local tunnel for immediate sharing

Requirements: Python 3, requests library
"""

import os
import sys
import subprocess
import time
import socket
import webbrowser
from urllib.request import urlopen
from urllib.error import URLError

# Install requests if not available
try:
    import requests
except ImportError:
    subprocess.run([sys.executable, "-m", "pip", "install", "requests"], check=True)
    import requests

GITHUB_USERNAME = "Rishi2003-cpu"
REPO_NAME = "college-portal"
GITHUB_TOKEN = ""  # Add your GitHub Personal Access Token here if you have one

def run_command(cmd, description=""):
    """Run a shell command and return result"""
    print(f"📦 {description}...")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ Error: {result.stderr}")
        return False, result.stderr
    print(f"✅ {description} complete")
    return True, result.stdout

def check_port_in_use(port):
    """Check if a port is in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def kill_port(port):
    """Kill process using a port"""
    try:
        # Find PID using the port
        result = subprocess.run(
            f"lsof -ti:{port} | xargs kill -9 2>/dev/null",
            shell=True, capture_output=True
        )
        print(f"🔪 Freed port {port}")
        return True
    except Exception as e:
        return False

def setup_git():
    """Configure git and commit files"""
    print("\n" + "="*50)
    print("🚀 STEP 1: Setting up Git")
    print("="*50)
    
    # Set git config
    run_command('git config user.name "Rishis Mac"', "Setting git name")
    run_command('git config user.email "rishismac@email.com"', "Setting git email")
    
    # Add and commit
    success, _ = run_command("git add -A", "Adding all files to git")
    if not success:
        return False
    
    success, _ = run_command(
        'git commit -m "College Portal - Complete Flask application with all services"',
        "Committing files"
    )
    return success

def create_github_repo():
    """Create GitHub repository using API"""
    print("\n" + "="*50)
    print("🚀 STEP 2: Creating GitHub Repository")
    print("="*50)
    
    url = "https://api.github.com/user/repos"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"token {GITHUB_TOKEN}"
    }
    data = {
        "name": REPO_NAME,
        "description": "College Portal - Student Services Web Application",
        "private": False,
        "auto_init": False
    }
    
    # Check if token is provided
    if not GITHUB_TOKEN:
        print("⚠️  No GitHub token provided!")
        print("📋 Manual steps to create repository:")
        print("   1. Go to https://github.com/new")
        print(f"   2. Repository name: {REPO_NAME}")
        print("   3. Description: College Portal - Student Services Web Application")
        print("   4. Make it Public")
        print("   5. DO NOT check 'Add a README'")
        print("   6. Click 'Create repository'")
        print("\n   Then run these commands:")
        print(f'   git remote add origin https://github.com/{GITHUB_USERNAME}/{REPO_NAME}.git')
        print("   git branch -M main")
        print("   git push -u origin main")
        return None
    
    # Try to create repo
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 201:
            print(f"✅ Repository '{REPO_NAME}' created successfully!")
            return f"https://github.com/{GITHUB_USERNAME}/{REPO_NAME}.git"
        elif response.status_code == 422:
            print(f"ℹ️  Repository '{REPO_NAME}' already exists")
            return f"https://github.com/{GITHUB_USERNAME}/{REPO_NAME}.git"
        else:
            print(f"❌ Failed to create repository: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error creating repository: {e}")
        return None

def push_to_github(remote_url):
    """Push code to GitHub"""
    print("\n" + "="*50)
    print("🚀 STEP 3: Pushing to GitHub")
    print("="*50)
    
    # Add remote
    success, _ = run_command(
        f'git remote add origin {remote_url}',
        "Adding GitHub remote"
    )
    if not success:
        # Remote might already exist, update it
        run_command(
            f'git remote set-url origin {remote_url}',
            "Updating GitHub remote URL"
        )
    
    # Push
    success, _ = run_command("git branch -M main", "Renaming branch to main")
    if success:
        success, _ = run_command(
            "git push -u origin main",
            "Pushing to GitHub"
        )
    
    return success

def start_flask_server():
    """Start the Flask development server"""
    print("\n" + "="*50)
    print("🚀 STEP 4: Starting Flask Server")
    print("="*50)
    
    port = 5001
    
    # Check if port is in use
    if check_port_in_use(port):
        print(f"⚠️  Port {port} is in use")
        kill_port(port)
    
    # Start Flask in background
    print(f"📦 Starting Flask server on http://localhost:{port}")
    
    env = os.environ.copy()
    env['FLASK_APP'] = 'app.py'
    env['FLASK_ENV'] = 'development'
    
    # Start server
    process = subprocess.Popen(
        [sys.executable, 'app.py'],
        cwd=os.getcwd(),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(3)
    
    # Check if server is running
    if process.poll() is None:
        print(f"✅ Flask server is running on http://localhost:{port}")
        return process
    else:
        print("❌ Failed to start Flask server")
        return None

def start_localtunnel(port):
    """Start localtunnel for quick sharing"""
    print("\n" + "="*50)
    print("🚀 STEP 5: Creating Public Link (LocalTunnel)")
    print("="*50)
    
    # Try to use cloudflared
    cloudflared_path = os.path.join(os.getcwd(), 'cloudflared')
    if os.path.exists(cloudflared_path) and os.path.getsize(cloudflared_path) > 1000:
        print("🌥️  Using Cloudflare Tunnel...")
        process = subprocess.Popen(
            [cloudflared_path, 'tunnel', '--url', f'http://localhost:{port}'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        time.sleep(5)
        return process
    
    # Fallback: provide manual instructions
    print("⚠️  LocalTunnel not available")
    print("\n📋 Quick sharing options:")
    print("\n   Option A - If you have Node.js installed:")
    print(f"   npm install -g localtunnel")
    print(f"   lt --port {port}")
    print("\n   Option B - If you can install Homebrew:")
    print("   /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"")
    print("   brew install node")
    print("   npm install -g localtunnel")
    print(f"   lt --port {port}")
    print("\n   Option C - Use ngrok (create free account at https://ngrok.com):")
    print(f"   ./ngrok http {port}")
    print(f"\n   🌐 Your server is running at: http://localhost:{port}")
    return None

def print_render_deployment_instructions():
    """Print Render.com deployment instructions"""
    print("\n" + "="*50)
    print("🎉 YOUR LOCAL SERVER IS RUNNING!")
    print("="*50)
    print(f"\n🔗 Access your app at: http://localhost:5001")
    print("\n" + "="*50)
    print("🚀 DEPLOY TO RENDER.COM FOR PERMANENT LINK")
    print("="*50)
    print("""
📋 Deployment Steps:

1. Go to https://render.com and sign up with GitHub

2. Create Web Service:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     * Name: college-portal
     * Environment: Python 3
     * Build Command: pip install -r requirements.txt
     * Start Command: gunicorn app:app --bind 0.0.0.0:$PORT
     * Plan: Free

3. Create PostgreSQL Database:
   - Click "New +" → "PostgreSQL"
   - Name: portal-db
   - Plan: Free
   - Copy the "Internal Database URL"

4. Add Environment Variable:
   - Go to Web Service → "Environment"
   - Add: DATABASE_URI = (paste the PostgreSQL URL)

5. Deploy and get your permanent URL:
   https://college-portal.onrender.com

🎯 Demo Login Credentials:
   Student ID: 21CS001
   Password: demo123
""")

def main():
    """Main deployment function"""
    print("\n" + "="*50)
    print("🎓 COLLEGE PORTAL - DEPLOYMENT AUTOMATION")
    print("="*50)
    
    # Step 1: Setup Git
    if not setup_git():
        print("❌ Git setup failed")
        sys.exit(1)
    
    # Step 2: Create GitHub repo
    remote_url = create_github_repo()
    
    # Step 3: Push to GitHub
    if remote_url:
        push_to_github(remote_url)
    
    # Step 4: Start Flask server
    server_process = start_flask_server()
    
    # Step 5: Start localtunnel
    if server_process:
        tunnel_process = start_localtunnel(5001)
    
    # Print instructions
    print_render_deployment_instructions()
    
    print("\n" + "="*50)
    print("✅ DEPLOYMENT SCRIPT COMPLETED!")
    print("="*50)

if __name__ == "__main__":
    main()

