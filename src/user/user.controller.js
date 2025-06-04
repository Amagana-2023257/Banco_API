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
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, phone, address, monthlyIncome, password } = req.body;

  try {
    // Verificar si el usuario existe
    const user = await User.findById(id);

    if (!user || !user.status) {  // Verificar si el usuario está activo
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado o desactivado'
      });
    }

    // Si el ingreso mensual es modificado, validar que sea mayor a Q100
    if (monthlyIncome && monthlyIncome < 100) {
      return res.status(400).json({
        success: false,
        message: "Los ingresos mensuales deben ser mayores a Q100."
      });
    }

    // Si el email se cambia, verificar si ya existe
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: `El correo ${email} ya está registrado.`
        });
      }
    }

    // Si el teléfono se cambia, validar el formato
    if (phone && !/^\d{8}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "El número de teléfono debe tener 8 dígitos."
      });
    }

    // Actualizar los campos que se permiten
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.monthlyIncome = monthlyIncome || user.monthlyIncome;
    user.password = password || user.password;

    // Guardar el usuario actualizado
    const updatedUser = await user.save();
    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
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
 * Eliminar un usuario por ID (realmente desactiva su cuenta)
 * Cambiar el estado del usuario a false en lugar de eliminarlo.
 */
export const deleteUser = async (req, res) => {
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
