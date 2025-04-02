import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';
import { validarLongitud, validarRequerido, validarTelefono, validarEmail, validarSoloTexto, validarCaracteresProhibidos, validarSoloNumeros } from '../../utils/validaciones.js';

const compras = [
    { idCompra: 1, clave_compra: "987675", fecha_compra: "17/08/2025", proveedor: {id: 1, nombre: "Gota blanca", telefono: "4776783940", contacto: "Héctor Gómez", correo_electronico: "gota@gmail.com", descripcion_servicio: "Cada jueves", estatus: 1}, observacion: "Compra exitosa", total: 300},
    { idCompra: 2, clave_compra: "987675", fecha_compra: "17/08/2025", proveedor: {id: 1, nombre: "Gota blanca", telefono: "4776783940", contacto: "Héctor Gómez", correo_electronico: "gota@gmail.com", descripcion_servicio: "Cada jueves", estatus: 1}, observacion: "Compra exitosa", total: 300},
    { idCompra: 3, clave_compra: "987675", fecha_compra: "17/08/2025", proveedor: {id: 1, nombre: "Gota blanca", telefono: "4776783940", contacto: "Héctor Gómez", correo_electronico: "gota@gmail.com", descripcion_servicio: "Cada jueves", estatus: 1}, observacion: "Compra exitosa", total: 300},
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

const proveedoresDisponibles = [
    {id: 1, nombre: "Gota blanca", telefono: "4776783940", contacto: "Héctor Gómez", correo_electronico: "gota@gmail.com", descripcion_servicio: "Cada jueves", estatus: 1},
    {id: 2, nombre: "Leche León", telefono: "4776783940", contacto: "Héctor Gómez", correo_electronico: "gota@gmail.com", descripcion_servicio: "Cada jueves", estatus: 1},
    {id: 3, nombre: "Tía Rosa", telefono: "4776783940", contacto: "Héctor Gómez", correo_electronico: "gota@gmail.com", descripcion_servicio: "Cada jueves", estatus: 1},
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
    proveedor: (select) => {
            const requerido = validarRequerido(select, 'proveedor');
            if (requerido) return requerido;
    },
    observacion: (input) => {
            const caracteresProhibidos = validarCaracteresProhibidos(input, 'observacion');
            if (caracteresProhibidos) return caracteresProhibidos;
            const soloTexto = validarSoloTexto(input, 'observacion');
            if (soloTexto) return soloTexto;
    }
}

// FUNCIONES COMPRA
function cargarCompras() {  
    const tbody = document.getElementById('tbody_compras');
    tabs.mostrarEsqueletoTabla(tbody);
    tbody.innerHTML = '';
    compras.forEach(compra => {
        tbody.innerHTML += `
        <tr data-id="${compra.idCompra}" class="hover:bg-gray-100">
            <td class="p-3 text-[#301e1a] text-center">${compra.fecha_compra}</td>
            <td class="p-3 text-[#301e1a] text-center">${compra.clave_compra}</td>
            <td class="p-3 text-[#301e1a] text-center">${compra.proveedor.nombre}</td>
            <td class="p-3 text-[#301e1a] text-center">$ ${compra.total}</td>
            <td class="p-3 text-[#301e1a] flex justify-center">
                <button onclick="abrirVerCompra(${compra.idCompra}, ${compra.fecha_compra}, '${compra.clave_compra}', '${compra.proveedor.nombre}', '${compra.observacion}')" class="align-middle cursor-pointer">
                    <img src="../../../static/images/info.png" class="w-7 h-7">
                </button>
            </td>
        </tr>
        `;
    });
    cargarProveedores();
}

function cargarProveedores(){
    const selectProveedor = document.querySelector('select[name="proveedor"]');
    selectProveedor.innerHTML = "";

    const optionDefault = document.createElement("option");
        optionDefault.textContent = "Selecciona una opción...";
        optionDefault.value = "";
        optionDefault.selected = true;
        optionDefault.disabled = true;
        selectProveedor.appendChild(optionDefault);

    proveedoresDisponibles.forEach(proveedor => {
        const option = document.createElement('option');
        option.value = proveedor.id;
        option.textContent = proveedor.nombre;
        selectProveedor.appendChild(option);
    })
}

function abrirModal(tipo) {
    const backdrop = document.getElementById('modalBackdropCompra');
    backdrop.classList.remove('hidden');
    let modalForm;  
    if (tipo === 'agregar') {
        modalForm = document.getElementById('modalFormCompra');
    } else {
        modalForm = document.getElementById('modalViewCompra');
    }
    modalForm.classList.remove('hidden');
}

function abrirVerCompra(id, clave, fecha, proveedor, observacion){
    abrirModal('ver');
}

function cerrarModal() {
    document.getElementById('modalBackdropCompra').classList.add('hidden');
    document.getElementById('modalFormCompra').classList.add('hidden');
    document.getElementById('modalViewCompra').classList.add('hidden');
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
                <input type="number" name="cantidad" min="0" class="block w-20 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 w-20" required>
                    <div class="grid shrink-0 grid-cols-1 focus-within:relative">
                        <select id="selectPresentacion" name="presentacion" aria-label="presentacion" class="col-start-1 row-start-1 w-24 appearance-none rounded-md py-1.5 pr-7 pl-3 text-base text-gray-500 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6" required>          
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

        const optionDefault = document.createElement("option");
        optionDefault.textContent = "Selecciona una opción...";
        optionDefault.value = "";
        optionDefault.selected = true;
        optionDefault.disabled = true;
        selectPresentacion.appendChild(optionDefault);
        
        presentaciones_producto.forEach(presentacion => {
            const option = document.createElement("option");
            option.textContent = presentacion;
            option.value = presentacion;
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

function guardarCompra(event){
    event.preventDefault();
    const contenedor = document.getElementById('insumos-seleccionados');
    if (contenedor.querySelector('div')) {
        event.preventDefault();
        const errores = validarFormulario();
        if (errores) {
            mostrarErrores(errores);
            return;
        }
        alertas.procesoTerminadoExito();
        cerrarModal();
    } else {
        alertas.alertaWarning("Debe existir al menos un insumo seleccionado");
    }
}

function cancelarCompra(event){    
    alertas.confirmarEliminar();
    cerrarModal();
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
    const compra = {
        clave: document.querySelector('input[name="clave"]').value,
        fecha: document.querySelector('input[name="fecha"]').value,
        proveedor: document.querySelector('select[name="proveedor"]').value,
        observacion: document.querySelector('input[name="observacion"]').value,
    };

    var errores = {};

    Object.keys(validacionesCompra).forEach(campo => {
        const error = validacionesCompra[campo](compra[campo]);
        console.log("Despues de consr error");
        console.log(error);

        if (error) {
            console.log("si hay errores");
            errores[campo] = error;
        }
    });

    return Object.keys(errores).length === 0 ? null : errores;
}

function limpiarFormulario(){
    document.querySelector('input[name="clave"]').value = '';
    document.querySelector('input[name="fecha"]').value = '';
    document.querySelector('select[name="proveedor"]').value = '';
    document.querySelector('input[name="observacion"]').value = '';
    document.getElementById('insumos-seleccionados').innerHTML = '';
}

window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.cargarCompras = cargarCompras;

window.filtrarInsumos = filtrarInsumos;
window.seleccionarInsumo = seleccionarInsumo;
window.eliminarInsumo = eliminarInsumo;
window.guardarCompra = guardarCompra;
window.abrirVerCompra = abrirVerCompra;
window.cancelarCompra = cancelarCompra;