const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Contact extends Model {}

//contact table schema
Contact.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    linkPrecedence: {
      type: DataTypes.ENUM("primary", "secondary"),
      allowNull: false,
      defaultValue: "primary",
    },
    //timestamps and paranoid options manage the below fields automatically without defining them in schema
    // createdAt: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    //   defaultValue: Sequelize.NOW,
    // },
    // updatedAt: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    //   defaultValue: Sequelize.NOW,
    // },
    // deletedAt: {
    //   type: DataTypes.DATE,
    //   allowNull: true,
    // }
  },
  {
    sequelize,
    modelName: "Contact",
    tableName: "Contact",
    timestamps: true, // adds and manages createdAt, updatedAt fields automatically
    paranoid: true, //adds and manages deletedAt field automatically
    indexes: [
      {
        unique: false,
        fields: ["phoneNumber"], // index on phone number to improve search performance
      },
      {
        unique: false,
        fields: ["email"], // index on email to improve search performance
      },
      {
        unique: false,
        fields: ["linkedId"], // index on linkedId to improve search performance
      },
    ],
  }
);

module.exports = Contact;
