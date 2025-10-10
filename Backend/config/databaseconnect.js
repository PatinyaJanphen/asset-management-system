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