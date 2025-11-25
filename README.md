# TerapiaFisica+ 🏥

Sistema integral de gestión de terapias físicas que conecta fisioterapeutas con pacientes para el seguimiento y asignación de ejercicios terapéuticos.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Base de Datos](#base-de-datos)
- [API Endpoints](#api-endpoints)
- [Funcionalidades](#funcionalidades)
- [Sistema de Pagos](#sistema-de-pagos)
- [Despliegue](#despliegue)
- [Contribución](#contribución)

## 📖 Descripción

TerapiaFisica+ es una plataforma web que facilita la gestión de terapias físicas, permitiendo a los fisioterapeutas asignar ejercicios personalizados a sus pacientes y hacer seguimiento del progreso de cada uno. Los pacientes pueden visualizar sus ejercicios asignados, marcarlos como completados y consultar su historial.

## ✨ Características Principales

### Para Fisioterapeutas
- ✅ Registro con validación de pago único ($199,999 COP)
- 👥 Búsqueda y gestión de pacientes
- 🎯 Asignación de ejercicios personalizados por extremidad
- 📊 Seguimiento del progreso de pacientes
- 🔐 Cambio de contraseña seguro
- 📧 Sistema de recuperación de contraseña

### Para Pacientes
- 📝 Registro rápido (contraseña generada automáticamente)
- 💪 Visualización de ejercicios asignados con videos
- ✅ Marcado de ejercicios como completados
- 📈 Historial de ejercicios realizados
- 🔍 Filtrado por extremidad
- 🔐 Gestión de perfil y contraseña

### Generales
- 🎥 Videos instructivos de ejercicios (almacenados en Cloudinary)
- 🔒 Autenticación JWT
- 💳 Integración con Stripe para pagos
- 📱 Diseño responsive
- 🌐 Arquitectura REST API

## 🛠️ Tecnologías Utilizadas

### Backend
- **Framework**: FastAPI 0.104.1
- **Base de Datos**: PostgreSQL
- **ORM**: SQLAlchemy 2.0.23
- **Migraciones**: Alembic 1.12.1
- **Autenticación**: JWT (python-jose)
- **Seguridad**: BCrypt (passlib)
- **Validación**: Pydantic 2.5.0
- **Pagos**: Stripe 7.5.0
- **Variables de Entorno**: python-dotenv

### Frontend
- **HTML5, CSS3, JavaScript (Vanilla)**
- **Stripe.js** para procesamiento de pagos
- **Fetch API** para comunicación con backend

### Almacenamiento
- **Videos**: Cloudinary
- **Archivos**: MinIO (opcional)

## 📋 Requisitos Previos

- Python 3.8+
- PostgreSQL 12+
- Node.js 14+ (opcional, para herramientas de desarrollo frontend)
- Cuenta de Stripe (para pagos)
- Cuenta de Cloudinary (para videos)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/terapiafisica-plus.git
cd terapiafisica-plus
```

### 2. Crear entorno virtual

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar base de datos PostgreSQL

```sql
CREATE DATABASE app_medica;
CREATE USER postgres WITH PASSWORD '1234';
GRANT ALL PRIVILEGES ON DATABASE app_medica TO postgres;
```

### 5. Ejecutar migraciones

```bash
# Inicializar Alembic (si es necesario)
alembic init alembic

# Aplicar migraciones
alembic upgrade head
```

### 6. Insertar datos iniciales

Ejecutar los scripts SQL en orden:

```bash
# 1. Crear tablas
psql -U postgres -d app_medica -f backend/scriptsSql/crearTablas.txt

# 2. Insertar extremidades
psql -U postgres -d app_medica -f backend/scriptsSql/insercionExtremidad.txt

# 3. Insertar ejercicios
psql -U postgres -d app_medica -f backend/scriptsSql/insercionesEjercicios.txt

# 4. Insertar lesiones
psql -U postgres -d app_medica -f backend/scriptsSql/insercionLesion.txt

# 5. Insertar fisioterapeuta (opcional)
psql -U postgres -d app_medica -f backend/scriptsSql/insercionFisioterapeuta.txt
```

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL=postgresql://postgres:1234@localhost:5432/app_medica

# JWT
SECRET_KEY=IGQ4JP6vw9ZGE1aVEY2sGYpHTNS2dpFt7BkiAsIA2-LKgAFVPdixs5o_dtbX_3EWcVv1bKHyTl0BjuzpvtY5aA
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Stripe
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica

# Email
EMAIL_ORIGEN=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_app

# Frontend
FRONTEND_URL=http://localhost:5500
```

### Configuración de Stripe

1. Crear cuenta en [Stripe](https://stripe.com)
2. Obtener claves API (Developers > API keys)
3. Configurar webhook para eventos de pago (opcional)

### Configuración de Email

Para Gmail:
1. Habilitar verificación en 2 pasos
2. Generar contraseña de aplicación
3. Usar esa contraseña en `EMAIL_PASSWORD`

## 📁 Estructura del Proyecto

```
terapiafisica-plus/
├── backend/
│   ├── app/
│   │   ├── config/
│   │   │   ├── config.py          # Configuración general
│   │   │   ├── jwt_config.py      # Configuración JWT
│   │   │   ├── security.py        # Funciones de seguridad
│   │   │   └── stripe_config.py   # Configuración Stripe
│   │   ├── data/
│   │   │   ├── db.py              # Configuración BD
│   │   │   └── models/
│   │   │       ├── user.py        # Modelos Usuario
│   │   │       ├── lesion.py      # Modelo Lesión
│   │   │       └── terapia.py     # Modelo Terapia
│   │   ├── logic/
│   │   │   ├── auth_service.py    # Lógica autenticación
│   │   │   ├── email_service.py   # Servicio email
│   │   │   ├── fisio_service.py   # Lógica fisioterapeuta
│   │   │   ├── paciente_service.py # Lógica paciente
│   │   │   └── payment_service.py  # Lógica pagos
│   │   ├── presentation/
│   │   │   ├── routers/
│   │   │   │   ├── auth_router.py     # Rutas autenticación
│   │   │   │   ├── paciente_router.py # Rutas paciente
│   │   │   │   ├── payment_router.py  # Rutas pagos
│   │   │   │   └── terapia_router.py  # Rutas terapia
│   │   │   └── schemas/
│   │   │       ├── usuario_schema.py  # Schemas usuario
│   │   │       └── payment_schema.py  # Schemas pago
│   │   └── main.py               # Punto entrada aplicación
│   ├── scriptsSql/              # Scripts SQL iniciales
│   └── tests/                   # Tests unitarios
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── style.css              # Estilos login
│   │   │   ├── registro.css           # Estilos registro
│   │   │   ├── dashboard_fisio.css    # Estilos dashboard fisio
│   │   │   └── dashboard_paciente.css # Estilos dashboard paciente
│   │   ├── js/
│   │   │   ├── main.js                # Lógica login
│   │   │   ├── registro.js            # Lógica registro fisio
│   │   │   ├── registro_paciente.js   # Lógica registro paciente
│   │   │   ├── dashboard_fisio.js     # Lógica dashboard fisio
│   │   │   ├── dashboard_paciente.js  # Lógica dashboard paciente
│   │   │   ├── pago.js                # Lógica pagos
│   │   │   └── recuperar-contrasena.js # Lógica recuperación
│   │   └── img/                  # Imágenes
│   ├── index.html               # Login
│   ├── registro.html            # Registro fisioterapeuta
│   ├── registrar_paciente.html  # Registro paciente
│   ├── dashboard_fisio.html     # Dashboard fisioterapeuta
│   ├── dashboard_paciente.html  # Dashboard paciente
│   ├── pago.html                # Página de pago
│   └── recuperar-contrasena.html # Recuperación contraseña
├── alembic/                     # Migraciones
├── .env                         # Variables de entorno
├── .gitignore
├── alembic.ini                  # Configuración Alembic
├── requirements.txt             # Dependencias Python
└── README.md
```

## 🗄️ Base de Datos

### Modelo de Datos

#### Tablas Principales

**Fisioterapeuta**
- Cedula (PK)
- Nombre
- Correo (unique)
- Contrasena (hash)
- Estado (Activo/Inactivo)
- Telefono

**Paciente**
- Cedula (PK)
- Nombre
- Correo (unique)
- Contrasena (hash)
- Estado
- Telefono
- Progreso (0-100)

**Extremidad**
- Id_extremidad (PK)
- Nombre (Brazo, Hombro, Codo, etc.)

**Ejercicio**
- Id_ejercicio (PK)
- Nombre
- Descripcion
- Repeticion
- Id_extremidad (FK)
- Url (video Cloudinary)

**Lesion**
- Id_lesion (PK)
- Nombre
- Id_extremidad (FK)

**Terapia_Asignada**
- Id_terapia (PK)
- Cedula_paciente (FK)
- Id_ejercicio (FK)
- Estado (Pendiente/Completado)
- Fecha_asignacion
- Fecha_realizacion
- Observaciones

#### Relaciones

**Trata** (Fisioterapeuta ↔ Paciente)
- Cedula_fisioterapeuta (FK)
- Cedula_paciente (FK)

**Sufre** (Paciente ↔ Lesion)
- Cedula_paciente (FK)
- Id_lesion (FK)

### Diagrama ER

```
Fisioterapeuta ──< Trata >── Paciente
                              │
                              └──< Sufre >── Lesion
                              │
                              └──< Terapia_Asignada >── Ejercicio
                                                         │
                                                         └── Extremidad
```

## 🔌 API Endpoints

### Autenticación (`/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registrar fisioterapeuta | No |
| POST | `/login` | Iniciar sesión | No |
| GET | `/verify` | Verificar token | Sí |
| POST | `/recuperar-contrasena` | Enviar contraseña temporal | No |
| POST | `/cambiar-contrasena` | Cambiar contraseña | Sí |
| GET | `/info-fisioterapeuta` | Obtener info perfil | Sí |

### Pacientes (`/paciente`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registrar paciente | No |
| GET | `/todos` | Listar todos los pacientes | No |
| GET | `/{cedula}` | Obtener paciente por cédula | No |
| GET | `/ejercicios` | Listar ejercicios disponibles | No |
| POST | `/asignar-ejercicio` | Asignar ejercicios a paciente | No |
| GET | `/ejercicios-asignados/{cedula}` | Ejercicios pendientes | No |
| GET | `/ejercicios-completados/{cedula}` | Ejercicios realizados | No |
| PUT | `/marcar-realizado/{id_terapia}` | Marcar ejercicio completado | No |

### Pagos (`/payments`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/config` | Obtener clave pública Stripe | No |
| POST | `/create-payment-intent` | Crear intención de pago | No |
| GET | `/verify-payment/{payment_intent_id}` | Verificar estado de pago | No |
| POST | `/activate-fisioterapeuta` | Activar cuenta tras pago | No |

## 🎯 Funcionalidades

### Flujo de Registro Fisioterapeuta

1. Usuario completa formulario de registro
2. Sistema valida datos
3. Crea cuenta con estado "Inactivo"
4. Redirige a página de pago
5. Usuario completa pago con Stripe ($199,999 COP)
6. Sistema verifica pago exitoso
7. Activa cuenta de fisioterapeuta
8. Redirige a login

### Flujo de Registro Paciente

1. Fisioterapeuta/Admin completa formulario
2. Sistema genera contraseña aleatoria
3. Crea cuenta de paciente
4. Muestra credenciales en pantalla
5. Envía credenciales por email (opcional)

### Flujo de Asignación de Ejercicios

1. Fisioterapeuta busca paciente por cédula
2. Selecciona ejercicios de la biblioteca
3. Sistema filtra ejercicios por extremidad
4. Asigna ejercicios al paciente
5. Ejercicios aparecen en dashboard del paciente

### Flujo de Ejercicios para Paciente

1. Paciente ve ejercicios asignados
2. Visualiza video instructivo
3. Completa ejercicio
4. Marca como realizado
5. Ejercicio pasa a historial
6. Se actualiza progreso

### Sistema de Autenticación

- **JWT con expiración de 30 minutos**
- **Tokens incluyen**: tipo de usuario, cédula, email, estado
- **Rutas protegidas** verifican token en header Authorization
- **Contraseñas hasheadas** con BCrypt (truncadas a 72 caracteres)

### Sistema de Recuperación de Contraseña

1. Usuario ingresa email
2. Sistema genera contraseña temporal
3. Hashea y guarda en BD
4. Envía email con nueva contraseña
5. Usuario puede cambiarla después del login

## 💳 Sistema de Pagos

### Configuración Stripe

**Monto**: $199,999 COP (19999900 centavos)
**Tipo**: Pago único (no suscripción)

### Flujo de Pago

1. Frontend crea PaymentIntent en backend
2. Backend devuelve `client_secret`
3. Frontend muestra formulario de tarjeta (Stripe.js)
4. Usuario ingresa datos de tarjeta
5. Stripe procesa pago
6. Si exitoso, backend activa cuenta fisioterapeuta
7. Actualiza estado de "Inactivo" a "Activo"

### Seguridad

- ✅ Claves secretas en variables de entorno
- ✅ Validación de pago en servidor
- ✅ No se almacenan datos de tarjeta
- ✅ Comunicación cifrada (HTTPS en producción)

## 🚀 Despliegue

### Iniciar Backend

```bash
# Modo desarrollo
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Modo producción
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Iniciar Frontend

**Opción 1: Live Server (VS Code)**
- Instalar extensión Live Server
- Click derecho en `index.html` > Open with Live Server

**Opción 2: Python HTTP Server**
```bash
cd frontend
python -m http.server 5500
```

**Opción 3: Node HTTP Server**
```bash
cd frontend
npx http-server -p 5500
```

### Acceso

- **Frontend**: http://localhost:5500
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

## 🧪 Testing

```bash
# Ejecutar tests
pytest backend/tests/

# Con cobertura
pytest --cov=backend backend/tests/
```

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con BCrypt
- ✅ Tokens JWT con expiración
- ✅ Validación de entrada con Pydantic
- ✅ CORS configurado
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ Contraseñas truncadas a 72 caracteres (límite BCrypt)

## 📝 Notas Importantes

### Limitaciones de BCrypt
- Las contraseñas se truncan a 72 caracteres antes de hashear
- Implementado en `backend/app/config/security.py`

### Estado de Fisioterapeuta
- **Inactivo**: Registrado pero sin pagar
- **Activo**: Pago completado, acceso total
- Fisioterapeutas inactivos solo pueden acceder a "Información Personal" y realizar el pago

### Videos de Ejercicios
- Almacenados en Cloudinary
- URLs en tabla `Ejercicio`
- Formato: MP4
- Se cargan dinámicamente en el frontend

## 🐛 Solución de Problemas

### Error de conexión a BD
```bash
# Verificar que PostgreSQL esté corriendo
sudo service postgresql status

# Verificar credenciales en .env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/app_medica
```

### Error de CORS
```python
# Verificar configuración en main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambiar en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Error de Stripe
```bash
# Verificar claves en .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Verificar que las claves sean válidas
stripe status
```

## 📞 Soporte

Para reportar bugs o solicitar características, crear un issue en GitHub.

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Autores

Desarrollado por el equipo de TerapiaFisica+

---

**TerapiaFisica+** - Recupera tu bienestar, transforma tu vida 💚
