# Proyecto Banco

## Descripción
Este proyecto tiene como objetivo la creación de un **sistema bancario** en línea utilizando **Node.js**, **React** y **MongoDB**. La plataforma está diseñada para manejar tanto **funcionalidades de administración** como **funcionalidades de cliente**. Los usuarios podrán realizar **transferencias**, **consultar su saldo**, **realizar depósitos**, y más, todo con un alto nivel de seguridad y validaciones.

## Funcionalidades del Administrador

1. **Creación de Administradores y Clientes**:
   - El administrador tiene la capacidad de **crear cuentas** de usuario (tanto administradores como clientes) con los siguientes datos:
     - **Nombre**
     - **NickName o Username**
     - **No. Cuenta** (Generado aleatoriamente)
     - **DPI** (No se puede modificar)
     - **Dirección**
     - **Celular**
     - **Correo**
     - **Contraseña** (No se puede modificar)
     - **Nombre de trabajo**
     - **Ingresos mensuales** (Debe ser mayor a Q100 para ser registrado)

2. **Visualización de Movimientos**:
   - El administrador puede ver las cuentas con más movimientos (por tipo de transacción: **transferencia**, **compra**, **crédito**).
   - **Ver los saldos disponibles** en las cuentas de los usuarios y los **últimos 5 movimientos**.

3. **Gestión de Productos/Servicios**:
   - El administrador puede gestionar productos o servicios exclusivos para los clientes del banco (por ejemplo, zapatos, peluquería, etc.).

4. **Realización de Depósitos**:
   - El administrador puede realizar depósitos, que se reflejan directamente en el saldo de la cuenta del usuario. Estos depósitos **no pueden ser eliminados**, pero pueden ser revertidos dentro de un minuto.

## Funcionalidades del Cliente

1. **Acceso a la Cuenta**:
   - Los clientes pueden acceder a su cuenta, pero no pueden **crear** o **eliminar** la cuenta, eso debe ser realizado por un administrador.
   
2. **Edición de Datos**:
   - Los clientes pueden **editar su nombre**, **dirección**, **nombre de trabajo** e **ingresos mensuales**.
   
3. **Consulta de Saldo e Historial**:
   - Los clientes pueden consultar su **saldo actual** y ver el **historial de transacciones** (transferencias, compras, créditos).

4. **Transferencias**:
   - Los clientes pueden realizar transferencias a otras cuentas, con las siguientes restricciones:
     - **No pueden transferir más de Q2000 por transacción**.
     - **El monto máximo por día** no puede exceder los **Q10,000**.
     - **Reflejo inmediato**: El saldo de la cuenta remitente se debita y el saldo de la cuenta receptora se acredita con el monto.

5. **Favoritos**:
   - Los clientes pueden **agregar cuentas a favoritos** (nombre de cuenta y tipo) y asignarles un **alias** para realizar transferencias rápidas.

6. **API de Divisas**:
   - El cliente puede consultar el saldo en **diferentes monedas**, utilizando un **API de conversión de divisas** (como IBM o Google API).

## Estandarización de Código

### 📌 **Variables**
- Las **variables** deben ser nombradas en **inglés**.
- Se debe utilizar la notación **camelCase**.
  - Ejemplos: `userName`, `productId`.

### 📁 **Módulos / Archivos**
- Los **nombres de los archivos y módulos** también deben estar en **inglés**.
- Usar **camelCase**, comenzando con minúscula.
  - Ejemplos: `productRegister`, `userRegister`.
- Utilizar **nombres en singular**, no en plural.
  - ✅ `productForm`
  - ❌ `productsForm`

### ❗ **Mensajes de error**
- Todos los **mensajes de error** deben estar escritos en **inglés**.
- Deben ser claros, precisos y orientados al usuario o al desarrollador, según corresponda.
  - Ejemplos:
    - "Invalid email address."
    - "Product not found."

### 💬 **Commits**
- Todos los **mensajes de commit** deben iniciar con un prefijo que indique el tipo de cambio. A continuación, se listan los prefijos que deben utilizarse:

  | Prefijo | Descripción |
  |---------|-------------|
  | `feat:`  | Agregar o eliminar una nueva característica |
  | `add:`   | Añadir archivos nuevos al proyecto |
  | `build:` | Cambios relacionados con la estructura del proyecto |
  | `docs:`  | Cambios en la documentación |
  | `fix:`   | Corrección de errores o bugs |
  | `refactor:` | Cambios internos que no afectan la funcionalidad |
  | `style:` | Cambios en estilos (CSS, clases, etc.) |
  | `chore:` | Cambios en dependencias o tareas menores |

  Ejemplos:
  - `add: Se creó el módulo register de productos`
  - `fix: Se arregló el método register de productos`

### 🌿 **Ramas**
- Las **ramas** se crearán por **funcionalidad** o **ticket**.
- Cada funcionalidad debe tener su propia rama, en la que se realizarán los commits correspondientes.
- Los **nombres de las ramas** serán en base al **número de ticket** de Jira, seguido por el nombre de la funcionalidad y al final agregaremos una letra que defina el módulo.
- El nombre de la funcionalidad debe empezar con mayúscula y debe estar escrita en inglés.

Ejemplo:
- Si el número del ticket en Jira es **LGDA-8** y la funcionalidad es **"Registrar Producto"**, el nombre de la rama debería ser **LGDA-8.RegisterProduct**.

### 📧 **Credenciales de administrador**:
- **Email**: admin@example.com
- **Contraseña**: Admin1234#/SFDS=)

## Instalación

### Requisitos
- **Node.js** (v16 o superior)
- **MongoDB** (local o en la nube)
- **Cloudinary** (para manejar imágenes)

### Pasos para instalar el proyecto:

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Amagana-2023257/Banco_FRONT.git
