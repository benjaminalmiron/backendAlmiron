import express from "express"

const router = express.Router()

let carts = [ ]
router.get("/", (req, res) => {
    res.json(carts)
})

router.post("/",(req,res)=>{
    const newCartId = carts.length + 1;

    const newCart ={
        id: newCartId,
        products:[]
    }

    carts.push(newCart)
    res.status(201).send({
        status: "success", message: "Cart Created", cart: newCart
    })
    
})

router.get("/:cid", (req,res)=>{

    let cartId = parseInt(req.params.cid)
    let cart = carts.find(cart=> cart.id === cartId)
    if(!cart){
        return res.status(404).send({error: `Cart with id ${cartId} not found` })
    }
    res.send({
        status: "success",
        message: `Products in cart ${cartId}`,
        products: cart.products  
    }) 
})
router.post("/:cid/product/:pid", (req, res) => {
    const cartId = parseInt(req.params.cid);  
    const productId = parseInt(req.params.pid);  

    let cart = carts.find(cart => cart.id === cartId);

    if (!cart) {
        return res.status(404).send({
            error: `Cart with id ${cartId} not found.`
        });
    }

    if (cart.products.includes(productId)) {
        return res.status(400).send({
            error: `Product with id ${productId} is already in the cart.`
        });
    }

    cart.products.push(productId);

    

    res.send({
        status: "success",
        message: `Product with id ${productId} added to cart ${cartId}.`,
        cart: cart
    });
});

export default router