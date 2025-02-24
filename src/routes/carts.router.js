import express from 'express';
import Cart from '../models/cart.model.js'; 
import mongoose from 'mongoose';
const router = express.Router();


router.get('/:cid', async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await Cart.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        res.status(200).send(cart); 
    } catch (error) {
        res.status(500).send('Error al obtener el carrito');
    }
});

router.post('/:cid/products', async (req, res) => {
    const { cid } = req.params; 
    const { producto_id, quantity } = req.body;  

    if (!quantity || quantity < 1) {
        return res.status(400).send('La cantidad debe ser mayor a 0');
    }

    try {
        let cart = await Cart.findById(cid).populate('products.product');  

        
        if (!cart) {
            cart = new Cart({ products: [] });
            await cart.save();
        }

        
        const quantityNumber = Number(quantity);

        
        const productoIdObj = new mongoose.Types.ObjectId(producto_id);

        
        const productIndex = cart.products.findIndex(p => p.product.equals(productoIdObj));

        if (productIndex !== -1) {
            
            cart.products[productIndex].quantity += quantityNumber;
        } else {
            
            cart.products.push({ product: productoIdObj, quantity: quantityNumber });
        }

        
        await cart.save();

        
        res.redirect(`/carrito/${cart._id}`);
    } catch (error) {
        console.error('Error al agregar el producto al carrito:', error);
        res.status(500).send('Error al agregar el producto al carrito');
    }
});




router.delete('/products/:productId', async (req, res) => {
    const { productId } = req.params; 

    try {
       
        const cart = await Cart.findOne({ 'products.product': productId });

        if (!cart) {
            return res.status(404).send('Carrito no encontrado o el producto no está en el carrito');
        }

       
        const productIndex = cart.products.findIndex(p => p.product.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).send('Producto no encontrado en el carrito');
        }

        
        cart.products.splice(productIndex, 1);

        
        await cart.save();

        res.status(200).send('Producto eliminado del carrito');
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).send('Error al eliminar el producto');
    }
});


router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body; 
    try {
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        
        cart.products = products.map(item => ({
            product: item.product,
            quantity: Number(item.quantity)
        }));

        
        await cart.save();

        res.status(200).send(cart);  
    } catch (error) {
        res.status(500).send('Error al actualizar el carrito');
    }
});


router.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).send('La cantidad debe ser mayor a 0');
    }

    try {
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        if (productIndex === -1) {
            return res.status(404).send('Producto no encontrado en el carrito');
        }

        
        cart.products[productIndex].quantity = Number(quantity);
        await cart.save();

        res.status(200).send(cart);  
    } catch (error) {
        res.status(500).send('Error al actualizar la cantidad del producto');
    }
});


router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        cart.products = [];
        await cart.save();

        res.status(200).send(cart);  // Responder con el carrito vacío
    } catch (error) {
        res.status(500).send('Error al vaciar el carrito');
    }
});




export default router;
