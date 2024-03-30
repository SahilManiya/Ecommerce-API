import mongoose from "mongoose";
const SubcategorySchema = mongoose.Schema({
    name : {
        type : String,
        required : true 
    },
    description: {
        type: String,
        required: [true, "Please Enter product Description"],
    },
    price : {
        type : Number,
        required : true
    },
    stock : {
        type : Number,
        required : true,
        default : 50
    },
    category_Id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        required : true
    },
    isActive : {
        type : Boolean,
        required : true
    }
})
const Subcategory = mongoose.model('Subcategory',SubcategorySchema);
export default Subcategory