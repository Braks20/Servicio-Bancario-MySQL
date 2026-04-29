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
| Sequelize | 6.x | ORM para MySQL |
| Sequelize CLI | 6.x | Gestión de migrations y seeds |
| mysql2 | latest | Driver de conexión a MySQL |
| dotenv | latest | Gestión de variables de entorno |

---

## 📁 Estructura del Proyecto

```
BackEnd/
│
├── config/
│   └── config.json           # Configuración de Sequelize (host, BD, usuario)
│
├── controllers/              # Lógica de negocio por recurso (próximamente)
│
├── db/
│   └── testConnection.js     # Script para verificar la conexión con MySQL
│
├── migrations/               # Historial de cambios en la base de datos
│   ├── 001-crear-tabla-roles.js
│   ├── 002-crear-tabla-clientes.js
│   ├── 003-crear-tabla-usuarios.js
│   ├── 004-crear-tabla-cuentas.js
│   ├── 005-crear-tabla-transacciones.js
│   ├── 006-crear-tabla-prestamos.js
│   ├── 007-crear-tabla-tarjetas-credito.js
│   ├── 008-crear-tabla-notificaciones.js
│   ├── 009-crear-tabla-log-auditoria.js
│   └── 010-agregar-indices.js
│
├── models/                   # Modelos Sequelize por tabla (próximamente)
│
├── routes/                   # Definición de rutas de la API (próximamente)
│
├── seeders/
│   └── 011-roles-iniciales.js  # Datos iniciales: roles del sistema
│
├── .env                      # Variables de entorno (NO subir a Git)
├── .gitignore                # Archivos excluidos del repositorio
├── .sequelizerc              # Rutas personalizadas para Sequelize CLI
├── package.json              # Dependencias y scripts del proyecto
└── README.md                 # Este archivo
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
