import { api } from '../../utils/api.js';

function cargarModuloHistorialPedidos() {
    const main_content = document.getElementById('main-content')
    main_content.innerHTML = '';
    api.getHTML('/historial-pedidos').then(response => {
        main_content.innerHTML = response;

        // Carga el contenido inicial
        
    }) .catch(err => console.error("Error cargando el módulo de historial de pedidos: ", err));
}

window.cargarModuloHistorialPedidos = cargarModuloHistorialPedidos;

