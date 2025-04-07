import { api } from '../../utils/api.js';

// Función para cargar la vista principal del portal del cliente en el main
async function cargarModuloPortalInicio() {
    const main_content = document.getElementById('main-content');
    main_content.innerHTML = '';

    await api.getHTML('/portalInicio')
        .then(response => {
            main_content.innerHTML = response;
        })
        .then(response =>  {
          consultarGalletas();
          configurarModalGalleta();
        })
        .catch(err => console.error("Error cargando el módulo de portal del cliente: ", err))
        //.finally(consultarGalletas); 
}

// Función para consultar las galletas
function consultarGalletas() {
    api.getJSON('/galletas/get_all_galletas')
        .then(response => {
            const galletasContainer = document.getElementById('galletasContainer');
            galletasContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevas galletas

            response.forEach(galleta => {
                const galletaDiv = document.createElement('div');
                const rutaImagen = `static/images/galletas/${galleta.nombre_galleta}.jpg`;
                galletaDiv.className = 'galleta-item p-2'
                galletaDiv.innerHTML = `
                  <img src="${rutaImagen}" alt="${galleta.nombre_galleta}" class="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-7/8" onerror="this.onerror=null; this.src='static/images/galletas/default.jpg';" loading="lazy">
        <h3 class="mt-4 text-sm text-gray-700">${galleta.nombre_galleta}</h3>
        <p class="mt-1 text-lg font-medium text-gray-900">${galleta.precio_unitario}</p>

        <div class="mt-2">
          <div class="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-[#8B4513] has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-[#8B4513]">
          <input type="number" name="cantidad" id="cantidad" class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 border-r border-gray-300 placeholder:text-gray-400 focus:outline-none sm:text-sm/6" placeholder="Cantidad" min="1" value="1">
          <div class="grid shrink-0 grid-cols-1 focus-within:relative">
            <select id="unidad" name="unidad" aria-label="Unidad" class="col-start-1 row-start-1 w-full appearance-none border-l border-gray-200 rounded-md py-1.5 pr-7 pl-3 text-base text-gray-500 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#8B4513] sm:text-sm/6 border-[#8B4513]">
            <option>Pieza(s)</option>
            <option>Paquete(s)</option>
            <option>Gramos</option>
            </select>
          </div>
          </div>
        </div>
        <button class="mt-4 w-[130px] h-[40px] p-2 rounded-[10px] bg-[#540b0e] hover:bg-[#3a080a] text-white border-none font-['Poppins'] font-light cursor-pointer transition-colors duration-300 ease-in-out flex items-center justify-center" 
          onclick="mostrarNotificacion('Producto agregado al carrito')">
          Agregar <img src="static/images/shop.png" alt="Agregar" class="ml-2 w-4 h-4">
        </button>
                `;
                galletasContainer.appendChild(galletaDiv);
            });
        })
        .catch(err => console.error("Error consultando galletas: ", err));
}


function mostrarNotificacion(mensaje) {
  // Crear el contenedor de la notificación si no existe
  let notificacionContainer = document.getElementById('notificacion-container');
  if (!notificacionContainer) {
      notificacionContainer = document.createElement('div');
      notificacionContainer.id = 'notificacion-container';
      notificacionContainer.style.position = 'fixed';
      notificacionContainer.style.top = '30px';
      notificacionContainer.style.right = '30px';
      notificacionContainer.style.zIndex = '1000';
      document.body.appendChild(notificacionContainer);
  }

  // Crear la notificación
  const notificacion = document.createElement('div');
  notificacion.textContent = mensaje;
  notificacion.style.color = '#fff';
  notificacion.style.backgroundColor = '#895645';
  notificacion.style.padding = '10px 20px';
  notificacion.style.marginBottom = '10px';
  notificacion.style.borderRadius = '5px';
  notificacion.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  notificacion.style.fontFamily = 'Poppins, sans-serif';
  notificacion.style.fontSize = '16px';

  // Agregar la notificación al contenedor
  notificacionContainer.appendChild(notificacion);

  // Eliminar la notificación después de 3 segundos
  setTimeout(() => {
      notificacion.remove();
  }, 3000);
}


function configurarModalGalleta() {
  const botonAbrir = document.getElementById('btn-abrir-modal');
  const modal = document.getElementById('modal-galleta');
  const cerrar = document.getElementById('cerrar-modal');

  if (!botonAbrir || !modal || !cerrar) {
    console.warn('Modal o botón no encontrados en el DOM');
    return;
  }

  // Mostrar modal al dar clic en el botón
  botonAbrir.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  // Cerrar modal al dar clic en el botón de cerrar
  cerrar.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Cerrar modal al hacer clic fuera del contenido del modal
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

// Asignar funciones globalmente para que sean accesibles en el HTML
window.consultarGalletas = consultarGalletas;
window.cargarModuloPortalInicio = cargarModuloPortalInicio;
window.mostrarNotificacion = mostrarNotificacion; // Asignar la función a window
window.configurarModalGalleta = configurarModalGalleta;