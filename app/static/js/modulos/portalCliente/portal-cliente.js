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

// Función para cargar el módulo de carrito
async function cargarModuloCarrito() {
    const main_content = document.getElementById('main-content');
    main_content.innerHTML = '';

    await api.getHTML('/carrito')
        .then(response => {
            main_content.innerHTML = response;
            
            // Cargar el script de carrito.js
            const script = document.createElement('script');
            script.src = '../../static/js/modulos/portalCliente/carrito.js';
            script.type = 'module';
            script.onload = () => {
                console.log('Script de carrito cargado');
                // Llamar a la función cargarCarrito después de que el script esté cargado
                if (window.cargarCarrito) {
                    window.cargarCarrito();
                }
            };
            document.body.appendChild(script);
        })
        .catch(err => console.error("Error cargando el módulo de carrito: ", err));
}

// Función para consultar las galletas
function consultarGalletas() {
  api.getJSON('/galletas/get_all_galletas')
      .then(response => {
          const galletasContainer = document.getElementById('galletasContainer');
          galletasContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevas galletas
          galletasContainer.className = 'mx-auto max-w-2xl sm:py-24 lg:max-w-7xl grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8';

          response.forEach(galleta => {
              const galletaDiv = document.createElement('div');
              const rutaImagen = `static/images/galletas/${galleta.nombre_galleta}.jpg`;
              galletaDiv.innerHTML = `
  
  
        <div class="rounded-lg overflow-hidden bg-white shadow-md">
  <img src="${rutaImagen}" 
       alt="${galleta.nombre_galleta}" 
       class="aspect-square w-full bg-gray-200 object-cover group-hover:opacity-75" 
       onerror="this.onerror=null; this.src='static/images/galletas/default.jpg';" 
       loading="lazy">
  
  <!-- Contenedor blanco para la información -->
  <div class="p-4 bg-white text-gray-800">
    <h3 class="text-lg font-semibold">${galleta.nombre_galleta}</h3>
    <p class="text-sm">Aquí va una descripción o información adicional.</p>
  </div>
</div>

        <h3 class="mt-4 text-sm text-gray-700">${galleta.nombre_galleta}</h3>
        <p class="mt-1 text-lg font-medium text-gray-900">$ ${galleta.precio_unitario}</p>
        <div class="flex flex-col gap-2">
            <div class="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-[#8B4513] has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-[#8B4513]">
                <input type="number" name="cantidad" class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 border-r border-gray-300 placeholder:text-gray-400 focus:outline-none sm:text-sm/6" placeholder="Cantidad" min="1" value="1">
                <select name="tipo_venta" class="w-[120px] border-l border-gray-200 rounded-md py-1.5 pr-2 pl-3 text-base text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#8B4513] sm:text-sm/6 border-[#8B4513]">
                    <option value="pieza">Pieza(s)</option>
                    <option value="gramaje">Gramaje</option>
                    <option value="medio_kilo">1/2 Kilo</option>
                    <option value="kilo">Kilo</option>
                </select>
            </div>

            <button class="w-full h-[40px] p-2 rounded-[10px] bg-[#540b0e] hover:bg-[#3a080a] text-white border-none font-['Poppins'] font-light cursor-pointer transition-colors duration-300 ease-in-out flex items-center justify-center" 
                onclick="event.stopPropagation(); agregarAlCarritoDesdeGalleta('${galleta.id_galleta}', '${galleta.nombre_galleta}', ${galleta.precio_unitario}, this)">
                Agregar <img src="static/images/shop.png" alt="Agregar" class="ml-2 w-4 h-4">
            </button>
        </div>
    </div>

    <!-- Reverso -->
   
</div>
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

// Tipos de venta
const TIPOS_VENTA = {
    pieza: { id: 2, label: 'Pieza(s)', descuento: 0 },
    gramaje: { id: 1, label: 'gramaje', descuento: 0 },
    medio_kilo: { id: 3, label: '1/2 Kilo', descuento: 0.05 },
    kilo: { id: 4, label: 'Kilo', descuento: 0.10 }
};

function calcCantidadGalletas(cantidad, tipo_venta, gramosPorPieza = 20) {
    let cantidadGalletas;
    switch (tipo_venta) {
        case 'pieza':
            cantidadGalletas = cantidad;
            break;
        case 'gramaje':
            cantidadGalletas = cantidad / gramosPorPieza; 
            break;
        case 'medio_kilo':
            cantidadGalletas = Math.floor((cantidad * 500) / gramosPorPieza);
            break;
        case 'kilo':
            cantidadGalletas = Math.floor((cantidad * 1000) / gramosPorPieza);
            break;
        default:
            cantidadGalletas = cantidad;
    }
    return cantidadGalletas;
}

function agregarAlCarritoDesdeGalleta(id_producto, nombre, precio_unitario, boton) {
    const cantidadInput = boton.parentElement.querySelector('input[type="number"]');
    const tipoVentaSelect = boton.parentElement.querySelector('select[name="tipo_venta"]');
    const cantidad = parseInt(cantidadInput.value);
    const tipo_venta = tipoVentaSelect.value;
    
    if (cantidad < 1) {
        alert("Cantidad inválida.");
        return;
    }

    // Asumimos un peso promedio de 20 gramos por galleta si no tenemos el dato específico
    const gramosPorPieza = 20;
    const cantidadTotal = calcCantidadGalletas(cantidad, tipo_venta, gramosPorPieza);
    
    // Calcular el precio unitario según el tipo de venta, siguiendo la lógica de registro-ventas.js
    let precioUnitarioAjustado = 0;
    let subtotal = 0;
    
    // Obtener el descuento según el tipo de venta
    const descuento = TIPOS_VENTA[tipo_venta]?.descuento || 0;
    
    switch(tipo_venta) {
        case 'pieza':
            precioUnitarioAjustado = precio_unitario;
            subtotal = cantidad * precioUnitarioAjustado;
            break;
        case 'gramaje':
            // Para paquetes, asumimos que tienen 6 galletas
            precioUnitarioAjustado = precio_unitario / gramosPorPieza;
            subtotal = cantidad * precioUnitarioAjustado;
            break;
        case 'medio_kilo':
            // Siguiendo la lógica de registro-ventas.js para medio kilo
            precioUnitarioAjustado = precio_unitario * (500 / gramosPorPieza) * (1 - descuento);
            subtotal = cantidad * precioUnitarioAjustado;
            break;
        case 'kilo':
            // Siguiendo la lógica de registro-ventas.js para kilo
            precioUnitarioAjustado = precio_unitario * (1000 / gramosPorPieza) * (1 - descuento);
            subtotal = cantidad * precioUnitarioAjustado;
            break;
        default:
            precioUnitarioAjustado = precio_unitario;
            subtotal = cantidad * precio_unitario;
    }
    
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const tipo_venta_id = TIPOS_VENTA[tipo_venta]?.id;
    const index = carrito.findIndex(p => p.id_producto === id_producto && p.tipo_venta === tipo_venta_id);

    if (index !== -1) {
        carrito[index].cantidad += cantidad;
        carrito[index].cantidad_total = calcCantidadGalletas(carrito[index].cantidad, tipo_venta, gramosPorPieza);
        carrito[index].subtotal = carrito[index].cantidad * precioUnitarioAjustado;
    } else {
        carrito.push({
            id_producto,
            nombre,
            precio_unitario: precioUnitarioAjustado,
            cantidad,
            cantidad_total: cantidadTotal,
            tipo_venta: tipo_venta_id,
            subtotal: subtotal
        });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));

    let mensaje = `Agregaste ${cantidad} ${tipo_venta === 'pieza' ? 'pieza(s)' : 
                  tipo_venta === 'gramaje' ? 'gramo(s)' : 
                  tipo_venta === 'medio_kilo' ? '1/2 kilo' : 'kilo'} de galletas`;
    mostrarNotificacion(mensaje);
}



// Asignar funciones globalmente para que sean accesibles en el HTML
window.consultarGalletas = consultarGalletas;
window.cargarModuloPortalInicio = cargarModuloPortalInicio;
window.mostrarNotificacion = mostrarNotificacion; 
window.configurarModalGalleta = configurarModalGalleta;
window.agregarAlCarritoDesdeGalleta = agregarAlCarritoDesdeGalleta;
window.cargarModuloCarrito = cargarModuloCarrito;
