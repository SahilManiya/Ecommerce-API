import SubCategory from "../models/Subcategory.js";
import Category from "../models/Category.js";
import ErrorHandler from "../utils/errorhandler.js";
import catchAsyncError from '../middlewere/catchAsyncError.js';
import ApiFeatures from "../utils/apifeatures.js";

export const add_subcategory = catchAsyncError(async(req,res,next)=>{
    const pCatory = req.params.id;
    if(!pCatory) return next(new ErrorHandler("Please ENter P Categorty", 400))

    const Catfind = await Category.findById(pCatory);
    if(!Catfind){
        return next(new ErrorHandler("Not Category Found",400));
    }
    req.body.category_Id = Catfind.id;
    req.body.isActive = true;
    const data = await SubCategory.create(req.body);
    Catfind.subcategory_Id.push(data.id);

    let IdPushSuccess = await Category.findByIdAndUpdate(Catfind.id,Catfind);
    if(IdPushSuccess){
        return res.status(200).json({data,success:true});
    }
})

export const updateSubcategory = catchAsyncError(async(req,res,next)=>{
    const findSubcategory = await SubCategory.findById(req.params.id);
    
    if(!findSubcategory){
        return next(new ErrorHandler("This Subcategory not Found...",400));
    }

    const updateSubcat = await SubCategory.findByIdAndUpdate(findSubcategory.id,req.body);
    if(!updateSubcat){
        return next(new ErrorHandler("Category not Update",400));
    }

    const updatedSubcat = await SubCategory.findById(findSubcategory.id);
    return res.json({
        updatedSubcat,
        success : true
    })
})

// With Filter & Pagination & Search
export const getAllProducts = catchAsyncError(async (req, res, next) => {
    const resultPerPage = 10;

    console.log("Request Query:", req.query);
    if (req.query.name) {
        req.query.keyword = req.query.name;
        delete req.query.name;
    }

    let query = SubCategory.find();

    const filterSearch = new ApiFeatures(query, req.query);

    filterSearch.search().filter().pagination(resultPerPage);

    if (req.query.minPrice && req.query.maxPrice) {
        const minPrice = parseFloat(req.query.minPrice);
        const maxPrice = parseFloat(req.query.maxPrice);

        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            filterSearch.query = filterSearch.query.find({ 
                price: { $gte: minPrice, $lte: maxPrice }
            });
        }
    }
    const products = await filterSearch.query;
    const totalProducts = await SubCategory.countDocuments(filterSearch.query.getQuery());
    const totalPages = Math.ceil(totalProducts / resultPerPage);

    return res.status(200).json({ 
        products, 
        ResultPerPage: resultPerPage, 
        totalPages 
    });
});

export const viewSubcategory = catchAsyncError(async(req,res,next)=>{
    const data = await SubCategory.findById(req.params.id);

    if(!data){
        return next(new ErrorHandler("This Subcategory not Exist...",400));
    }

    return res.json({
        subcategory : data,
        success : true
    })
})

