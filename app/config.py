from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Supabase settings
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # Gmail API settings
    GMAIL_CLIENT_ID: str
    GMAIL_CLIENT_SECRET: str
    GMAIL_REFRESH_TOKEN: str
    GMAIL_USER: str
    
    # Claude/Anthropic settings
    ANTHROPIC_API_KEY: str
    
    class Config:
        env_file = ".env"

settings = Settings() 