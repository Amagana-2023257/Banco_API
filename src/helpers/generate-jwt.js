import jwt from 'jsonwebtoken';

/**
 * Genera un JWT para el usuario.
 * @param {String} uid - El ID del usuario.
 * @param {String} name - El nombre del usuario.
 * @param {String} role - El rol del usuario.
 * @param {String} [expiresIn="1h"] - Tiempo de expiración del token. (opcional)
 * @returns {Promise<String>} El token generado.
 */
export const generateJWT = async (uid = "", name = "", role = "", expiresIn = "1h") => {
    // Verificar que los parámetros sean válidos
    if (!uid || typeof uid !== 'string') {
        throw new Error("El ID del usuario debe ser una cadena no vacía.");
    }
    if (!name || typeof name !== 'string') {
        throw new Error("El nombre del usuario debe ser una cadena no vacía.");
    }
    if (!role || typeof role !== 'string') {
        throw new Error("El rol del usuario debe ser una cadena no vacía.");
    }

    const payload = { uid, name, role };

    try {
        // Generar el token con jwt.sign y devolverlo
        const token = await new Promise((resolve, reject) => {
            jwt.sign(payload, process.env.SECRETORPRIVATEKEY, { expiresIn }, (err, token) => {
                if (err) {
                    return reject(new Error("Error al generar el token: " + err.message));
                }
                resolve(token);
            });
        });

        return token;
    } catch (err) {
        throw new Error(`No se pudo generar el token: ${err.message}`);
    }
};
