from sqlalchemy.orm import Session
from app.data.models.user import User_Paciente
from app.config.security import hash_password
import secrets
import string
# import smtplib
# from email.mime.text import MIMEText


# ----------------------------------------------------------
# 🔹 Función: Generar una contraseña aleatoria segura
# ----------------------------------------------------------
def generar_contrasena(longitud=10):
    """
    Genera una contraseña aleatoria combinando letras y números.
    Ejemplo: 'aK7pX9qT2r'
    """
    caracteres = string.ascii_letters + string.digits
    return ''.join(secrets.choice(caracteres) for _ in range(longitud))


# ----------------------------------------------------------
#  Función: Enviar correo con las credenciales (opcional)
# ----------------------------------------------------------
#  Esta función está desactivada por ahora.
# Si quieres activar el envío real, descomenta este bloque
# y la línea correspondiente dentro de la función `crear()`.

"""
def enviar_correo(destinatario: str, contrasena: str, nombre: str):
    remitente = "tu_correo@hotmail.com"  #  cámbialo por tu correo real
    password = "tu_contraseña_o_contraseña_de_aplicación"  #  cámbiala por tu clave SMTP

    cuerpo = f'''
    Hola {nombre},

    Tu cuenta en TerapiaFisica+ ha sido creada correctamente.

    Credenciales de acceso:
    Usuario: {destinatario}
    Contraseña: {contrasena}

    Te recomendamos cambiar la contraseña después del primer inicio de sesión.

    Saludos,
    El equipo de TerapiaFisica+
    '''

    msg = MIMEText(cuerpo)
    msg["Subject"] = "Registro en TerapiaFisica+"
    msg["From"] = remitente
    msg["To"] = destinatario

    try:
        # Servidor SMTP de Outlook/Hotmail
        with smtplib.SMTP("smtp.office365.com", 587) as server:
            server.starttls()
            server.login(remitente, password)
            server.send_message(msg)
        print(f" Correo enviado correctamente a {destinatario}")
    except Exception as e:
        print(f" Error al enviar correo: {e}")
        print(f"(DEBUG) Credenciales generadas: {destinatario} / {contrasena}")
"""


# ----------------------------------------------------------
#  Función principal: Crear un nuevo paciente
# ----------------------------------------------------------
def crear(db: Session, cedula: str, correo: str, nombre: str, telefono: str):
    """
    Crea un nuevo paciente con una contraseña aleatoria generada automáticamente.
    En modo pruebas: imprime las credenciales por consola.
    """
    print(" [DEBUG] usando la versión ACTUAL de paciente_service.py")
    try:
        # 1️ Generar contraseña aleatoria
        contrasena_generada = generar_contrasena()

        # 2️ Hashear la contraseña
        contrasena_hash = hash_password(contrasena_generada)

        # 3️ Crear el objeto Paciente
        paciente = User_Paciente(
            cedula=cedula,
            nombre=nombre,
            correo=correo,
            contrasena=contrasena_hash,
            telefono=telefono
        )

        # 4️ Guardar en la base de datos
        db.add(paciente)
        db.commit()
        db.refresh(paciente)

        # 5️ Mostrar datos por consola (modo pruebas)
        print(" [DEBUG] Paciente registrado correctamente:")
        print(f"    Nombre: {nombre}")
        print(f"    Correo: {correo}")
        print(f"    Contraseña generada: {contrasena_generada}")

        #  Si deseas activar el envío de correo real, descomenta esta línea:
        # enviar_correo(correo, contrasena_generada, nombre)

        return paciente, contrasena_generada


    except Exception as e:
        db.rollback()
        print(f" Error al crear paciente: {e}")
        raise e
