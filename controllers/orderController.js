import catchAsyncError from '../middlewere/catchAsyncError.js';
import Subcategory from '../models/Subcategory.js';
import ErrorHandler from '../utils/errorhandler.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

export const addOrder = catchAsyncError(async (req, res, next) => {

    const findinCart = await Cart.find({ user: req.user.id }).populate({
        path : 'product',
        select : '-stock'
    }).exec(); 
    const findOrder = await Order.find({ user: req.user.id });

    if (findinCart.length === 0) {
        return next(new ErrorHandler("Your Cart was Empty..", 400));
    }

    const requiredFields = ['phone', 'pinCode', 'country', 'state', 'city', 'address'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return next(new ErrorHandler(`Required fields are missing: ${missingFields.join(', ')}`, 400));
    }

    const orderData = {
        product: findinCart.map(item => ({ product: item.product, quantity: item.quantity })),
        user: req.user.id,
        ...req.body
    };

    // Quantity minus In Subcategory Stock
    const findSubcat = await Subcategory.find();
    for (const productData of orderData.product) {
        const matchedSubcat = findSubcat.find(subcat => subcat._id.equals(productData.product.id));

        if (matchedSubcat) {
            matchedSubcat.stock -= productData.quantity;

            await matchedSubcat.save();
        }
    }
    const createOrder = await Order.create(orderData);

    if (!createOrder) {
        return next(new ErrorHandler("Order not Created...", 400));
    }

    // Remove items from the cart
    await Cart.deleteMany({ user: req.user.id });

    return res.json({
        createOrder,
        success: true
    });
});

export const getMyOrder = catchAsyncError(async (req, res, next) => {
    const findOrder = await Order.find({ user: req.user.id })
    .populate({
        path: 'user',
        select: '-password -phone -email -isActive -role' // Assuming you want to exclude the password field
    })
    .populate({
        path : 'product.product',
        select : '-stock'
    });

    if (!findOrder || findOrder.length === 0) {
        return next(new ErrorHandler("Order not Found...", 400));
    }

    return res.json({
        findOrder,
        success: true
    });
});


export const deleteOrder = catchAsyncError(async(req,res,next)=>{
    
    const findOrder = await Order.findById(req.params.id);
    const findSubcat = await Subcategory.find();
    
    if(!findOrder){
        return next(new ErrorHandler("That Order not Found...",400));
    }
    
    if(req.user.id != findOrder.user){
        return next(new ErrorHandler("That Order is not Exist...",400))
    }
    
    if(findOrder.orderStatus === "Delivered"){
        return next(new ErrorHandler("Order was Delivered"));
    }

    for (const productData of findOrder.product) {
        // Find the corresponding Subcategory document
        const matchedSubcat = findSubcat.find(subcat => subcat._id.equals(productData.product));
        
        console.log(matchedSubcat);

        if (matchedSubcat) {
            matchedSubcat.stock += productData.quantity;
            
            await matchedSubcat.save();
        }
    }
    // console.log(findOrder);

    const deleteorder = await Order.findByIdAndDelete(findOrder).populate('product.product');
    
    if(deleteorder){
        return res.json({deleteorder , success:true});
    }
})

// getAllOrder By Admin 
export const getAllOrder = catchAsyncError(async(req,res,next)=>{
    const findOrders = await Order.find();

    if(!findOrders){
        return next(new ErrorHandler("Orders not Found"));
    }

    return res.json({
        findOrders,
        success : true
    })
})

export const updateOrderDetails = catchAsyncError(async(req,res,next)=>{
    const findOrder = await Order.findById(req.params.id);
    if(findOrder.orderStatus === "Delivered"){
        return next(new ErrorHandler("Order was Delivered"));
    }

    if(req.user.id != findOrder.user){
        return next(new ErrorHandler("That Order is not Exist...",400))
    }

    const updateData = await Order.findByIdAndUpdate(req.params.id,req.body);
    
    const updatedData = await Order.findById(req.params.id);
    if(!updateData){
        return next(new ErrorHandler("Order Details are not Update",400));
    }

    return res.json({
        updatedData,
        success : true
    })

})
