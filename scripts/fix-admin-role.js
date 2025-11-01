// scripts/fix-admin-role.js
// Script para asegurar que el rol de admin esté correctamente asignado

require('dotenv').config();
const mongoose = require('mongoose');
const Chef = require('../src/models/chef.model');
const connectDB = require('../src/config/db');

const userEmail = process.argv[2] || 'juanfelipejaramillohenao@gmail.com';

const fixRole = async () => {
  try {
    await connectDB();

    // Actualizar directamente usando updateOne para forzar el campo
    const result = await Chef.updateOne(
      { email: userEmail },
      { $set: { role: 'admin' } }
    );

    console.log('Resultado de actualización:', result);

    // Verificar que se guardó correctamente
    const chef = await Chef.findOne({ email: userEmail });
    
    if (!chef) {
      console.error(`❌ No se encontró el usuario con email "${userEmail}"`);
      process.exit(1);
    }

    // Forzar que el campo role esté presente
    if (!chef.role) {
      chef.role = 'admin';
      await chef.save({ validateBeforeSave: false });
    }

    // Obtener de nuevo para verificar
    const updatedChef = await Chef.findById(chef._id).lean();
    
    console.log('\n✅ Rol actualizado correctamente:');
    console.log('   Email:', updatedChef.email);
    console.log('   Nombre:', updatedChef.name);
    console.log('   Rol:', updatedChef.role || 'NO DEFINIDO');
    console.log('\n📋 Objeto completo (sin password):');
    const { password, ...chefWithoutPassword } = updatedChef;
    console.log(JSON.stringify(chefWithoutPassword, null, 2));

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

fixRole();

