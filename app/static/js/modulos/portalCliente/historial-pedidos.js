import { api } from '../../utils/api.js';

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
    const data = {
        id_cliente: 1 // El backend tomará el id_cliente del current_user
    };
    api.postJSON('/pedidos/consultar_historial_pedidos', data)
    .then(response => {
        console.log("Respuesta del servidor:", response); // Para debug
        const pedidos = response.pedidos;
        const orden = document.getElementById('orden');
        const detalle_pedido = document.getElementById('detalle_pedido');
        
        orden.innerHTML = '';
        detalle_pedido.innerHTML = '';
        
        orden.className = 'bg-[#EFE6DC] p-4 mt-4 rounded-lg';
        
        if (pedidos && pedidos.length > 0) {
            pedidos.forEach(pedido => {
                // Crear el div de orden
                const orden_div = document.createElement('div');
                orden_div.className = 'flex justify-between text-sm mb-2 p-2 bg-white rounded';
                orden_div.innerHTML = `
                    <span><strong>Número de orden: </strong>${pedido.id_pedido}</span>
                    <span><strong>Fecha de compra: </strong>${pedido.fecha}</span>
                    <span><strong>Monto total: </strong>$${pedido.precio_unitario * pedido.factor_venta}</span>
                `;
                orden.appendChild(orden_div);

                // Crear el div de detalle_pedido
                const detalle_div = document.createElement('div');
                detalle_div.className = 'flex bg-white rounded-lg';
                detalle_div.innerHTML = `
                    <div class="flex">
                        <div class="mr-4">
                            <img src="static/images/galletas/Galletas de mantequilla.jpg" alt="Product Image" class="w-32 h-32 object-cover rounded-lg">
                        </div>
                        <div class="flex flex-col">
                            <h2 class="font-bold text-lg">${pedido.galleta}</h2>
                            <p class="font-bold ">Tipo de venta: <span class="text-gray-500">${pedido.tipo_venta}</span></p>
                            <p class="font-bold ">Cantidad: <span class="text-gray-500">${pedido.factor_venta}</span></p>
                            <p class="mt-3 text-lg font-bold">Precio unitario: <span class="text-gray-500 ">$${pedido.precio_unitario}</span></p>
                            
                        </div>
                    </div>
                `;
                detalle_pedido.appendChild(detalle_div);
            });
        } else {
            orden.innerHTML = '<p class="text-center text-gray-600">No hay pedidos para mostrar</p>';
            detalle_pedido.innerHTML = '<p class="text-center text-gray-600">No hay detalles para mostrar</p>';
        }
    })
    .catch(err => {
        console.error("Error consultando historial de pedidos:", err);
        const orden = document.getElementById('orden');
        const detalle_pedido = document.getElementById('detalle_pedido');
        orden.innerHTML = '<p class="text-center text-red-600">Error al cargar el historial de pedidos</p>';
        detalle_pedido.innerHTML = '<p class="text-center text-red-600">Error al cargar los detalles de pedidos</p>';
    });
}



window.cargarModuloHistorialPedidos = cargarModuloHistorialPedidos;
window.consultar_historial_pedidos = consultar_historial_pedidos;
