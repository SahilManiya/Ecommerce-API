import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt';
import catchAsyncError from '../middlewere/catchAsyncError.js'; 
import ErrorHandler from '../utils/errorhandler.js';
import sendToken from '../utils/jwtToken.js';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import ApiFeatures from '../utils/apifeatures.js';
import Order from '../models/Order.js';
import nodemailer from 'nodemailer';

export const addAdmin = catchAsyncError (async(req, res,next) => {
    const checkMail = await Admin.findOne({email:req.body.email});
    if(checkMail){
        return next(new ErrorHandler("Email Already Exist",400));
    }

    if(req.body.role == "SuperAdmin"){
        const superAdminKey = req.body.superAdminKey.toString();
        if(superAdminKey !== process.env.SUPER_ADMIN_SECRET_KEY.toString()){
            return next(new ErrorHandler("Secret Key not Match...",400));
        }   

    }

    let data = await Admin.create(req.body);
    sendToken(data,201,res);
});

export const UpdateProfile = catchAsyncError(async(req,res,next)=>{

    if(!req.user.id){
        return next(new ErrorHandler("Login to Access..."));
    }

    // const findEmail = await Admin.findOne({email:req.body.email});
    // if(findEmail){
    //     return next(new ErrorHandler("This Email already Exist...",400));
    // }
    
    let updateData = await Admin.findByIdAndUpdate(req.user.id,req.body);
    if(!updateData){
        return next(new ErrorHandler("Data not Update.."));
    }

    const updatedData = await Admin.findById(req.user.id);
    res.cookie("token",null,{
        expires : new Date(Date.now()),
        httpOnly : true,
    });
    res.status(200).json({
        success : true,
        updatedData,
        message : "Data Update Successfully Login Again"
    });
    
})

// Admin Update by SuperAdmin

export const updateAdmin = catchAsyncError(async(req,res,next)=>{
    const findUser = await Admin.findById(req.params.id);
    if(!findUser){
        return next(new ErrorHandler("User not Exist...",400));
    }

    // const findEmail = await Admin.findOne({email:req.body.email});
    // if(findEmail){
    //     return next(new ErrorHandler("This Email already Exist...",400));
    // }

    if(findUser.role.toString() == "SuperAdmin"){
        if(!req.body.superAdminKey){
            return next(new ErrorHandler("Enter superAdminKey...",400));
        }

        if(req.body.superAdminKey.toString() !== process.env.SUPER_ADMIN_SECRET_KEY){
            return next(new ErrorHandler("Secret Key not Match...",400));
        }
    }

    if(findUser){
        const updateData = await Admin.findByIdAndUpdate(findUser,req.body);
        if(!updateData){
            return next(new ErrorHandler("User Data not Update...",400));
        }

        if(req.body.role.toString() == "SuperAdmin"){
            if(!req.body.superAdminKey){
                return next(new ErrorHandler("Enter superAdminKey...",400));
            }

            if(req.body.superAdminKey.toString() !== process.env.SUPER_ADMIN_SECRET_KEY){
                return next(new ErrorHandler("Secret Key not Match...",400));
            }
        }

        const updated = await Admin.findById(findUser);
        return res.json({
            success : true,
            updatedData : updated,
        })
    }
})

export const forgotPassword = catchAsyncError(async(req,res,next)=>{
    const findUser = await Admin.findOne({email:req.body.email});
    if(!findUser){
        return next(new ErrorHandler("This email not Exist...",400));
    }

    const expirationDate = new Date(Date.now() + 3600000);
    const options3 = {
        expires: expirationDate,
        httpOnly: true,
    };

    const transporter = nodemailer.createTransport({
        host: process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        secure: true,
        auth: {
            // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD,
        },
    });

    const otp = Math.floor(100000+Math.random()*900000);
    if(findUser){
        const userEmail = findUser.email;
        const otpAndEmail = { otp:otp, userEmail:userEmail };
        res.cookie('resetPassotp',otpAndEmail,options3);
    }

    const info = await transporter.sendMail({
        from: process.env.SMPT_MAIL, // sender address
        to: findUser.email, // list of receivers
        subject: "Forgot Password✔", // Subject line
        text: "Hello world?", // plain text body
        html: `<h3>OTP = ${otp}</h3>`, // html body
    });
    if(!info){
        return next(new ErrorHandler("OTP not Send...",400));
    }

    return res.json({
        success : true,
        message : `Otp Send ${findUser.email} This Mail Check...`
    })
})

export const resetPassword = catchAsyncError(async(req,res,next)=>{
    const email = req.cookies.resetPassotp.userEmail.toString();
    if(!req.cookies.resetPassotp){
        return next(new ErrorHandler("Please Resend OTP...",400));
    }

    if(req.body.NewPassword != req.body.ConfirmPassword){
        return next(new ErrorHandler("Password not Match...",400));
    }

    if(req.body.otp.toString() !== req.cookies.resetPassotp.otp.toString()){
        return next(new ErrorHandler("Otp not Match...",400));
    }

    const findUser = await Admin.findOne({email:email});
    

    if(!findUser){
        return next(new ErrorHandler("User not Exist...",400));
    }   
    const PasswordString = req.body.NewPassword.toString();
    const bcryptPassword = await bcrypt.hash(PasswordString,10);
    // console.log(req.body.NewPassword);
    let updatePassword = await Admin.findByIdAndUpdate(findUser,{'password':bcryptPassword});
    if(updatePassword){
        // res.clearCookie('token');
        res.clearCookie('resetPassotp');
        res.clearCookie('token');
        return res.json({
            success : true,
            message : "Password Update Successfully Login Again..."
        })
    }
    
})

