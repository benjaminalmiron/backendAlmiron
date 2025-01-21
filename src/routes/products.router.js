import express from "express"

  const products = [
    { id: "1", titulo: 'Producto A', precio: 100 },
    { id: "2", titulo: 'Producto B', precio: 200 },
    { id: "3", titulo: 'Producto C', precio: 300 },
    { id: "4", titulo: 'Producto D', precio: 400 },
    { id: "5", titulo: 'Producto E', precio: 500 }
  ];

const router = express.Router()

router.get("/", (req, res)=>{
    res.json(products)
})

router.get("/:pid",(req,res)=>{
    let idProducto = req.params.pid
    let product = products.find(producto => producto.id === idProducto)
    if(!product) return res.status(404).send({error:"producto no encontrado"})
    res.send({product})
})

router.post("/",(req,res)=>{
    let product = req.body;
    if (!product.id || !product.title || !product.price || !product.stock) {
        return res.status(400).send({
            status: "error",
            message: "All fields (id, title, price, stock) are required."
        });
    }
    products.push({ ...product, id: (products.length + 1)});

    res.send({status:"confirm", message:"Product Created"})
})

router.put("/:id",(req, res)=>{
    const productId = req.params.id;
    const productInfoUpdate = req.body;
    const productIndex = products.findIndex(product=> product.id === productId)
    if(productIndex === -1){
        return res.status(400).send({status:"error", error: "Product not found"})
    }


    products[productId-1] = productInfoUpdate;
    res.send({status:"success", message: "Product info updated succesful"})
})

router.delete("/:id",(req, res)=>{
    let productId = req.params.id;
    const productExists = products.findIndex(product => product.id === productId);
    if (!productExists) {
    return res.status(400).send({ status: "error", error: "Product not found" });
}
products.splice(productExists, 1);
res.send({status: "success", message: "product deleted"})
})


export default router