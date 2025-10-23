""" import smtplib
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
 """


import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_ORIGEN = os.getenv("EMAIL_ORIGEN")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5500")  # Configurable

def send_recovery_email(to: str, contrasena: str, nombre: str = "Usuario"):
    """
    Envía un correo con la contraseña recuperada
    """
    try:
        # Validar configuración
        if not EMAIL_ORIGEN or not EMAIL_PASSWORD:
            raise Exception("Configuración de email incompleta. Verifica EMAIL_ORIGEN y EMAIL_PASSWORD en .env")

        # Crear mensaje
        msg = MIMEMultipart('alternative')
        msg["Subject"] = "Recuperación de Contraseña - TerapiaFisica+"
        msg["From"] = EMAIL_ORIGEN
        msg["To"] = to

        # Contenido HTML del email
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #16a085 0%, #138d75 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">TerapiaFisica+</h1>
                        <p style="color: white; margin: 10px 0 0 0;">Recuperación de Contraseña</p>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px;">Hola <strong>{nombre}</strong>,</p>
                        
                        <p>Hemos recibido una solicitud para recuperar tu contraseña de TerapiaFisica+.</p>
                        
                        <div style="background: white; border-left: 4px solid #16a085; padding: 20px; margin: 20px 0;">
                            <p style="margin: 0; color: #666;">Tu nueva contraseña temporal es:</p>
                            <p style="font-size: 24px; font-weight: bold; color: #16a085; margin: 10px 0; letter-spacing: 2px;">{contrasena}</p>
                        </div>
                        
                        <p style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px;">
                            <strong>⚠️ Importante:</strong> Por tu seguridad, te recomendamos cambiar esta contraseña después de iniciar sesión.
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="{FRONTEND_URL}/index.html" 
                               style="background: #16a085; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Iniciar Sesión
                            </a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #666; text-align: center;">
                            Si no solicitaste esta recuperación, ignora este correo.<br>
                            Tu cuenta permanece segura.
                        </p>
                        
                        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
                            © 2025 TerapiaFisica+ - Recupera tu bienestar, transforma tu vida
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """

        # Contenido texto plano (fallback)
        text_content = f"""
        Hola {nombre},

        Hemos recibido una solicitud para recuperar tu contraseña de TerapiaFisica+.

        Tu nueva contraseña temporal es: {contrasena}

        Por tu seguridad, te recomendamos cambiar esta contraseña después de iniciar sesión.

        Puedes iniciar sesión aquí: {FRONTEND_URL}/index.html

        Si no solicitaste esta recuperación, ignora este correo. Tu cuenta permanece segura.

        Saludos,
        El equipo de TerapiaFisica+
        """

        # Adjuntar ambas versiones
        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        msg.attach(part1)
        msg.attach(part2)

        # Enviar email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_ORIGEN, EMAIL_PASSWORD)
            server.send_message(msg)
        
        print(f"Correo de recuperación enviado a {to}")
        return True

    except Exception as e:
        print(f"Error al enviar correo: {e}")
        raise Exception(f"Error al enviar el correo: {str(e)}")


def send_email(to: str, subject: str, body: str):
    """
    Función genérica para enviar emails
    """
    try:
        if not EMAIL_ORIGEN or not EMAIL_PASSWORD:
            raise Exception("Configuración de email incompleta")

        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = EMAIL_ORIGEN
        msg["To"] = to

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(EMAIL_ORIGEN, EMAIL_PASSWORD)
            smtp.send_message(msg)
        
        print(f"Correo enviado a {to}")
        return True
    except Exception as e:
        print(f"Error al enviar correo: {e}")
        raise