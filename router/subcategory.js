import express from 'express';
import {add_subcategory , getAllProducts , updateSubcategory , viewSubcategory} from '../controllers/subcategoryController.js';
const routes = express.Router();

routes.post('/add_subcategory/:id', add_subcategory);

routes.put('/updateSubcategory/:id',updateSubcategory);

routes.get('/getAllProducts',getAllProducts);

routes.get('/viewSubcategory/:id',viewSubcategory);

export default routes;