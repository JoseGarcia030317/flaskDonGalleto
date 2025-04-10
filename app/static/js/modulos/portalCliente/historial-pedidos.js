import { api } from '../../utils/api.js';
import { convertirFecha } from '../../utils/validaciones.js';

const getEstatusInfo = (estatus) => {
    switch (estatus) {
        case 0: return { texto: 'Cancelado', color: 'bg-red-100 text-red-800' };
        case 1: return { texto: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' };
        case 2: return { texto: 'Aceptado', color: 'bg-green-100 text-green-800' };
        case 3: return { texto: 'Rechazado', color: 'bg-red-100 text-red-800' };
        default: return { texto: 'Desconocido', color: 'bg-gray-100 text-gray-800' };
    }
};

function cargarModuloHistorialPedidos() {
    const main_content = document.getElementById('main-content')
    main_content.innerHTML = '';
    api.getHTML('/historial-pedidos')
        .then(response => {
            main_content.innerHTML = response;

        })
        .then(response => {
            consultar_historial_pedidos();
        })
        .catch(err => console.error("Error cargando el módulo de historial de pedidos: ", err));
}


function consultar_historial_pedidos() {
    const data = { id_cliente: 1 };

    api.postJSON('/pedidos/consultar_historial_pedidos', data)
        .then(response => {
            const contenedor = document.getElementById('contenedor-pedidos');
            contenedor.innerHTML = '';

            if (response.pedidos && response.pedidos.length > 0) {
                response.pedidos.forEach(pedido => {
                    const card = document.createElement('div');
                    card.className = 'bg-[#EFE6DC] rounded-lg p-4';
                    const estatusInfo = getEstatusInfo(pedido.estado);
                    card.innerHTML = `
                    <div class="flex justify-between text-sm mb-2 p-2 bg-white rounded">
                        <span><strong>N° orden: </strong>${pedido.id_pedido}</span>
                        <span><strong>Fecha: </strong>${convertirFecha(pedido.fecha)}</span>
                         <span class="px-3 py-1 rounded-full text-xs font-medium ${estatusInfo.color}">
                                ${estatusInfo.texto}
                            </span>
                        <span><strong>Total: </strong>$${(pedido.precio_unitario * pedido.factor_venta).toFixed(2)}</span>
                    </div>
                    
                    <div class="bg-white rounded-lg p-4 mt-2">
                        <div class="flex items-start">
                            <img src="static/images/galletas/Galletas de mantequilla.jpg" 
                                 alt="${pedido.galleta}" 
                                 class="w-24 h-24 object-cover rounded-lg mr-4">
                            <div class="flex-grow">
                                <h2 class="font-bold text-lg mb-2">${pedido.galleta}</h2>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <p class="font-semibold">Tipo de venta:</p>
                                        <p class="text-gray-600">${pedido.tipo_venta}</p>
                                    </div>
                                    <div>
                                        <p class="font-semibold">Cantidad:</p>
                                        <p class="text-gray-600">${pedido.factor_venta}</p>
                                    </div>
                                    <div>
                                        <p class="font-semibold">Precio unitario:</p>
                                        <p class="text-gray-600">$${pedido.precio_unitario}</p>
                                    </div>
                                    <div>
                                        <p class="font-semibold">Subtotal:</p>
                                        <p class="text-gray-600">$${(pedido.precio_unitario * pedido.factor_venta).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                    contenedor.appendChild(card);
                });
            } else {
                contenedor.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-600 text-lg">No hay pedidos para mostrar</p>
                </div>
            `;
            }
        })
        .catch(err => {
            console.error("Error:", err);
            const contenedor = document.getElementById('contenedor-pedidos');
            contenedor.innerHTML = `
            <div class="text-center py-8 text-red-600">
                Error al cargar el historial de pedidos
            </div>
        `;
        });
}



window.cargarModuloHistorialPedidos = cargarModuloHistorialPedidos;
window.consultar_historial_pedidos = consultar_historial_pedidos;
