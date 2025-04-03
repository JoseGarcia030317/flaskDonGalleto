import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';
import { abrirConversor, cerrarConversor, cambiarPestana, convertirUnidad, limpiarCampos } from "../../utils/conversor.js";
import { limpiarErrores, mostrarErrores, validarCaracteresProhibidos, validarLongitud, validarNumeroDecimal, validarRequerido, validarSoloNumeros } from '../../utils/validaciones.js';

// ====================================================================
// Variables ocupadas para el funcionamiento de merma-insumos
// ====================================================================
let insumosDisponibles = [];
let recetasDisponibles = [];
let insumosSeleccionados = new Map();

// ====================================================================
// Funciones para realizar validaciones del lado del Cliente
// ====================================================================
const validacionesGalletas = {
    nombre_galleta: (input) => {
        const caracteresProhibidos = validarCaracteresProhibidos(input, 'nombre de la galleta')
        if (caracteresProhibidos) return caracteresProhibidos;
        const longitud = validarLongitud(input, 5, 50);
        if (longitud) return longitud;
        return null
    },
    proteccion_precio: (input) => {
        const requerido = validarRequerido(input, 'protección del precio');
        if (requerido) return requerido;
        const soloNumeros = validarNumeroDecimal(input, 'protección del precio');
        if (soloNumeros) return soloNumeros;
        if (parseFloat(input) <= 0) {
            return 'La protección del precio debe ser mayor a 0';
        }
        return null;
    },
    gramos_galleta: (input) => {
        const requerido = validarRequerido(input, 'protección del precio');
        if (requerido) return requerido;
        const soloNumeros = validarNumeroDecimal(input, 'protección del precio');
        if (soloNumeros) return soloNumeros;
        if (parseFloat(input) <= 0) {
            return 'La cantidad debe ser mayor a 0';
        }
        return null;
    },
    dias_caducidad: (input) => {
        const requerido = validarRequerido(input, 'días de caducidad');
        if (requerido) return requerido;
        const soloNumeros = validarSoloNumeros(input, 'días de caducidad');
        if (soloNumeros) return soloNumeros;
        if (parseFloat(input) <= 0) {
            return 'La cantidad debe ser mayor a 0';
        }
        return null;
    },
    descripcion_galleta: (input) => {
        const caracteresProhibidos = validarCaracteresProhibidos(input, 'descripcion de la galleta');
        if (caracteresProhibidos) return caracteresProhibidos;
        const longitud = validarLongitud(input, 0, 250);
        if (longitud) return longitud;
        return null;
    },
    precio_sugerido: (input) => {
        const requerido = validarRequerido(input, 'protección del precio');
        if (requerido) return requerido;
        const soloNumeros = validarNumeroDecimal(input, 'protección del precio');
        if (soloNumeros) return soloNumeros;
        if (parseFloat(input) <= 0) {
            return 'El precio de venta debe ser mayor a 0';
        }
        return null;
    }
}

function validarFormularioGalleta() {
    const merma = {
        nombre_galleta: document.querySelector('input[name="nombre_galleta"]').value,
        dias_caducidad: document.querySelector('input[name="dias_caducidad"]').value,
        gramos_galleta: document.querySelector('input[name="gramos_galleta"]').value,
        proteccion_precio: document.querySelector('input[name="proteccion_precio"]').value,
        descripcion_galleta: document.querySelector('textarea[name="descripcion_galleta"]').value,
        precio_sugerido: document.querySelector('input[name="precio_sugerido"]').value
    }

    const errores = {};

    Object.keys(validacionesGalletas).forEach(campo => {
        const error = validacionesGalletas[campo](merma[campo]);
        if (error) {
            errores[campo] = error;
        }
    });

    return Object.keys(errores).length === 0 ? null : errores;
}

const validacionesRecetas = {
    nombre_receta: (input) => {
        const caracteresProhibidos = validarCaracteresProhibidos(input, 'nombre de la receta');
        if (caracteresProhibidos) return caracteresProhibidos;
        const longitud = validarLongitud(input, 5, 50);
        if (longitud) return longitud;
        return null;
    },
    tiempo_horneado: (input) => {
        const requerido = validarRequerido(input, 'tiempo de horneado');
        if (requerido) return requerido;
        const soloNumeros = validarSoloNumeros(input, 'tiempo de horneado');
        if (soloNumeros) return soloNumeros;
        if (parseFloat(input) <= 0) {
            return 'El tiempo de horneado debe ser mayor a 0';
        }
        return null;
    },
    galletas_producidas: (input) => {
        const requerido = validarRequerido(input, 'galletas producidas');
        if (requerido) return requerido;
        const soloNumeros = validarSoloNumeros(input, 'galletas producidas');
        if (soloNumeros) return soloNumeros;
        if (parseFloat(input) <= 0) {
            return 'La cantidad de galletas producidas debe ser mayor a 0';
        }
        return null;
    }
}

