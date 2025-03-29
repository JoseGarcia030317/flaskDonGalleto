import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';
import { validarLongitud, validarRequerido, validarTelefono, validarEmail, validarSoloTexto, validarCaracteresProhibidos } from '../../utils/validaciones.js';

const insumosDisponibles = [
    { id: 1, nombre: "Harina de trigo", unidad: "kg" },
    { id: 2, nombre: "Huevos", unidad: "pz" },
    { id: 3, nombre: "Leche entera", unidad: "lt" },
    { id: 4, nombre: "Mantequilla", unidad: "gr" },
    { id: 5, nombre: "Azúcar glass", unidad: "gr" },
    { id: 6, nombre: "Esencia de vainilla", unidad: "ml" },
    { id: 7, nombre: "Leche deslactosada", unidad: "lt" },
];

const presentaciones_producto = ["Unidad", "Paquete", "Caja", "Bolsa", "Galón", "Saco", "Tubo", "Sobre", "Rollo"]

let insumosSeleccionados = new Set();

// VALIDACIONES COMPRA
const validacionesCompra = {
    clave: (input) => {
            const requerido = validarRequerido(input, 'nombre');
            if (requerido) return requerido;
            const caracteresProhibidos = validarCaracteresProhibidos(input, 'nombre');
            if (caracteresProhibidos) return caracteresProhibidos;
            const soloNumeros = validarSoloNumeros(input, 'nombre');
            if (soloNumeros) return soloNumeros;
    },
    fecha: (input) => {
            const requerido = validarRequerido(input, 'fecha');
            if (requerido) return requerido;
    },
    proveedor: (input) => {
            const requerido = validarRequerido(input, 'proveedor');
            if (requerido) return requerido;
    },
    observacion: (input) => {
            const caracteresProhibidos = validarCaracteresProhibidos(input, 'observacion');
            if (caracteresProhibidos) return caracteresProhibidos;
            const soloTexto = validarSoloNumeros(input, 'observacion');
            if (soloTexto) return soloTexto;
    }
}

const validacionesProducto = {
    cantidad: (input) => {
        const requerido = validarRequerido(input, 'cantidad');
        if (requerido) return requerido;
    },
    unidad: (input) => {
        const requerido = validarRequerido(input, 'unidad');
        if (requerido) return requerido;
    },
    costo: (input) => {
        const requerido = validarRequerido(input, 'costo');
        if (requerido) return requerido;
    }
}

function cargarCompras() {  
    const tbody = document.getElementById('tbody_compras');
}

function abrirModal() {
    const backdrop = document.getElementById('modalBackdropCompra');
    const modalForm = document.getElementById('modalFormCompra');

    backdrop.classList.remove('hidden');
    modalForm.classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modalBackdropCompra').classList.add('hidden');
    document.getElementById('modalFormCompra').classList.add('hidden');
    limpiarFormulario();
}

// SELECCIONAR INSUMOS
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
    document.getElementById('header-insumos-seleccionados').hidden=false;
    if (!insumosSeleccionados.has(idInsumo)) {
        const elemento = document.createElement('div');
        elemento.className = 'flex items-center gap-2 p-2 bg-gray-50 rounded-lg';
        elemento.innerHTML = `
            <input type="hidden" name="insumo_id" value="${idInsumo}">
            <span class="flex-1">${insumo.nombre}</span>
            <div class="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2">
                <input type="number" name="cantidad" min="0" class="block w-20 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 w-20">
                    <div class="grid shrink-0 grid-cols-1 focus-within:relative">
                        <select id="selectPresentacion" name="presentacion" aria-label="presentacion" class="col-start-1 row-start-1 w-24 appearance-none rounded-md py-1.5 pr-7 pl-3 text-base text-gray-500 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6">          
                        </select>
                    <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                        <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                    </svg>
                </div>
            </div>
            <input type="number" 
                   name="precio"
                   min="0.0" 
                   step="0.1" 
                   placeholder="" 
                   class="w-25 p-1 border border-[#895645] rounded-full text-center"
                   required>
            <button onclick="eliminarInsumo(${idInsumo}, this)" 
                    class="text-red-500 hover:text-red-700 cursor-pointer">
                ✕
            </button>
        `;

        const selectPresentacion = elemento.querySelector("#selectPresentacion");

        presentaciones_producto.forEach(presentacion => {
            const option = document.createElement("option");
            option.textContent = presentacion; 
            selectPresentacion.appendChild(option);
        });
        
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

function guardarCompra(){
    const errores = validarFormulario();
    if (errores) {
        mostrarErrores(errores);
        return;
    }
}

function mostrarErrores(errores) {
    document.querySelectorAll('.error-message').forEach(span => span.classList.add('hidden'));
    Object.keys(errores).forEach(campo => {
        const input = document.querySelector(`[name="${campo}"]`);
        if (!input) {
            console.error(`No se encontró el campo: ${campo}`);
            return;
        }
        const errorSpan = input.nextElementSibling;
        if (!errorSpan || !errorSpan.classList.contains('error-message')) {
            console.error(`No se encontró el mensaje de error para el campo: ${campo}`);
            return;
        }
        errorSpan.textContent = errores[campo];
        errorSpan.classList.remove('hidden');
    });
}

function validarFormulario() {
    const proveedor = {
        clave: document.querySelector('input[name="clave"]').value,
        fecha: document.querySelector('input[name="fecha"]').value,
        proveedor: document.querySelector('input[name="proveedor"]').value,
        observacion: document.querySelector('input[name="observacion"]').value,
    };

    const errores = {};

    Object.keys(validacionesProveedor).forEach(campo => {
        const error = validacionesProveedor[campo](proveedor[campo]);
        if (error) {
            errores[campo] = error;
        }
    });

    return Object.keys(errores).length === 0 ? null : errores;
}

window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.cargarCompras = cargarCompras;

window.filtrarInsumos = filtrarInsumos;
window.seleccionarInsumo = seleccionarInsumo;
window.eliminarInsumo = eliminarInsumo;
window.guardarCompra = guardarCompra;