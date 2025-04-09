/**
 * Utilidades para manejar tipos de venta y productos
 */

// Constantes para tipos de venta
export const TIPOS_VENTA = {
  PIEZAS: { id: '2', label: 'pieza(s)', descuento: 0 },
  GRAMAJE: { id: '1', label: 'gramaje', descuento: 0 },
  MEDIO_KILO: { id: '3', label: '1/2 kilo', descuento: 0.05 },
  KILO: { id: '4', label: 'kilo(s)', descuento: 0.10 }
};

// Constantes para tipos de productos
export const TIPOS_PRODUCTO = {
  GALLETA: 'galleta',
  INSUMO: 'insumo',
  PAQUETE: 'paquete',
  OTRO: 'otro'
};

/**
 * Obtiene el tipo de venta recomendado según el tipo de producto
 * @param {Object} producto - Objeto con información del producto
 * @param {string} producto.tipo_producto - Tipo de producto (galleta, insumo, paquete, etc.)
 * @param {string} [producto.tipo_venta] - Tipo de venta ya definido (opcional)
 * @returns {string} - ID del tipo de venta recomendado
 */
export function getTipoVentaByProducto(producto) {
  // Si el producto ya tiene un tipo de venta definido, lo usamos
  if (producto.tipo_venta) {
    return producto.tipo_venta;
  }
  
  // Si no tiene tipo de venta definido, determinamos uno basado en el tipo de producto
  switch(producto.tipo_producto) {
    case TIPOS_PRODUCTO.GALLETA:
      // Para galletas, por defecto ofrecemos venta por pieza
      return TIPOS_VENTA.PIEZAS.id;
    case TIPOS_PRODUCTO.INSUMO:
      // Para insumos, por defecto ofrecemos venta por gramaje
      return TIPOS_VENTA.GRAMAJE.id;
    case TIPOS_PRODUCTO.PAQUETE:
      // Para paquetes, por defecto ofrecemos venta por kilo
      return TIPOS_VENTA.KILO.id;
    default:
      // Por defecto, si no se reconoce el tipo, usamos pieza
      return TIPOS_VENTA.PIEZAS.id;
  }
}

/**
 * Obtiene el texto descriptivo para un tipo de venta
 * @param {string} tipoVentaId - ID del tipo de venta
 * @returns {string} - Texto descriptivo del tipo de venta
 */
export function getTipoVentaTexto(tipoVentaId) {
  switch(tipoVentaId) {
    case TIPOS_VENTA.PIEZAS.id:
      return TIPOS_VENTA.PIEZAS.label;
    case TIPOS_VENTA.GRAMAJE.id:
      return TIPOS_VENTA.GRAMAJE.label;
    case TIPOS_VENTA.MEDIO_KILO.id:
      return TIPOS_VENTA.MEDIO_KILO.label;
    case TIPOS_VENTA.KILO.id:
      return TIPOS_VENTA.KILO.label;
    default:
      return tipoVentaId;
  }
}

/**
 * Valida si un tipo de venta es válido para un tipo de producto
 * @param {string} tipoProducto - Tipo de producto
 * @param {string} tipoVentaId - ID del tipo de venta
 * @returns {boolean} - True si el tipo de venta es válido para el tipo de producto
 */
export function validarTipoVentaParaProducto(tipoProducto, tipoVentaId) {
  // Definimos qué tipos de venta son válidos para cada tipo de producto
  const tiposVentaValidos = {
    [TIPOS_PRODUCTO.GALLETA]: [TIPOS_VENTA.PIEZAS.id, TIPOS_VENTA.GRAMAJE.id, TIPOS_VENTA.MEDIO_KILO.id, TIPOS_VENTA.KILO.id],
    [TIPOS_PRODUCTO.INSUMO]: [TIPOS_VENTA.GRAMAJE.id, TIPOS_VENTA.KILO.id],
    [TIPOS_PRODUCTO.PAQUETE]: [TIPOS_VENTA.PIEZAS.id, TIPOS_VENTA.KILO.id],
    [TIPOS_PRODUCTO.OTRO]: [TIPOS_VENTA.PIEZAS.id, TIPOS_VENTA.GRAMAJE.id, TIPOS_VENTA.KILO.id]
  };
  
  // Si el tipo de producto no está definido, consideramos que cualquier tipo de venta es válido
  if (!tiposVentaValidos[tipoProducto]) {
    return true;
  }
  
  // Verificamos si el tipo de venta está en la lista de válidos para ese tipo de producto
  return tiposVentaValidos[tipoProducto].includes(tipoVentaId);
}

/**
 * Calcula el descuento aplicable según el tipo de venta
 * @param {string} tipoVentaId - ID del tipo de venta
 * @returns {number} - Porcentaje de descuento (0-1)
 */
export function getDescuentoTipoVenta(tipoVentaId) {
  switch(tipoVentaId) {
    case TIPOS_VENTA.PIEZAS.id:
      return TIPOS_VENTA.PIEZAS.descuento;
    case TIPOS_VENTA.GRAMAJE.id:
      return TIPOS_VENTA.GRAMAJE.descuento;
    case TIPOS_VENTA.MEDIO_KILO.id:
      return TIPOS_VENTA.MEDIO_KILO.descuento;
    case TIPOS_VENTA.KILO.id:
      return TIPOS_VENTA.KILO.descuento;
    default:
      return 0;
  }
} 