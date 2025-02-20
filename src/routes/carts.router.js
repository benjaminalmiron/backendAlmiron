import express from 'express';
import Cart from '../models/cart.model.js'; // Asegúrate de importar el modelo Cart
import mongoose from 'mongoose';
const router = express.Router();

// Agregar un producto al carrito
router.post('/:cid/products', async (req, res) => {
    const { cid } = req.params;  // Este es el ID del carrito
    const { producto_id, quantity } = req.body;  // Usamos 'producto_id' en vez de 'productId'

    if (!quantity || quantity < 1) {
        return res.status(400).send('La cantidad debe ser mayor a 0');
    }

    try {
        let cart = await Cart.findById(cid).populate('products.product');  // Buscar el carrito por ID

        // Si el carrito no existe, creamos uno nuevo
        if (!cart) {
            cart = new Cart({ products: [] });
            await cart.save();
        }

        // Asegurarse de que la cantidad sea un número
        const quantityNumber = Number(quantity);

        // Crear un ObjectId a partir del producto_id recibido
        const productoIdObj = new mongoose.Types.ObjectId(producto_id);

        // Buscar si el producto ya está en el carrito
        const productIndex = cart.products.findIndex(p => p.product.equals(productoIdObj));

        if (productIndex !== -1) {
            // Si el producto ya está en el carrito, aumentar la cantidad
            cart.products[productIndex].quantity += quantityNumber;
        } else {
            // Si el producto no está en el carrito, agregarlo
            cart.products.push({ product: productoIdObj, quantity: quantityNumber });
        }

        // Guardar el carrito actualizado
        await cart.save();

        // Redirigir al carrito actualizado
        res.redirect(`/carrito/${cart._id}`);
    } catch (error) {
        console.error('Error al agregar el producto al carrito:', error);
        res.status(500).send('Error al agregar el producto al carrito');
    }
});



// Eliminar un producto específico del carrito
router.delete('/api/carts/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
   
    try {
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        if (productIndex === -1) {
            return res.status(404).send('Producto no encontrado en el carrito');
        }

        // Eliminar el producto
        cart.products.splice(productIndex, 1);
        await cart.save();

        res.status(200).send(cart);  // Responder con el carrito actualizado
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).send('Error al eliminar el producto del carrito');
    }
});


// Actualizar el carrito con un arreglo de productos (PUT)
router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;  // Un arreglo de productos con { product: id, quantity }

    try {
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        // Asegurarse de que las cantidades sean números
        cart.products = products.map(item => ({
            product: item.product,
            quantity: Number(item.quantity)
        }));

        // Guardar el carrito actualizado
        await cart.save();

        res.status(200).send(cart);  // Responder con el carrito actualizado
    } catch (error) {
        res.status(500).send('Error al actualizar el carrito');
    }
});

// Actualizar solo la cantidad de un producto en el carrito
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

        // Asegurarse de que la cantidad sea un número
        cart.products[productIndex].quantity = Number(quantity);
        await cart.save();

        res.status(200).send(cart);  // Responder con el carrito actualizado
    } catch (error) {
        res.status(500).send('Error al actualizar la cantidad del producto');
    }
});

// Eliminar todos los productos del carrito
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

// Obtener todos los productos del carrito con el detalle completo (populate)
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await Cart.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        res.status(200).send(cart);  // Responder con los productos completos del carrito
    } catch (error) {
        res.status(500).send('Error al obtener el carrito');
    }
});

export default router;
