
# 🍳 Kitchen Fighters - API Backend

API RESTful para la gestión de torneos de cocina. Sistema completo que permite registrar chefs, crear torneos, inscribir participantes, enviar puntuaciones y consultar rankings.

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints de la API](#endpoints-de-la-api)
- [Autenticación](#autenticación)
- [Reglas de Negocio](#reglas-de-negocio)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Validaciones](#validaciones)
- [Manejo de Errores](#manejo-de-errores)
- [Testing](#testing)

## 🔧 Requisitos

- **Node.js**: v18 o superior
- **MongoDB**: Base de datos MongoDB (MongoDB Atlas)
- **npm** o **yarn**: Gestor de paquetes

### Verificar instalación:

```bash
# Verificar versión de Node.js
node --version

# Verificar versión de npm
npm --version

# Verificar instalación de MongoDB (si es local)
mongod --version
```

## 🚀 Instalación

### Paso 1: Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Kitchen_Fighters_BackEnd
```

### Paso 2: Instalar dependencias

Usando **npm** (recomendado):
```bash
npm install
```

O usando **yarn**:
```bash
yarn install
```

O usando **pnpm**:
```bash
pnpm install
```

Esto instalará todas las dependencias necesarias listadas en `package.json`:
- Express, Mongoose, JWT, bcryptjs, etc.

### Paso 3: Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto (ver sección [Configuración](#configuración))

### Paso 4: Iniciar el servidor
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:5000` (o el puerto configurado en `.env`)

## ⚙️ Configuración

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Puerto del servidor
PORT=5000

# MongoDB Connection String
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/nombre_db?retryWrites=true&w=majority

# JWT Secret (para autenticación)
JWT_SECRET=tu_secreto_jwt_muy_seguro_aqui

# Frontend URL (para enlaces de reseteo de contraseña)
FRONTEND_URL=http://localhost:3000

# Email Configuration (para reseteo de contraseña)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

### 📧 Configuración de Email (Reseteo de Contraseña)

⚠️ **IMPORTANTE:** La funcionalidad de reseteo de contraseña requiere un **correo electrónico real** configurado. El sistema envía emails reales a los usuarios cuando solicitan restablecer su contraseña.

#### Configuración para Gmail:

1. **Usar un correo Gmail real** que tengas acceso.

2. **Generar una "Contraseña de aplicación"** (no uses tu contraseña normal):
   - Ve a tu cuenta de Google: https://myaccount.google.com/
   - Seguridad → Verificación en dos pasos (debe estar activada)
   - Busca "Contraseñas de aplicaciones"
   - Genera una nueva contraseña para "Correo" y "Otro (personalizado)" → nombre: "Kitchen Fighters"
   - **Copia la contraseña generada** (16 caracteres sin espacios)

3. **Configurar en `.env`:**
   ```env
   EMAIL_USER=tu_email_real@gmail.com
   EMAIL_PASS=la_contraseña_de_aplicacion_generada
   ```

#### Configuración para otros proveedores:

Si usas otro proveedor de email (Outlook, Yahoo, etc.), modifica `src/config/mailer.js` con los datos SMTP correspondientes:
- **Outlook/Hotmail:** `smtp-mail.outlook.com`, puerto 587
- **Yahoo:** `smtp.mail.yahoo.com`, puerto 465 o 587

#### Verificación:

Al iniciar el servidor, deberías ver en la consola:
```
Nodemailer listo para enviar correos.
```

Si ves un error, revisa que:
- `EMAIL_USER` sea un correo real y válido
- `EMAIL_PASS` sea la contraseña de aplicación correcta (no tu contraseña normal)
- Tengas la verificación en 2 pasos activada (si usas Gmail)

## 📁 Estructura del Proyecto

```
Kitchen_Fighters_BackEnd/
├── src/
│   ├── config/
│   │   ├── db.js              # Configuración de MongoDB
│   │   ├── mailer.js          # Configuración de nodemailer
│   │   └── multer.config.js   # Configuración de carga de archivos
│   ├── controllers/
│   │   ├── admin.controller.js    # Controladores de administración
│   │   ├── chef.controller.js     # Controladores de chefs
│   │   └── tournament.controller.js # Controladores de torneos
│   ├── middleware/
│   │   ├── auth.middleware.js     # Middleware de autenticación JWT
│   │   ├── checkAdmin.middleware.js # Middleware de verificación de admin
│   │   └── logger.js              # Middleware de logging (morgan)
│   ├── models/
│   │   ├── chef.model.js          # Modelo de Chef (Mongoose)
│   │   └── tournament.model.js    # Modelo de Tournament (Mongoose)
│   └── routes/
│       ├── admin.routes.js        # Rutas de administración
│       ├── chef.routes.js         # Rutas de chefs
│       ├── tournament.routes.js   # Rutas de torneos
│       └── index.js               # Router principal
├── uploads/                       # Directorio para imágenes subidas
├── .env                           # Variables de entorno
├── index.js                         # Punto de entrada de la aplicación
└── package.json
```

## 🌐 Endpoints de la API

### Base URL
```
http://localhost:5000/api
```

### 🔓 Endpoints Públicos (Chefs)

#### POST `/api/chefs`
Registrar un nuevo chef.

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "specialty": "Cocina Italiana",
  "experienceYears": 5,
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Juan Pérez",
  "specialty": "Cocina Italiana",
  "experienceYears": 5,
  "email": "juan@example.com",
  "role": "user",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

#### POST `/api/chefs/login`
Iniciar sesión.

**Request Body:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "chef": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "user"
  }
}
```

#### GET `/api/chefs`
Listar todos los chefs (público, sin email).

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Juan Pérez",
    "specialty": "Cocina Italiana",
    "experienceYears": 5
  }
]
```

#### GET `/api/chefs/:id`
Obtener información de un chef específico.

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Juan Pérez",
  "specialty": "Cocina Italiana",
  "experienceYears": 5,
  "role": "user"
}
```

#### POST `/api/chefs/forgot-password`
Solicitar reseteo de contraseña. El sistema enviará un email real al usuario con un enlace para restablecer su contraseña.

⚠️ **Requisito:** Debe estar configurado un correo real en las variables de entorno (`EMAIL_USER` y `EMAIL_PASS`) para que esta funcionalidad funcione.

**Request Body:**
```json
{
  "email": "juan@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Si el correo está registrado, recibirás un enlace de reseteo."
}
```

**Nota:** Por seguridad, el sistema siempre responde con éxito, incluso si el email no existe en la base de datos.

#### POST `/api/chefs/reset-password/:token`
Restablecer contraseña usando el token recibido por email.

**Request Body:**
```json
{
  "password": "nuevaPassword123"
}
```

### 🔒 Endpoints Protegidos (Requieren Token JWT)

#### GET `/api/chefs/me`
Obtener perfil del chef autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT `/api/chefs/profile`
Actualizar perfil del chef autenticado (incluye carga de imagen).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (form-data):**
- `description`: (opcional) Nueva descripción
- `specialty`: (opcional) Nueva especialidad
- `experienceYears`: (opcional) Nuevos años de experiencia
- `profileImage`: (opcional) Archivo de imagen

### 🏆 Endpoints de Torneos

#### POST `/api/tournaments`
Crear un nuevo torneo.

**Request Body:**
```json
{
  "name": "Torneo de Cocina 2024",
  "inicio": "2024-12-15T10:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Torneo de Cocina 2024",
  "inicio": "2024-12-15T10:00:00.000Z",
  "estado": "Pendiente",
  "participants": [],
  "results": [],
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

#### GET `/api/tournaments`
Listar todos los torneos.

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Torneo de Cocina 2024",
    "inicio": "2024-12-15T10:00:00.000Z",
    "estado": "Pendiente",
    "participants": []
  }
]
```

#### GET `/api/tournaments/:id`
Obtener detalles de un torneo específico.

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Torneo de Cocina 2024",
  "inicio": "2024-12-15T10:00:00.000Z",
  "estado": "En Curso",
  "participants": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Juan Pérez",
      "specialty": "Cocina Italiana"
    }
  ],
  "results": []
}
```

#### POST `/api/tournaments/:id/register` 🔒
Inscribir un chef en un torneo (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Chef inscrito correctamente"
}
```

#### POST `/api/tournaments/:id/submit` 🔒
Enviar puntuación de un chef para un torneo (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "chefId": "507f1f77bcf86cd799439011",
  "score": 85
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "estado": "En Curso",
  "results": [
    {
      "chef": "507f1f77bcf86cd799439011",
      "score": 85
    }
  ]
}
```

#### GET `/api/tournaments/:id/ranking`
Obtener el ranking de un torneo ordenado por puntuación.

**Response (200 OK):**
```json
[
  {
    "chef": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Juan Pérez"
    },
    "score": 95
  },
  {
    "chef": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "María García"
    },
    "score": 88
  }
]
```

### 👨‍💼 Endpoints de Administración (Requieren rol Admin)

**Todos los endpoints de admin requieren:**
- Token JWT válido
- Rol de usuario: `admin`

#### GET `/api/admin/chefs`
Obtener todos los chefs (solo admin).

#### PUT `/api/admin/chefs/:id`
Cambiar rol de un chef.

**Request Body:**
```json
{
  "role": "admin"
}
```

#### DELETE `/api/admin/chefs/:id`
Eliminar un chef.

#### GET `/api/admin/tournaments`
Obtener todos los torneos con detalles completos.

#### POST `/api/admin/tournaments`
Crear torneo (versión admin con más campos).

**Request Body:**
```json
{
  "name": "Torneo Master Chef",
  "startDate": "2024-12-15",
  "description": "Torneo de alto nivel",
  "maxParticipants": 16
}
```

#### PUT `/api/admin/tournaments/:id`
Actualizar torneo.

#### DELETE `/api/admin/tournaments/:id`
Eliminar torneo.

#### PUT `/api/admin/tournaments/:id/results`
Actualizar resultados del torneo en lote.

**Request Body:**
```json
{
  "results": [
    {
      "chef": "507f1f77bcf86cd799439011",
      "score": 95
    },
    {
      "chef": "507f1f77bcf86cd799439013",
      "score": 88
    }
  ]
}
```

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación.

### Cómo obtener un token:

1. Registrar un chef con `POST /api/chefs`
2. Iniciar sesión con `POST /api/chefs/login`
3. El token se devuelve en la respuesta del login

### Cómo usar el token:

Incluir el token en el header `Authorization` de todas las peticiones protegidas:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Expiración del token:

Los tokens expiran después de **1 hora**. Después de esto, el usuario debe iniciar sesión nuevamente.

### 🔑 Credenciales de Prueba (Admin)

Para facilitar las pruebas, existe un usuario administrador preconfigurado:

**Usuario Admin:**
- **Email:** `Juanfelipejaramillohenao@gmail.com`
- **Contraseña:** `123456`
- **Rol:** `admin`

Puedes usar estas credenciales para:
- Probar endpoints de administración (`/api/admin/*`)
- Acceder a funcionalidades exclusivas de admin
- Gestionar torneos y chefs

**Ejemplo de login con credenciales de admin:**
```bash
curl -X POST http://localhost:5000/api/chefs/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "Juanfelipejaramillohenao@gmail.com",
    "password": "123456"
  }'
```

⚠️ **Nota de Seguridad:** Estas credenciales son solo para desarrollo/pruebas. En producción, asegúrate de cambiar las contraseñas por defecto.

## 📜 Reglas de Negocio

### Torneos

1. **Estados del torneo:**
   - `Pendiente`: El torneo aún no ha comenzado, se pueden inscribir chefs
   - `En Curso`: El torneo ha comenzado, se pueden enviar puntuaciones
   - `Finalizado`: Todos los participantes han enviado sus puntuaciones
   - `Cancelado`: El torneo fue cancelado

2. **Inscripción de chefs:**
   - Solo se pueden inscribir chefs cuando el torneo está en estado `Pendiente`
   - Un chef no puede inscribirse dos veces en el mismo torneo
   - El torneo puede tener un límite máximo de participantes (`maxParticipants`)

3. **Puntuaciones:**
   - Solo los chefs inscritos pueden enviar puntuaciones
   - Cada chef solo puede enviar una puntuación por torneo
   - Las puntuaciones deben estar entre 0 y 100
   - Cuando un chef envía su primera puntuación, el torneo pasa automáticamente a estado `En Curso`
   - Cuando todos los participantes han enviado sus puntuaciones, el torneo pasa a estado `Finalizado`

4. **Ranking:**
   - El ranking se ordena por puntuación de mayor a menor
   - Solo se muestran chefs que han enviado su puntuación

### Chefs

1. **Roles:**
   - `user`: Usuario estándar (por defecto)
   - `admin`: Administrador con acceso a rutas especiales

2. **Validaciones:**
   - El email debe ser único
   - La contraseña debe tener al menos 6 caracteres
   - Los años de experiencia deben ser un número positivo (>= 0)

## 💡 Ejemplos de Uso

### Flujo completo: Crear torneo, inscribir chef y enviar puntuación

#### 1. Registrar un chef

```bash
curl -X POST http://localhost:5000/api/chefs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "specialty": "Cocina Italiana",
    "experienceYears": 5,
    "email": "juan@example.com",
    "password": "password123"
  }'
```

#### 2. Iniciar sesión

```bash
curl -X POST http://localhost:5000/api/chefs/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

Guardar el `token` de la respuesta.

#### 3. Crear un torneo

```bash
curl -X POST http://localhost:5000/api/tournaments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Torneo de Cocina 2024",
    "inicio": "2024-12-15T10:00:00Z"
  }'
