import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';
import { abrirConversor, cerrarConversor, cambiarPestana, convertirUnidad, limpiarCampos } from "../../utils/conversor.js";
import { api } from '../../utils/api.js';
import {convertirFecha} from '../../utils/validaciones.js';

let dataResponse;

function cargarAlmacen() {  
    const tbody = document.getElementById('tbody_almacen');
    tbody.innerHTML = tabs.mostrarEsqueletoModuloContent();

    api.getJSON('almacen/list_compras')
        .then(data => {
            if (!data) {
                tbody.innerHTML = '';
                tbody.innerHTML = `
                    <div class="flex justify-center items-center min-h-screen">
                        <p class="text-gray-500 font-medium text-xl">No hay galletas registradas</p>
                    </div>
                `;
                return ;
            }
            // tbody.innerHTML = '';
            data.forEach(compra => {
                tbody.innerHTML +=  `
                <div class="w-full flex py-4 px-3 mb-3 border border-[#8A5114] justify-between rounded-xl bg-white shadow-md">
                    <div>
                        <span class="text-[#915A17]">${convertirFecha(compra.fecha_compra)}</span>
                        <p class="text-xl">Compra ${compra.clave_compra} - ${compra.proveedor}</p> 
                    </div>
                <button onclick="abrirCompra(${compra.id_compra})" class="flex items-center justify-center space-x-1 px-3 py-0 bg-white text-[#8A5114] border-2 border-[#6B3D0C] rounded-full hover:bg-[#6B3D0C] hover:text-white focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    </button>                                  
                    </div>
                `;
            });
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al cargar compras', 'error');
        })
        .finally(() => tabs.desbloquearTabs());
}

function abrirModal(){
    const backdrop = document.getElementById('modalBackdropAlmacen');
    const modalForm = document.getElementById('modalFormAlmacen');

    backdrop.classList.remove('hidden');
    modalForm.classList.remove('hidden');
}

function abrirCompra(id_compra){
    tabs.mostrarLoader();
    const insumos = document.getElementById('insumos');
    api.postJSON('/compras/get_compra', {id_compra: id_compra})
    .then(data => {
        dataResponse = data;
        insumos.innerHTML = '';
        if(data){
            document.getElementById('id_compra').textContent = data.id_compra;
            data.detalles.forEach((detalle, index) => {
                // Generamos un ID único para poder identificar fácilmente cada elemento relacionado
                const cantidadId = `cantidad-${index}`;
                const resultadoId = `resultado-${index}`;
            
                insumos.innerHTML += `
                    <div class="flex items-center w-full mb-3 gap-4 p-3 bg-gray-50 rounded-lg shadow-sm">
                        <p class="w-1/6">${detalle.insumo}</p>
                        <p class="text-center w-1/6">${detalle.cantidad}</p>
                        <p class="text-center w-1/6">${detalle.presentacion}</p> 
                        <input type="number" id="${cantidadId}" name="cantidad" min="0.0" step="0.1" placeholder="" class="w-1/6 p-2 border border-[#895645] rounded-full text-center" required>
                        <p class="text-center w-1/6" id="${resultadoId}">= 0 ${detalle.unidad}</p>
                        <input type="date" name="fecha_caducidad" class="w-1/6 p-2 border border-[#895645] rounded-full text-center" required>
                    </div>
                `;
            
                // Agregamos el event listener después de insertar el HTML
                setTimeout(() => {
                    const input = document.getElementById(cantidadId);
                    const resultado = document.getElementById(resultadoId);
            
                    input.addEventListener('input', () => {
                        const valorIngresado = parseFloat(input.value);
                        const cantidadOriginal = parseFloat(detalle.cantidad);
            
                        if (!isNaN(valorIngresado)) {
                            const resultadoMultiplicacion = (valorIngresado * cantidadOriginal).toFixed(2);
                            resultado.textContent = `= ${resultadoMultiplicacion}` + ' ' + detalle.unidad;
                        } else {
                            resultado.textContent = `= 0`;
                        }
                    });
                });
            });            
            abrirModal();
        }
    }).finally(() => tabs.ocultarLoader());
}

function validarFormulario(){
    const insumos = document.querySelectorAll("#insumos input[required]");
    let esValido = true;
    for (let input of insumos) { 
        if (!input.value.trim()) { 
            input.classList.add("border-red-500"); // Agregar borde rojo si hay error
            alertas.alertaWarning("Verifica que la información de insumos se encuentre completa.");
            esValido = false; // DETIENE la función inmediatamente
        } else {
            input.classList.remove("border-red-500");
        }
    }
    return esValido;
}

function guardarAlmacen(event){
    event.preventDefault();
    if(!validarFormulario()){
        return;
    }
    document.getElementById('btnGuardarAlmacen').disabled = true;

    const formData = {
        id_compra : document.getElementById('id_compra').textContent,
        detalle : obtenerDetalles()
    }

    let endpoint = 'almacen/guardar_inventario';
    api.postJSON(endpoint, formData)
    .then(() => {
        cerrarModal();
        alertas.procesoTerminadoExito();
        cargarAlmacen();
    }).finally(() => document.getElementById('btnGuardarAlmacen').disabled = false);
}


function obtenerDetalles() {
    const detalles = [];

    dataResponse.detalles.forEach((detalle, index) => {
        const resultadoEl = document.getElementById(`resultado-${index}`);
        const fechaEl = document.querySelectorAll('#insumos input[name="fecha_caducidad"]')[index];

        const textoResultado = resultadoEl.textContent;
        const cantidad = parseFloat(textoResultado.replace(/[^\d.]/g, ''));

        const fecha = fechaEl.value;

        if (!isNaN(cantidad) && fecha) {
            detalles.push({
                insumo_id: detalle.insumo_id, // Asegúrate que exista en tu objeto original
                cantidad: cantidad,
                fecha_caducidad: fecha
            });
        }
    });

    return detalles;
}


function cerrarModal() {
    document.getElementById('modalBackdropAlmacen').classList.add('hidden');
    document.getElementById('modalFormAlmacen').classList.add('hidden');
    limpiarFormulario();
}

function limpiarFormulario(){
    dataResponse = '';
    document.getElementById('insumos').innerHTML = '';
    document.getElementById('id_compra').textContent = '';
}

window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.cargarAlmacen = cargarAlmacen;
window.abrirCompra = abrirCompra;
window.guardarAlmacen = guardarAlmacen;

// exponer funciones del conversor de unidades globalmente
window.cambiarPestana = cambiarPestana;
window.convertirUnidad = convertirUnidad;
window.abrirConversor = abrirConversor;
window.cerrarConversor = cerrarConversor;
window.limpiarCampos = limpiarCampos;
