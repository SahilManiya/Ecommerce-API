import express from 'express';
const app = express();
import dotenv from 'dotenv';
import connectDatabace from './config/database.js';
import adminRouter from './router/admin.js';
import errorMiddleware from './middlewere/error.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
dotenv.config({
    path : './.env'
})
connectDatabace(); 
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/admin',adminRouter);
app.listen(process.env.PORT,(err)=>{
    if(err){
        console.log("Server not Connect");
        return false;
    }
    console.log("Server Connected",process.env.PORT);
})
app.use(errorMiddleware);