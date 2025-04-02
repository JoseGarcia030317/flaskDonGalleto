import { api } from '../../utils/api.js';

// Funcion para cargar la vista principal del portal del cliente en el main
function cargarModuloPortalInicio() {
    const main_content = document.getElementById('main-content')
    main_content.innerHTML = '';
    api.getHTML('/portalInicio').then(response => {
        main_content.innerHTML = response;

        // Carga el contenido inicial
        
    }) .catch(err => console.error("Error cargando el módulo de portal del cliente: ", err));
}

// Función para agregar
    //funcion agregar()


function consultarGalletas() {
  api.getJSON('/galletas')
}
function saludar(){
  console.log('Hola desde el portal cliente');
  aler
}


// Asignar la función globalmente para que sea accesible en el HTML
window.saludar = saludar;
window.cargarModuloPortalInicio = cargarModuloPortalInicio;
//agregar funciones al html nombrar aquí 