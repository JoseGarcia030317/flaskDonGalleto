import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';

const galletas = [
    {
        id_galleta : 1,
        nombre: "Oreo Clásica", 
        descripcion: "Galleta de chocolate con relleno cremoso",
        piezas: "16 piezas",
        precio: 15.50,
        stock: 120,
        imagen: "../../../static/images/galleta ejemplo.png"
    },
    {
        id_galleta : 2,
        nombre: "Chips Ahoy", 
        descripcion: "Galleta con chispas de chocolate",
        piezas: "24 piezas",
        precio: 18.75,
        stock: 85,
        imagen: "../../../static/images/galleta ejemplo.png"
    },
    {
        id_galleta : 3,
        nombre: "Chips Ahoy", 
        descripcion: "Galleta con chispas de chocolate",
        piezas: "24 piezas",
        precio: 18.75,
        stock: 85,
        imagen: "../../../static/images/galleta ejemplo.png"
    },
    {
        id_galleta : 4,
        nombre: "Chips Ahoy", 
        descripcion: "Galleta con chispas de chocolate",
        piezas: "24 piezas",
        precio: 18.75,
        stock: 85,
        imagen: "../../../static/images/galleta ejemplo.png"
    },
    {
        id_galleta : 5,
        nombre: "Chips Ahoy", 
        descripcion: "Galleta con chispas de chocolate",
        piezas: "24 piezas",
        precio: 18.75,
        stock: 85,
        imagen: "../../../static/images/galleta ejemplo.png"
    },
    {
        id_galleta : 6,
        nombre: "Chips Ahoy", 
        descripcion: "Galleta con chispas de chocolate",
        piezas: "24 piezas",
        precio: 18.75,
        stock: 85,
        imagen: "../../../static/images/galleta ejemplo.png"
    },
    {
        id_galleta : 7,
        nombre: "Chips Ahoy", 
        descripcion: "Galleta con chispas de chocolate",
        piezas: "24 piezas",
        precio: 18.75,
        stock: 85,
        imagen: "../../../static/images/galleta ejemplo.png"
    },
    {
        id_galleta : 8,
        nombre: "Chips Ahoy", 
        descripcion: "Galleta con chispas de chocolate",
        piezas: "24 piezas",
        precio: 18.75,
        stock: 85,
        imagen: "../../../static/images/galleta ejemplo.png"
    },
    {
        id_galleta : 9,
        nombre: "Chips Ahoy", 
        descripcion: "Galleta con chispas de chocolate",
        piezas: "24 piezas",
        precio: 18.75,
        stock: 85,
        imagen: "../../../static/images/galleta ejemplo.png"
    },
    {
        id_galleta : 10,
        nombre: "Chips Ahoy", 
        descripcion: "Galleta con chispas de chocolate",
        piezas: "24 piezas",
        precio: 18.75,
        stock: 85,
        imagen: "../../../static/images/galleta ejemplo.png"
    }
];

// ====================================================================
// Funciones para manejar el DOM y mostrar modales y alertas
// ====================================================================
// Funcion generica para abrir un modal en base a la clase hidden
function abrirModalPrincipal(tipo) {
    const backdrop = document.getElementById('modalBackdrop');
    const modalForm = document.getElementById('modalForm');

    backdrop.classList.remove('hidden');
    document.getElementById('modal-titulo').textContent =
        tipo === 'editar' ? 'Editar producto' : 'Añadir producto';
    modalForm.classList.remove('hidden');
}

function cerrarModalPrincipal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
    document.getElementById('modalForm').classList.add('hidden');
}

function abrirModalSecundario(tipo) {
    const backdrop = document.getElementById('modalBackdropSecundario');
    const modalForm = document.getElementById('modalFormSecundario');

    backdrop.classList.remove('hidden');
    document.getElementById('modal-titulo-secundario').textContent =
        tipo === 'editar' ? 'Editar receta' : 'Añadir receta';
    modalForm.classList.remove('hidden');
}

function cerrarModalSecundario() {
    document.getElementById('modalBackdropSecundario').classList.add('hidden');
    document.getElementById('modalFormSecundario').classList.add('hidden');
}

// ====================================================================
// Funciones para hacer las conexiones con la aplicaion Flask
// ====================================================================
// funcion para cargar las galletas con la aplicacion flask
function cargarGalletas() {
    generarCards(galletas);
}

// Función para generar las cards de las galletas
function generarCards(galletas) {
    const container = document.getElementById('galletas-container');

    galletas.forEach(galleta => {
        const card = document.createElement('div');
        card.className = 'bg-[#efe6dc] rounded-xl shadow-md overflow-hidden border border-gray-200';
        card.innerHTML = `
            <div class="flex p-4">
                <div class="w-1/3 flex items-center justify-center">
                    <img src="${galleta.imagen}" 
                         alt="${galleta.nombre}" 
                         class="h-24 w-24 object-contain">
                </div>
                
                <div class="w-2/3 pl-4">
                    <h3 class="text-lg font-semibold text-black">${galleta.nombre}</h3>
                    <p class="text-sm text-black mt-1">${galleta.piezas}</p>
                    <p class="text-base font-semibold text-black mt-2">$${galleta.precio}</p>
                </div>
            </div>

            <div class="flex justify-items-center border-t border-black p-2">
                <button onclick="buscarGalletaReceta(${galleta.id_galleta})" class="flex-1 flex items-center justify-center p-2 cursor-pointer">
                    <img src="../../../static/images/lapiz.png" class="w-7 h-7">
                </button>
                
                <button onclick="eliminarGalleta(${galleta.id_galleta})" class="flex-1 flex items-center justify-center p-2 cursor-pointer">
                    <img src="../../../static/images/bote basura.png" class="w-7 h-7">
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function guardarProductoReceta(){

}

function buscarGalletaReceta(id_galleta) {
    alert('ID de la galleta buscada: ' + id_galleta);
}

function eliminarGalleta(id_galleta) {
    alert('ID de la galleta eliminada: ' + id_galleta);
}
 
window.cargarGalletas = cargarGalletas;

window.abrirModalPrincipal = abrirModalPrincipal;
window.cerrarModalPrincipal = cerrarModalPrincipal;
window.abrirModalSecundario = abrirModalSecundario;
window.cerrarModalSecundario = cerrarModalSecundario;

window.guardarProductoReceta = guardarProductoReceta;
window.buscarGalletaReceta = buscarGalletaReceta;
window.eliminarGalleta = eliminarGalleta;