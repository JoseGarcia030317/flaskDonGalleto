import { api } from '../../utils/api.js';
import { tabs } from "../../utils/tabs.js";

// Funcion para cargar la vista principal de dashboard en el main
function cargarModuloDashboard() {
    const main_content = document.getElementById('main-content')
    api.getHTML('/dashboard')
    .then(html => {
        main_content.innerHTML = html;
        // Carga el contenido inicial
        cargarContenidoDashboard("grafica-productos");
    })
    .catch(error => {
        console.error("Error cargando el módulo de dashboard: ", error);
        Swal.fire('Error', 'No se pudo cargar el módulo de dashboard', 'error');
    });
}

// Función genérica para cargar cualquier sección de compras dinámicamente
function cargarContenidoDashboard(endpoint) {
    const galletasContent = document.getElementById('dashboard-contenido');

    const timestamp = Date.now();
    api.getHTML(`/dashboard/${endpoint}?_=${timestamp}`)
    .then(html => {
        galletasContent.innerHTML = html;

        // Eliminar scripts antiguos
        document.querySelectorAll('script[data-submodule]').forEach(script => script.remove());

        // Cargar script del submódulo
        const script = document.createElement('script');
        script.src =`../../static/js/modulos/dashboard/${endpoint}.js?_=${timestamp}`;
        script.type = 'module';
        script.setAttribute('data-submodule', endpoint);

        script.onload = () => {
            console.log(`Script de ${endpoint} cargado`);
            if (endpoint === 'grafica-productos') window.cargarGraficasDashboard();
            // if (endpoint === 'recetas') window.cargarRecetas();
        };

        document.body.appendChild(script);
    })
    .catch(err => console.error(`Error cargando ${endpoint}:`, err));
}

// Asignar la función globalmente para que sea accesible en el HTML
window.cargarModuloDashboard = cargarModuloDashboard;