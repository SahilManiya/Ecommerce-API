import express from 'express';
import { addAdmin , view_admin ,adminLogin , forgotPassword , resetPassword , updateAdmin , admin_logout , view_profile , UpdateProfile , view_allCategory , view_subcatby_cat , updateStatusByDelivery , UserGetOrder } from '../controllers/adminController.js'; // Importing specific named export

import categoryRouter from '../router/category.js';
import subcategoryRouter from '../router/subcategory.js';
import cartRouter from '../router/cart.js';
import orderRouter from '../router/order.js';
import {isAuthenticatedUser,authorizeRoles} from '../middlewere/auth.js'; 
const routes = express.Router();

routes.post('/addAdmin',addAdmin);

routes.post('/adminLogin',adminLogin);

routes.get('/admin_logout',admin_logout); 

routes.get('/view_admin',isAuthenticatedUser,authorizeRoles('admin','SuperAdmin'),view_admin);

routes.get('/view_profile',isAuthenticatedUser,view_profile);

// Update By Super Admin
routes.put('/updateAdmin/:id',isAuthenticatedUser,authorizeRoles('SuperAdmin'),updateAdmin);

routes.put('/UpdateProfile',isAuthenticatedUser,UpdateProfile);

routes.post('/forgotPassword',forgotPassword);

routes.post('/resetPassword',resetPassword);

routes.get('/view_allCategory',isAuthenticatedUser,view_allCategory);

routes.get('/view_subcatby_cat/:id',isAuthenticatedUser,view_subcatby_cat);

routes.use('/category',isAuthenticatedUser,authorizeRoles('admin','SuperAdmin'),categoryRouter);

routes.use('/subcategory',isAuthenticatedUser,authorizeRoles('admin','SuperAdmin'),subcategoryRouter);

routes.use('/cart',isAuthenticatedUser,cartRouter);

routes.use('/order',isAuthenticatedUser,orderRouter);

routes.put('/updateStatusByDelivery/:id',isAuthenticatedUser,authorizeRoles('delivery'),updateStatusByDelivery);

routes.post('/UserGetOrder/:id',isAuthenticatedUser,authorizeRoles('delivery'),UserGetOrder);

export default routes;
