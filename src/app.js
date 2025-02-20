import express from "express";
import cartsRouter from "./routes/carts.router.js";
import productsRouter from "./routes/products.router.js";
import __dirname from "./utils.js";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from 'http';
import mongoose from "mongoose";
import dotenv from "dotenv";
import productModel from "./models/product.model.js";
import Cart from './models/cart.model.js';
import methodOverride from "method-override";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.engine('handlebars', engine({
    helpers: {
        add: function(a, b) {
            return a + b;
        },
        pagePlusOne: function(page) {
            return page + 1;
        },
        pageMinusOne: function(page) {
            return page - 1;
        },
        ifEquals: function(a, b, options) {
            if (a === b) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        }
    }
}));

dotenv.config();

const URIMongoDB = process.env.URIMONGO;

mongoose.connect(URIMongoDB)
    .then(() => console.log("Conexión a base de datos exitosa"))
    .catch((error) => {
        console.error("Error en conexión: ", error);
        process.exit();
    });

app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));

server.listen(8080, () => {
    console.log("El servidor se encuentra escuchando");
});

app.use("/api/carts", cartsRouter);
app.use("/api/products", productsRouter);

// Middleware para depurar el método de la solicitud
app.use((req, res, next) => {
    console.log('Método de la solicitud:', req.method); // Esto imprimirá el método de la solicitud (POST, DELETE, etc.)
    next();
});

app.get('/', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const query = req.query.query || '';
    const category = req.query.category || '';
    const availability = req.query.availability || '';
    const sort = req.query.sort || '';

    let filter = {};
    if (query) {
        filter.title = { $regex: query, $options: 'i' };
    }
    if (category) {
        filter.category = category;
    }
    if (availability !== '') {
        filter.availability = availability === 'true';
    }

    let sortObj = {};
    if (sort === 'asc') {
        sortObj.price = 1;
    } else if (sort === 'desc') {
        sortObj.price = -1;
    }

    try {
        const products = await productModel.find(filter)
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const totalProducts = await productModel.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        res.render('layouts/home', {
            productos: products,
            totalPages: totalPages,
            page: page,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevLink: page > 1 ? `/?page=${page - 1}&limit=${limit}&query=${query}&category=${category}&availability=${availability}&sort=${sort}` : null,
            nextLink: page < totalPages ? `/?page=${page + 1}&limit=${limit}&query=${query}&category=${category}&availability=${availability}&sort=${sort}` : null,
            query: query,
            category: category,
            availability: availability,
            sort: sort
        });

    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send('Error al obtener los productos');
    }
});

app.get('/producto/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const producto = await productModel.findById(productId).lean();

        if (!producto) {
            return res.status(404).send('Producto no encontrado');
        }

        let cart = await Cart.findOne({});

        if (!cart) {
            cart = new Cart({ products: [] });
            await cart.save();
        }

        res.render('productDetail', {
            producto: producto,
            cartId: cart._id.toString()
        });

    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).send('Error al obtener el producto');
    }
});

app.get('/carrito/:cid', async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await Cart.findById(cid).populate('products.product');

        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        const cartItems = cart.products.map(item => ({
            productName: item.product.title,
            productPrice: item.product.price,
            quantity: item.quantity,
            totalPrice: item.product.price * item.quantity,
            productId: item.product._id.toString()
        }));

        res.render('layouts/carrito', {
            cartItems,
            total: cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
            cartId: cid
        });
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).send('Error al obtener el carrito');
    }
});
