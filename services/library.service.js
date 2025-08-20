const DbMixin = require("../mixins/db.mixin");

module.exports = {
    name: "library",
    mixins: [DbMixin("library")],
    
    settings: {
        fields: ["_id", "userId", "title", "author", "publishYear", "isbn", 
                "coverImage", "review", "rating", "createdAt", "updatedAt"]
    },

    actions: {
        add: {
            auth: "required",
            params: {
                title: "string",
                author: "string",
                publishYear: { type: "number", optional: true },
                isbn: { type: "string", optional: true },
                coverImage: { type: "string", optional: true }, // base64
                review: { type: "string", optional: true },
                rating: { type: "number", min: 1, max: 5, optional: true }
            },
            async handler(ctx) {
                const { title, author, publishYear, isbn, coverImage, review, rating } = ctx.params;
                const userId = ctx.meta.user.id;
                
                return await this.adapter.insert({
                    userId,
                    title,
                    author,
                    publishYear,
                    isbn,
                    coverImage,
                    review,
                    rating,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        },

        get: {
            auth: "required",
            params: {
                id: "string"
            },
            async handler(ctx) {
                const { id } = ctx.params;
                const userId = ctx.meta.user.id;
                
                const book = await this.adapter.findById(id);
                if (!book || book.userId !== userId) {
                    throw new Error("Libro no encontrado");
                }
                
                return book;
            }
        },

        update: {
            auth: "required",
            params: {
                id: "string",
                review: { type: "string", optional: true },
                rating: { type: "number", min: 1, max: 5, optional: true }
            },
            async handler(ctx) {
                const { id, review, rating } = ctx.params;
                const userId = ctx.meta.user.id;
                
                const book = await this.adapter.findById(id);
                if (!book || book.userId !== userId) {
                    throw new Error("Libro no encontrado");
                }
                
                const updateData = { updatedAt: new Date() };
                if (review !== undefined) updateData.review = review;
                if (rating !== undefined) updateData.rating = rating;
                
                return await this.adapter.updateById(id, { $set: updateData });
            }
        },

        delete: {
            auth: "required",
            params: {
                id: "string"
            },
            async handler(ctx) {
                const { id } = ctx.params;
                const userId = ctx.meta.user.id;
                
                const book = await this.adapter.findById(id);
                if (!book || book.userId !== userId) {
                    throw new Error("Libro no encontrado");
                }
                
                return await this.adapter.removeById(id);
            }
        },

        list: {
            auth: "required",
            params: {
                search: { type: "string", optional: true },
                excludeNoReview: { type: "string", optional: true, default: false }
            },
            async handler(ctx) {
                
                const { search, excludeNoReview } = ctx.params;
                const userId = ctx.meta.user.id;
                
                let query = { userId };
                
                // Filtro de búsqueda
                if (search) {
                    query.$or = [
                        { title: { $regex: search, $options: "i" } },
                        { author: { $regex: search, $options: "i" } }
                    ];
                }
                
                // Excluir libros sin review
                if (excludeNoReview == "true") {
                    query.review = { $exists: true, $ne: "" };
                }
                
                return await this.adapter.find({ 
                    query,
                    sort: ["-createdAt"]
                });
            }
        },

        getCover: {
            params: {
                id: "string"
            },
            async handler(ctx) {
                const { id } = ctx.params;
                
                const book = await this.adapter.findById(id);
                if (!book || !book.coverImage) {
                    throw new Error("Portada no encontrada");
                }
                
                // Devolver imagen base64
                return {
                    image: book.coverImage,
                    contentType: "image/jpeg"
                };
            }
        }
    }
};