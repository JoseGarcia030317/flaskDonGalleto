import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';

let insumosDisponibles = [];
let recetasDisponibles = [];

// ====================================================================
// Funciones para manejar el DOM y mostrar modales y alertas
// ====================================================================
function abrirModal() {
    const backdrop = document.getElementById('modalBackdrop');
    const modalForm = document.getElementById('modalForm');

    backdrop.classList.remove('hidden');
    modalForm.classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
    document.getElementById('modalForm').classList.add('hidden');
    document.getElementById('recetas-container').innerHTML = '';
}

// ====================================================================
// Funciones para hacer las conexiones con la aplicaion Flask de galletas
// ====================================================================
async function inicializarModuloSolicitudProduccion() {
    await consultarInsumos();
    await cargarGalletas();
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

// funcion para cargar las galletas con la aplicacion flask
async function cargarGalletas() {
    const container = document.getElementById('galletas-container');
    tabs.mostrarEsqueletoCardGalleta(container);
    await api.getJSON('/galletas/get_all_galletas')
        .then(data => {
            if (data) {
                generarCards(data);
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
                        <p class="text-sm text-black mt-1">Existencias: ${galleta.existencias}</p>
                        <p class="text-base font-semibold text-black mt-2">$${galleta.precio_unitario}</p>
                    </div>
                </div>
            </div>

            <div class="flex justify-items-center border-t border-black p-2">
                <button onclick="buscarGalletaPorId(${galleta.id_galleta})" class="flex-1 flex items-center justify-center p-2 cursor-pointer">
                    <img src="../../../static/images/mixing.png" class="w-7 h-7">
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
                cargarRecetasLocal(data.recetas)
                generarRecetasCards();
                abrirModal();
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al cargar la galleta', 'error');
        })
        .finally(() => tabs.ocultarLoader());
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
                    <button onclick="solicitarProduccion('${receta.id_receta}')" 
                            class="flex-1 flex items-center justify-center p-1 cursor-pointer">
                        <img src="../../../static/images/mixing.png" class="w-7 h-7">
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function cargarRecetasLocal(recetas) {
    recetasDisponibles = recetas.map(receta => ({
        id_receta: receta.id_receta,
        nombre_receta: receta.nombre_receta,
        tiempo_horneado: receta.tiempo_horneado,
        galletas_producidas: receta.galletas_producidas,
        costo_receta: calcularCostoRecetaDesdeDetalle(receta.detalle_receta),
        es_base: receta.receta_base === 1,
        detalle_receta: receta.detalle_receta
    }));
}

function calcularCostoRecetaDesdeDetalle(detalle) {
    return detalle.reduce((total, insumo) => {
        const insumoDB = insumosDisponibles.find(i => i.id_insumo === insumo.insumo_id);

        if (!insumoDB) {
            console.error(`Insumo con ID ${insumo.insumo_id} no encontrado.`);
            return total;
        }

        const precio = parseFloat(insumoDB.precio_unitario);
        const cantidad = parseFloat(insumo.cantidad);

        if (isNaN(precio) || isNaN(cantidad)) {
            console.error(`Valores inválidos en insumo ${insumo.insumo_id}: Precio=${insumoDB.precio_unitario}, Cantidad=${insumo.cantidad}`);
            return total;
        }

        return total + (precio * cantidad);
    }, 0);
}

function solicitarProduccion(id_receta) {
    const receta = recetasDisponibles.find(r => String(r.id_receta) === String(id_receta));
    if (!receta) {
        alertas.mostrarAlerta('Error', 'Receta no encontrada', 'error');
        return;
    }

    const insumos = receta.detalle_receta.map(insumo => ({
        id_insumo: insumo.insumo_id,
        cantidad: insumo.cantidad
    }));

    tabs.mostrarLoader();
    api.postJSON('/horneado/solicitar_horneado', { receta_id: id_receta })
        .then(data => {
            if (data.id_horneado) {
                alertas.procesoTerminadoExito();
            }
            if (data.estatus === 400) {
                let mensaje = '';
                data.insumos_faltantes.forEach(insumo => {
                    mensaje += insumo.nombre + '<br>'
                });
                alertas.alertaFaltaDeInsumos(mensaje);
            }
            cerrarModal();
        })
        .catch(error => {
            alertas.alertaRecetas('Error al solicitar producción');
            cerrarModal();
        })
        .finally(() => tabs.ocultarLoader());
}

window.inicializarModuloSolicitudProduccion = inicializarModuloSolicitudProduccion;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.buscarGalletaPorId = buscarGalletaPorId;
window.solicitarProduccion = solicitarProduccion;