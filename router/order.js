import express from 'express';
const routes = express.Router();
import { addOrder , getMyOrder , deleteOrder , getAllOrder , updateOrderDetails } from '../controllers/orderController.js';

import {isAuthenticatedUser,authorizeRoles} from '../middlewere/auth.js'; 

routes.post('/addOrder',isAuthenticatedUser,addOrder);

routes.get('/getMyOrder',isAuthenticatedUser,getMyOrder);

routes.delete('/deleteOrder/:id',isAuthenticatedUser,deleteOrder);

routes.get('/getAllOrder',isAuthenticatedUser,authorizeRoles('admin','delivery','SuperAdmin'),getAllOrder);

routes.put('/updateOrderDetails/:id',isAuthenticatedUser,updateOrderDetails);

export default routes;