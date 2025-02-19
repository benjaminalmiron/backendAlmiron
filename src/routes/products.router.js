import express from "express";
import productModel from "../models/product.model.js";  // Modelo de producto Mongoose

const router = express.Router();

// Obtener todos los productos
router.get("/", async (req, res) => {
    try {
        const products = await productModel.find(); // Usamos Mongoose para obtener todos los productos
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Error al leer los productos" });
    }
});

// Obtener un producto por su id
router.get("/:pid", async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid); // Buscar por id en MongoDB
        if (!product) return res.status(404).json({ error: "Producto no encontrado" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el producto" });
    }
});

// Crear un nuevo producto
router.post("/", async (req, res) => {
    try {
        const { title, price, stock } = req.body;  // Desestructuración de los campos necesarios

        if (!title || !price || !stock) {
            return res.status(400).json({ status: "error", message: "Todos los campos son obligatorios (title, price, stock)." });
        }

        // Crear un nuevo producto con Mongoose
        const newProduct = new productModel({
            title,
            price,
            stock
        });

        // Guardar el producto en la base de datos
        await newProduct.save();
        res.status(201).json({ status: "success", message: "Producto creado" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al crear el producto", error: error.message });
    }
});

// Actualizar un producto por su id
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = req.body;

        const product = await productModel.findByIdAndUpdate(id, updatedProduct, { new: true }); // Actualiza el producto y devuelve el nuevo
        if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });

        res.json({ status: "success", message: "Producto actualizado con éxito", product });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al actualizar el producto" });
    }
});

// Eliminar un producto por su id
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.findByIdAndDelete(id);  // Buscar y eliminar por id
        if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });

        res.json({ status: "success", message: "Producto eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al eliminar el producto" });
    }
});

export default router;