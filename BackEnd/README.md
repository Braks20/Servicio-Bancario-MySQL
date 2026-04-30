# 🏦 Servicio Bancario — BackEnd

Backend de un sistema bancario moderno construido sobre **Node.js**, **Sequelize ORM** y **MySQL**. Diseñado para resolver los retos críticos de transformación digital, seguridad de datos, escalabilidad y eficiencia operativa de una institución financiera.

---

## 📋 Tabla de Contenidos

- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración del Entorno](#-configuración-del-entorno)
- [Base de Datos](#-base-de-datos)
- [Migrations](#-migrations)
- [Seeders](#-seeders)
- [Verificar Conexión](#-verificar-conexión)
- [Archivos de Configuración](#-archivos-de-configuración)

---

## 🛠 Tecnologías

| Tecnología | Versión | Propósito |
|---|---|---|
| Node.js | ≥ 18 | Runtime de JavaScript |
| Express.js | 4.x | Framework web para la API REST |
| Sequelize | 6.x | ORM para MySQL |
| Sequelize CLI | 6.x | Gestión de migrations y seeds |
| mysql2 | latest | Driver de conexión a MySQL |
| bcrypt | 6.x | Encriptado de contraseñas |
| jsonwebtoken | 9.x | Generación y validación de tokens JWT |
| dotenv | latest | Gestión de variables de entorno |
| cors | latest | Habilitar peticiones de otros orígenes |

---

## 📁 Estructura del Proyecto

```
BackEnd/
│
├── app.js                    # Punto de entrada de la aplicación y servidor Express
│
├── config/
│   └── config.json           # Configuración de Sequelize (host, BD, usuario)
│
├── controllers/              # Lógica de negocio de la API
│   ├── auditoriaController.js
│   ├── authController.js
│   ├── clienteController.js
│   ├── cuentaController.js
│   ├── prestamoController.js
│   ├── tarjetaCreditoController.js
│   └── transaccionController.js
│
├── db/
│   └── testConnection.js     # Script para verificar la conexión con MySQL
│
├── middlewares/              # Interceptores para Express
│   ├── auditoria.js          # Registro automático de eventos y acciones
│   ├── auth.js               # Verificación de tokens JWT
│   └── roles.js              # Autorización basada en roles
│
├── migrations/               # Historial de cambios en la base de datos
│   └── ... (001 a 010)
│
├── models/                   # Modelos Sequelize y sus asociaciones
│   ├── index.js              # Inicializador de Sequelize
│   └── ... (Cliente, Cuenta, Transaccion, etc.)
│
├── routes/                   # Definición de endpoints de la API
│   ├── index.js              # Enrutador principal (/api)
│   └── ... (authRoutes, clienteRoutes, etc.)
│
├── seeders/
│   └── 011-roles-iniciales.js  # Datos iniciales: roles del sistema
│
├── ServicioBancario.postman_collection.json # Colección lista para importar en Postman
├── .env                      # Variables de entorno (NO subir a Git)
├── .gitignore                # Archivos excluidos del repositorio
├── .sequelizerc              # Rutas personalizadas para Sequelize CLI
└── package.json              # Dependencias y scripts del proyecto
```

---

## ✅ Requisitos Previos

- **Node.js** v18 o superior → [descargar](https://nodejs.org)
- **MySQL** 8.x corriendo en `localhost:3306`
- La base de datos `Banco` creada en MySQL:
  ```sql
  CREATE DATABASE Banco;
  ```

---

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Braks20/Servicio-Bancario-MySQL.git

# 2. Entrar al BackEnd
cd Servicio-Bancario-MySQL/BackEnd

# 3. Instalar dependencias
npm install
```

---

## ⚙️ Configuración del Entorno

Crea o edita el archivo `.env` en la raíz del BackEnd:

```env
# Servidor
PORT=3000

# Base de Datos (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=Banco
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_DIALECT=mysql

# Entorno
NODE_ENV=development
```

> ⚠️ **Nunca subas el `.env` a Git.** Ya está incluido en `.gitignore`.

---

## 🗄️ Base de Datos

El sistema gestiona **9 tablas** principales con sus relaciones e índices:

| Tabla | Descripción |
|---|---|
| `Roles` | Roles del sistema (admin, usuario, etc.). Extensible sin cambiar el schema |
| `Clientes` | Datos personales de los clientes del banco |
| `Usuarios` | Credenciales de acceso. Vinculados a un `Cliente` y un `Rol` |
| `Cuentas` | Cuentas bancarias (ahorro, corriente, plazo fijo, empresarial) |
| `Transacciones` | Registro inmutable de movimientos financieros |
| `Prestamos` | Préstamos otorgados a clientes |
| `TarjetasCredito` | Tarjetas de crédito vinculadas a clientes |
| `Notificaciones` | Mensajes enviados al cliente (email, SMS, push) |
| `LogAuditoria` | Auditoría completa de acciones sensibles del sistema |

### Diagrama de Relaciones

```
Roles ──────────────┐
                    ↓
Clientes ──→ Usuarios
   │
   ├──→ Cuentas ──→ Transacciones ──→ Notificaciones
   ├──→ Prestamos
   ├──→ TarjetasCredito
   └──→ Notificaciones

Usuarios ──→ Transacciones
Usuarios ──→ LogAuditoria
```

---

## 🔄 Migrations

Las migrations son el historial de cambios de la base de datos. **Deben ejecutarse en orden numérico.**

### Ejecutar todas las migrations

```bash
npx sequelize-cli db:migrate
```

### Deshacer la última migration

```bash
npx sequelize-cli db:migrate:undo
```

### Deshacer todas las migrations

```bash
npx sequelize-cli db:migrate:undo:all
```

### Orden de ejecución

```
001 → Roles               (base del sistema de permisos)
002 → Clientes            (identidad del cliente)
003 → Usuarios            (FK a Roles y Clientes)
004 → Cuentas             (FK a Clientes)
005 → Transacciones       (FK a Cuentas y Usuarios)
006 → Prestamos           (FK a Clientes y Cuentas)
007 → TarjetasCredito     (FK a Clientes)
008 → Notificaciones      (FK a Clientes y Transacciones)
009 → LogAuditoria        (FK a Usuarios)
010 → Índices             (optimización de consultas)
```

---

## 🌱 Seeders

Los seeders insertan datos iniciales necesarios para el funcionamiento del sistema.

### Ejecutar todos los seeders

```bash
npx sequelize-cli db:seed:all
```

### Deshacer todos los seeders

```bash
npx sequelize-cli db:seed:undo:all
```

### Datos insertados

| Seeder | Datos |
|---|---|
| `011-roles-iniciales.js` | `admin` — Acceso total al sistema |
| | `usuario` — Acceso al portal del cliente |

---

## 🔌 Verificar Conexión

Antes de levantar el servidor, puedes comprobar que la conexión con MySQL es correcta:

```bash
node db/testConnection.js
```

**Salida esperada:**
```
✅ Conexión exitosa con MySQL!
   Host         : localhost
   Puerto       : 3306
   Base de datos: Banco
   Usuario      : root
```

---

## 🚦 Iniciar el Servidor

Una vez completadas las configuraciones, migraciones y comprobada la conexión, levanta la API REST:

```bash
node app.js
```
*(También puedes usar `npx nodemon app.js` para desarrollo)*

El servidor estará escuchando en `http://localhost:3000`.

---

## 📬 Colección de Postman

El proyecto incluye una colección completa de Postman lista para ser importada y probar todos los endpoints sin tener que escribir JSON manualmente.

1. Abre **Postman**.
2. Presiona **Import**.
3. Selecciona el archivo **`ServicioBancario.postman_collection.json`** ubicado en la raíz de `BackEnd`.
4. Encontrarás la colección "Servicio Bancario API" con carpetas ordenadas para Auth, Clientes, Cuentas y Transacciones.

> 💡 **Nota de Seguridad**: Después de usar el endpoint **Login** y recibir tu Token JWT, cópialo y dirígete a las variables de la colección en Postman para asignarlo a la variable `token`. Esto autenticará automáticamente el resto de tus peticiones.

---

## 📄 Archivos de Configuración

### `.sequelizerc`
Le indica a Sequelize CLI dónde están las carpetas del proyecto:
```js
config      → config/config.json
models      → models/
seeders     → seeders/
migrations  → migrations/
```

### `config/config.json`
Configuración de la conexión a MySQL por entorno (`development` / `production`).

### `.gitignore`
Excluye del repositorio:
- `node_modules/` — dependencias (se reinstalan con `npm install`)
- `.env` — credenciales sensibles
- Logs y archivos temporales del sistema operativo

---

## 📌 Notas de Diseño

- **Las `Transacciones` son inmutables**: nunca se editan ni eliminan. Para corregir un error se crea una transacción de reversión.
- **`LogAuditoria` no tiene `updated_at`**: es un registro histórico inmutable.
- **`Roles` usa una tabla, no ENUM**: permite agregar nuevos roles (`cajero`, `supervisor`, `auditor`...) sin modificar el schema de `Usuarios`.
- **Soft delete**: los registros financieros nunca se eliminan físicamente, se cambia su campo `estado`.