```

Guardar el `_id` del torneo.

#### 4. Inscribir chef en el torneo

```bash
curl -X POST http://localhost:5000/api/tournaments/TOURNAMENT_ID/register \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

#### 5. Enviar puntuación

```bash
curl -X POST http://localhost:5000/api/tournaments/TOURNAMENT_ID/submit \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "chefId": "CHEF_ID_AQUI",
    "score": 85
  }'
```

#### 6. Ver ranking

```bash
curl http://localhost:5000/api/tournaments/TOURNAMENT_ID/ranking
```

## ✅ Validaciones

### Chef
- `name`: Obligatorio, string
- `specialty`: Obligatorio, string
- `experienceYears`: Obligatorio, número >= 0
- `email`: Obligatorio, formato de email válido, único
- `password`: Obligatorio, mínimo 6 caracteres

### Torneo
- `name`: Obligatorio, string, único
- `inicio`: Opcional, fecha válida (formato ISO 8601)
- `estado`: Automático, enum: `['Pendiente', 'En Curso', 'Finalizado', 'Cancelado']`

### Puntuación
- `score`: Obligatorio, número entre 0 y 100
- `chefId`: Obligatorio, ID válido de un chef inscrito en el torneo

## 🚨 Manejo de Errores

La API devuelve códigos de estado HTTP estándar:

