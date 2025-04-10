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

function abrirModalSecundario(tipo, idReceta = null) {
    const idGalleta = parseInt(document.querySelector('input[name="galleta_id"]').value);
    const recetaBase = recetasDisponibles.find(r => r.es_base);

    if (idGalleta === 0 && tipo === 'añadir' && recetasDisponibles.length !== 0) {
        alertas.alertaRecetas('Al crear una galleta nueva, solo puedes añadir la receta base');
        return;
    }

    // Limpiar formulario si es nueva receta
    if (tipo === 'añadir') limpiarFormularioReceta();

    // Si es agregar una nueva receta cuando es una edicion de galleta
    if (tipo === 'añadir' && idGalleta !== 0) {
        if (!recetaBase) {
            alertas.alertaRecetas('Primero debe existir una receta base');
            return;
        }
        copiarRecetaBase(recetaBase);
        generarRecetasCards();
        tipo = 'editar';
    }

    const backdrop = document.getElementById('modalBackdropSecundario');
    const modalForm = document.getElementById('modalFormSecundario');

    document.getElementById('modal-titulo-secundario').textContent =
        tipo === 'editar' ? 'Editar receta' : 'Añadir receta';

    backdrop.classList.remove('hidden');
    modalForm.classList.remove('hidden');
}

function cerrarModalSecundario() {
    document.getElementById('modalBackdropSecundario').classList.add('hidden');
    document.getElementById('modalFormSecundario').classList.add('hidden');
    limpiarFormularioReceta();
}

// ====================================================================
// Funciones para hacer las conexiones con la aplicaion Flask de galletas
// ====================================================================
// Inicializar el modulo
async function inicializarModuloGalletas() {
    await consultarInsumos();
    cargarGalletas();
}

