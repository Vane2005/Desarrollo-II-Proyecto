import random
import string

def generar_contrasena_aleatoria(length=10):
    caracteres = string.ascii_letters + string.digits
    return ''.join(random.choice(caracteres) for _ in range(length))
