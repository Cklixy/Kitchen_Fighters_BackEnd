// scripts/make-admin.js
// Script para asignar el rol de admin a un usuario desde la línea de comandos

require('dotenv').config();
const mongoose = require('mongoose');
const Chef = require('../src/models/chef.model');
const connectDB = require('../src/config/db');

// Obtener el email del usuario desde los argumentos de línea de comandos
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('❌ Error: Debes proporcionar el email del usuario');
  console.log('\n📝 Uso: node scripts/make-admin.js <email>');
  console.log('   Ejemplo: node scripts/make-admin.js admin@example.com');
  process.exit(1);
}

const makeAdmin = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Buscar el usuario por email
    const user = await Chef.findOne({ email: userEmail });

    if (!user) {
      console.error(`❌ Error: No se encontró un usuario con el email "${userEmail}"`);
      process.exit(1);
    }

    // Verificar si ya es admin
    if (user.role === 'admin') {
      console.log(`✅ El usuario "${userEmail}" ya tiene rol de admin`);
      console.log(`   Nombre: ${user.name}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Actualizar el rol a admin
    user.role = 'admin';
    await user.save();

    console.log('✅ ¡Rol de admin asignado correctamente!');
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Rol anterior: user`);
    console.log(`   Rol nuevo: admin`);

    // Cerrar la conexión
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

makeAdmin();

