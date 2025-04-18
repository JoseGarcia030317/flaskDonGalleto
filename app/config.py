import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    # JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    CSRF_SECRET_KEY = os.getenv("CSRF_SECRET_KEY")
    
    DEBUG = os.getenv("DEBUG")
    TESTING = os.getenv("TESTING")
    
    SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE")
    SESSION_COOKIE_HTTPONLY = os.getenv("SESSION_COOKIE_HTTPONLY")
    SESSION_COOKIE_SAMESITE = os.getenv("SESSION_COOKIE_SAMESITE")
    # CSRF_ENABLED = os.getenv("CSRF_ENABLED")
    WTF_CSRF_ENABLED = os.getenv("WTF_CSRF_ENABLED")
    WTF_CSRF_HEADERS = os.getenv("WTF_CSRF_HEADERS", "X-CSRFToken").split(',')
    
    PERMANENT_SESSION_LIFETIME = timedelta(hours=3)
    REMEMBER_COOKIE_DURATION = timedelta(hours=3)
    
    SERVER = os.getenv("SERVER")
    DATABASE = os.getenv("DATABASE")
    USER = os.getenv("USER")
    PASSWORD = os.getenv("PASSWORD")
    
    PORT = os.getenv("PORT")