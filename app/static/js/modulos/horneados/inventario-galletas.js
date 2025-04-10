import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';

let insumosDisponibles = [];
let recetasDisponibles = [];
let fecha = '';

function cargarInventarioGalletas() {
    generarCards();
    consultarInsumos();
}

function abrirModal() {
    const backdrop = document.getElementById('modalBackdrop');
    const modalForm = document.getElementById('modalForm');

    backdrop.classList.remove('hidden');
    modalForm.classList.remove('hidden');
}

// Función para generar las cards de las galletas
function generarCards() {
    const container = document.getElementById("galletas-container");
    tabs.mostrarEsqueletoCardGalleta(container);
    api.getJSON('galletas/get_all_galletas')
    .then(galletas => {
            container.innerHTML = '';
            galletas.forEach(galleta => {
                const card = document.createElement('div');
                card.className = 'bg-[#efe6dc] rounded-xl shadow-md overflow-hidden border border-gray-200';
                card.innerHTML = `
                    <div class="flex p-3 mb-1">
                        <div class="w-1/3 flex items-center justify-center">
                            <img src="../../../static/images/galleta ejemplo.png" alt="${galleta.nombre_galleta}" class="h-24 w-24 pl-2 object-contain">
                        </div>
                
                        <div class="flex items-center h-24">
                            <div class="max-w-32 pl-4">
                                <h3 class="text-lg font-semibold text-black">${galleta.nombre_galleta}</h3>
                                <p class="text-sm text-black mt-1">Existencias: ${galleta.existencias}</p>
                            </div>
                        </div>
                    </div>
                
                    <div class="border-t border-[#8A5114] p-1 flex items-center justify-center hover:bg-[rgba(145,90,23,0.15)]">
                        <button onclick="buscarGalletaPorId(${galleta.id_galleta})" class="text-[#8A5114] p-1 cursor-pointer flex flex-nowrap">
                            <img src="../../../static/images/horneado.png" class="w-5 h-5">
                            Añadir horneado
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        
        }); 
}

function buscarGalletaPorId(id_galleta) {
    tabs.mostrarLoader();
    api.postJSON('/galletas/get_galleta_by_id', { id_galleta })
        .then(data => {
            if (data.id_galleta) {
                document.getElementById('nombre_galleta').textContent= data.nombre_galleta;
                fecha = new Date();
                const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
                document.getElementById('fecha').textContent = fecha.toLocaleDateString('es-ES', opciones);
                cargarRecetasLocal(data.recetas)
                generarRecetasCards();
                abrirModal();
            }
        })
        .catch(error => {
            Swal.fire('Error', 'Error al cargar la galleta', 'error');
        })
        .finally(() => tabs.ocultarLoader());
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

function generarRecetasCards(){
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
                    <button onclick="agregarHorneado('${String(receta.id_receta)}')" 
                            class="flex-1 flex items-center justify-center p-1 cursor-pointer">
                        <img src="../../../static/images/mixing.png" class="w-7 h-7">
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

async function consultarInsumos() {
    const container = document.getElementById('galletas-container');
    tabs.mostrarEsqueletoCardGalleta(container);
    await api.getJSON('/insumos/get_all_insumos_unidad')
        .then(data => {
            if (data) insumosDisponibles = data;
        })
        .catch(error => {
            Swal.fire('Error', 'Error al cargar insumos', 'error');
        });
}

function agregarHorneado(id_receta){
    tabs.mostrarLoader();
    api.postJSON('/horneado/crear_horneado', {receta_id : id_receta})
            .then(data => {
                if (data.estatus === 400) {
                    let mensaje = '';
                    data.insumos_faltantes.forEach(insumo => {
                        mensaje += insumo.nombre + '<br>'
                    });
                    alertas.alertaFaltaDeInsumos(mensaje);
                } else if (data.id_horneado) {
                    alertas.procesoTerminadoExito();
                    cerrarModal();
                } else {
                    alertas.mostrarAlerta('Error', 'Error al solicitar producción', 'error');
                }
            })
            .catch(error => {
                alertas.procesoTerminadoSinExito();
            })
            .finally(() => tabs.ocultarLoader());
}

function cerrarModal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
    document.getElementById('modalForm').classList.add('hidden');
    document.getElementById('recetas-container').innerHTML = '';
}


window.cargarInventarioGalletas = cargarInventarioGalletas;
window.buscarGalletaPorId = buscarGalletaPorId;
window.cerrarModal = cerrarModal;
window.buscarGalletaPorId = buscarGalletaPorId;
window.agregarHorneado = agregarHorneado;
