import express from "express"
import cartsRouter from "./routes/carts.router.js"
import productsRouter from "./routes/products.router.js"
import __dirname from "./utils.js"
import { engine } from "express-handlebars"
import { Server } from "socket.io"
import http from 'http';
import mongoose from "mongoose"
import dotenv from "dotenv"
import productModel from "./models/product.model.js"

const app = express()
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
    console.log("El servidor se encuentra escuchando")
});

app.use("/api/carts", cartsRouter);
app.use("/api/products", productsRouter);

app.get('/', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10; // Número de productos por página
    const page = parseInt(req.query.page) || 1; // Página actual
    const query = req.query.query || ''; // Filtro por nombre
    const category = req.query.category || ''; // Filtro por categoría
    const availability = req.query.availability || ''; // Filtro por disponibilidad
    const sort = req.query.sort || ''; // Orden (asc/desc)

    // Crear un objeto de filtro
    let filter = {};

    // Filtro por nombre del producto si se proporciona un query
    if (query) {
        filter.title = { $regex: query, $options: 'i' }; // Buscar de manera insensible a mayúsculas/minúsculas
    }

    // Filtro por categoría si se proporciona
    if (category) {
        filter.category = category;
    }

    // Filtro por disponibilidad si se proporciona
    if (availability !== '') {
        filter.availability = availability === 'true'; // Convertir a booleano
    }

    // Ordenar productos por precio (ascendente o descendente)
    let sortObj = {};
    if (sort === 'asc') {
        sortObj.price = 1; // Ascendente
    } else if (sort === 'desc') {
        sortObj.price = -1; // Descendente
    }

    try {
        // Verificar los filtros antes de consultar la base de datos
        console.log('Filtros:', filter);
        console.log('Ordenar por:', sortObj);

        // Obtener productos con los filtros aplicados y la paginación usando .lean()
        const products = await productModel.find(filter)
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(); // Usar .lean() para obtener objetos planos

        const totalProducts = await productModel.countDocuments(filter); // Total de productos para la paginación

        // Calcular el total de páginas para la paginación
        const totalPages = Math.ceil(totalProducts / limit);

        // Renderizar la vista con los productos filtrados
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

app.get('/realtimeproducts', (req, res) => {
    res.render('layouts/realTimeProducts', { productos });
});

io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado');

    socket.emit('updateProducts', productos);

    socket.on('addProduct', (nuevoProducto) => {
        productos.push(nuevoProducto);

        io.sockets.emit('updateProducts', productos);
    });

    socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado');
    });
});
