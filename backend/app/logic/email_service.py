import smtplib
from email.message import EmailMessage

def send_email(to: str, subject: str, body: str):
    EMAIL_ORIGEN = "tucorreo@gmail.com"
    PASSWORD = "tu_contraseña_app"  # Usa una app password de Gmail

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = EMAIL_ORIGEN
    msg["To"] = to
    msg.set_content(body)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(EMAIL_ORIGEN, PASSWORD)
        smtp.send_message(msg)
