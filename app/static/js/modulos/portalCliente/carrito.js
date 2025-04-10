import { api } from '../../utils/api.js';


function cargarModuloCarrito() {
  const main_content = document.getElementById('main-content')
  main_content.innerHTML = '';
  api.getHTML('/carrito').then(response => {
    main_content.innerHTML = response;

    // Cargar el carrito después de que el HTML esté en el DOM
    cargarCarrito();
  }).catch(err => console.error("Error cargando el módulo de carrito de compras: ", err));
}

function cargarCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contenedor = document.getElementById('carritoItems');
  const totalSpan = document.getElementById('total');
  console.log(carrito)
  if (!contenedor || !totalSpan) {
    console.error("No se encontraron los elementos necesarios para mostrar el carrito");
    return;
  }

  contenedor.innerHTML = '';

  let total = 0;

  if (carrito.length === 0) {
    contenedor.innerHTML = '<p class="text-center text-gray-500 py-4">Tu carrito está vacío</p>';
    totalSpan.textContent = `$${total.toFixed(2)}`;
    return;
  }

  carrito.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = "bg-[#F9F6F3]  p-4 rounded-lg shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4";

    // Determinar el texto del tipo de venta
    let tipoVentaTexto = '';
    switch (item.tipo_venta) {
      case 2:
        tipoVentaTexto = 'piezas';
        break;
      case 1:
        tipoVentaTexto = 'gramaje';
        break;
      case 3:
        tipoVentaTexto = 'Paquete 700 g';
        break;
      case 4:
        tipoVentaTexto = 'Paquete kilo';
        break;
      default:
        tipoVentaTexto = item.tipo_venta;
    }

    div.innerHTML = `
      <div class="flex flex-col p-4">
        <div >
          <div class="mb-4">
            <h2 class="text-3xl font-semibold mb-4">${item.nombre}</h2>
      
            <div class="flex items-center border-b py-4">
              <img src="static/images/galletas/Galleta de Chocolate Clásica.jpg" alt="Basic Tee Sienna" class="w-32 h-32 object-cover mr-4">
              <div class="flex-1">
                <p class="text-large text-gray-600">Cantidad (presentación): <span class="font-medium">${item.cantidad} </span></p>
                <p class="text-large text-gray-600">Cantidad galletas: <span class="font-medium">${item.cantidad_total} </span></p>
                <p class="text-large text-gray-600">Tipo de venta: <span class="font-medium">${tipoVentaTexto}</span></p>
                <p class="text-base text-gray-600">Precio unitario: $${item.precio_unitario.toFixed(2)}</p>
                <p class="text-base text-gray-800 font-semibold">Subtotal: $${item.subtotal.toFixed(2)}</p>
              </div>
              <div class="ml-auto flex items-center">
                <button onclick="eliminarDelCarrito(${index})" class="text-base text-red-500 hover:text-red-700 transition cursor-pointer">
                ❌ Eliminar
              </button>
              </div>
            </div>
          </div>
      </div>
    `;
    contenedor.appendChild(div);
    total += item.subtotal;
  });

  totalSpan.textContent = `$${total.toFixed(2)}`;
}

function eliminarDelCarrito(index) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  cargarCarrito();
}

function vaciarCarrito() {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "¿Quieres vaciar el carrito?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#6f473d',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, vaciar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('carrito');
      cargarCarrito();
      Swal.fire(
        '¡Vaciado!',
        'El carrito ha sido vaciado.',
        'success'
      )
    }
  })
}

function confirmarCompra() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const detalle = carrito.map(item => ({
    galleta_id: item.id_producto,
    tipo_venta_id: item.tipo_venta,
    factor_venta: item.cantidad,
    precio_unitario: item.precio_unitario
  }));

  const venta = {
    detalle,
    id_cliente: 1
  };

  // Enviar el pedido al backend
  api.postJSON('/pedidos/crear_pedido', venta)
    .then(response => {
      Swal.fire({
        title: '¡Pedido registrado!',
        text: 'Tu pedido ha sido registrado exitosamente.',
        icon: 'success',
        confirmButtonColor: '#6f473d',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        // Vaciar el carrito después de confirmar la compra
        localStorage.removeItem('carrito');
        cargarCarrito();
      });
    })
    .catch(error => {
      console.error('Error al crear el pedido:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al registrar tu pedido. Por favor, intenta nuevamente.',
        icon: 'error',
        confirmButtonColor: '#6f473d',
        confirmButtonText: 'Aceptar'
      });
    });
}

// Asignar funciones globalmente para que sean accesibles en el HTML
window.eliminarDelCarrito = eliminarDelCarrito;
window.confirmarCompra = confirmarCompra;
window.cargarModuloCarrito = cargarModuloCarrito;
window.vaciarCarrito = vaciarCarrito;
window.cargarCarrito = cargarCarrito;
