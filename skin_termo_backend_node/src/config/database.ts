import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'skintermo',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: console.log, // Set to console.log to see SQL queries
  dialectOptions: {
    // ssl: { require: true, rejectUnauthorized: false } // Uncomment if using remote Postgres like Supabase/Neon
  }
});

export default sequelize;
