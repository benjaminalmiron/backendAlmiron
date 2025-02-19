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
        type: String, // Se asume que la categoría es un string, pero puede ser más complejo si necesitas un modelo separado para categorías
        required: true
    },
    availability: {
        type: Boolean, // True si el producto está disponible, false si no lo está
        required: true
    }
});

const productModel = mongoose.model('Product', productSchema);

export default productModel;