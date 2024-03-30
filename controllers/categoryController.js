import Category from "../models/Category.js";
import Admin from "../models/Admin.js";
import ErrorHandler from "../utils/errorhandler.js";
import catchAsyncError from '../middlewere/catchAsyncError.js';

export const add_category = catchAsyncError (async(req,res,next)=>{ 
    req.body.isActive = true;
    let data = await Category.create(req.body);
    if(!data){
        return next(new ErrorHandler("Category not Insert", 400));
    }
        
    return res.status(200).json({data,success:true});
    
})

export const updateCategory = catchAsyncError(async(req,res,next)=>{
    const findCategory = await Category.findById(req.params.id);
    
    if(!findCategory){
        return next(new ErrorHandler("This Category not Found...",400));
    }

    const updateCat = await Category.findByIdAndUpdate(findCategory.id,req.body);
    if(!updateCat){
        return next(new ErrorHandler("Category not Update",400));
    }

    const updatedCat = await Category.findById(findCategory.id);
    return res.json({
        updatedCat,
        success : true
    })
})