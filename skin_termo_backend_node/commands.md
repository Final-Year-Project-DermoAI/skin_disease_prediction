# Backend Commands & Operations

This document outlines the essential commands required to operate the SkinTermo Node.js Backend.

## 🚀 Installation & Setup

Before running the application, make sure all Node.js modules are installed.

```bash
cd skin_termo_backend_node
npm install
```

## 🗄️ Database Setup (Crucial Step)

The backend is configured to use **PostgreSQL**. The server will crash if the database does not exist.

1. Open your PostgreSQL command line (or pgAdmin)
2. Log in using your superuser, usually `postgres`:
   ```bash
   psql -U postgres
   ```
3. Create the blank database named `skintermo`:
   ```sql
   CREATE DATABASE skintermo;
   ```
   *(Note: The Sequelize ORM in `index.ts` will automatically create the tables inside this database when the server starts.)*

## 🖥️ Running the Server

### Development Mode (with hot-reloading)
This is the command you use during active development. It uses `nodemon` and `ts-node` to automatically restart the server when you save changes.
```bash
npm run dev
```

### Production Build
To prepare the application for a production server, compile the TypeScript into JavaScript.
```bash
npm run build
```

Then start the compiled server:
```bash
npm run start
```

## 🛠️ Resolving Startup Errors

If `npm run dev` gives you the error: `'ts-node' is not recognized as an internal or external command`, run:
```bash
npm install -g ts-node typescript nodemon
```
Then try running `npm run dev` again.
