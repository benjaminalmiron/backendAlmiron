import express from "express"
import cartsRouter from "./routes/carts.router.js"
import productsRouter from "./routes/products.router.js"
/* import viewsRouter from "./routes/views.router.js" */
import __dirname from "./utils.js"
import handlebars from "express-handlebars"
import { Server } from "socket.io"
import http from 'http';

const app = express()
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views' );
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));

server.listen(8080, ()=>{
    console.log("El servidor se encuentra escuchando")
})

app.use("/api/carts", cartsRouter)
app.use("/api/products", productsRouter)
/* app.use("/", viewsRouter) */

let productos = [
    { nombre: 'Producto 1', precio: 100 },
    { nombre: 'Producto 2', precio: 150 },
    { nombre: 'Producto 3', precio: 200 }
];

// Ruta para la vista "home"
app.get('/', (req, res) => {
    res.render('layouts/home', { productos });
});

app.get('/realtimeproducts', (req, res) => {
    res.render('layouts/realTimeProducts', { productos });
});

io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado');

    // Emitir la lista de productos al cliente
    socket.emit('updateProducts', productos);

    // Escuchar eventos de actualización de productos (si los agregas)
    socket.on('addProduct', (nuevoProducto) => {
        productos.push(nuevoProducto);
        // Emitir los productos actualizados a todos los clientes conectados
        io.sockets.emit('updateProducts', productos);
    });

    // Escuchar cuando un cliente se desconecta
    socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado');
    });
});