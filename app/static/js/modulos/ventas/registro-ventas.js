import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';

let galletasDisponibles = []

// Tipos de venta
const TIPOS_VENTA = {
    piezas: { id: 2, label: 'Por pieza', descuento: 0 },
    gramaje: { id: 1, label: 'Por gramaje', descuento: 0 },
    medio: { id: 3, label: 'Bolsa 700 g', descuento: 0.05 },
    kilo: { id: 4, label: 'Bolsa kilo', descuento: 0.10 }
};

function abrirModal() {
    const backdrop = document.getElementById('modalBackdrop');
    const modalForm = document.getElementById('modalForm');

    backdrop.classList.remove('hidden');
    modalForm.classList.remove('hidden')
}

// Función para filtrar la tabla
function filtrarTabla() {
    const textoBusqueda = document.querySelector('input[name="buscar-insumo"]').value.toLowerCase();
    const filas = document.querySelectorAll('#tbody_insumos tr');
    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();

        if (textoFila.includes(textoBusqueda)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

// Funcino para cerrar los distintos modales
function cerrarModal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
    document.getElementById('modalForm').classList.add('hidden');
    document.querySelector('input[name="buscar-insumo"]').value = '';
}

// Funcion para obtener el tipo de venta selccionado, inicia en piezas
function getTipoVenta() {
    const sel = document.querySelector('input[name="tipoVenta"]:checked');
    return sel?.value || 'piezas';
}

// Funcion para calcular el total de la venta tomando en cuenta el descuento
function recalcTotal() {
    const filas = Array.from(document.querySelectorAll('#tbody_producto tr'));
    let subtotal = 0;
    filas.forEach(fila => {
        const descuento = fila.querySelector('.cell-subtotal').textContent;
        subtotal += parseFloat(descuento) || 0;
    });
    const descuentoPct = parseFloat(document.getElementById('descuento').value) || 0;
    const totalConDesc = subtotal * (1 - descuentoPct / 100);
    document.getElementById('total-general').textContent = `$${totalConDesc.toFixed(2)}`;
}

// Calcula cuántas galletas son según tipo y factor de venta
function calcCantidadGalletas(tipoKey, factor, gramosPorPieza) {
    let cantidad;
    switch (tipoKey) {
        case 'piezas':
            cantidad = factor;
            break;
        case 'gramaje':
            cantidad = factor / gramosPorPieza;
            break;
        case 'medio':
            cantidad = (factor * 700) / gramosPorPieza;
            break;
        case 'kilo':
            cantidad = (factor * 1000) / gramosPorPieza;
            break;
        default:
            cantidad = factor;
    }
    // Nos quedamos con la parte entera
    return Math.floor(cantidad);
}

// Funcion para crear el renglon de la tabla
function handleCardClick(galleta) {
    const tipoKey = getTipoVenta();
    const { id: tipoId, label: tipoLabel, descuento } = TIPOS_VENTA[tipoKey];

    const exist = Number(galleta.existencias);
    const gramos = Number(galleta.gramos_galleta);
    const precioPieza = Number(galleta.precio_unitario);

    // 1) Determinar precioUnit, step y max según tipoKey
    let precioUnit, step, max;
    let allowDecimals = false;
    switch (tipoKey) {
        case 'piezas':
            precioUnit = precioPieza;
            step = 1;
            max = exist;
            allowDecimals = false;
            break;
        case 'gramaje':
            precioUnit = precioPieza / gramos;
            step = gramos;
            max = exist * gramos;
            allowDecimals = true;
            break;
        case 'medio':
            precioUnit = precioPieza * Math.floor(700 / gramos) * (1 - descuento);
            step = 1;
            max = Math.floor((exist * gramos) / 700);
            allowDecimals = false;
            break;
        case 'kilo':
            precioUnit = precioPieza * Math.floor(1000 / gramos) * (1 - descuento);
            step = 1;
            max = Math.floor((exist * gramos) / 1000);
            allowDecimals = false;
            break;
    }

    const rowId = `row-${galleta.id_galleta}-${tipoId}`;
    let fila = document.getElementById(rowId);

    // 2) Cuántas piezas añade este click (equivalente)
    const newPieces = calcCantidadGalletas(tipoKey, step, gramos);

    // 3) Cuántas piezas ya están vendidas en otras filas
    const sumExcl = getPiezasGalletaSeleccionada(galleta.id_galleta, fila);

    // 4) Cuántas piezas hay en esta fila actualmente
    const oldPieces = fila
        ? calcCantidadGalletas(
            fila.dataset.tipoVentaKey,
            Number(fila.querySelector('.input-cant').value),
            Number(fila.dataset.gramosPieza)
        )
        : 0;

    // 5) Validación de stock global
    if (sumExcl + oldPieces + newPieces > exist) {
        alertas.alertaWarning('Stock insuficiente para esta galleta');
        return;
    }

    // 6) Crear o actualizar la fila
    const tbody = document.getElementById('tbody_producto');
    const stepAttr = allowDecimals ? 'any' : step;
    const inputMode = allowDecimals ? 'decimal' : 'numeric';
    const oninputAttr = allowDecimals
        ? ''
        : 'this.value = this.value.replace(/\\D/g, \'\')';
    if (!fila) {
        // Crear nueva fila
        fila = document.createElement('tr');
        fila.id = rowId;
        fila.dataset.gramosPieza = gramos;
        fila.dataset.tipoVentaKey = tipoKey;
        fila.dataset.tipoVentaId = tipoId;

        // Cantidad inicial de galletas
        const cantG = calcCantidadGalletas(tipoKey, step, gramos);
        fila.dataset.cantidadGalletas = cantG;

        fila.innerHTML = `
            <td class="p-2 text-center">${galleta.nombre_galleta}</td>
            <td class="p-2 text-center">$${precioUnit.toFixed(2)}</td>
            <td class="p-2 text-center">
            <input
                type="number"
                class="w-16 mx-auto text-center border rounded input-cant"
                value="${step}"
                step="${stepAttr}"
                max="${max}"
                min="${step}"
                inputmode="${inputMode}"
                oninput="${oninputAttr}"
            />
            </td>
            <td class="p-2 text-center">${tipoLabel}</td>
            <td class="p-2 text-center cell-subtotal">${(precioUnit * step).toFixed(2)}</td>
            <td class="p-2 text-center">
            <button class="btn-remove cursor-pointer">
                <img src="../../../static/images/bote basura.png" class="w-7 h-7">
            </button>
            </td>
        `;

        const inputCant = fila.querySelector('.input-cant');
        inputCant.addEventListener('change', () => {
            let val = Number(inputCant.value);
            if (!allowDecimals) {
                val = Math.floor(val);
            }
            if (val < step) val = step;
            if (val > max) val = max;
            inputCant.value = val;

            fila.querySelector('.cell-subtotal').textContent = (val * precioUnit).toFixed(2);

            const nuevaG = calcCantidadGalletas(tipoKey, val, gramos);
            fila.dataset.cantidadGalletas = nuevaG;

            recalcTotal();
        });

        // Botón borrar
        fila.querySelector('.btn-remove')
            .addEventListener('click', () => {
                fila.remove();
                recalcTotal();
            });

        // Listener cambio de cantidad
        fila.querySelector('.input-cant')
            .addEventListener('change', () => {
                let val = Number(fila.querySelector('.input-cant').value);
                if (val < step) val = step;
                if (val > max) val = max;
                fila.querySelector('.input-cant').value = val;

                // Recalcular subtotal
                fila.querySelector('.cell-subtotal').textContent = (val * precioUnit).toFixed(2);

                // Recalcular cantidad_galletas
                const nuevaG = calcCantidadGalletas(tipoKey, val, gramos);
                fila.dataset.cantidadGalletas = nuevaG;

                recalcTotal();
            });

        tbody.appendChild(fila);

    } else {
        // Actualizar fila existente: sumar un step más
        const inputCant = fila.querySelector('.input-cant');
        let nueva = Number(inputCant.value) + step;
        if (nueva > max) nueva = max;
        inputCant.value = nueva;

        // Recalcular subtotal
        fila.querySelector('.cell-subtotal').textContent = (nueva * precioUnit).toFixed(2);

        // Recalcular cantidad_galletas
        const nuevaG = calcCantidadGalletas(tipoKey, nueva, gramos);
        fila.dataset.cantidadGalletas = nuevaG;
    }

    // 7) Recalcular total de la venta
    recalcTotal();
}

// Funcion para buscar entre las cards de galletas
function filtrarCards() {
    const term = document.querySelector('input[name="buscar"]').value.toLowerCase().trim();
    const container = document.getElementById('galletas-container');
    const cards = Array.from(container.children);

    cards.forEach(card => {
        // Busca en el nombre y en la existencia (o añade más campos si quieres)
        const nombre = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const existenciaText = card.querySelector('p.text-sm')?.textContent.toLowerCase() || '';
        if (nombre.includes(term) || existenciaText.includes(term)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Recolecta datos de la tabla y inputs para crear el sjon para mandar la informaicion
function recolectarDatosVenta() {
    const filas = Array.from(document.querySelectorAll('#tbody_producto tr'));
    const detalle_venta = filas.map(fila => {
        const [, precioCell, cantidadTd] = fila.children;
        // ["row","<galletaId>","<tipoId>"]
        const rowId = fila.id.split('-');
        const galleta_id = parseInt(rowId[1]);
        const tipoKey = fila.dataset.tipoVentaKey;
        const tipo_venta_id = parseInt(fila.dataset.tipoVentaId);
        const factor_venta = parseFloat(cantidadTd.querySelector('input').value) || 0;
        const gramosPorPieza = parseFloat(fila.dataset.gramosPieza) || 0;
        const cantidad_galletas = calcCantidadGalletas(tipoKey, factor_venta, gramosPorPieza);
        const precio_unitario = parseFloat(precioCell.textContent.replace('$', ''));

        return {
            galleta_id,
            tipo_venta_id,
            factor_venta: Number(factor_venta.toFixed(2)),
            cantidad_galletas,
            precio_unitario: Number(precio_unitario.toFixed(2)),
        };
    });
    const descVal = parseFloat(document.getElementById('descuento').value) || 0;
    return {
        observacion: '',
        descuento: Number(descVal.toFixed(2)),
        detalle_venta
    };
}

// Funcion para validar que no se exceda el inventario en distintos tipos de vntas
function getPiezasGalletaSeleccionada(galletaId, excludeRow = null) {
    let sum = 0;
    document.querySelectorAll('#tbody_producto tr').forEach(row => {
        if (row === excludeRow) return;
        const [, idStr] = row.id.split('-');
        if (parseInt(idStr, 10) !== galletaId) return;

        const key = row.dataset.tipoVentaKey;
        const factor = Number(row.querySelector('.input-cant').value) || 0;
        const grams = Number(row.dataset.gramosPieza) || 0;

        sum += calcCantidadGalletas(key, factor, grams);
    });
    return sum;
}

// Funcion par enviar la venta al backend
function registrarVenta() {
    const numFilas = document.querySelectorAll('#tbody_producto tr').length;
    if (numFilas === 0) {
        alertas.alertaWarning('Debes agregar al menos una galleta a la venta');
        return;
    }
    alertas.confirmarYRegistrarVenta()
        .then(resultado => {
            if (!resultado.isConfirmed) {
                return Promise.reject('cancelado');
            }
            const payload = recolectarDatosVenta();
            tabs.mostrarLoader();
            return api.postJSON('/ventas/guardar_venta', payload)
        })
        .then(data => {
            if (data.status === 200 || data.status === 201 || data.message === "Venta guardada correctamente") {
                alertas.procesoTerminadoExito();
            } else {
                alertas.procesoTerminadoSinExito();
            }
            limpiarVistaVenta();
        })
        .catch(error => {
            if (error !== 'cancelado') {
                Swal.fire('Error', 'Error al generar la venta', 'error');
            }
        })
        .finally(() => tabs.ocultarLoader());
}

// Funcion para consultar las galletas a la BD
function cargarGalletas() {
    const container = document.getElementById('galletas-container');
    tabs.mostrarEsqueletoCardGalleta(container);
    api.getJSON('/galletas/get_all_galletas')
        .then(data => {
            if (data) {
                galletasDisponibles = data;
                generarCards(data)
                document.getElementById('btn-agregar').disabled = false;
            }
        })
        .catch(error => {
            Swal.fire('Error', 'Error al cargar las galletas', 'error');
        })
        .finally(() => tabs.desbloquearTabs());
}

// Funcion para generar las cards de galletas
function generarCards(galletas) {
    const container = document.getElementById('galletas-container');
    container.innerHTML = '';
    galletas.forEach(galleta => {
        const existencias = Number(galleta.existencias);
        const gramosPorPieza = Number(galleta.gramos_galleta);
        const precioPorPieza = Number(galleta.precio_unitario);

        const totalGramos = existencias * gramosPorPieza;
        const totalDinero = (existencias * precioPorPieza).toFixed(2);
        const paquetes1kg = Math.floor(totalGramos / 1000);
        const paquetesMedioKg = Math.floor(totalGramos / 700);

        const card = document.createElement('div');
        card.className = 'border border-gray-200 rounded-lg overflow-hidden bg-[#efe6dc] shadow-sm hover:shadow-md transition-shadow';
        card.innerHTML = `
            <div class="flex p-4 h-[190px]">
                <div class="w-1/5 flex flex-col items-center justify-between bg-[#efe6dc] rounded-lg">
                    <div class="w-full flex items-center justify-center">
                        <img src="../../../static/images/galleta ejemplo.png" alt="${galleta.nombre_galleta}" class="h-20 w-20 object-contain">
                    </div>
                    <div class="w-full flex items-center justify-center mt-2">
                        <button onclick="buscarGalletaPorId(${galleta.id_galleta})" class="align-middle cursor-pointer">
                            <img src="../../../static/images/info.png" class="w-7 h-7">
                        </button>
                    </div>
                </div>

                <div class="w-4/5 pl-4 flex flex-col justify-between cursor-pointer" id="seccion-derecha">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">${galleta.nombre_galleta} (${parseFloat(galleta.gramos_galleta).toFixed(2)} g)</h3>
                        <p class="text-sm text-gray-500 mt-1">Existencias: ${galleta.existencias}</p>
                    </div>
                    <p class="text-base font-bold text-gray-900">$${galleta.precio_unitario}</p>
                    <div class="text-sm text-gray-700 space-y-1">
                        <p><strong>Total gramos:</strong> ${totalGramos} g; <strong>Total en $:</strong> $${parseFloat(totalDinero).toFixed(2)}</p>
                        <p><strong>Paquetes 1 kg:</strong> ${paquetes1kg}; <strong>Paquetes 700 g:</strong> ${paquetesMedioKg}</p>
                    </div>
                </div>
            </div>
        `;
        const seccion = card.querySelector("#seccion-derecha");
        seccion.addEventListener('click', () => handleCardClick(galleta));

        container.appendChild(card);
    });
}

// funcion para buscar la galleta por id así como sus recetas
function buscarGalletaPorId(id_galleta) {
    tabs.mostrarLoader();
    api.postJSON('/galletas/get_galleta_by_id', { id_galleta })
        .then(data => {
            if (data.id_galleta) {
                buscarInsumos(data.recetas);
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al cargar la galleta', 'error');
        });
}

// Funcion para mostrar los insumos en la vista
function buscarInsumos(recetas) {
    const tbody = document.getElementById('tbody_insumos');
    tbody.innerHTML = '';
    api.getJSON('/insumos/get_all_insumos_unidad')
        .then(data => {
            const recetaBase = recetas.find(receta => receta.receta_base === 1);
            let infoInsumos = recetaBase.detalle_receta.map(detalle => {
                const insumo = data.find(i => String(i.id_insumo) === String(detalle.insumo_id));
                return { ...insumo };
            });

            infoInsumos.forEach(insumoReceta => {
                tbody.innerHTML += `
                <tr data-id="${insumoReceta.id_insumo}" class="hover:bg-gray-100">
                    <td class="p-3 text-center">${insumoReceta.nombre}</td>
                    <td class="p-3 text-center">${insumoReceta.descripcion}</td>
                </tr>
            `;
            })
            abrirModal();
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al cargar insumos', 'error');
        })
        .finally(() => tabs.ocultarLoader());
}

// Funcion para limipar la vista de galletas
function limpiarVistaVenta() {
    const tbody = document.getElementById('tbody_producto');
    tbody.innerHTML = '';

    document.getElementById('descuento').value = 0;

    document.getElementById('total-general').textContent = '$0.00';

    document.getElementById('btn-agregar').disabled = true;

    cargarGalletas();
}

window.cargarGalletas = cargarGalletas;
window.filtrarTabla = filtrarTabla;
window.filtrarCards = filtrarCards;
window.recalcTotal = recalcTotal;
window.registrarVenta = registrarVenta;
window.buscarGalletaPorId = buscarGalletaPorId;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;