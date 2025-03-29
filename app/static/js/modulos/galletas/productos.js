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


const recetas = [
    {
        id: 1,
        nombre: "Receta Clásica",
        tiempo: 45,
        cantidad: 120,
        insumos: ["Harina", "Huevos", "Mantequilla"]
    },
    {
        id: 2,
        nombre: "Receta Premium",
        tiempo: 60,
        cantidad: 80,
        insumos: ["Chocolate", "Nueces", "Vainilla"]
    },
    {
        id: 3,
        nombre: "Receta Premium",
        tiempo: 60,
        cantidad: 80,
        insumos: ["Chocolate", "Nueces", "Vainilla"]
    },
    {
        id: 4,
        nombre: "Receta Premium",
        tiempo: 60,
        cantidad: 80,
        insumos: ["Chocolate", "Nueces", "Vainilla"]
    },
    {
        id: 5,
        nombre: "Receta Premium",
        tiempo: 60,
        cantidad: 80,
        insumos: ["Chocolate", "Nueces", "Vainilla"]
    },
    {
        id: 6,
        nombre: "Receta Premium",
        tiempo: 60,
        cantidad: 80,
        insumos: ["Chocolate", "Nueces", "Vainilla"]
    }
];

const insumosDisponibles = [
    { id: 1, nombre: "Harina de trigo", unidad: "kg" },
    { id: 2, nombre: "Huevos", unidad: "pz" },
    { id: 3, nombre: "Leche entera", unidad: "lt" },
    { id: 4, nombre: "Mantequilla", unidad: "gr" },
    { id: 5, nombre: "Azúcar glass", unidad: "gr" },
    { id: 6, nombre: "Esencia de vainilla", unidad: "ml" },
    { id: 7, nombre: "Leche deslactosada", unidad: "lt" },
];

let insumosSeleccionados = new Set();

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

    generarRecetasCards(recetas);
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

function generarRecetasCards(recetas) {
    const container = document.getElementById('recetas-container');
    container.innerHTML = '';
    
    container.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-4');

    recetas.forEach(receta => {
        const card = document.createElement('div');
        // Añadir w-full y min-w para consistencia
        card.className = 'w-full min-w-[250px] h-[170px] bg-[#efe6dc] rounded-xl shadow-md overflow-hidden border border-gray-200';
        card.innerHTML = `
            <div class="flex flex-col p-3 space-y-2 h-full">
                <!-- Parte Superior - Información -->
                <div class="space-y-1 flex-1">
                    <h3 class="text-lg font-semibold text-black break-words">${receta.nombre}</h3>
                    <p class="text-black text-sm">${receta.tiempo} min</p>
                    <p class="text-black text-sm">${receta.cantidad} und</p>
                    <p class="text-sm text-black">Insumos: ${receta.insumos.length} elementos</p>
                </div>

                <!-- Parte Inferior - Botones -->
                <div class="flex border-t border-black pt-1 mt-1">
                    <button onclick="editarReceta(${receta.id})" 
                            class="flex-1 flex items-center justify-center p-1 cursor-pointer">
                        <img src="../../../static/images/lapiz.png" class="w-7 h-7">
                    </button>
                    
                    <button onclick="eliminarReceta(${receta.id})" 
                            class="flex-1 flex items-center justify-center p-1 cursor-pointer">
                        <img src="../../../static/images/bote basura.png" class="w-7 h-7">
                    </button>
                </div>
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

function editarReceta(id_receta) {
    alert('ID de la receta a editar: ' + id_receta);
    abrirModalSecundario('editar');
}

function eliminarReceta(id_receta) {
    alert('ID de la receta eliminada: ' + id_receta);
}

function filtrarInsumos(termino) {
    const sugerencias = document.getElementById('sugerencias-insumos');
    
    sugerencias.innerHTML = '';

    if (termino.length < 3) {
        sugerencias.classList.add('hidden');
        return;
    }

    const resultados = insumosDisponibles.filter(insumo =>
        insumo.nombre.toLowerCase().includes(termino.toLowerCase()) &&
        !insumosSeleccionados.has(insumo.id)
    );
    
    if (resultados.length > 0) {
        sugerencias.innerHTML = resultados.map(insumo => `
            <div class="p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between border-b"
                onclick="seleccionarInsumo(${insumo.id})">
                <span>${insumo.nombre}</span>
                <span class="text-sm text-gray-500">${insumo.unidad}</span>
            </div>
        `).join('');
        sugerencias.classList.remove('hidden');
    } else {
        sugerencias.classList.add('hidden');
    }
}

function seleccionarInsumo(idInsumo) {
    const insumo = insumosDisponibles.find(i => i.id === idInsumo);
    const contenedor = document.getElementById('insumos-seleccionados');
    
    if (!insumosSeleccionados.has(idInsumo)) {
        const elemento = document.createElement('div');
        elemento.className = 'flex items-center gap-2 p-2 bg-gray-50 rounded-lg';
        elemento.innerHTML = `
            <input type="hidden" name="insumo_id" value="${idInsumo}">
            <span class="flex-1">${insumo.nombre}</span>
            <input type="number" 
                   min="0.0" 
                   step="0.1" 
                   placeholder="Cantidad" 
                   class="w-24 p-1 border border-[#895645] rounded-full text-center"
                   required>
            <span class="w-12 text-sm">${insumo.unidad}</span>
            <button onclick="eliminarInsumo(${idInsumo}, this)" 
                    class="text-red-500 hover:text-red-700 cursor-pointer">
                ✕
            </button>
        `;
        
        contenedor.appendChild(elemento);
        insumosSeleccionados.add(idInsumo);
    }
    
    document.getElementById('sugerencias-insumos').classList.add('hidden');
    document.getElementById('buscador-insumos').value = '';
}

// Función para eliminar insumo
function eliminarInsumo(idInsumo, elemento) {
    elemento.parentElement.remove();
    insumosSeleccionados.delete(idInsumo);
}
 
window.cargarGalletas = cargarGalletas;

window.abrirModalPrincipal = abrirModalPrincipal;
window.cerrarModalPrincipal = cerrarModalPrincipal;
window.abrirModalSecundario = abrirModalSecundario;
window.cerrarModalSecundario = cerrarModalSecundario;

window.guardarProductoReceta = guardarProductoReceta;
window.buscarGalletaReceta = buscarGalletaReceta;
window.eliminarGalleta = eliminarGalleta;

window.filtrarInsumos = filtrarInsumos;
window.seleccionarInsumo = seleccionarInsumo;
window.eliminarInsumo = eliminarInsumo;

window.editarReceta = editarReceta;
window.eliminarReceta = eliminarReceta;