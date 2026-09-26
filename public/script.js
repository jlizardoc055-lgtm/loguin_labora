const productos = [

{
id:1,
nombre:"Nike Air Max",
precio:"$120",
categoria:"Nike",
descripcion:"Zapatilla deportiva Nike Air Max.",
imagen:"img/nike air max.webp"
},

{
id:2,
nombre:"Nike Revolution",
precio:"$90",
categoria:"Nike",
descripcion:"Modelo ligero para correr.",
imagen:"img/Nike Revolution.webp"
},

{
id:3,
nombre:"Nike Zoom",
precio:"$140",
categoria:"Nike",
descripcion:"Ideal para entrenamiento.",
imagen:"img/Nike air zoom.webp"
},

{
id:4,
nombre:"Adidas Superstar",
precio:"$110",
categoria:"Adidas",
descripcion:"Clásico modelo Adidas.",
imagen:"img/adidas super star.webp"
},

{
id:5,
nombre:"Adidas Run",
precio:"$95",
categoria:"Adidas",
descripcion:"Perfecta para correr.",
imagen:"img/adidas run.avif"
},

{
id:6,
nombre:"Adidas Forum",
precio:"$130",
categoria:"Adidas",
descripcion:"Diseño urbano.",
imagen:"img/adidas forum.jpg"
},

{
id:7,
nombre:"Puma RS-X",
precio:"$100",
categoria:"Puma",
descripcion:"Comodidad y estilo.",
imagen:"img/puma rs-x.webp"
},

{
id:8,
nombre:"Puma Future",
precio:"$115",
categoria:"Puma",
descripcion:"Diseño moderno.",
imagen:"img/puma future.jpg"
},

{
id:9,
nombre:"Puma Smash",
precio:"$80",
categoria:"Puma",
descripcion:"Casual para diario.",
imagen:"img/puma smash.avif"
},

{
id:10,
nombre:"Nike Court",
precio:"$105",
categoria:"Nike",
descripcion:"Para tenis.",
imagen:"img/nike court.webp"
},

{
id:11,
nombre:"Adidas UltraBoost",
precio:"$180",
categoria:"Adidas",
descripcion:"Máxima comodidad.",
imagen:"img/adidas ultraboost.jpg"
},

{
id:12,
nombre:"Puma Velocity",
precio:"$125",
categoria:"Puma",
descripcion:"Excelente amortiguación.",
imagen:"img/puma velocity.avif"
}

];

const contenedor=document.getElementById("productos");
const buscar=document.getElementById("buscar");
const categoria=document.getElementById("categoria");
const mensaje=document.getElementById("mensaje");

function mostrar(lista){

contenedor.innerHTML="";

if(lista.length==0){

mensaje.innerHTML="No se encontraron productos";
return;

}

mensaje.innerHTML="";

lista.forEach(p=>{

contenedor.innerHTML+=`

<div class="card" onclick="detalle(${p.id})">

<img src="${p.imagen}">

<h3>${p.nombre}</h3>

<p>${p.precio}</p>

</div>

`;

});

}

mostrar(productos);

function filtrar(){

let texto=buscar.value.toLowerCase();
let cat=categoria.value;

let lista=productos.filter(p=>{

let coincideNombre=p.nombre.toLowerCase().includes(texto);

let coincideCategoria=cat==="Todos" || p.categoria===cat;

return coincideNombre && coincideCategoria;

});

mostrar(lista);

}

buscar.addEventListener("keyup",filtrar);
categoria.addEventListener("change",filtrar);

function detalle(id){

let p=productos.find(x=>x.id==id);

document.getElementById("imgGrande").src=p.imagen;
document.getElementById("nombre").innerHTML=p.nombre;
document.getElementById("descripcion").innerHTML=p.descripcion;
document.getElementById("precio").innerHTML=p.precio;

document.getElementById("modal").style.display="block";

}

document.getElementById("cerrar").onclick=function(){

document.getElementById("modal").style.display="none";

}

document.getElementById("carrito").onclick=function(){

alert("Producto agregado al carrito.");

}