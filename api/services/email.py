import resend
import os

def send_password_reset_email(user_email: str, reset_link: str):
    """Send password reset email via Resend"""
    
    resend.api_key = os.environ.get('RESEND_API_KEY')
    
    try:
        params = {
            "from": "CloudSecure <no-reply@cloudsecure.me>",  
            "to": [user_email],
            "subject": "CloudSecure - Reset Your Password",
            "html": f"""
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
                        <p style="color: #ffffff;">You requested to reset your password for your CloudSecure account.</p>
                        <p style="color: #ffffff;">Click the button below to create a new password:</p>
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
        }
        
        email = resend.Emails.send(params)
        print(f"Password reset email sent to {user_email} via Resend!")
        return True
        
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False