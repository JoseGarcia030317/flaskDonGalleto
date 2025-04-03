import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';
import { abrirConversor, cerrarConversor, cambiarPestana, convertirUnidad, limpiarCampos } from "../../utils/conversor.js";

const compras = [
    {
        id_compra: 1,
        clave_compra: "342353",
        fecha_compra: "17/09/2025",
        observacion: "Compra de emergencia llamado de emergencia",
        proveedor: {
                id_proveedor: 1, 
                nombre: "Gota blanca", 
                telefono: "4776783940", 
                contacto: "Héctor Gómez", 
                correo_electronico: "gota@gmail.com", 
                descripcion_servicio: "Cada jueves", 
                estatus: 1
        },
        detalle_compra : [
            {
                compra_id : 1,
                insumo: {
                    id_insumo: 3, nombre: "Leche entera", unidad: "lt" 
                },
                presentacion: "Caja",
                precio: 30.00,
                cantidad: 3
            },
            {
                compra_id : 1,
                insumo: {
                    id_insumo: 4, nombre: "Mantequilla", unidad: "gr",
                },
                presentacion: "Caja",
                precio: 30.00,
                cantidad: 3
            }
        ]
    }
]

function cargarAlmacen() {  
    const tbody = document.getElementById('tbody_almacen');
    tabs.mostrarEsqueletoTabla(tbody);
    tbody.innerHTML = '';
    compras.forEach(compra => {
        tbody.innerHTML +=  `
            <div class="w-full flex py-4 px-3 border border-[#8A5114] justify-between rounded-xl bg-white shadow-md">
            <div>
                <span class="text-[#915A17]">${compra.fecha_compra}</span>
                <p class="text-xl">Compra ${compra.clave_compra} - ${compra.proveedor.nombre}</p> 
            </div>
            <button onclick="abrirCompra(${compra.id_compra}, '${compra.clave_compra}', '${compra.proveedor.nombre}')" class="flex items-center justify-center space-x-1 px-3 py-0 bg-white text-[#8A5114] border-2 border-[#6B3D0C] rounded-full hover:bg-[#6B3D0C] hover:text-white focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </button>                                  
        </div>
        `;
    });

}

function abrirModal(){
    const backdrop = document.getElementById('modalBackdropAlmacen');
    const modalForm = document.getElementById('modalFormAlmacen');

    backdrop.classList.remove('hidden');
    modalForm.classList.remove('hidden');
}

function abrirCompra(id, clave, proveedor){
    abrirModal();

}

function agregarGrupoInsumo(){
    const grupoInsumo = document.getElementById('grupo-agregado');
    grupoInsumo.insertAdjacentHTML('beforeend', `
        <div class="flex items-center w-[calc(100%-24px)] m-2 gap-4 p-3 bg-gray-50 rounded-lg shadow-sm justify-end ml-6">
            <div class="flex w-1/5 justify-center items-center space-x-2">
                <span>=</span>                    
                <input type="number" name="cantidad" min="0.0" step="0.1" placeholder="" class="w-20 p-2 border border-[#895645] rounded-full text-center" required>
                <p class="text-center w-auto">Lt</p>
            </div>
            <input type="date" name="fecha_caducidad" class="w-1/5 p-2 border border-[#895645] rounded-full text-center" required>
        </div>
    `);
}

function cargarDetalleCompra(){
    
}

function guardarAlmacen(){
    alertas.procesoTerminadoExito();
    cerrarModal();
}

function cerrarModal() {
    document.getElementById('modalBackdropAlmacen').classList.add('hidden');
    document.getElementById('modalFormAlmacen').classList.add('hidden');
    limpiarFormulario();
}

window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.cargarAlmacen = cargarAlmacen;
window.abrirCompra = abrirCompra;
window.agregarGrupoInsumo = agregarGrupoInsumo;
window.guardarAlmacen = guardarAlmacen;

// exponer funciones del conversor de unidades globalmente
window.cambiarPestana = cambiarPestana;
window.convertirUnidad = convertirUnidad;
window.abrirConversor = abrirConversor;
window.cerrarConversor = cerrarConversor;
window.limpiarCampos = limpiarCampos;