function validarFormularioReceta() {
    const merma = {
        nombre_receta: document.querySelector('input[name="nombre_receta"]').value,
        tiempo_horneado: document.querySelector('input[name="tiempo_horneado"]').value,
        galletas_producidas: document.querySelector('input[name="galletas_producidas"]').value
    }

    const errores = {};

    Object.keys(validacionesRecetas).forEach(campo => {
        const error = validacionesRecetas[campo](merma[campo]);
        if (error) {
            errores[campo] = error;
        }
    });

    return Object.keys(errores).length === 0 ? null : errores;
}

function validarInsumosDinamicos() {
    const erroresInsumos = {};
    const inputsCantidad = document.querySelectorAll('#insumos-seleccionados input[type="number"]');

    inputsCantidad.forEach(input => {
        const idInsumo = input.closest('div').querySelector('input[name="insumo_id"]').value;
        const valor = input.value;
        const campoKey = `insumo_${idInsumo}`;

        // Validación requerido
        if (!valor.trim()) {
            erroresInsumos[campoKey] = "La cantidad es requerida";
            return;
        }

        // Validación número decimal
        if (!/^\d+(\.\d{1,2})?$/.test(valor)) {
            erroresInsumos[campoKey] = "Debe ser un número decimal válido";
            return;
        }

        // Validación mayor que 0
        if (parseFloat(valor) <= 0) {
            erroresInsumos[campoKey] = "La cantidad debe ser mayor a 0";
        }
    });

    return Object.keys(erroresInsumos).length === 0 ? null : erroresInsumos;
}

function mostrarErroresInsumos(errores) {
    // Limpiar todos los errores primero
    document.querySelectorAll('.error-insumo').forEach(span => {
        span.classList.add('hidden');
        span.textContent = '';
    });

    // Mostrar nuevos errores usando el id_insumo
    Object.entries(errores).forEach(([campoKey, mensaje]) => {
        const idInsumo = campoKey.split('_')[1]; // Ejemplo: "insumo_123" → idInsumo = "123"

        // Buscar el contenedor del insumo por su id
        const inputInsumo = document.querySelector(`input[name="insumo_id"][value="${idInsumo}"]`);
        if (!inputInsumo) return;

        const contenedor = inputInsumo.closest('div');
        const errorSpan = contenedor.querySelector('.error-insumo');

        if (errorSpan) {
            errorSpan.textContent = mensaje;
            errorSpan.classList.remove('hidden');
        }
    });
}

// ====================================================================
// Funciones para manejar el DOM y mostrar modales y alertas
// ====================================================================
// Funcion generica para abrir un modal en base a la clase hidden
function abrirModalPrincipal(tipo) {
    const backdrop = document.getElementById('modalBackdrop');
    const modalForm = document.getElementById('modalForm');

    backdrop.classList.remove('hidden');
    document.getElementById('modal-titulo').textContent =
        tipo === 'editar' ? 'Editar galleta' : 'Añadir galleta';
    modalForm.classList.remove('hidden');
}

function cerrarModalPrincipal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
    document.getElementById('modalForm').classList.add('hidden');
    limpiarFormularioGalleta();
    recetasDisponibles = [];
    document.getElementById('recetas-container').innerHTML = '';
}

function abrirModalSecundario(tipo) {
    const idGalleta = parseInt(document.querySelector('input[name="galleta_id"]').value);
    const existeRecetaBase = recetasDisponibles.some(r => r.es_base);

    // Validación para nuevas galletas
    // No permite agregar más de una receta al agregar una nueva receta
    if (idGalleta === 0 && existeRecetaBase && tipo === 'añadir') {
        alertas.alertaRecetas("Solo 1 receta base permitida para nuevas galletas");
        return;
    }

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
    limpiarFormularioReceta();
}

