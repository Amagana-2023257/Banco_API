// src/middlewares/validateJWT.js
import jwt from 'jsonwebtoken';
import User from '../user/user.model.js';

/**
 * Middleware para validar el JWT.
 * Verifica si el token es válido, si el usuario existe y si está activo.
 */
export const validateJWT = async (req, res, next) => {
    try {
        // Obtener token de los posibles lugares: cuerpo, query o cabecera
        let token = req.body.token || req.query.token || req.headers['authorization'];

        // Si no se proporcionó un token, devolver un error de autenticación
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó un token en la petición',
            });
        }

        // Limpiar el token de la palabra "Bearer " si está presente
        token = token.replace(/^Bearer\s+/, '');

        // Verificar la validez del token y extraer el uid
        const decoded = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        // Buscar el usuario en la base de datos usando el uid extraído del token
        const user = await User.findById(decoded.uid);

        // Si el usuario no existe, devolver un error
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Usuario no existe en la base de datos',
            });
        }

        // Verificar que el usuario esté activo
        if (!user.status) {
            return res.status(400).json({
                success: false,
                message: 'Usuario desactivado',
            });
        }

        // Agregar la información del usuario al objeto `req`
        req.usuario = user;
        next();
    } catch (err) {
        // Manejar cualquier error, como un token inválido o expirado
        return res.status(500).json({
            success: false,
            message: 'Error al validar el token',
            error: err.message,
        });
    }
};
