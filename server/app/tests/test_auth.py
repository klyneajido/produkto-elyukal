# Modified test_smtp.py to send actual email with debug
import smtplib
from email.mime.text import MIMEText

SENDER_EMAIL = "produktoelyukalph@gmail.com"
SENDER_PASSWORD = "zkua somv mwlf mdim"  # Gmail App Password
RECIPIENT_EMAIL = "andriqklyne.ajido@lorma.edu"  # Fixed typo in email

def test_send_email():
    try:
        message = MIMEText("This is a test email from Produkto Elyukal")
        message["Subject"] = "Test Email - Produkto Elyukal"
        message["From"] = SENDER_EMAIL
        message["To"] = RECIPIENT_EMAIL
        
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.set_debuglevel(1)  # Enable debug output
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, RECIPIENT_EMAIL, message.as_string())
            print("Test email sent successfully")
            return True
    except Exception as e:
        print(f"Failed to send test email: {str(e)}")
        return False

if __name__ == "__main__":
    test_send_email()