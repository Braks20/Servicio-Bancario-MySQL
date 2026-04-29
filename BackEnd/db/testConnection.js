require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  port     : process.env.DB_PORT,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar con MySQL:', err.message);
    process.exit(1);
  }
  console.log('✅ Conexión exitosa con MySQL!');
  console.log(`   Host     : ${process.env.DB_HOST}`);
  console.log(`   Puerto   : ${process.env.DB_PORT}`);
  console.log(`   Base de datos: ${process.env.DB_NAME}`);
  console.log(`   Usuario  : ${process.env.DB_USER}`);
  connection.end();
});
