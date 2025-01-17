import express from "express"

const app = express()


app.use(express.json())
app.use(express.urlencoded({encoded:true}))

app.listen(8080,
    ()=>{
        console.log("listening on port")
    }
)
const products = [
     { id: "1", 
         title: "Teclado mecánico Logitech G Pro X",
            price: "129.99",
            stock: "10",},

          {  id: "2",
            title: "Teclado Corsair K95 RGB Platinum",
            price: "199.99",
            stock: "7",
          }
    
]
app.get("/",(req, res)=>{
    res.send({products})
})

app.get("/api/product",(req, res)=>{
    res.send({products})
})

app.get("/api/product/:pid",(req,res)=>{
    let idProducto = req.params.pid
    let product = products.find(producto => producto.id === idProducto)
    if(!product) return res.status(404).send({error:"producto no encontrado"})
    res.send({product})
})


app.post("/api/product",(req,res)=>{
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

app.put("/api/product/:id",(req, res)=>{
    const productId = req.params.id;
    const productInfoUpdate = req.body;
    const productIndex = products.findIndex(product=> product.id === productId)
    if(productIndex === -1){
        return res.status(400).send({status:"error", error: "Product not found"})
    }


    products[productId-1] = productInfoUpdate;
    res.send({status:"success", message: "Product info updated succesful"})
})

app.delete("/api/product/:id",(req, res)=>{
    let productId = req.params.id;
    const productExists = products.findIndex(product => product.id === productId);
    if (!productExists) {
    return res.status(400).send({ status: "error", error: "Product not found" });
}
products.splice(productExists, 1);
res.send({status: "success", message: "product deleted"})
})