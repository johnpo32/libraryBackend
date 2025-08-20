const fetch = require("node-fetch");

module.exports = {
    name: "books",
    
    actions: {
        search: {
            auth: "required",
            params: {
                query: { type: "string", min: 1 },
                limit: { type: "number", optional: true, default: 1 }
            },
            async handler(ctx) {
                const { query, limit } = ctx.params;
                const userId = ctx.meta.user.id;
                
                try {
                    // Guardar búsqueda en historial
                    await ctx.call("searchHistory.add", {
                        userId,
                        query,
                        timestamp: new Date()
                    });
                    
                    const response = await fetch(
                        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`
                    );
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    // Verificar libros en biblioteca personal
                    const libraryBooks = await ctx.call("library.list", { userId });
                    
                    // Formatear resultados
                    const formattedBooks = await Promise.all(
                        (data.docs || []).map(async (book) => {
                            const formatted = this.formatBook(book);
                            
                            // Verificar si el libro está en la biblioteca
                            const inLibrary = libraryBooks.find(libBook => 
                                libBook.isbn === formatted.isbn || 
                                libBook.title === formatted.title
                            );
                            
                            if (inLibrary) {
                                formatted.cover = `/api/books/library/front-cover/${inLibrary._id}`;
                                formatted.inLibrary = true;
                                formatted.libraryId = inLibrary._id;
                            }
                            
                            return formatted;
                        })
                    );
                    
                    return formattedBooks;
                } catch (error) {
                    this.logger.error("Error fetching books:", error);
                    throw new Error("Error al buscar libros");
                }
            }
        },
        
        getLastSearches: {
            auth: "required",
            async handler(ctx) {
                const userId = ctx.meta.user.id;
                return await ctx.call("searchHistory.getLast", { 
                    userId, 
                    limit: 5 
                });
            }
        }
    },

    methods: {
        formatBook(book) {
            return {
                title: book.title,
                author: book.author_name ? book.author_name[0] : "Desconocido",
                publishYear: book.first_publish_year,
                isbn: book.isbn ? book.isbn[0] : null,
                cover: book.cover_i 
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` 
                    : null,
                inLibrary: false
            };
        }
    }
};