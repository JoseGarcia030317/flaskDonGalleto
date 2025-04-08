import { api } from '../../utils/api.js';

function cargarModuloCarrito() {
    const main_content = document.getElementById('main-content')
    main_content.innerHTML = '';
    api.getHTML('/carrito').then(response => {
        main_content.innerHTML = response;
        
        // Cargar el carrito después de que el HTML esté en el DOM
        cargarCarrito();
    }) .catch(err => console.error("Error cargando el módulo de carrito de compras: ", err));
}

function cargarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contenedor = document.getElementById('carritoItems');
    const totalSpan = document.getElementById('total');
    
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
      div.className = "bg-gray-50 p-4 rounded-lg shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4";

      // Determinar el texto del tipo de venta
      let tipoVentaTexto = '';
      switch(item.tipo_venta) {
        case 'pieza':
          tipoVentaTexto = 'pieza(s)';
          break;
        case 'paquete':
          tipoVentaTexto = 'paquete(s)';
          break;
        case 'medio_kilo':
          tipoVentaTexto = '1/2 kilo';
          break;
        case 'kilo':
          tipoVentaTexto = 'kilo(s)';
          break;
        default:
          tipoVentaTexto = item.tipo_venta;
      }

      div.innerHTML = `
         <div class="flex flex-col md:flex-row p-4">
 
  <div class="md:w-2/3">
    <div class="mb-4">
      <h2 class="text-2xl font-semibold mb-4">Carrito de compras</h2>
 
      <div class="flex items-center border-b py-4">
        <img src="static/images/galletas/Galleta de Chocolate Clásica.jpg" alt="Basic Tee Sienna" class="w-32 h-32 object-cover mr-4">
        <div class="flex-1">
          <h3 class="text-lg font-large">${item.nombre}</h3>
          <p class="text-sm text-gray-600">Cantidad: <span class="font-medium">[ ${item.cantidad} ] Tipo de venta: ${tipoVentaTexto}</span></p>
          <p class="text-md text-gray-500">Ingredientes: Harina, Azúcar, Mantequilla, Chocolate</p>
          <p class="text-sm text-gray-600">Precio unitario: $${item.precio_unitario.toFixed(2)}</p>
          <p class="text-sm text-gray-800 font-semibold">Subtotal: $${item.subtotal.toFixed(2)}</p>
        </div>
        <div class="ml-auto flex items-center">
          <button onclick="eliminarDelCarrito(${index})" class="text-sm text-red-500 hover:text-red-700 transition cursor-pointer">
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
    if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
      localStorage.removeItem('carrito');
      cargarCarrito();
    }
  }

  function confirmarCompra() {
    const venta = {
      productos: JSON.parse(localStorage.getItem('carrito')) || [],
      total: parseFloat(document.getElementById('total').textContent.replace('$',''))
    };

    console.log("Venta lista para enviar:", venta);

    // Aquí podrías hacer un fetch o axios.post a tu API de ventas
    // fetch('/ventas/guardar', { method: 'POST', body: JSON.stringify(venta), ... })

    alert("Compra confirmada. Revisa la consola.");
  }

// Asignar funciones globalmente para que sean accesibles en el HTML
window.eliminarDelCarrito = eliminarDelCarrito;
window.confirmarCompra = confirmarCompra;
window.cargarModuloCarrito = cargarModuloCarrito;
window.vaciarCarrito = vaciarCarrito;
window.cargarCarrito = cargarCarrito;