- `200 OK`: Petición exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error de validación o datos incorrectos
- `401 Unauthorized`: Token inválido o faltante
- `403 Forbidden`: Acceso denegado (requiere rol admin)
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (ej: email duplicado, torneo lleno)
- `500 Internal Server Error`: Error interno del servidor

### Formato de error:

```json
{
  "message": "Descripción del error",
  "errors": {
    "campo": "Mensaje de error específico"
  }
}
```

### Ejemplos de errores comunes:

```json
// Email duplicado
{
  "message": "El correo electrónico 'juan@example.com' ya está en uso."
}

// Torneo lleno
{
  "message": "El torneo ya alcanzó el límite de participantes"
}

// Chef ya inscrito
{
  "message": "Ya estás inscrito en este torneo"
}

// Puntuación inválida
{
  "message": "El score debe estar entre 0 y 100"
}
```

## 🧪 Testing

### Ejecutar el servidor en modo desarrollo:

```bash
npm run dev
```

### Probar endpoints con curl o Postman:

1. Importar la colección de Postman (si está disponible)
2. O usar los ejemplos de curl proporcionados arriba

### Variables de entorno para testing:

Para pruebas locales, asegúrate de tener configurado:
- `MONGO_URI`: Conexión a una base de datos de prueba
- `JWT_SECRET`: Cualquier string seguro para desarrollo

## 📦 Dependencias Principales

- **express**: Framework web para Node.js
- **mongoose**: ODM para MongoDB
- **jsonwebtoken**: Generación y verificación de tokens JWT
- **bcryptjs**: Hash de contraseñas
- **morgan**: Logger HTTP para desarrollo
- **cors**: Middleware para habilitar CORS
- **multer**: Manejo de carga de archivos
- **nodemailer**: Envío de emails (reseteo de contraseña)
- **dotenv**: Manejo de variables de entorno

## 📝 Notas Importantes

1. **Base de datos**: La API utiliza MongoDB. Asegúrate de tener una instancia corriendo o usar MongoDB Atlas.

2. **Carga de archivos**: Las imágenes de perfil se guardan en `/uploads`. Asegúrate de que este directorio exista.

3. **Seguridad**: 
   - Nunca expongas el `JWT_SECRET` en el código
   - Usa HTTPS en producción
   - Valida todas las entradas del usuario

4. **Producción**: 
   - Cambiar `NODE_ENV=production`
   - Configurar variables de entorno de forma segura
   - Usar una base de datos de producción
   - Configurar logs apropiados

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte de una prueba técnica.

---
