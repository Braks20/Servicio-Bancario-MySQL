const { sequelize } = require('./models');

async function checkTables() {
  try {
    const [results] = await sequelize.query("SHOW TABLES;");
    console.log('Tablas encontradas:', results.map(r => Object.values(r)[0]));
    
    for (const table of results.map(r => Object.values(r)[0])) {
      const [count] = await sequelize.query(`SELECT COUNT(*) as total FROM ${table};`);
      console.log(`Tabla ${table}: ${count[0].total} filas`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error al conectar:', err.message);
    process.exit(1);
  }
}

checkTables();
