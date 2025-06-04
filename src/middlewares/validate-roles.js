// src/middlewares/hasRoles.js

/**
 * Middleware para verificar que el usuario tiene uno de los roles especificados.
 * @param  {...string} roles - Roles permitidos para acceder al recurso
 */
export const hasRoles = (...roles) => {
    return (req, res, next) => {
        // Verificar si el usuario está presente en `req.usuario` (debería estarlo después de validateJWT)
        if (!req.usuario) {
            return res.status(500).json({
                success: false,
                message: 'Error interno: El usuario no está autenticado correctamente',
            });
        }

        // Verificar si el rol del usuario está en los roles permitidos
        if (!roles.includes(req.usuario.role)) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado: El recurso requiere uno de los siguientes roles: ${roles.join(', ')}`,
            });
        }

        // Validar si los roles proporcionados son de tipo string no vacío
        if (roles.some(role => typeof role !== 'string' || !role.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Roles proporcionados no válidos. Asegúrese de que todos sean cadenas de texto no vacías.',
            });
        }

        // Si todo está en orden, se permite el acceso
        next();
    };
};
