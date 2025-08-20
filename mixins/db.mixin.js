"use strict";

const { ServiceBroker } = require("moleculer");
const DbService	= require("moleculer-db");
const MongoAdapter = require("moleculer-db-adapter-mongo");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('moleculer-db').MoleculerDB} MoleculerDB  Moleculer's DB Service Schema
 */

module.exports = function(collection) {
    const schema = {
        mixins: [DbService],
        adapter: new MongoAdapter(process.env.MONGO_URI),
        collection: collection
    };

    return schema;
};