// ====================================================================
// Funciones para hacer las conexiones con la aplicaion Flask
// ====================================================================
// Inicializar el modulo
async function inicializarModuloGalletas() {
    await consultarInsumos();
    cargarGalletas();
}
// Funcion para cargar los insumos inicialmente
async function consultarInsumos() {
    const container = document.getElementById('galletas-container');
    tabs.mostrarEsqueletoCardGalleta(container);
    await api.getJSON('/insumos/get_all_insumos_unidad')
        .then(data => {
            if (data) insumosDisponibles = data;
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al cargar insumos', 'error');
        });
}

// FUNCIONES PROPIAS DE GALLETAS
// funcion para cargar las galletas con la aplicacion flask
function cargarGalletas() {
    const container = document.getElementById('galletas-container');
    tabs.mostrarEsqueletoCardGalleta(container);
    api.getJSON('/galletas/get_all_galletas')
        .then(data => {
            if (data) {
                generarCards(data);
                limpiarFormularioGalleta();
                limpiarFormularioReceta();
                document.getElementById('btn-agregar').disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al cargar las galletas', 'error');
        })
        .finally(() => tabs.desbloquearTabs());
}

// Función para generar las cards de las galletas
function generarCards(galletas) {
    const container = document.getElementById('galletas-container');
    container.innerHTML = '';
    galletas.forEach(galleta => {
        const card = document.createElement('div');
        card.className = 'bg-[#efe6dc] rounded-xl shadow-md overflow-hidden border border-gray-200 h-64 flex flex-col';
        card.innerHTML = `
            <div class="flex p-4 flex-1 flex-col h-[200px]">
                <div class="flex flex-1">
                    <div class="w-1/3 flex items-center justify-center">
                        <img src="../../../static/images/galleta ejemplo.png" 
                         alt="${galleta.nombre_galleta}" 
                         class="h-24 w-24 object-contain">
                    </div>
                
                    <div class="w-2/3 pl-4">
                        <h3 class="text-lg font-semibold text-black">${galleta.nombre_galleta}</h3>
                        <p class="text-sm text-black mt-1">100 pzas</p>
                        <p class="text-base font-semibold text-black mt-2">$${galleta.precio_unitario}</p>
                    </div>
                </div>
            </div>

            <div class="flex justify-items-center border-t border-black p-2">
                <button onclick="buscarGalletaPorId(${galleta.id_galleta})" class="flex-1 flex items-center justify-center p-2 cursor-pointer">
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

// funcion para buscar la galleta por id así como sus recetas
function buscarGalletaPorId(id_galleta) {

}

// Funcion para agregar una nueva galleta a la bd
function guardarGalleta() {
    // Validar el formulario de galleta
    let errores = validarFormularioGalleta();
    if (errores) {
        mostrarErrores(errores);
        return;
    }

    if (recetasDisponibles.length === 0) {
        alertas.alertaRecetas('Debes de agregar al menos la receta base');
        return;
    }

    let id_galleta = parseInt(document.querySelector('input[name="galleta_id"]').value);
    if (id_galleta !== 0) {
        editarGalleta();
    } else {
        agregarGalleta();
    }
}

function agregarGalleta() {
    let formData = obtenerDatosFormularioGalleta();
    let receta = recetasDisponibles[0];

    // Construir payload para el endpoint
    const payload = {
        nombre_galleta: formData.nombre_galleta,
        descripcion_galleta: formData.descripcion_galleta,
        proteccion_precio: formData.proteccion_precio,
        gramos_galleta: formData.gramos_galleta,
        precio_unitario: formData.precio_unitario.toFixed(2),
        dias_caducidad: formData.dias_caducidad,
        receta: {
            nombre_receta: receta.nombre_receta,
            tiempo_horneado: receta.tiempo_horneado,
            galletas_producidas: receta.galletas_producidas,
            detalle_receta: receta.detalle_receta.map(insumo => ({
                insumo_id: insumo.insumo_id,
                cantidad: insumo.cantidad
            }))
        }
    };

    tabs.mostrarLoader();
    api.postJSON('/galletas/create_galleta', payload)
        .then(data => {
            cerrarModalPrincipal();
            if (data.status === 200 || data.status === 201) {
                alertas.procesoTerminadoExito();
                cargarGalletas();
            } else {
                alertas.procesoTerminadoSinExito();
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al guardar la galleta', 'error');
        })
        .finally(() => tabs.ocultarLoader());
}

// Funcion para eliminar una galleta de la bd
function eliminarGalleta(id_galleta) {
    alert('ID de la galleta eliminada: ' + id_galleta);
}

// Obtener datos de la galleta del formulario del modal principal
function obtenerDatosFormularioGalleta() {
    return {
        id_galleta: parseInt(document.querySelector('input[name="galleta_id"]').value),
        nombre_galleta: document.querySelector('input[name="nombre_galleta"]').value,
        dias_caducidad: parseInt(document.querySelector('input[name="dias_caducidad"]').value),
        gramos_galleta: parseFloat(document.querySelector('input[name="gramos_galleta"]').value),
        proteccion_precio: parseFloat(document.querySelector('input[name="proteccion_precio"]').value),
        descripcion_galleta: document.querySelector('textarea[name="descripcion_galleta"]').value,
        precio_unitario: parseFloat(document.querySelector('input[name="precio_sugerido"]').value)
    };
}

// Función para calcular el precio sugerido basado en la protección de precio
function calcularPrecioSugerido() {
    if (recetasDisponibles.length === 0) return 0;

    const recetaBase = recetasDisponibles.find(r => r.es_base);
    if (!recetaBase) return 0;

    const proteccion = parseFloat(document.querySelector('input[name="proteccion_precio"]').value) || 0;
    const costoPorGalleta = recetaBase.costo_receta / recetaBase.galletas_producidas;
    const precioSugerido = costoPorGalleta + proteccion;

    return precioSugerido;
}

// Función para actualizar el campo de precio sugerido cuando cambia la protección
function actualizarPrecioSugerido() {
    const precioSugerido = calcularPrecioSugerido();
    document.querySelector('input[name="precio_sugerido"]').value = precioSugerido.toFixed(2);
}


// FUNCIONES PROPIAS DE LAS RECETAS
// Obtener datos de la receta del fomulario
function obtenerDatosFormularioReceta() {
    const idGalleta = parseInt(document.querySelector('input[name="galleta_id"]').value);
    const recetaId = document.getElementById('receta_id').value;
    const esRecetaExistente = recetasDisponibles.some(r => r.id_receta === recetaId);
    const esBase = esRecetaExistente
        ? recetasDisponibles.find(r => r.id_receta === recetaId).es_base
        : idGalleta === 0 && recetasDisponibles.length === 0;

    return {
        id_receta: recetaId !== '0' ? recetaId : `temp_${Date.now()}`,
        nombre_receta: document.querySelector('input[name="nombre_receta"]').value,
        tiempo_horneado: parseInt(document.querySelector('input[name="tiempo_horneado"]').value),
        galletas_producidas: parseInt(document.querySelector('input[name="galletas_producidas"]').value),
        costo_receta: parseFloat(document.querySelector('input[name="costo_receta"]').value),
        es_base: esBase,
        detalle_receta: Array.from(insumosSeleccionados).map(([id_insumo, datos]) => ({
            insumo_id: id_insumo,
            cantidad: parseFloat(datos.cantidad)
        }))
    };
}

function guardarRecetaLocal() {
    // Validar campos estáticos primero
    const erroresReceta = validarFormularioReceta();

    // Validar campos dinámicos de insumos
    const erroresInsumos = validarInsumosDinamicos();

    // Si hay errores de validación, mostrarlos y salir
    if (erroresReceta || erroresInsumos) {
        if (erroresReceta) mostrarErrores(erroresReceta);
        if (erroresInsumos) mostrarErroresInsumos(erroresInsumos);
        return;
    }

    // Ahora validar cantidad mínima de insumos
    if (insumosSeleccionados.size < 5) {
        alertas.alertaRecetas('La receta debe de tener por lo menos 5 insumos');
        return;
    }

    let formDataReceta = obtenerDatosFormularioReceta();
    const index = recetasDisponibles.findIndex(r => r.id_receta === formDataReceta.id_receta);

    if (index === -1) {
        // Nueva receta
        recetasDisponibles.push(formDataReceta);
    } else {
        // Actualizar existente
        recetasDisponibles[index] = formDataReceta;
    }

    generarRecetasCards();
    cerrarModalSecundario();
}

// funcion para generar las cards de las recetas
function generarRecetasCards() {
    const container = document.getElementById('recetas-container');
    container.innerHTML = '';
    container.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-4');

    recetasDisponibles.forEach(receta => {
        const card = document.createElement('div');
        card.className = 'w-full min-w-[250px] h-[210px] bg-[#efe6dc] rounded-xl shadow-md overflow-hidden border border-gray-200';

        // Mostrar costo solo si es receta base
        const costoHTML = receta.es_base
            ? `<p class="text-sm text-black">Costo receta: $${receta.costo_receta.toFixed(2)}</p>
                <p class="text-sm text-black">Costo galleta: $${(receta.costo_receta.toFixed(2) / receta.galletas_producidas).toFixed(2)}</p>    
            `
            : '';

        card.innerHTML = `
            <div class="flex flex-col p-3 space-y-2 h-full">
                <div class="space-y-1 flex-1">
                    <h3 class="text-lg font-semibold text-black break-words">${receta.nombre_receta}</h3>
                    <p class="text-black text-sm">${receta.tiempo_horneado} min</p>
                    <p class="text-black text-sm">${receta.galletas_producidas} und</p>
                    ${costoHTML}
                    <p class="text-sm text-black">Insumos: ${receta.detalle_receta.length}</p>
                </div>

                <div class="flex border-t border-black pt-1 mt-1">
                    <button onclick="editarReceta('${receta.id_receta}')" 
                            class="flex-1 flex items-center justify-center p-1 cursor-pointer">
                        <img src="../../../static/images/lapiz.png" class="w-7 h-7">
                    </button>
                    
                    <button onclick="eliminarReceta('${receta.id_receta}')" 
                            class="flex-1 flex items-center justify-center p-1 cursor-pointer">
                        <img src="../../../static/images/bote basura.png" class="w-7 h-7">
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function buscarRecetasPorId(id_galleta) {

}

function editarReceta(id_receta) {
    // Determinar si es receta temporal o de BD
    const esTemporal = id_receta.startsWith('temp_');

    if (esTemporal) {
        const receta = recetasDisponibles.find(r => r.id_receta === id_receta);
        cargarRecetaEnFormulario(receta);
    } else {
        console.log('receta existente cargando...')
    }
    abrirModalSecundario('editar');
}

function eliminarReceta(id_receta) {
    const idGalleta = parseInt(document.querySelector('input[name="galleta_id"]').value);
    const receta = recetasDisponibles.find(r => r.id_receta === id_receta);

    // Validar si es receta base de galleta nueva
    if (idGalleta === 0 && receta.es_base) {
        alertas.alertaRecetas("No puedes eliminar la receta base");
        return;
    }

    if (confirm('¿Eliminar esta receta?')) {
        recetasDisponibles = recetasDisponibles.filter(r => r.id_receta !== id_receta);
        generarRecetasCards();
    }
}

function cargarRecetaEnFormulario(receta) {
    limpiarFormularioReceta();

    // Campo oculto para el ID de la receta
    document.getElementById('receta_id').value = receta.id_receta;

    // Campos básicos
    document.querySelector('input[name="nombre_receta"]').value = receta.nombre_receta;
    document.querySelector('input[name="tiempo_horneado"]').value = receta.tiempo_horneado;
    document.querySelector('input[name="galletas_producidas"]').value = receta.galletas_producidas;
    document.querySelector('input[name="costo_receta"]').value = receta.costo_receta.toFixed(2);

    // Cargar insumos con sus cantidades
    receta.detalle_receta.forEach(insumo => {
        // Verificar si el insumo ya está seleccionado
        if (!insumosSeleccionados.has(insumo.insumo_id)) {
            seleccionarInsumo(insumo.insumo_id);
        }

        // Obtener el input de cantidad específico
        const inputCantidad = document.querySelector(
            `input[name="insumo_id"][value="${insumo.insumo_id}"]`
        ).closest('div').querySelector('input[type="number"]');

        if (inputCantidad) {
            inputCantidad.value = insumo.cantidad;
            actualizarCantidadInsumo(insumo.insumo_id, insumo.cantidad);
        }
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

    if (!insumosSeleccionados.has(id_insumo)) {
        const elemento = document.createElement('div');
        elemento.className = 'flex items-center gap-2 p-2 bg-gray-50 rounded-lg';
        elemento.innerHTML = `
            <input type="hidden" name="insumo_id" value="${id_insumo}">
            <span class="flex-1">${insumo.nombre}</span>
            <span class="flex-1">$${insumo.precio_unitario.toFixed(2)}</span>
            <input type="number" 
                min="0.0" 
                step="0.1" 
                placeholder="Cantidad" 
                class="w-24 p-1 border border-[#895645] rounded-full text-center"
                required
                oninput="actualizarCantidadInsumo(${id_insumo}, this.value); limpiarErroresInsumo(this)">
            <span class="w-12 text-sm">${insumo.unidad.simbolo}</span>
            <span class="error-insumo text-red-500 text-sm hidden ml-2"></span>
            <button onclick="eliminarInsumo(${id_insumo})" 
                    class="text-red-500 hover:text-red-700 cursor-pointer">
                ✕
            </button>
        `;

        contenedor.appendChild(elemento);
        insumosSeleccionados.set(id_insumo, {
            ...insumo,
            cantidad: 0
        });
        calcularCostoReceta();
        campo_busqueda.focus();
    }

    document.getElementById('sugerencias-insumos').classList.add('hidden');
    campo_busqueda.value = '';
}

function eliminarInsumo(id_insumo) {
    const inputInsumo = document.querySelector(`input[name="insumo_id"][value="${id_insumo}"]`);
    if (inputInsumo) {
        const contenedor = inputInsumo.closest('div');
        // Eliminar el error asociado
        const errorSpan = contenedor.querySelector('.error-insumo');
        if (errorSpan) {
            errorSpan.remove();
        }
        contenedor.remove();
    }
    insumosSeleccionados.delete(id_insumo);
    calcularCostoReceta();
}

function actualizarCantidadInsumo(id_insumo, cantidad) {
    if (insumosSeleccionados.has(id_insumo)) {
        const insumo = insumosSeleccionados.get(id_insumo);
        insumo.cantidad = parseFloat(cantidad) || 0;
        insumosSeleccionados.set(id_insumo, insumo);
        calcularCostoReceta();
    }
}

function calcularCostoReceta() {
    let costoTotal = 0;

    // Iteramos sobre el Map
    insumosSeleccionados.forEach((insumo) => {
        costoTotal += insumo.precio_unitario * insumo.cantidad;
    });

    // Actualizamos el campo
    document.querySelector('input[name="costo_receta"]').value = costoTotal.toFixed(2);
}

// FUNCIONES PARA LIMPIAR CAMPOS O ERRORES
function limpiarFormularioGalleta() {
    // campos de galleta
    document.querySelector('input[name="galleta_id"]').value = 0;
    document.querySelector('input[name="nombre_galleta"]').value = '';
    document.querySelector('input[name="dias_caducidad"]').value = '';
    document.querySelector('input[name="gramos_galleta"]').value = '';
    document.querySelector('input[name="proteccion_precio"]').value = '';
    document.querySelector('input[name="precio_sugerido"]').value = '';
    document.querySelector('textarea[name="descripcion_galleta"]').value = '';

    limpiarErrores();
}

function limpiarFormularioReceta() {
    // campos de receta
    document.querySelector('input[name="nombre_receta"]').value = '';
    document.querySelector('input[name="tiempo_horneado"]').value = '';
    document.querySelector('input[name="galletas_producidas"]').value = '';
    document.querySelector('input[name="costo_receta"]').value = '';

    // Limpiar insumos
    insumosSeleccionados.clear();
    document.getElementById('insumos-seleccionados').innerHTML = '';

    limpiarErrores();
}

function limpiarErroresInsumo(input) {
    const errorSpan = input.closest('div').querySelector('.error-insumo');
    if (errorSpan) {
        errorSpan.classList.add('hidden');
        errorSpan.textContent = '';
    }
}

// Funcion para inicializar el modulo
window.inicializarModuloGalletas = inicializarModuloGalletas;

// Funciones del modal secundario
window.abrirModalSecundario = abrirModalSecundario;
window.cerrarModalSecundario = cerrarModalSecundario;
window.guardarRecetaLocal = guardarRecetaLocal;
window.actualizarCantidadInsumo = actualizarCantidadInsumo;
window.limpiarErroresInsumo = limpiarErroresInsumo;

// Funciones para el modal primario
window.abrirModalPrincipal = abrirModalPrincipal;
window.cerrarModalPrincipal = cerrarModalPrincipal;

window.guardarGalleta = guardarGalleta;
window.eliminarGalleta = eliminarGalleta;

window.filtrarInsumos = filtrarInsumos;
window.seleccionarInsumo = seleccionarInsumo;
window.eliminarInsumo = eliminarInsumo;

window.actualizarPrecioSugerido = actualizarPrecioSugerido;

window.editarReceta = editarReceta;
window.eliminarReceta = eliminarReceta;

// exponer funciones del conversor de unidades globalmente
window.cambiarPestana = cambiarPestana;
window.convertirUnidad = convertirUnidad;
window.abrirConversor = abrirConversor;
window.cerrarConversor = cerrarConversor;
window.limpiarCampos = limpiarCampos;