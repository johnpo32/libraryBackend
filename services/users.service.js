const DbService = require("../mixins/db.mixin"); 

module.exports = {
    name: "users",
    mixins: [DbService("users")],
    
    settings: {
        fields: ["_id", "username", "email", "password", "role", "createdAt"]
    },
    
    actions: {
        register: {
            params: {
                username: "string|min:3",
                password: "string|min:6"
            },
            async handler(ctx) {
                const { username, password } = ctx.params;
                
                // Verificar si el usuario ya existe
                const existingUser = await this.adapter.findOne({ username });
                if (existingUser) {
                    throw new Error("Usuario ya existe");
                }
                
                // Crear usuario
                return await this.adapter.insert({
                    username,
                    password: password,
                    role: "user",
                    createdAt: new Date()
                });
            }
        }
    },
    
    // Seed inicial de la base de datos
    seedDB() {
        return this.adapter.insertMany([
            {
                username: "admin",
                password: "$2a$10$rOzJq...", 
                role: "admin",
                createdAt: new Date()
            }
        ]);
    }
};