import express from "express";
import productModel from "../models/product.model.js"; 

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const products = await productModel.find(); 
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Error al leer los productos" });
    }
});


router.get("/:pid", async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid); 
        if (!product) return res.status(404).json({ error: "Producto no encontrado" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el producto" });
    }
});


router.post("/", async (req, res) => {
    try {
        const { title, price, stock } = req.body;  

        if (!title || !price || !stock) {
            return res.status(400).json({ status: "error", message: "Todos los campos son obligatorios (title, price, stock)." });
        }

        
        const newProduct = new productModel({
            title,
            price,
            stock
        });

       
        await newProduct.save();
        res.status(201).json({ status: "success", message: "Producto creado" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al crear el producto", error: error.message });
    }
});


router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = req.body;

        const product = await productModel.findByIdAndUpdate(id, updatedProduct, { new: true });
        if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });

        res.json({ status: "success", message: "Producto actualizado con éxito", product });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al actualizar el producto" });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.findByIdAndDelete(id);  
        if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });

        res.json({ status: "success", message: "Producto eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al eliminar el producto" });
    }
});

export default router;