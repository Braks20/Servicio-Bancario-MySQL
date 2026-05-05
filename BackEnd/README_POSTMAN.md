# Guía Completa de la API - Servicio Bancario (Postman)

Este documento contiene la lista completa de todas las funciones (endpoints) disponibles en la colección de Postman para el **Servicio Bancario**.

> **Nota Importante:** La colección de Postman está configurada para capturar automáticamente el **Token JWT**. Solo necesitas ejecutar el `Login` una vez con las credenciales adecuadas, y todas las demás peticiones funcionarán automáticamente.

---

## 🔑 1. Autenticación (Auth)
Estas funciones manejan el acceso al sistema.

| Función | Método | Endpoint | Rol Requerido | Descripción |
|---------|--------|----------|---------------|-------------|
| **Login** | `POST` | `/api/auth/login` | *Ninguno* | Inicia sesión en el sistema. Si es exitoso, guarda el JWT para usarlo en el resto de peticiones. |
| **Ver Perfil** | `GET` | `/api/auth/perfil` | Cualquier rol | Devuelve la información del usuario actualmente autenticado (basado en el token). |

---

## 👥 2. Gestión de Clientes
Funciones relacionadas con la creación y lectura de perfiles de clientes.

| Función | Método | Endpoint | Rol Requerido | Descripción |
|---------|--------|----------|---------------|-------------|
| **Crear Cliente** | `POST` | `/api/clientes` | `admin`, `cajero` | Permite registrar un nuevo cliente en el banco (requiere DPI, nombre, etc). |
| **Listar Clientes** | `GET` | `/api/clientes` | `admin`, `cajero` | Obtiene el listado completo de todos los clientes registrados en el banco. |

---

## 🏦 3. Gestión de Cuentas Bancarias
Funciones para manejar las cuentas (ahorro, monetarias) de los clientes.

| Función | Método | Endpoint | Rol Requerido | Descripción |
|---------|--------|----------|---------------|-------------|
| **Crear Cuenta** | `POST` | `/api/cuentas` | `admin`, `cajero` | Abre una nueva cuenta bancaria asociándola al ID de un cliente existente. |
| **Consultar Saldo** | `GET` | `/api/cuentas/:id/saldo` | `admin`, `cajero`, `cliente` | Revisa el saldo disponible y bloqueado de una cuenta específica. |

---

## 💸 4. Transacciones
Operaciones de movimiento de dinero.

| Función | Método | Endpoint | Rol Requerido | Descripción |
|---------|--------|----------|---------------|-------------|
| **Depósito** | `POST` | `/api/transacciones/deposito` | `admin`, `cajero` | Ingresa dinero a una cuenta bancaria. |
| **Retiro** | `POST` | `/api/transacciones/retiro` | `admin`, `cajero` | Extrae dinero de una cuenta (valida que haya saldo suficiente). |
| **Transferencia** | `POST` | `/api/transacciones/transferencia` | `admin`, `cajero`, `cliente` | Mueve dinero de una cuenta origen a una cuenta destino. (Los clientes pueden hacer esto desde su banca virtual). |

---

## 🛡️ 5. Gestión de Usuarios
Funciones administrativas y de seguridad.

| Función | Método | Endpoint | Rol Requerido | Descripción |
|---------|--------|----------|---------------|-------------|
| **Desbloquear Cuenta** | `POST` | `/api/usuarios/:id/desbloquear` | `admin` | Restablece los intentos fallidos a 0 y quita el tiempo de bloqueo de un usuario suspendido. |

---

## 🛠️ ¿Cómo hacer las pruebas? (Credenciales)

Para probar los diferentes niveles de acceso, usa estas credenciales en el **Login**:

**Para probar funciones administrativas (`admin` o `cajero`):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Para probar funciones de clientes (`cliente`):**
```json
{
  "username": "juanperez",
  "password": "cliente123"
}
```
*(Al iniciar sesión como cliente e intentar usar "Listar Clientes", recibirás un error de permisos).*
