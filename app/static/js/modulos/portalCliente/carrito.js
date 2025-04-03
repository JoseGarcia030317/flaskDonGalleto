import { api } from '../../utils/api.js';

function cargarModuloCarrito() {
    const main_content = document.getElementById('main-content')
    main_content.innerHTML = '';
    api.getHTML('/carrito').then(response => {
        main_content.innerHTML = response;

        // Carga el contenido inicial
        
    }) .catch(err => console.error("Error cargando el módulo de carrito de compras: ", err));
}

window.cargarModuloCarrito = cargarModuloCarrito;

