import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';
import { validarLongitud, validarRequerido, validarTelefono, validarEmail, validarSoloTexto, validarCaracteresProhibidos, validarSoloNumeros } from '../../utils/validaciones.js';

let insumosDisponibles = [];

const presentaciones_producto = ["Unidad", "Paquete", "Caja", "Bolsa", "Galón", "Saco", "Tubo", "Sobre", "Rollo"]

let insumosSeleccionados = new Map();

// VALIDACIONES COMPRA
const validacionesCompra = {
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
function initCompras(){
    cargarCompras();
    cargarProveedores();
    consultarInsumos();
}

function cargarCompras() {  
    const tbody = document.getElementById('tbody_compras');
    tabs.mostrarEsqueletoTabla(tbody,5,5);

    api.getJSON('/compras/list_compras')
    .then(data => {
        tbody.innerHTML = '';
        data.forEach(compra => {
            tbody.innerHTML += `
            <tr data-id="${compra.id_compra}" class="hover:bg-gray-100">
            <td class="p-3 text-[#301e1a] text-center">${convertirFecha(compra.fecha_compra)}</td>
            <td class="p-3 text-[#301e1a] text-center">${compra.clave_compra}</td>
            <td class="p-3 text-[#301e1a] text-center">${compra.proveedor}</td>
            <td class="p-3 text-[#301e1a] text-center">${compra.total_compra}</td>
            <td class="p-3 text-[#301e1a] flex justify-center">
            <button onclick="abrirVerCompra(${compra.id_compra})" class="align-middle cursor-pointer">
                <img src="../../../static/images/info.png" class="w-7 h-7">
            </button>
            </td>
            </tr>
            `;
        });
    });
}

function cargarProveedores(){
    api.getJSON('/provedores/get_all_proveedores')
        .then(data => {
            const selectProveedor = document.querySelector('select[name="proveedor"]');
            selectProveedor.innerHTML = "";
            
            const optionDefault = document.createElement("option");
            optionDefault.textContent = "Selecciona una opción...";
            optionDefault.value = "";
            optionDefault.selected = true;
            optionDefault.disabled = true;
            selectProveedor.appendChild(optionDefault);
            
            data.forEach(proveedor => {
                const option = document.createElement('option');
                option.value = proveedor.id_proveedor;
                option.textContent = proveedor.nombre;
                selectProveedor.appendChild(option);
            })
    });
}

function consultarInsumos() {
    api.getJSON('/insumos/get_all_insumos_unidad')
        .then(data => {
            if (data) insumosDisponibles = data;
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al cargar insumos', 'error');
        }).finally( () => tabs.desbloquearTabs());
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

function abrirVerCompra(id_compra){
    api.postJSON('/compras/get_compra', {id_compra: id_compra})
    .then(data => {
        if(data){
            abrirModal('ver');
            document.getElementById("idCompra").textContent = data.id_compra;
            document.getElementById("verFechaCompra").textContent = convertirFecha(data.fecha_compra);
            document.getElementById("verClaveCompra").textContent = data.clave_compra;
            document.getElementById("verProveedorCompra").textContent = data.proveedor;
            document.getElementById("verobservacionCompra").textContent = data.observacion;

            if(data.detalles.length > 0){
                const tbody = document.getElementById('tbody_compras_detalle');
                tbody.innerHTML = '';
                data.detalles.forEach(detalle => {
                    tbody.innerHTML += `
                    <tr>
                        <td class="p-3 text-[#301e1a] text-center">${detalle.insumo}</td>
                        <td class="p-3 text-[#301e1a] text-center">${detalle.presentacion}</td>
                        <td class="p-3 text-[#301e1a] text-center">${detalle.cantidad}</td>
                        <td class="p-3 text-[#301e1a] text-center">${detalle.precio_unitario}</td>
                    </tr>
                    `;
                });
            }
        }
    });
}

function cerrarModal() {
    document.getElementById('modalBackdropCompra').classList.add('hidden');
    document.getElementById('modalFormCompra').classList.add('hidden');
    document.getElementById('modalViewCompra').classList.add('hidden');
    limpiarFormulario();
}

function convertirFecha(fecha){
    return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// FUNCIONES PARA LOS INSUMOS
function filtrarInsumos(termino) {
    const sugerencias = document.getElementById('sugerencias-insumos');

    sugerencias.innerHTML = '';

    if (termino.length < 1) {
        sugerencias.classList.add('hidden');
        return;
    }

    const resultados = insumosDisponibles.filter(insumo =>
        insumo.nombre.toLowerCase().includes(termino.toLowerCase()) &&
        !insumosSeleccionados.has(insumo.id_insumo)
    );

    if (resultados.length > 0) {
        sugerencias.innerHTML = resultados.map(insumo => `
            <div class="p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between border-b"
                onclick="seleccionarInsumo(${insumo.id_insumo})">
                <span>${insumo.nombre}</span>
                <span class="text-sm text-gray-500">(${insumo.unidad.simbolo})</span>
            </div>
        `).join('');
        sugerencias.classList.remove('hidden');
    } else {
        sugerencias.classList.add('hidden');
    }
}

function seleccionarInsumo(id_insumo) {
    const insumo = insumosDisponibles.find(i => i.id_insumo === id_insumo);
    const contenedor = document.getElementById('insumos-seleccionados');
    const campo_busqueda = document.getElementById('buscador-insumos');

    document.getElementById('header-insumos-seleccionados').hidden=false;
    if (!insumosSeleccionados.has(id_insumo)) {
        const elemento = document.createElement('div');
        elemento.className = 'flex items-center gap-2 p-2 bg-gray-50 rounded-lg';
        elemento.innerHTML = `
            <input type="hidden" name="insumo_id" value="${id_insumo}">
            <span class="flex-1">${insumo.nombre}</span>
            <div class="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2">
                <input type="number" name="cantidad" min="0" class="block w-20 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6" required oninput="actualizarInsumo(${id_insumo}, this.value, 'cantidad')">
                    <div class="grid shrink-0 grid-cols-1 focus-within:relative">
                        <select id="selectPresentacion" name="presentacion" aria-label="presentacion" class="col-start-1 row-start-1 w-24 appearance-none rounded-md py-1.5 pr-7 pl-3 text-base text-gray-500 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6" required oninput="actualizarInsumo(${id_insumo}, this.value, 'presentacion')">      
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
                   required
                   oninput="actualizarInsumo(${id_insumo}, this.value, 'costo')">
            <button onclick="eliminarInsumo(${id_insumo}, this)" 
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
        
        insumosSeleccionados.set(id_insumo, {
            insumo_id: id_insumo,
            presentacion: '',
            precio_unitario: 0.00,
            cantidad: 0
        });

        contenedor.appendChild(elemento);
        campo_busqueda.focus();
    }
    
    document.getElementById('sugerencias-insumos').classList.add('hidden');
    campo_busqueda.value = '';
}

// Función para eliminar insumo
function eliminarInsumo(idInsumo, elemento) {
    elemento.parentElement.remove();
    insumosSeleccionados.delete(idInsumo);
}

function actualizarInsumo(id_insumo, valor, campo) {
    if (insumosSeleccionados.has(id_insumo)) {
        const insumo = insumosSeleccionados.get(id_insumo);
        if (campo === 'cantidad'){
            insumo.cantidad = parseFloat(valor) || 0;
        } else if(campo === 'costo'){
            insumo.precio_unitario = parseFloat(valor) || 0.00;
        } else {
            insumo.presentacion = valor;
        }
        insumosSeleccionados.set(id_insumo, insumo);
    }
}

function guardarCompra(event){
    document.getElementById('btnGuardarCompra').disabled = true;
    event.preventDefault();
    const contenedor = document.getElementById('insumos-seleccionados');
    if (contenedor.querySelector('div')) {
        event.preventDefault();
        const errores = validarFormulario();
        if (errores === false || errores) {
            mostrarErrores(errores);
            return;
        }
        const formData =  {
            observacion: document.querySelector('input[name="observacion"]').value,
            proveedor_id: document.querySelector('select[name="proveedor"]').value,
            fecha_compra: document.querySelector('input[name="fecha"]').value,
            estatus: 1,
            detalles: Array.from(insumosSeleccionados.values()) // Convertir a array de objetos
        }

        let endpoint = 'compras/create_compra';
        api.postJSON(endpoint, formData)
            .then(data => {
                if(data.id_compra) {
                    cerrarModal();
                    alertas.procesoTerminadoExito();
                    cargarCompras();
                    insumosSeleccionados.clear();
                    document.getElementById('header-insumos-seleccionados').hidden=true;
                    limpiarFormulario();
                }
            })
    } else {
        alertas.alertaWarning("Debe existir al menos un insumo seleccionado");
    }
}

function cancelarCompra(event){    
    let label = document.getElementById('idCompra');
    if (label) {
        let idCompra = parseInt(label.textContent, 10);
        alertas.confirmarEliminar().then(resultado => {
            if(!resultado.isConfirmed) {
                return Promise.reject('cancelado');
            }
            tabs.mostrarLoader();
            return api.postJSON('/compras/delete_compra', {id_compra: idCompra});
        })
        .then(data => {
            alertas.procesoTerminadoExito();
            tabs.ocultarLoader();
            cargarCompras();
        })
        cerrarModal();
    } else {
        console.log("id no encontrado");
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
    const compra = {
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
            errores[campo] = error;
        }
    });

    const insumos = document.querySelectorAll("#insumos-seleccionados input[required], #insumos-seleccionados select[required]");
    for (let input of insumos) { 
        if (!input.value.trim()) { 
            input.classList.add("border-red-500"); // Agregar borde rojo si hay error
            alertas.alertaWarning("Verifica que la información de insumos se encuentre completa.");
            return false; // DETIENE la función inmediatamente
        } else {
            input.classList.remove("border-red-500");
        }
    }
    return Object.keys(errores).length === 0 ? null : errores;
}

function limpiarFormulario(){
    document.querySelector('select[name="proveedor"]').value = '';
    document.querySelector('input[name="observacion"]').value = '';
    document.getElementById('insumos-seleccionados').innerHTML = '';
    document.getElementById('btnGuardarCompra').disabled = false;
}

window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.initCompras = initCompras;

window.filtrarInsumos = filtrarInsumos;
window.seleccionarInsumo = seleccionarInsumo;
window.eliminarInsumo = eliminarInsumo;
window.guardarCompra = guardarCompra;
window.abrirVerCompra = abrirVerCompra;
window.cancelarCompra = cancelarCompra;
window.actualizarInsumo = actualizarInsumo;