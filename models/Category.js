import mongoose from "mongoose";
const CategorySchema = mongoose.Schema({ 
    category : {
        type : String,
        required : true
    },
    subcategory_Id : {
        type : Array,
        ref : 'Subcategory'
    },
    isActive : {
        type : Boolean,
        default : true,
        required : true
    }
})
const Category = mongoose.model('Category',CategorySchema);
export default Category;