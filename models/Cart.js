import mongoose from "mongoose";
const CartSchema = mongoose.Schema({  
  name: {
      type: String,
      required: true,
  },
  price: {
      type: Number,
      required: true,
  },
  quantity: {
      type: Number,
      default : 1,
      required: true
  },
  product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
  },
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
  },

    // shippingInfo: {
    //     address: {
    //       type: String,
    //       required: true,
    //     },
    //     city: {
    //       type: String,
    //       required: true,
    //     },
    //     state: {
    //       type: String,
    //       required: true,
    //     },
    //     country: {
    //       type: String,
    //       required: true,
    //     },
    //     pinCode: {
    //       type: Number,
    //       required: true,
    //     },
    //     phone: {
    //       type: Number,
    //       required: true,
    //     },
    // },
    // orderItems: [
    //     {
    //         name: {
    //             type: String,
    //             required: true,
    //         },
    //         price: {
    //             type: Number,
    //             required: true,
    //         },
    //         quantity: {
    //             type: Number,
    //             default : 1,
    //             required: true
    //         },
    //         product: {
    //             type: mongoose.Schema.Types.ObjectId,
    //             ref: "Subcategory",
    //             required: true,
    //         },
    //     }
    // ],
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Admin",
    //   required: true,
    // },
})
const Cart = mongoose.model('Cart',CartSchema);
export default Cart;