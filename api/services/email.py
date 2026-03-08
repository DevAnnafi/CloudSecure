from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os

def send_password_reset_email(user_email: str, reset_link: str):
    """Send password reset email via SendGrid"""
    
    message = Mail(
        from_email='noreply@cloudsecure.app',  # Change to your domain later
        to_emails=user_email,
        subject='CloudSecure - Reset Your Password',
        html_content=f'''
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #1a1a1a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #1a1a1a; padding: 30px; border-radius: 0 0 8px 8px; }}
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
                .footer {{ text-align: center; margin-top: 20px; color: #666666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; color: #22c55e;">CloudSecure</h1>
                </div>
                <div class="content">
                    <h2>Reset Your Password</h2>
                    <p>You requested to reset your password for your CloudSecure account.</p>
                    <p>Click the button below to create a new password:</p>
                    <a href="{reset_link}" class="button">Reset Password</a>
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
        '''
    )
    
    try:
        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)
        print(f" Password reset email sent to {user_email} (Status: {response.status_code})")
        return True
    except Exception as e:
        print(f" Failed to send email: {e}")
        return False