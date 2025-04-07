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

function cargarInventarioGalletas() {
    const container = document.getElementById("galletas-container");
    tabs.mostrarEsqueletoCardGalleta(container);
    generarCards();
}

function abrirModal(id_galleta) {
    const backdrop = document.getElementById('modalBackdrop');
    const modalForm = document.getElementById('modalForm');

    backdrop.classList.remove('hidden');
    modalForm.classList.remove('hidden');
    cargarRecetas(id_galleta);
}

// Función para generar las cards de las galletas
function generarCards() {
    const container = document.getElementById('galletas-container');
    container.innerHTML = "";
    galletas.forEach(galleta => {
        const card = document.createElement('div');
        card.className = 'bg-[#efe6dc] rounded-xl shadow-md overflow-hidden border border-gray-200';
        card.innerHTML = `
            <div class="flex p-1 mb-1">
                <div class="w-1/3 flex items-center justify-center">
                    <img src="${galleta.imagen}" 
                         alt="${galleta.nombre}" 
                         class="h-24 w-24 pl-2 object-contain">
                </div>
                
                <div class="flex items-center h-24">
                    <div class="max-w-32 pl-4">
                        <h3 class="text-lg font-semibold text-black">${galleta.nombre}</h3>
                        <p class="text-sm text-black mt-1">${galleta.piezas}</p>
                    </div>
                </div>
            </div>

            <div class="border-t border-[#8A5114] p-1 flex items-center justify-center hover:bg-[rgba(145,90,23,0.15)]">
                <button onclick="abrirModal(${galleta.id_galleta})" class="text-[#8A5114] p-1 cursor-pointer flex flex-nowrap">
                    <img src="../../../static/images/horneado.png" class="w-5 h-5">
                    Añadir horneado
                </button>
            </div>
        `;
        
        container.appendChild(card);
    }); 
}

function cargarRecetas(id_galleta){
    const selectRecetas = document.querySelector('select[name="receta"]');
    selectRecetas.innerHTML = "";
            
    const optionDefault = document.createElement("option");
    optionDefault.textContent = "Selecciona una receta...";
    optionDefault.value = "";
    optionDefault.selected = true;
    optionDefault.disabled = true;
    selectRecetas.appendChild(optionDefault);
            
    recetas.forEach(receta => {
        const option = document.createElement('option');
        option.value = receta.id;
        option.textContent = receta.nombre;
        selectRecetas.appendChild(option);
    })
}

function guardarHorneado(){
    if(document.querySelector('select[name="receta"]').value === ""){
        return;
    }
    alertas.procesoTerminadoExito();
    cerrarModal();
}

function cerrarModal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
    document.getElementById('modalForm').classList.add('hidden');
    limpiarFormulario();
}

function limpiarFormulario(){
    document.querySelector('select[name="receta"]').value = '';
}

window.cargarInventarioGalletas = cargarInventarioGalletas;
window.abrirModal = abrirModal;
window.guardarHorneado =guardarHorneado;
window.cerrarModal = cerrarModal;