// Funcion para cargar los insumos inicialmente
async function consultarInsumos() {
    await api.getJSON('/insumos/get_all_insumos_unidad')
        .then(data => {
            if (data) insumosDisponibles = data;
        })
        .catch(error => {
            Swal.fire('Error', 'Error al cargar insumos', 'error');
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
            if (!data) {
                container.innerHTML = `
                    <div class="flex justify-center items-center min-h-screen">
                        <p class="text-gray-500 font-medium text-xl">No hay galletas registradas</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            Swal.fire('Error', 'Error al cargar las galletas', 'error');
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
                        <p class="text-sm text-black mt-1">Existencias: ${galleta.existencias}</p>
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
    tabs.mostrarLoader();
    api.postJSON('/galletas/get_galleta_by_id', { id_galleta })
        .then(data => {
            if (data.id_galleta) {
                cargarGalletaEnFormulario(data);
                abrirModalPrincipal('editar');
            }
        })
        .catch(error => {
            Swal.fire('Error', 'Error al cargar la galleta', 'error');
        })
        .finally(() => tabs.ocultarLoader());
}

// Función para cargar datos de galleta en formulario
function cargarGalletaEnFormulario(galleta) {
    galleta = normalizarReceta(galleta);
    // Campos principales
    document.querySelector('input[name="galleta_id"]').value = galleta.id_galleta;
    document.querySelector('input[name="nombre_galleta"]').value = galleta.nombre_galleta;
    document.querySelector('input[name="dias_caducidad"]').value = galleta.dias_caducidad;
    document.querySelector('input[name="gramos_galleta"]').value = galleta.gramos_galleta;
    document.querySelector('input[name="proteccion_precio"]').value = galleta.proteccion_precio;
    document.querySelector('textarea[name="descripcion_galleta"]').value = galleta.descripcion_galleta || '';
    document.querySelector('input[name="precio_sugerido"]').value = galleta.precio_unitario;

    // Cargar recetas
    recetasDisponibles = galleta.recetas.map(receta => ({
        id_receta: receta.id_receta,
        nombre_receta: receta.nombre_receta,
        tiempo_horneado: receta.tiempo_horneado,
        galletas_producidas: receta.galletas_producidas,
        costo_receta: calcularCostoRecetaDesdeDetalle(receta.detalle_receta),
        es_base: receta.receta_base === 1,
        detalle_receta: receta.detalle_receta
    }));

    generarRecetasCards();

    let recetaBase = recetasDisponibles.find(r => r.es_base);
    if (!recetaBase) return;

    // 1. Calcular nuevo costo unitario
    const nuevoCostoPorGalleta = recetaBase.costo_receta / recetaBase.galletas_producidas;

    // 2. Obtener valores originales almacenados
    const precioOriginal = galleta.precio_unitario;
    const proteccionOriginal = galleta.proteccion_precio;
    const costoProduccionOriginal = precioOriginal - proteccionOriginal;

    // 3. Comparar costos
    if (nuevoCostoPorGalleta > parseFloat(costoProduccionOriginal.toFixed())) {
        const aumento = nuevoCostoPorGalleta - costoProduccionOriginal;
        const nuevoPrecioSugerido = nuevoCostoPorGalleta + proteccionOriginal;

        alertas.alertaAumentoCostoProduccion(
            aumento.toFixed(2),
            parseFloat(nuevoPrecioSugerido).toFixed(2)
        ).then((confirmar) => {
            if (confirmar) {
                // Actualizar campo de precio sugerido
                document.querySelector('input[name="precio_sugerido"]').value = parseFloat(nuevoPrecioSugerido).toFixed(2);
            }
        });
    }
}

// Funcion para agregar una nueva galleta a la bd
function guardarGalleta() {
    const errores = validarFormularioGalleta();
    if (errores) {
        mostrarErrores(errores);
        return;
    }

    const idGalleta = parseInt(document.querySelector('input[name="galleta_id"]').value);

    // Validación específica para edición
    if (idGalleta !== 0) {
        const recetasBase = recetasDisponibles.filter(r => r.es_base);
        if (recetasBase.length !== 1) {
            alertas.alertaRecetas("Debe haber exactamente 1 receta base");
            return;
        }
    }

    if (recetasDisponibles.length === 0) {
        alertas.alertaRecetas('Debes agregar al menos la receta base');
        return;
    }

    idGalleta !== 0 ? editarGalleta() : agregarGalleta();
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
            Swal.fire('Error', 'Error al guardar la galleta', 'error');
        })
        .finally(() => tabs.ocultarLoader());
}

// Función para editar galleta
function editarGalleta() {
    const formData = obtenerDatosFormularioGalleta();

    const payload = {
        id_galleta: formData.id_galleta,
        nombre_galleta: formData.nombre_galleta,
        descripcion_galleta: formData.descripcion_galleta,
        proteccion_precio: formData.proteccion_precio,
        gramos_galleta: formData.gramos_galleta,
        precio_unitario: formData.precio_unitario,
        dias_caducidad: formData.dias_caducidad,
        recetas: recetasDisponibles.map(receta => ({
            id_receta: String(receta.id_receta).startsWith('temp_') ? null : parseInt(receta.id_receta),
            nombre_receta: receta.nombre_receta,
            tiempo_horneado: receta.tiempo_horneado,
            galletas_producidas: receta.galletas_producidas,
            detalle_receta: receta.detalle_receta.map(insumo => ({
                insumo_id: insumo.insumo_id,
                cantidad: insumo.cantidad
            }))
        }))
    };

    // Validación extra para nuevas recetas
    payload.recetas.forEach(receta => {
        if (!receta.id_receta) {
            delete receta.id_receta;
        }
    });

    tabs.mostrarLoader();
    console.log(payload);

    api.postJSON('/galletas/update_galleta', payload)
        .then(response => {
            if ((response?.status === 200 || response?.status === 201) && response?.id_galleta) {
                alertas.procesoTerminadoExito();
                cerrarModalPrincipal();
                cargarGalletas();
            } else {
                throw new Error('Error en la actualización');
            }
        })
        .catch(error => {
            Swal.fire('Error', 'Error al actualizar la galleta', 'error');
        })
        .finally(() => tabs.ocultarLoader());
}

// Funcion para eliminar una galleta de la bd
function eliminarGalleta(id_galleta) {
    alertas.confirmarEliminar()
    .then(resultado => {
        if (!resultado.isConfirmed) return Promise.reject('cancelado');
        
        tabs.mostrarLoader();
        return api.postJSON('/galletas/delete_galleta', { id_galleta: id_galleta });
    })
    .then(data => {
        if ((data?.status === 200 || data?.status === 201) && data?.id_galleta) {
            alertas.procesoTerminadoExito();
            cerrarModalPrincipal();
            cargarGalletas();
        } else {
            throw new Error(data?.error || 'Error al eliminar la galleta');
        }
    })
    .catch(error => {
        if (error !== 'cancelado') {
            console.error('Error eliminando galleta:', error);
            Swal.fire('Error', 'No se pudo eliminar la galleta', 'error');
        }
    })
    .finally(() => tabs.ocultarLoader());
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


// ====================================================================
// Funciones para hacer las conexiones con la aplicaion Flask de recetas
// ====================================================================
function agregarRecetaDerivada() {
    const recetaBase = recetasDisponibles.find(r => r.es_base);

    if (!recetaBase) {
        alertas.alertaRecetas("Primero debe existir una receta base");
        return;
    }

    const nuevaReceta = {
        id_receta: `temp_${Date.now()}`,
        nombre_receta: `Copia de ${recetaBase.nombre_receta}`,
        tiempo_horneado: recetaBase.tiempo_horneado,
        galletas_producidas: recetaBase.galletas_producidas,
        es_base: false,
        detalle_receta: recetaBase.detalle_receta.map(insumo => ({
            ...insumo,
            cantidad: insumo.cantidad
        }))
    };

    recetasDisponibles.push(nuevaReceta);
    generarRecetasCards();
    abrirModalSecundario('editar', nuevaReceta.id_receta);
}

function editarReceta(id_receta) {
    const idBuscado = String(id_receta);

    const receta = recetasDisponibles.find(r =>
        String(r.id_receta) === idBuscado
    );

    if (!receta) {
        Swal.fire('Error', 'Receta no encontrada', 'error');
        return;
    }

    cargarRecetaEnFormulario(receta);
    abrirModalSecundario('editar');
}

// Obtener datos de la receta del fomulario
function obtenerDatosFormularioReceta() {
    const recetaId = document.getElementById('receta_id').value;
    const galletaId = parseInt(document.querySelector('input[name="galleta_id"]').value);

    const esRecetaExistente = recetasDisponibles.some(r => String(r.id_receta) === recetaId);
    let esRecetaBase = recetasDisponibles.some(r => String(r.id_receta) === recetaId && r.es_base);
    if (galletaId === 0 && !esRecetaExistente && !esRecetaBase) {
        esRecetaBase = true;
    }

    return {
        id_receta: esRecetaExistente ? recetaId : `temp_${Date.now()}`,
        nombre_receta: document.querySelector('input[name="nombre_receta"]').value,
        tiempo_horneado: parseInt(document.querySelector('input[name="tiempo_horneado"]').value),
        galletas_producidas: parseInt(document.querySelector('input[name="galletas_producidas"]').value),
        es_base: esRecetaBase,
        costo_receta: parseFloat(document.querySelector('input[name="costo_receta"]').value).toFixed(2) || 0.00,
        detalle_receta: Array.from(insumosSeleccionados).map(([id, data]) => ({
            insumo_id: id,
            cantidad: data.cantidad
        }))
    };
}

function guardarRecetaLocal() {
    const recetaId = document.getElementById('receta_id').value;
    const index = recetasDisponibles.findIndex(r => String(r.id_receta) === String(recetaId));

    // Validar campos dinámicos de insumos
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
    if (insumosSeleccionados.size < 1) {
        alertas.alertaRecetas('La receta debe tener al menos 1 insumos');
        return;
    }

    // Obtener datos ACTUALIZADOS del formulario
    const formData = obtenerDatosFormularioReceta();

    // Preservar propiedades críticas
    if (index !== -1) {
        formData.id_receta = recetasDisponibles[index].id_receta;
        formData.es_base = recetasDisponibles[index].es_base;
        recetasDisponibles[index] = formData;
    } else {
        recetasDisponibles.push(formData);
    }

    // Nueva validación: Margen de protección
    if (formData.es_base && !String(formData.id_receta).startsWith('temp_')) {
        const proteccion = parseFloat(document.querySelector('input[name="proteccion_precio"]').value) || 0;
        const costoPorGalleta = formData.costo_receta / formData.galletas_producidas;
        const precioActual = parseFloat(document.querySelector('input[name="precio_sugerido"]').value) || 0;
        const nuevoPrecio = costoPorGalleta + proteccion;

        // Si el nuevo precio supera al actual + 1% o el margen es negativo
        if (nuevoPrecio > precioActual * 1.01 || nuevoPrecio > precioActual) {
            alertas.alertaCambioMargen(
                costoPorGalleta.toFixed(2),
                nuevoPrecio.toFixed(2)
            ).then((confirmar) => {
                if (confirmar) {
                    document.querySelector('input[name="precio_sugerido"]').value = nuevoPrecio.toFixed(2);
                    formData.precio_sugerido = nuevoPrecio.toFixed(2);
                }
            });
        }
    }

    generarRecetasCards();
    cerrarModalSecundario();
}

function copiarRecetaBase(recetaBase) {
    // Crear copia de la receta base
    const nuevaReceta = {
        id_receta: `temp_${Date.now()}`,
        nombre_receta: `Copia de ${recetaBase.nombre_receta}`,
        tiempo_horneado: recetaBase.tiempo_horneado,
        galletas_producidas: recetaBase.galletas_producidas,
        es_base: false,
        detalle_receta: recetaBase.detalle_receta.map(insumo => ({
            insumo_id: insumo.insumo_id,
            cantidad: insumo.cantidad
        }))
    };

    // Agregar a las recetas disponibles
    recetasDisponibles.push(nuevaReceta);

    cargarRecetaEnFormulario(nuevaReceta);
}

// funcion para generar las cards de las recetas
function generarRecetasCards() {
    const container = document.getElementById('recetas-container');
    container.innerHTML = '';
    container.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-4');

    recetasDisponibles.forEach(receta => {
        const card = document.createElement('div');
        card.className = 'w-full min-w-[250px] h-[220px] bg-[#efe6dc] rounded-xl shadow-md overflow-hidden border border-gray-200';

        let costo_receta = receta.costo_receta || calcularCostoRecetaDesdeDetalle(receta.detalle_receta);
        costo_receta = parseFloat(costo_receta).toFixed(2);

        const costoHTML = receta.es_base
            ? `<p class="text-sm text-black">Costo receta: $${costo_receta}</p>
           <p class="text-sm text-black">Costo/galleta: $${(costo_receta / receta.galletas_producidas).toFixed(2)}</p>`
            : '';

        const esBase = receta.es_base ?
            '<span class="text-green-600 text-xs">(Receta Base)</span>' :
            '<span class="text-blue-600 text-xs">(Receta Derivada)</span>';

        card.innerHTML = `
            <div class="flex flex-col p-3 space-y-2 h-full">
                <div class="space-y-1 flex-1">
                    <h3 class="text-lg font-semibold text-black break-words">${receta.nombre_receta}</h3>
                    ${esBase}
                    <div class="grid grid-cols-2">
                        <p class="text-black text-sm">${receta.tiempo_horneado} min</p>
                        <p class="text-black text-sm">${receta.galletas_producidas} und</p>
                    </div>
                    ${costoHTML}
                    <p class="text-sm text-black">Insumos: ${receta.detalle_receta.length}</p>
                </div>

                <div class="flex border-t border-black pt-1 mt-1">
                    <button onclick="editarReceta('${String(receta.id_receta)}')" 
                            class="flex-1 flex items-center justify-center p-1 cursor-pointer">
                        <img src="../../../static/images/lapiz.png" class="w-7 h-7">
                    </button>
                    
                    <button onclick="eliminarReceta('${String(receta.id_receta)}')" 
                            class="flex-1 flex items-center justify-center p-1 cursor-pointer">
                        <img src="../../../static/images/bote basura.png" class="w-7 h-7">
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function eliminarReceta(id_receta) {
    const idBuscado = String(id_receta);
    const index = recetasDisponibles.findIndex(r => String(r.id_receta) === idBuscado);

    // Validación de receta base
    if (recetasDisponibles[index]?.es_base) {
        alertas.alertaRecetas('No se puede eliminar la receta base')
        return;
    }

    alertas.confirmarEliminar()
        .then(resultado => {
            if (!resultado.isConfirmed) return;

            // Eliminación local para IDs temporales
            if (idBuscado.startsWith('temp_')) {
                recetasDisponibles.splice(index, 1);
                generarRecetasCards();
                alertas.procesoTerminadoExito();
                return;
            } else {
                alertas.alertaRecetas('Para eliminar la receta, debe eliminar la galleta que la contiene')
                return;
            }
        })
}

async function cargarRecetaEnFormulario(receta) {
    tabs.mostrarLoader();
    await consultarInsumos()
        .then(() => {
            limpiarFormularioReceta();

            // Resetear estado GLOBAL de insumos
            insumosSeleccionados.clear();
            document.getElementById('insumos-seleccionados').innerHTML = '';

            // Calcular y mostrar costo inicial
            let costo = receta.costo_receta || calcularCostoRecetaDesdeDetalle(receta.detalle_receta);
            costo = parseFloat(costo).toFixed(2);
            document.querySelector('input[name="costo_receta"]').value = costo;

            // Cargar datos PRIMARIOS
            document.getElementById('receta_id').value = receta.id_receta;
            document.querySelector('input[name="nombre_receta"]').value = receta.nombre_receta;
            document.querySelector('input[name="tiempo_horneado"]').value = receta.tiempo_horneado;
            document.querySelector('input[name="galletas_producidas"]').value = receta.galletas_producidas;
            if (receta.es_base) {
                document.querySelector('input[name="galletas_producidas"]').removeAttribute('oninput');
            } else {
                document.querySelector('input[name="galletas_producidas"]').setAttribute('oninput', 'actualizarProporciones()');
            }

            receta.detalle_receta.forEach(insumo => {
                const insumoCompleto = insumosDisponibles.find(i => i.id_insumo === insumo.insumo_id);

                if (insumoCompleto) {
                    const divInsumo = document.createElement('div');
                    divInsumo.className = 'flex items-center gap-2 p-2 bg-gray-50 rounded-lg';
                    divInsumo.innerHTML = `
                        <input type="hidden" name="insumo_id" value="${insumo.insumo_id}">
                        <span class="flex-1">${insumoCompleto.nombre}</span>
                        <span class="flex-1">$${insumoCompleto.precio_unitario.toFixed(2)}</span>
                        <input type="number" 
                            min="0.0" 
                            step="0.1" 
                            value="${insumo.cantidad}"
                            class="w-24 p-1 border border-[#895645] rounded-full text-center"
                            ${!receta.es_base ? 'readonly' : ''}
                            oninput="actualizarCantidadInsumo(${insumo.insumo_id}, this.value); limpiarErroresInsumo(this)">
                        <span class="w-12 text-sm">${insumoCompleto.simbolo}</span>
                        ${receta.es_base ? `
                        <button onclick="eliminarInsumo(${insumo.insumo_id})" 
                                class="text-red-500 hover:text-red-700 cursor-pointer">
                            ✕
                        </button>
                        ` : ''}
                        <span class="error-insumo text-red-500 text-sm hidden ml-2"></span>
                    `;

                    document.getElementById('insumos-seleccionados').appendChild(divInsumo);
                    insumosSeleccionados.set(insumo.insumo_id, {
                        ...insumoCompleto,
                        cantidad: insumo.cantidad
                    });
                }
            });

            document.getElementById('buscador-insumos').disabled = !receta.es_base;
        })
        .finally(() => tabs.ocultarLoader());
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
                <span>$${insumo.precio_unitario.toFixed(2)}</span>
                <span class="text-sm text-gray-500">(${insumo.simbolo})</span>
            </div>
        `).join('');
        sugerencias.classList.remove('hidden');
    } else {
        sugerencias.classList.add('hidden');
    }
}

function seleccionarInsumo(id_insumo, esProgramatico = false) {
    const insumo = insumosDisponibles.find(i => i.id_insumo === id_insumo);
    const contenedor = document.getElementById('insumos-seleccionados');
    const campo_busqueda = document.getElementById('buscador-insumos');
    const recetaId = document.getElementById('receta_id').value;
    const receta = recetasDisponibles.find(r => r.id_receta === recetaId);

    if (!esProgramatico && receta && !receta.es_base) {
        alertas.alertaRecetas("Solo puedes modificar insumos en la receta base");
        return;
    }

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
            <span class="w-12 text-sm">${insumo.simbolo}</span>
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
    const recetaId = document.getElementById('receta_id').value;
    const receta = recetasDisponibles.find(r => r.id_receta == recetaId);

    if (receta && !receta.es_base) {
        alertas.alertaRecetas("Solo puedes eliminar insumos en la receta base");
        return;
    }

    const elemento = document.querySelector(`input[name="insumo_id"][value="${id_insumo}"]`)?.closest('div');
    if (elemento) {
        elemento.remove();
        insumosSeleccionados.delete(id_insumo);
        calcularCostoReceta();
    }
}

// Funcion para actualizar la cantidad de un insumo seleccionado y actualizar el costo de la receta
function actualizarCantidadInsumo(id_insumo, cantidad) {
    if (insumosSeleccionados.has(id_insumo)) {
        const insumo = insumosSeleccionados.get(id_insumo);
        insumo.cantidad = parseFloat(cantidad) || 0;
        insumosSeleccionados.set(id_insumo, insumo);
        calcularCostoReceta();
    }
}

// Funcion para calcular el costo total de la receta
function calcularCostoReceta() {
    let costoTotal = 0;

    // Iteramos sobre el Map
    insumosSeleccionados.forEach((insumo) => {
        costoTotal += insumo.precio_unitario * insumo.cantidad;
    });

    // Actualizamos el campo
    document.querySelector('input[name="costo_receta"]').value = costoTotal.toFixed(2);

    // Solo si es receta base y está en modo edición
    const recetaId = document.getElementById('receta_id').value;
    const receta = recetasDisponibles.find(r => String(r.id_receta) === String(recetaId));

    if (receta?.es_base) {
        // Forzar actualización en el modal principal
        actualizarPrecioSugerido();
    }
}

// Funcion para actualizar el valor de las cantidades de los insumos en base a una proporcion con la receta base
function actualizarProporciones() {
    const recetaActualId = document.getElementById('receta_id').value;
    const recetaActual = recetasDisponibles.find(r => String(r.id_receta) === String(recetaActualId));

    // Solo para recetas derivadas
    if (!recetaActual || recetaActual.es_base) return;

    const recetaBase = recetasDisponibles.find(r => r.es_base);
    if (!recetaBase) {
        alertas.alertaRecetas('No se encontró la receta base');
        return;
    }

    const nuevasGalletas = parseFloat(document.querySelector('input[name="galletas_producidas"]').value) || 1;
    const proporcion = nuevasGalletas / recetaBase.galletas_producidas;

    // Actualizar cada insumo visible en el formulario
    document.querySelectorAll('#insumos-seleccionados div').forEach(divInsumo => {
        const inputId = divInsumo.querySelector('input[name="insumo_id"]').value;
        const inputCantidad = divInsumo.querySelector('input[type="number"]');
        const insumoBase = recetaBase.detalle_receta.find(i => String(i.insumo_id) === inputId);

        if (insumoBase && inputCantidad) {
            const nuevoValor = (insumoBase.cantidad * proporcion).toFixed(2);
            inputCantidad.value = nuevoValor;

            // Actualizar en el estado global aunque sea readonly
            if (insumosSeleccionados.has(parseInt(inputId))) {
                insumosSeleccionados.get(parseInt(inputId)).cantidad = parseFloat(nuevoValor);
            }
        }
    });

    // Recalcular costo
    calcularCostoReceta();
}

//Funcion para parsear y redondear el objeto de galleta
function normalizarReceta(obj) {
    const redondear = x => Math.round(Number(x) * 100) / 100;
  
    obj.gramos_galleta     = redondear(obj.gramos_galleta);
    obj.precio_unitario    = redondear(obj.precio_unitario);
    obj.proteccion_precio  = redondear(obj.proteccion_precio);
  
    for (let i = 0; i < obj.recetas.length; i++) {
      const receta = obj.recetas[i];
  
      receta.galletas_producidas = redondear(receta.galletas_producidas);
      receta.tiempo_horneado     = redondear(receta.tiempo_horneado);

      for (let j = 0; j < receta.detalle_receta.length; j++) {
        const det = receta.detalle_receta[j];
        det.cantidad   = redondear(det.cantidad);
        det.insumo_id  = redondear(det.insumo_id);
      }
    }
  
    return obj;
  }

// Funcion para redondear digitos de la receta
function redondearDosDecimales(num) {
    return Math.round(Number(num) * 100) / 100;
}

function calcularCostoRecetaDesdeDetalle(detalle) {
    let costo_receta = detalle.reduce((total, insumo) => {
        const insumoDB = insumosDisponibles.find(i => i.id_insumo === insumo.insumo_id);
        return insumoDB ? total + (insumoDB.precio_unitario * insumo.cantidad) : total;
    }, 0);
    return redondearDosDecimales(costo_receta);
}

// FUNCIONES PARA LIMPIAR CAMPOS O ERRORES
export function limpiarFormularioGalleta() {
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

export function limpiarFormularioReceta() {
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
window.actualizarProporciones = actualizarProporciones;

// Funciones para el modal primario
window.abrirModalPrincipal = abrirModalPrincipal;
window.cerrarModalPrincipal = cerrarModalPrincipal;

window.guardarGalleta = guardarGalleta;
window.eliminarGalleta = eliminarGalleta;
window.buscarGalletaPorId = buscarGalletaPorId;

window.filtrarInsumos = filtrarInsumos;
window.seleccionarInsumo = seleccionarInsumo;
window.eliminarInsumo = eliminarInsumo;

window.actualizarPrecioSugerido = actualizarPrecioSugerido;

window.editarReceta = editarReceta;
window.eliminarReceta = eliminarReceta;
window.agregarRecetaDerivada = agregarRecetaDerivada;

// exponer funciones del conversor de unidades globalmente
window.cambiarPestana = cambiarPestana;
window.convertirUnidad = convertirUnidad;
window.abrirConversor = abrirConversor;
window.cerrarConversor = cerrarConversor;
window.limpiarCampos = limpiarCampos;