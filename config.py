"""
Configuration settings for College Portal Backend
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI', 'sqlite:///portal.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # WhatsApp Configuration (Twilio)
    TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
    TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')
    TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', '')
    
    # Admin WhatsApp numbers (comma-separated)
    ADMIN_WHATSAPP = os.environ.get('ADMIN_WHATSAPP', '+919380126330')
    
    # College contact numbers
    XEROX_SHOP = os.environ.get('XEROX_SHOP', '+919380126330')
    MESS_MANAGER = os.environ.get('MESS_MANAGER', '+919380126330')
    FIVESTAR_RESTAURANT = os.environ.get('FIVESTAR_RESTAURANT', '+919380126330')
    CCD = os.environ.get('CCD', '+919380126330')
    STATIONARY_SHOP = os.environ.get('STATIONARY_SHOP', '+919380126330')
    SECURITY_OFFICE = os.environ.get('SECURITY_OFFICE', '+919380126330')
    
    # Application settings
    DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'
    PORT = int(os.environ.get('PORT', 5000))

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///portal.db'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI')

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

