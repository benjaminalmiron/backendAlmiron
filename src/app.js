import express from "express"
import cartsRouter from "./routes/carts.router.js"
import productsRouter from "./routes/products.router.js"

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.listen(8080, ()=>{
    console.log("El servidor se encuentrea escuchando")
})

app.use("/api/carts", cartsRouter)
app.use("/api/products", productsRouter)