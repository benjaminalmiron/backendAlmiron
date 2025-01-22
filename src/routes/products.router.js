import express from "express"
import productManager from "../fileManager/productManager.js";

const productsManager = new productManager


  const products = [
    { id: "1", titulo: 'Producto A', precio: 100 },
    { id: "2", titulo: 'Producto B', precio: 200 },
    { id: "3", titulo: 'Producto C', precio: 300 },
    { id: "4", titulo: 'Producto D', precio: 400 },
    { id: "5", titulo: 'Producto E', precio: 500 }
  ];

const router = express.Router()


router.get("/", async (req, res) => {
    try {
        const products = await productsManager.readProducts(); // Usamos el método del manager
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Error al leer los productos" });
    }
});

router.get("/:pid", async (req, res) => {
    try {
        const product = await productManager.readProducts();
        const foundProduct = product.find(p => p.id === req.params.pid);
        if (!foundProduct) return res.status(404).json({ error: "Producto no encontrado" });
        res.json(foundProduct);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el producto" });
    }
});


router.post("/", async (req, res) => {
    try {
        const product = req.body;

       
        if (!product.title || !product.price || !product.stock) {
            return res.status(400).json({ status: "error", message: "Todos los campos son obligatorios (title, price, stock)." });
        }
        await productsManager.crearProducto(product);
        res.status(201).json({ status: "success", message: "Producto creado" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al crear el producto", error: error.message });
    }
});


router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = req.body;
        await productsManager.updateProduct(id, updatedProduct);
        res.json({ status: "success", message: "Producto actualizado con éxito" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al actualizar el producto" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await productsManager.deleteProduct(id);
        res.json({ status: "success", message: "Producto eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al eliminar el producto" });
    }
});


export default router