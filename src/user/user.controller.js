// src/controllers/user.controller.js
import User from './user.model.js';

/**
 * Obtener todos los usuarios activos
 * Solo devuelve los usuarios cuyo estado es true.
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ status: true });  // Solo usuarios activos
    res.status(200).json({
      success: true,
      users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los usuarios',
      error: err.message
    });
  }
};

/**
 * Obtener un usuario por ID
 * Validar que el usuario exista antes de retornar sus datos.
 */
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar al usuario por su ID
    const user = await User.findById(id);

    if (!user || !user.status) {  // Verificar si el usuario está activo
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado o desactivado'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el usuario',
      error: err.message
    });
  }
};

/**
 * Actualizar los datos de un usuario
 * Solo se permite la actualización de ciertos campos como email, dirección, celular, etc.
 */
/**
 * Actualizar usuario sin permitir cambio de contraseña
 * Carga el documento, asigna sólo los campos permitidos y guarda.
 */
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const incoming = { ...req.body };

  // Campos permitidos (sin password)
  const allowed = [
    'name',
    'surname',
    'username',
    'email',
    'phone',
    'address',
    'jobName',
    'monthlyIncome',
    'status',
    'role',
    'profilePicture'
  ];

  try {
    // 1) Carga
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // 2) Validaciones (igual que antes)
    if (incoming.monthlyIncome != null && incoming.monthlyIncome < 100) {
      return res.status(400).json({ success: false, message: 'Los ingresos mensuales deben ser Q100 o más' });
    }
    if (incoming.phone && !/^[0-9]{8}$/.test(incoming.phone)) {
      return res.status(400).json({ success: false, message: 'El teléfono debe tener 8 dígitos' });
    }
    if (incoming.role && !['ADMIN_GLOBAL','GERENTE_SUCURSAL','CAJERO','CLIENTE'].includes(incoming.role)) {
      return res.status(400).json({ success: false, message: `Rol inválido: ${incoming.role}` });
    }
    if (incoming.email && incoming.email !== user.email) {
      const exists = await User.findOne({ email: incoming.email.toLowerCase() });
      if (exists) {
        return res.status(400).json({ success: false, message: `Email ${incoming.email} ya registrado` });
      }
    }
    if (incoming.username && incoming.username !== user.username) {
      const exists = await User.findOne({ username: incoming.username.trim() });
      if (exists) {
        return res.status(400).json({ success: false, message: `Username ${incoming.username} ya en uso` });
      }
    }

    // 3) Asignar sólo campos permitidos
    allowed.forEach(field => {
      if (field in incoming && incoming[field] != null) {
        if (['name','surname','username','address','jobName','profilePicture'].includes(field)) {
          user[field] = incoming[field].trim();
        } else if (field === 'email') {
          user.email = incoming.email.trim().toLowerCase();
        } else if (field === 'monthlyIncome') {
          user.monthlyIncome = Number(incoming.monthlyIncome);
        } else {
          user[field] = incoming[field];
        }
      }
    });

    // 4) Guardar cambios
    const updated = await user.save();

    // 5) Volver a leer todos los usuarios activos (para forzar nueva data)
    const allUsers = await User.find({ status: true }).sort({ surname: 1, name: 1 });

    // 6) Responder con usuario actualizado y lista completa
    return res.status(200).json({
      success: true,
      message: 'Usuario actualizado y lista refrescada',
      user: updated,
      users: allUsers
    });

  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el usuario',
      error: err.message
    });
  }
};

/**
 * Desactivar un usuario por ID
 * Cambiar el estado del usuario a false en lugar de eliminarlo.
 */
export const deactivateUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar al usuario por ID
    const user = await User.findById(id);

    if (!user || !user.status) {  // Verificar si el usuario está activo
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado o ya desactivado'
      });
    }

    // Cambiar el estado a false para desactivar al usuario
    user.status = false;

    // Guardar el usuario desactivado
    const deactivatedUser = await user.save();
    res.status(200).json({
      success: true,
      message: 'Usuario desactivado exitosamente',
      user: deactivatedUser
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar el usuario',
      error: err.message
    });
  }
};




/**
 * Actualizar mis propios datos
 * Solo puede actualizar el usuario autenticado (ID extraído del token).
 */
export const updateMe = async (req, res) => {
  const id = req.usuario._id.toString();
  const { email, phone, address, monthlyIncome, password, username } = req.body;

  try {
    const user = await User.findById(id);
    if (!user || !user.status) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado o desactivado'
      });
    }

    if (monthlyIncome != null && monthlyIncome < 100) {
      return res.status(400).json({
        success: false,
        message: 'Los ingresos mensuales deben ser mayores a Q100.'
      });
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: `El correo ${email} ya está registrado.`
        });
      }
    }

    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: `El nombre de usuario ${username} ya está registrado.`
        });
      }
    }

    if (phone && !/^\d{8}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'El número de teléfono debe tener 8 dígitos.'
      });
    }

    // Solo reasigna si viene un valor nuevo
    user.email         = email ?? user.email;
    user.phone         = phone ?? user.phone;
    user.address       = address ?? user.address;
    user.monthlyIncome = monthlyIncome ?? user.monthlyIncome;
    user.password      = password ?? user.password;
    user.username      = username ?? user.username;

    const updatedUser = await user.save();
    res.status(200).json({
      success: true,
      message: 'Datos actualizados correctamente',
      user: updatedUser
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar mis datos',
      error: err.message
    });
  }
};