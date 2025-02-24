import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    category: {
        type: String, 
        required: true
    },
    availability: {
        type: Boolean, 
        required: true
    }
});

const productModel = mongoose.model('Product', productSchema);

export default productModel;