import 'dotenv/config';
export const config={port:Number(process.env.PORT||4000),databaseUrl:process.env.DATABASE_URL||'',jwtSecret:process.env.JWT_SECRET||'dev-secret-change-me',jwtExpiresIn:process.env.JWT_EXPIRES_IN||'7d',frontendUrl:process.env.FRONTEND_URL||'http://localhost:8080'};
