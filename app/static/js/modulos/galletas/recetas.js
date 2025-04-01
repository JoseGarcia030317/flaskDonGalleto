import { api } from "../../utils/api.js";
import { tabs } from "../../utils/tabs.js";
import { alertas } from "../../utils/alertas.js";
import { abrirConversor, cerrarConversor, cambiarPestana, convertirUnidad, limpiarCampos } from "../../utils/conversor.js";

// datos de prueba para cargar las card de recetas
const productosConRecetas = [
    {
        id_galleta: 1,
        nombre: "Oreo Clásica",
        descripcion: "Galleta de chocolate con relleno cremoso",
        recetas: [
            {
                id: 101,
                nombre: "Receta Tradicional Oreo",
                tiempo: 45,
                cantidad: 120,
                insumos: [
                    { nombre: "Harina de trigo", cantidad: 2.5, unidad: "kg" },
                    { nombre: "Cacao en polvo", cantidad: 0.5, unidad: "kg" },
                    { nombre: "Mantequilla", cantidad: 1, unidad: "kg" }
                ],
                instrucciones: "Mezclar los ingredientes secos..."
            },
            {
                id: 102,
                nombre: "Receta Especial Oreo",
                tiempo: 60,
                cantidad: 80,
                insumos: [
                    { nombre: "Harina de trigo", cantidad: 2, unidad: "kg" },
                    { nombre: "Cacao premium", cantidad: 0.75, unidad: "kg" },
                    { nombre: "Mantequilla sin sal", cantidad: 1.2, unidad: "kg" }
                ],
                instrucciones: "Precalentar horno a 180°C..."
            }
        ]
    },
    {
        id_galleta: 2,
        nombre: "Chips Ahoy",
        descripcion: "Galleta con chispas de chocolate",
        recetas: [
            {
                id: 201,
                nombre: "Receta Original Chips Ahoy",
                tiempo: 50,
                cantidad: 100,
                insumos: [
                    { nombre: "Harina", cantidad: 3, unidad: "kg" },
                    { nombre: "Chispas de chocolate", cantidad: 1.5, unidad: "kg" },
                    { nombre: "Huevos", cantidad: 24, unidad: "pz" }
                ],
                instrucciones: "Batir mantequilla con azúcar..."
            },
            {
                id: 202,
                nombre: "Receta Extra Chocolate",
                tiempo: 55,
                cantidad: 90,
                insumos: [
                    { nombre: "Harina", cantidad: 2.8, unidad: "kg" },
                    { nombre: "Chispas de chocolate", cantidad: 2, unidad: "kg" },
                    { nombre: "Cacao", cantidad: 0.5, unidad: "kg" }
                ],
                instrucciones: "Mezclar ingredientes secos..."
            }
        ]
    },
    {
        id_galleta: 3,
        nombre: "Galleta de Avena",
        descripcion: "Galleta saludable con avena y pasas",
        recetas: [
            {
                id: 301,
                nombre: "Receta Clásica de Avena",
                tiempo: 40,
                cantidad: 110,
                insumos: [
                    { nombre: "Avena", cantidad: 2, unidad: "kg" },
                    { nombre: "Pasas", cantidad: 0.8, unidad: "kg" },
                    { nombre: "Miel", cantidad: 1, unidad: "lt" }
                ],
                instrucciones: "Mezclar avena con miel..."
            }
        ]
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
function abrirModal(id_galleta, id_receta, tipo) {
    const backdrop = document.getElementById('modalBackdrop');
    const modalForm = document.getElementById('modalForm');

    document.getElementById('galleta_id').value = id_galleta;
    document.getElementById('receta_id').value = id_receta;

    document.getElementById('modal-titulo').textContent = tipo === 'editar' ? 'Editar receta' : 'Añadir receta';
    
    backdrop.classList.remove('hidden');
    modalForm.classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
    document.getElementById('modalForm').classList.add('hidden');
}

// Función para colapsar/expandir cards de recetas
function toggleRecetas(idGalleta) {
    const recetasDiv = document.getElementById(`recetas-galleta-${idGalleta}`);
    const icon = document.getElementById(`toggle-icon-${idGalleta}`);
    
    recetasDiv.classList.toggle('hidden');
    icon.classList.toggle('rotate-180');
}

// ====================================================================
// Funciones para hacer las conexiones con la aplicaion Flask
// ====================================================================
function cargarRecetas() {
    generarCards();
}

function generarCards() {
    const container = document.getElementById('recetas-container');
    container.innerHTML = '';

    productosConRecetas.forEach(galleta => {
        // Contenedor principal para cada galleta
        const galletaContainer = document.createElement('div');
        galletaContainer.className = 'mb-3 border border-[#895645]/30 rounded-lg overflow-hidden';
        galletaContainer.innerHTML = `
            <div class="bg-[#efe6dc] p-3 flex justify-between items-center">
                <h2 class="text-xl font-semibold text-[#3C1D0C]">${galleta.nombre}</h2>
                <div>
                    <button class="text-[#3C1D0C] mr-2 rounded-full hover:bg-[#895645]/10 cursor-pointer" onclick="abrirModal(${galleta.id_galleta}, 0, 'añadir')">
                        <img src="../../../static/images/plus.png" class="w-5 h-5 transition-transform">
                    </button>
                    <button class="text-[#3C1D0C] p-1 rounded-full hover:bg-[#895645]/10 cursor-pointer" onclick="toggleRecetas(${galleta.id_galleta})">
                        <img src="../../../static/images/flecha collapsar.png" id="toggle-icon-${galleta.id_galleta}" class="w-5 h-5 transition-transform">
                    </button>
                </div>
            </div>
            <div id="recetas-galleta-${galleta.id_galleta}" class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            </div>
        `;
        
        container.appendChild(galletaContainer);
        
        // Generar las cards de recetas para esta galleta
        const recetasContainer = document.getElementById(`recetas-galleta-${galleta.id_galleta}`);
        galleta.recetas.forEach(receta => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-sm border border-[#895645]/20';
            card.innerHTML = `
                <div class="flex flex-col p-3 space-y-2 h-full">
                    <div class="space-y-1 flex-1">
                        <h3 class="text-lg font-semibold text-black break-words">${receta.nombre}</h3>
                        <p class="text-black text-sm">${receta.tiempo} min</p>
                        <p class="text-black text-sm">${receta.cantidad} und</p>
                        <p class="text-sm text-black">Insumos: ${receta.insumos.length} elementos</p>
                    </div>

                    <div class="flex border-t border-black pt-1 mt-1">
                        <button onclick="buscarRecetaPorId(${galleta.id_galleta}, ${receta.id})" 
                                class="flex-1 flex items-center justify-center p-1 cursor-pointer">
                            <img src="../../../static/images/lapiz.png" class="w-7 h-7">
                        </button>
                        
                        <button onclick="eliminarReceta(${galleta.id_galleta}, ${receta.id})" 
                                class="flex-1 flex items-center justify-center p-1 cursor-pointer">
                            <img src="../../../static/images/bote basura.png" class="w-7 h-7">
                        </button>
                    </div>
                </div>
            `;
            recetasContainer.appendChild(card);
        });
    });
}

function guardarReceta() {

}

function eliminarReceta(id_galleta, id_receta) {
    alert('ID de la galleta eliminada: ' + id_galleta);
    alert('ID de la receta eliminada: ' + id_receta);
}

function buscarRecetaPorId(id_galleta, id_receta) {
    alert('ID de la galleta seleccionada: ' + id_galleta);
    alert('ID de la receta seleccionada: ' + id_receta);
    abrirModal(id_galleta, id_receta, 'editar');
}

function filtrarInsumos(termino) {
    const sugerencias = document.getElementById('sugerencias-insumos');
    sugerencias.innerHTML = '';
    if (termino.length < 2) {
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
                   class="w-24 p-1 border rounded-full text-center"
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

function eliminarInsumo(idInsumo, elemento) {
    elemento.parentElement.remove();
    insumosSeleccionados.delete(idInsumo);
}

// Exponer funciones de propias de recetas globalmanete
window.guardarReceta = guardarReceta;
window.eliminarReceta = eliminarReceta;
window.buscarRecetaPorId = buscarRecetaPorId;

// Exportar funciones de modales y alerta globalmente
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;

// exporner funciones de modificaion del dom globalmente
window.cargarRecetas = cargarRecetas;
window.toggleRecetas = toggleRecetas;

window.filtrarInsumos = filtrarInsumos;
window.seleccionarInsumo = seleccionarInsumo;
window.eliminarInsumo = eliminarInsumo;

// exponer funciones del conversor de unidades globalmente
window.cambiarPestana = cambiarPestana;
window.convertirUnidad = convertirUnidad;
window.abrirConversor = abrirConversor;
window.cerrarConversor = cerrarConversor;
window.limpiarCampos = limpiarCampos;