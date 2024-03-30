import express from 'express';
import {add_category , updateCategory} from '../controllers/categoryController.js';
const routes = express.Router();
routes.post('/add_category',add_category);

routes.put('/updateCategory/:id',updateCategory);
export default routes; 