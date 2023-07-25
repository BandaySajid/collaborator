import { DataTypes, ValidationError, ValidationErrorItem } from "sequelize";
import sequelize from "../db_config/mysql.js";
import bcrypt from 'bcrypt';
import uuid from "../utils/uuid.js";

const User = sequelize.define('user', {
    user_id: {
        type: DataTypes.UUID,
        unique: true,
        allowNull: false,
        primaryKey: true,
        defaultValue : uuid()
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate : {
            isValid(value){
                if(value.includes(' ')){
                    throw new Error(`username cannot include spaces`);
                }
            }
        }
    },

    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isValid(value) {
                const emailPattern = /^[\w\.-]+@[\w\.-]+\.\w+$/;
                if (!emailPattern.test(value)) {
                    throw new Error(`email validation failed, invalid email : ${value}`);
                };
            }
        }
    },

    password: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isValid(value) {
                const minPassLength = 7;
                if (value.length < minPassLength) {
                    throw new Error(`password validation failed, minimum password length : ${minPassLength}`);
                }
            }
        }
    }
});

const hashPassword = async (password) => {
    return (await bcrypt.hash(password, 10));
};

User.beforeCreate(async (user) => {
    user.password = await hashPassword(user.password);
});

User.prototype.compareHash = async function (plainPassword) {
    const user = this;
    const isValidPassword = await bcrypt.compare(plainPassword, user.getDataValue('password'));
    if (!isValidPassword) {
        const vErrItem = new ValidationErrorItem("Password does not match");
        throw new ValidationError("Password does not match", [vErrItem]);
    }

    return user;
};

User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        user.password = await hashPassword(user.password);
    }
});

export default User;