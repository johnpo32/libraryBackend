const DbMixin = require("../mixins/db.mixin");

module.exports = {
    name: "searchHistory",
    mixins: [DbMixin("search_history")],
    
    settings: {
        fields: ["_id", "userId", "query", "timestamp"]
    },

    actions: {
        add: {
            params: {
                userId: "string",
                query: "string",
                timestamp: "date"
            },
            async handler(ctx) {
                const { userId, query, timestamp } = ctx.params;
                
                return await this.adapter.insert({
                    userId,
                    query,
                    timestamp
                });
            }
        },

        getLast: {
            params: {
                userId: "string",
                limit: { type: "number", default: 5 }
            },
            async handler(ctx) {
                const { userId, limit } = ctx.params;
                
                return await this.adapter.find({
                    query: { userId },
                    sort: ["-timestamp"],
                    limit
                });
            }
        }
    }
};