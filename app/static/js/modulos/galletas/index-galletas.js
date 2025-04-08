import { api } from '../../utils/api.js';
import { tabs } from "../../utils/tabs.js";

// Funcion para cargar la vista principal de dashboard en el main
function cargarModuloGalletas() {
    const main_content = document.getElementById('main-content')
    main_content.innerHTML = tabs.mostrarEsqueletoMainContent();
    api.getHTML('/galletas')
    .then(html => {
        main_content.innerHTML = html;
        // Carga el contenido inicial
        cargarContenidoGalletas("productos");
    })
    .catch(error => {
        console.error("Error cargando el módulo de galletas: ", error);
        Swal.fire('Error', 'No se pudo cargar el módulo de galletas', 'error');
    });
}

// Función genérica para cargar cualquier sección de compras dinámicamente
function cargarContenidoGalletas(endpoint) {
    const galletasContent = document.getElementById('galletas-contenido');
    galletasContent.innerHTML = tabs.mostrarEsqueletoModuloContent();

    const timestamp = Date.now();
    api.getHTML(`/galletas/${endpoint}?_=${timestamp}`)
    .then(html => {
        galletasContent.innerHTML = html;

        // Eliminar scripts antiguos
        document.querySelectorAll('script[data-submodule]').forEach(script => script.remove());

        // Cargar script del submódulo
        const script = document.createElement('script');
        script.src = `../../static/js/modulos/galletas/${endpoint}.js?_=${timestamp}`;
        script.type = 'module';
        script.setAttribute('data-submodule', endpoint);

        script.onload = () => {
            console.log(`Script de ${endpoint} cargado`);
            if (endpoint === 'productos') window.inicializarModuloGalletas();
            // if (endpoint === 'recetas') window.cargarRecetas();
        };

        document.body.appendChild(script);
    })
    .catch(err => console.error(`Error cargando ${endpoint}:`, err));
}

// Asignar la función globalmente para que sea accesible en el HTML
window.cargarModuloGalletas = cargarModuloGalletas;