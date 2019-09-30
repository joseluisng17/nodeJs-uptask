const Sequelize = require('sequelize');

// Option 1: Passing parameters separately
const db = new Sequelize('uptasknode', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    port: '3306',
    operatorsAliases: false,
    define: {
        timestamps: false
    },

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },

});

module.exports = db;

// Option 2: Passing a connection URI
//const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');