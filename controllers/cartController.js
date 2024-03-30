import catchAsyncError from '../middlewere/catchAsyncError.js';
import Subcategory from '../models/Subcategory.js';
import ErrorHandler from '../utils/errorhandler.js';
import Cart from '../models/Cart.js';
export const addToCart = catchAsyncError(async(req,res,next)=>{

    const findProduct = await Subcategory.findById(req.params.id);
    if(!findProduct){
        return next(new ErrorHandler("This Product is not Available...",400));
    }

    req.body.name = findProduct.name;
    req.body.price = findProduct.price;
    req.body.product = findProduct.id;
    req.body.user = req.user;
    
    if(req.body.quantity >= findProduct.stock){
        return next(new ErrorHandler("Product Out of Stock...",400));
    }

    if(req.body.quantity <=5 && req.body.quantity>0){
                
        const findUser = await Cart.find({user:req.user.id});

        const foundOrder = findUser.find(v => v.product == findProduct.id);

        if (foundOrder) {
            const updatedQuantity = foundOrder.quantity + 1;
            
            if(updatedQuantity >= findProduct.stock){
                return next(new ErrorHandler("Product Out of Stock...",400));
            }
            if(updatedQuantity >5){
                return next(new ErrorHandler("Quantity Enter maxiMum 5 & miniMum 1",400));
            }

            await Cart.updateOne({ _id: foundOrder._id }, { quantity: updatedQuantity });

            const updatedOrder = { ...foundOrder.toObject(), quantity: updatedQuantity };

            return res.json({
                msg : "Product already in Cart",
                updatedOrder,
                success : true
            });
        }
        if(!foundOrder){
            let addCart = await Cart.create(req.body);
    
            if(!addCart){
                return next(new ErrorHandler("Failed to add your Order..",400))
            }
            
            return res.json({
                addCart,
                success : true
            });
        }
    }
    else{
        return next(new ErrorHandler("Quantity Enter maxiMum 5 & miniMum 1",400));
    }
});

export const getMyCart = catchAsyncError(async(req,res,next)=>{
    const findOrder = await Cart.find({user:req.user.id});
    
    if(!findOrder){
        return next(new ErrorHandler("Cart not Found..."));
    }

    if(findOrder.length == 0){
        return next(new ErrorHandler("your Cart was Empty..."));
    }
    
    return res.json({
        findOrder,
        success : true
    })
})

export const deleteToCart = catchAsyncError(async(req,res,next)=>{
    const findOrder = await Cart.findById(req.params.id);
    if(req.user.id != findOrder.user){
        return next(new ErrorHandler("That Order is not Exist your Cart...",400))
    }

    const deleteorder = await Cart.findByIdAndDelete(findOrder);
    
    if(deleteorder){
        return res.json({deleteorder , success:true});
    }
})