export const view_admin = catchAsyncError(async (req, res, next) => {
    const resultPerPage = 4;
    let query = Admin.find().select('-password');

    if (req.query.name) {
        req.query.keyword = req.query.name;
        delete req.query.name;
    }
    const filterSearch = new ApiFeatures(query, req.query);

    filterSearch.searchForAdmin().pagination(resultPerPage);

    const adminData = await filterSearch.query;
    const record = adminData.filter((v) => {
        return v.isActive === true;
    });
    const totalAdmins = await Admin.countDocuments(filterSearch.query.getQuery());

    // only active admin show
    const activeAdmins = await Admin.countDocuments({
        ...filterSearch.query.getQuery(),
        isActive: true 
    });
    // only deactive admin show
    const deactivAdmin = await Admin.countDocuments({
        ...filterSearch.query.getQuery(),
        isActive : false
    })

    return res.status(200).json({ adminData: record, totalAdmins, activeAdmins,deactivAdmin,resultPerPage, success: true });

});

export const adminLogin = catchAsyncError(async(req,res,next)=>{

    const {email,password} = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email & Password", 400));
    }

    const checkMail = await Admin.findOne({email});
    if(checkMail){

        const isPasswordMatched = await checkMail.comparePassword(password);
        if(isPasswordMatched){
            sendToken(checkMail, 200, res);
        }
        else{
            return next(new ErrorHandler("Invalid email or password", 401));
        }
    }
    else{
        return next(new ErrorHandler("Invalid  email or password", 401));
    }
})

export const admin_logout = catchAsyncError(async(req,res,next)=>{

    res.cookie("token",null,{
        expires : new Date(Date.now()),
        httpOnly : true,
    });
    res.status(200).json({
        success : true,
        message : "Logged Out"
    });
})


export const view_allCategory = catchAsyncError(async(req,res,next)=>{
    const data = await Category.find();
    if(!data){
        return next(new ErrorHandler("Category Data not Found",401));
    }

    return res.status(200).json({data,success:true});
})

export const view_subcatby_cat = catchAsyncError(async(req,res,next)=>{
    const catData = await Category.findById(req.params.id);
    const data = await Subcategory.find();
    // console.log(catData);
    // console.log(data);
    let record = data.filter((v,i)=>{
        if(catData.id == v.category_Id){ 
            return v;
        }
    }) 
    if(!record){
        return next(new ErrorHandler("Category Data not found",401));
    }

    return res.status(200).json({SubCategory : record,success:true});
})

export const view_profile = catchAsyncError(async(req,res,next)=>{
    // console.log(req.user);
    let data = await Admin.findById(req.user.id);

    if(!data){
        return next(new ErrorHandler("Data not Found",400));
    }

    return res.status(200).json({Profile : data,success:true});
})

export const UserGetOrder = catchAsyncError(async(req,res,next)=>{

    const findOrder = await Order.findById(req.params.id);
  
    if(!findOrder){
        return next(new ErrorHandler("This Order not Found"));
    }
    const findUser = await Admin.findById(findOrder.user);

    if (!findUser) {
        return next(new ErrorHandler("This user not Found...", 400));
    }

    const expirationDate = new Date(Date.now() + 3600000);
    const options2 = {
        expires: expirationDate,
        httpOnly: true,
    };

    const otp = Math.floor(100000+Math.random()*900000);
    const userId = findUser.id;

    const otpAndId = { otp:otp, userId:userId };

    res.cookie('otpAndId', otpAndId, options2);
    console.log(otp);

    if (!findUser.email) {
        return next(new ErrorHandler("This user Email not Found", 400));
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        secure: true,
        auth: {
            // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD,
        },
    });

    const info = await transporter.sendMail({
        from: process.env.SMPT_MAIL, // sender address
        to: findUser.email, // list of receivers
        subject: "Delivery Code ✔", // Subject line
        text: "Hello world?", // plain text body
        html: `<h3>OTP = ${otp}</h3>`, // html body
    });

    if(!info){
        return next(new ErrorHandler("OTP not Send...",400));
    }

    return res.json({
        success : true,
        message : `Otp Send ${findUser.email} This Mail Check...`
    })
})  

export const updateStatusByDelivery = catchAsyncError(async(req,res,next)=>{

    const findOrder = await Order.findById(req.params.id);
    // console.log(req.cookies.otpAndId);

    if(!req.cookies.otpAndId){
        return next(new ErrorHandler("Please Resend Otp..."));
    }

    
    if(req.body.otp != req.cookies.otpAndId.otp ){
        return next(new ErrorHandler("Otp not Match...",400));
    }

    if(findOrder.user.toString() != req.cookies.otpAndId.userId.toString()){
        return next(new ErrorHandler("User Otp not Match...",400));
    }
    
    if(!findOrder){
        return next(new ErrorHandler("Order not Found",400));
    }

    if(req.body.otp.toString() === req.cookies.otpAndId.otp.toString() && findOrder.user.toString() === req.cookies.otpAndId.userId.toString()){
        const updateOrderStatus = await Order.findByIdAndUpdate(findOrder,{orderStatus:"Delivered"});
        if(!updateOrderStatus){
            return next(new ErrorHandler("Order Status not Update",400));
        }
        if(updateOrderStatus){
            res.clearCookie('otpAndId');
        }
    }

    const updatedStatus = await Order.findById(findOrder);

    return res.json({
        success : true,
        SatatusUpdate : updatedStatus
    })
})