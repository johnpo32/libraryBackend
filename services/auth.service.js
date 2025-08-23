const { ServiceBroker } = require("moleculer");
const DbService = require("../mixins/db.mixin"); 
const jwt = require("jsonwebtoken");

module.exports = {
    name: "auth",

    mixins: [DbService("users")],

    settings: {
        jwtSecret: process.env.JWT_SECRET || "your-secret-key",
        jwtExpiresIn: "1d"
    },

    actions: {
        login: {
            params: {
                username: "string",
                password: "string"
            },
            async handler(ctx) {
                const { username, password } = ctx.params;

                // Buscar usuario en la BD
                const user = await this.adapter.findOne({ username });

                if (!user) {
                    throw new Error("Usuario no encontrado");
                }

                // Verificar contraseña (en texto plano, demo)
                if (password !== user.password) {
                    throw new Error("Contraseña incorrecta");
                }

                // Generar token JWT
                const token = jwt.sign(
                    {
                        id: user._id.toString(),
                        username: user.username,
                        role: user.role
                    },
                    this.settings.jwtSecret,
                    { expiresIn: this.settings.jwtExpiresIn }
                );

                return {
                    token,
                    user: {
                        id: user._id.toString(),
                        username: user.username,
                        role: user.role
                    }
                };
            }
        },

        verifyToken: {
            params: {
                token: "string"
            },
            async handler(ctx) {
                try {
                    const decoded = jwt.verify(ctx.params.token, this.settings.jwtSecret);
                    return { valid: true, user: decoded };
                } catch (error) {
                    return { valid: false, error: error.message };
                }
            }
        }
    }
};
