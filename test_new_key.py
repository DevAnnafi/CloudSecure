from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# PASTE YOUR NEW KEY HERE
API_KEY = 'SG.paste_the_new_key_here'

message = Mail(
    from_email='zihanparadox@gmail.com',
    to_emails='zihanparadox@gmail.com',
    subject='CloudSecure Test Email',
    html_content='<h1>Success!</h1><p>If you see this, SendGrid is working!</p>'
)

try:
    sg = SendGridAPIClient(API_KEY)
    response = sg.send(message)
    print(f"✅ SUCCESS! Status: {response.status_code}")
    print("Check your email inbox!")
except Exception as e:
    print(f"❌ ERROR: {e}")
