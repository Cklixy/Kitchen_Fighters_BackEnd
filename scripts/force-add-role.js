// scripts/force-add-role.js
// Script para forzar la adición del campo role usando la conexión directa de MongoDB

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

const userEmail = process.argv[2] || 'juanfelipejaramillohenao@gmail.com';

const forceAddRole = async () => {
  try {
    await connectDB();
    
    // Usar la conexión directa de MongoDB (no Mongoose)
    const db = mongoose.connection.db;
    const chefsCollection = db.collection('chefs');
    
    // Actualizar el documento directamente
    const result = await chefsCollection.updateOne(
      { email: userEmail },
      { 
        $set: { 
          role: 'admin'
        } 
      }
    );
    
    console.log('Resultado updateOne:', {
      matched: result.matchedCount,
      modified: result.modifiedCount
    });
    
    // Verificar que se guardó
    const chef = await chefsCollection.findOne({ email: userEmail });
    
    if (!chef) {
      console.error(`❌ No se encontró el usuario`);
      process.exit(1);
    }
    
    console.log('\n✅ Campo role agregado directamente en MongoDB:');
    console.log('   Email:', chef.email);
    console.log('   Nombre:', chef.name);
    console.log('   Rol:', chef.role || 'NO DEFINIDO');
    console.log('\n📋 Todos los campos del documento:');
    console.log(JSON.stringify(Object.keys(chef), null, 2));
    
    // Ahora verificar con Mongoose
    const Chef = require('../src/models/chef.model');
    const mongooseChef = await Chef.findOne({ email: userEmail });
    
    console.log('\n🔍 Verificación con Mongoose:');
    console.log('   Rol desde Mongoose:', mongooseChef ? mongooseChef.role : 'NO ENCONTRADO');
    
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
};

forceAddRole();

