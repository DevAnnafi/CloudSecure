import resend
import os
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ.get('RESEND_API_KEY')

print(f"API Key: {resend.api_key[:10]}..." if resend.api_key else "No API key found!")

try:
    params = {
        "from": "CloudSecure <onboarding@resend.dev>",
        "to": ["islamannafi@gmail.com"],
        "subject": "Test from CloudSecure",
        "html": "<strong>This is a test!</strong>"
    }
    
    email = resend.Emails.send(params)
    print(f"✅ SUCCESS! Email sent!")
    print(f"Email ID: {email}")
    
except Exception as e:
    print(f"❌ ERROR: {e}")
