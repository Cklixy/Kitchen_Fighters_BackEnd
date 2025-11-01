# 🎯 Cómo Asignar Rol de Administrador a un Usuario

Existen **3 formas** de asignar el rol de admin a un usuario en Kitchen Fighters BackEnd:

---

## 📋 Método 1: Usando el Script desde la Terminal (Recomendado para el primer admin)

Este método es útil cuando **aún no tienes ningún usuario con rol de admin** y necesitas crear el primero.

### Pasos:

1. **Abre una terminal** en la raíz del proyecto
2. **Ejecuta el script** con el email del usuario que quieres hacer admin:

```bash
node scripts/make-admin.js <email-del-usuario>
```

### Ejemplo:

```bash
node scripts/make-admin.js admin@example.com
```

### Resultado esperado:

```
✅ ¡Rol de admin asignado correctamente!
   Email: admin@example.com
   Nombre: Juan Pérez
   Rol anterior: user
   Rol nuevo: admin
```

---

## 🌐 Método 2: Usando el Endpoint de la API (Requiere que ya exista un admin)

Una vez que tengas al menos **un usuario con rol de admin**, puedes usar este endpoint para asignar roles a otros usuarios.

### Endpoint:

```
PUT /api/admin/users/:id/role
```

### Headers requeridos:

```
Authorization: Bearer <token-del-admin>
Content-Type: application/json
```

### Body (JSON):

```json
{
  "role": "admin"
}
```

### Ejemplo con cURL:

```bash
curl -X PUT http://localhost:5000/api/admin/users/507f1f77bcf86cd799439011/role \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

### Ejemplo con JavaScript (fetch):

```javascript
const userId = '507f1f77bcf86cd799439011';
const adminToken = 'tu-token-jwt-aqui';

const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ role: 'admin' })
});

const data = await response.json();
console.log(data);
```

### Respuesta exitosa (200):

```json
{
  "message": "Rol actualizado correctamente a \"admin\"",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "admin",
    ...
  }
}
```

---

## 🗄️ Método 3: Directamente desde MongoDB (Método avanzado)

Si prefieres hacerlo directamente en la base de datos:

### Pasos:

1. **Conéctate a tu base de datos MongoDB** (puedes usar MongoDB Compass, mongo shell, o cualquier cliente)
2. **Ejecuta este comando** para actualizar el usuario:

```javascript
// En MongoDB Shell o MongoDB Compass
db.chefs.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
);
```

O para buscar por ID:

```javascript
db.chefs.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439011") },
  { $set: { role: "admin" } }
);
```

### Verificar que funcionó:

```javascript
db.chefs.findOne({ email: "admin@example.com" });
```

Deberías ver `"role": "admin"` en el documento.

---

## 📝 Notas Importantes

1. **El primer admin**: Como no hay ningún admin al principio, necesitas usar el **Método 1** (script) o el **Método 3** (MongoDB directo) para crear el primer usuario administrador.

2. **Seguridad**: El endpoint `/api/admin/users/:id/role` está protegido con:
   - `authMiddleware`: Verifica que el usuario esté autenticado
   - `checkAdmin`: Verifica que el usuario tenga rol de admin

3. **Roles válidos**: Solo se aceptan dos valores:
   - `"user"` (rol por defecto)
   - `"admin"`

4. **Cambiar de admin a user**: También puedes usar cualquiera de estos métodos para cambiar un usuario de `admin` a `user`:

```bash
# Con el script (si el email es el del usuario a cambiar)
node scripts/make-admin.js usuario@example.com
# Pero esto lo convierte a admin. Para convertirlo a user, usa MongoDB directamente o el endpoint.
```

Con el endpoint:
```json
{
  "role": "user"
}
```

---

## 🚀 Endpoints de Admin Disponibles

Una vez que tengas un usuario admin, puedes usar estos endpoints:

- `GET /api/admin/dashboard` - Dashboard de administrador
- `GET /api/admin/users` - Listar todos los usuarios
- `GET /api/admin/users/:id` - Obtener un usuario específico
- `PUT /api/admin/users/:id/role` - Cambiar el rol de un usuario

**Todos estos endpoints requieren:**
- Header `Authorization: Bearer <token>`
- Que el usuario tenga rol `admin`

---

¿Necesitas ayuda? Revisa los archivos:
- `src/controllers/admin.controller.js` - Controladores de admin
- `src/routes/admin.routes.js` - Rutas de admin
- `src/middleware/checkAdmin.middleware.js` - Middleware de verificación

