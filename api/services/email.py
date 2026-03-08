import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def send_password_reset_email(user_email: str, reset_link: str):
    """Send password reset email via Gmail SMTP"""
    
    # Email configuration
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = os.environ.get('GMAIL_USER')
    sender_password = os.environ.get('GMAIL_APP_PASSWORD')
    
    # Create message
    message = MIMEMultipart("alternative")
    message["Subject"] = "CloudSecure - Reset Your Password"
    message["From"] = f"CloudSecure <{sender_email}>"
    message["To"] = user_email
    
    # HTML email content
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 30px; border-radius: 8px; }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .header h1 {{ color: #22c55e; margin: 0; }}
            .content {{ margin: 20px 0; }}
            .button {{ 
                display: inline-block; 
                background-color: #22c55e; 
                color: #000000; 
                padding: 12px 30px; 
                text-decoration: none; 
                border-radius: 6px; 
                font-weight: bold;
                margin: 20px 0;
            }}
            .footer {{ text-align: center; margin-top: 30px; color: #666666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>CloudSecure</h1>
            </div>
            <div class="content">
                <h2 style="color: #ffffff;">Reset Your Password</h2>
                <p>You requested to reset your password for your CloudSecure account.</p>
                <p>Click the button below to create a new password:</p>
                <p style="text-align: center;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </p>
                <p style="color: #888888; font-size: 14px;">
                    This link will expire in 1 hour.
                </p>
                <p style="color: #888888; font-size: 14px;">
                    If you didn't request this, you can safely ignore this email.
                </p>
            </div>
            <div class="footer">
                <p>© 2026 CloudSecure. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Attach HTML content
    html_part = MIMEText(html_content, "html")
    message.attach(html_part)
    
    try:
        # Connect to Gmail SMTP server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        
        # Send email
        server.sendmail(sender_email, user_email, message.as_string())
        server.quit()
        
        print(f"Password reset email sent to {user_email}")
        return True
        
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False