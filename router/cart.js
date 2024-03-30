import express from 'express';
const routes = express.Router();
import { addToCart , getMyCart , deleteToCart } from '../controllers/cartController.js';

import {isAuthenticatedUser,authorizeRoles} from '../middlewere/auth.js'; 

routes.post('/addToCart/:id',addToCart);

routes.get('/getMyCart',getMyCart);

routes.delete('/deleteToCart/:id',deleteToCart);


export default routes;