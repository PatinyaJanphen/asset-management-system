import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

const databaseconnect = async () => {
    try {
        await prisma.$connect();
        console.log('Database connection successful');
    } catch (err) {
        console.log('Error connecting to the database:', err);
        throw err;
    }
};

export { prisma, databaseconnect };


// const databaseconnect = async () => {
//     try {
//         const db = await mysql.createConnection({
//             host: process.env.DB_HOST,
//             user: process.env.DB_USER,
//             password: process.env.DB_PASSWORD,
//             database: process.env.DB_NAME
//         });
//         console.log('Database connection successful');
//         return db;
//     } catch (err) {
//         console.log('Error connecting to the database:', err);
//         throw err;
//     }
// }
// export default databaseconnect;