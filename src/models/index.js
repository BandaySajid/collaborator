import Code from "./code.js";
import User from "./user.js";
import sequelize from "../db_config/mysql.js";

User.hasOne(Code, {
    foreignKey: 'user_id'
});

Code.belongsTo(User, {
    foreignKey: 'user_id'
});

await sequelize.sync({
    force: false
});

export { Code, User };