import { isUtf8 } from "buffer";
import fs from "fs/promises"

class productManager {
    constructor(){
        this.filePath= "./fileManager/products.json"
    }

    async crearProducto(product) {
        try {
            let products = await this.readProducts();
    
            // Filtrar solo los IDs numéricos para asegurar que no se incluyan valores no válidos
            const numericIds = products
                .map(p => parseInt(p.id))
                .filter(id => !isNaN(id)); // Solo IDs válidos numéricos
    
            // Encontrar el ID máximo entre los IDs válidos y sumarle 1
            const maxId = numericIds.length > 0 
                ? Math.max(...numericIds) + 1 
                : 1; // Si no hay productos numéricos, el primer ID será 1
    
            // Asignamos el nuevo ID al producto
            const newProduct = { ...product, id: maxId.toString() }; // Convertir el ID a string para consistencia
    
            // Agregar el producto al arreglo de productos
            products.push(newProduct);
    
            // Escribir los productos actualizados en el archivo
            await fs.writeFile(this.filePath, JSON.stringify(products, null, 2));
    
            console.log("Producto creado con éxito:", newProduct);
        } catch (error) {
            console.error("Error al crear el producto:", error);
        }
    }
    async readProducts(){
        try{
            const data = await fs.readFile(this.filePath, "utf-8")
            return JSON.parse(data);
            
        }catch(error){
            if(error.code === "ENOENT"){
                return []
            }else{
                console.error("error to reading products:", error)
                throw error
            }
        }
    }

    async updateProduct(id, updatedProduct) {
        try {
            let products = await this.readProducts();
            const index = products.findIndex(product => product.id === id);
            if (index === -1) throw new Error("Producto no encontrado");
            products[index] = { ...products[index], ...updatedProduct };
            await fs.writeFile(this.filePath, JSON.stringify(products, null, 2));
        } catch (error) {
            console.error("Error al actualizar producto:", error);
        }
    }

    async deleteProduct(id) {
        try {
            let products = await this.readProducts();
            const index = products.findIndex(product => product.id === id);
            if (index === -1) throw new Error("Producto no encontrado");
            products.splice(index, 1);
            await fs.writeFile(this.filePath, JSON.stringify(products, null, 2));
        } catch (error) {
            console.error("Error al eliminar producto:", error);
        }
    }
}

export default productManager
