import sequelize from "../db_config/mysql.js";
import { DataTypes } from "sequelize";
import uuid from "../utils/uuid.js";

const Code = sequelize.define('code', {
    code_id: {
        type: DataTypes.UUID,
        unique: true,
        allowNull: false,
        primaryKey: true,
        defaultValue: uuid()
    },

    content: {
        type: DataTypes.TEXT('long')
    },

    invite_url: {
        type: DataTypes.STRING
    },

    user_id: {
        type: DataTypes.UUID,
        unique: true,
        allowNull: false
    }
});

export default Code;