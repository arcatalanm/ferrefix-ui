// ===============================================================
// SISTEMA DE CARRITO DE COMPRAS CON PERSISTENCIA EN LOCALSTORAGE
// Validación de stock, cantidades, cálculo de subtotales y totales
// ===============================================================

const STORAGE_KEY_CARRITO = 'ferrefix_carrito_v1';
export const EVENTO_CARRITO_ACTUALIZADO = 'ferrefix:carrito_actualizado';

const notificarCarrito = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENTO_CARRITO_ACTUALIZADO));
  }
};

/**
 * Obtiene los productos actuales dentro del carrito desde localStorage
 */
export const obtenerCarrito = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY_CARRITO);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al leer el carrito de localStorage:', error);
    return [];
  }
};

/**
 * Guarda los productos del carrito en localStorage y notifica en tiempo real
 */
export const guardarCarrito = (items) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY_CARRITO, JSON.stringify(items));
    notificarCarrito();
  }
};

/**
 * Agrega un producto al carrito validando el stock disponible
 */
export const agregarAlCarrito = (producto, cantidadDeseada = 1) => {
  if (!producto || !producto.idProducto) {
    return { ok: false, error: 'Producto no válido' };
  }

  const carrito = obtenerCarrito();
  const stockMaximo = Number(producto.stock) || 0;

  if (stockMaximo <= 0) {
    return { ok: false, error: 'El producto no cuenta con stock disponible actualmente.' };
  }

  const indiceExistente = carrito.findIndex(
    (item) => String(item.idProducto) === String(producto.idProducto)
  );

  let nuevaCantidad = cantidadDeseada;

  if (indiceExistente !== -1) {
    nuevaCantidad = carrito[indiceExistente].cantidad + cantidadDeseada;

    // Validación estricta contra stock
    if (nuevaCantidad > stockMaximo) {
      return { 
        ok: false, 
        error: `No puedes agregar más unidades. El stock máximo disponible es de ${stockMaximo} unidades.` 
      };
    }

    carrito[indiceExistente].cantidad = nuevaCantidad;
  } else {
    if (nuevaCantidad > stockMaximo) {
      return { 
        ok: false, 
        error: `No puedes agregar ${nuevaCantidad} unidades. Solo hay ${stockMaximo} disponibles en stock.` 
      };
    }

    carrito.push({
      idProducto: producto.idProducto,
      nombre: producto.nombre,
      marca: producto.marca,
      categoria: producto.categoria,
      precioVenta: Number(producto.precioVenta) || 0,
      imagen: producto.imagen || '/banner-web.webp',
      stock: stockMaximo,
      cantidad: nuevaCantidad
    });
  }

  guardarCarrito(carrito);
  return { 
    ok: true, 
    mensaje: `Se agregaron ${cantidadDeseada} unid(s) de "${producto.nombre}" al carrito.`,
    cantidadTotal: nuevaCantidad 
  };
};

/**
 * Actualiza la cantidad de un producto en el carrito (con validación de límites)
 */
export const actualizarCantidad = (idProducto, nuevaCantidad) => {
  const carrito = obtenerCarrito();
  const indice = carrito.findIndex((item) => String(item.idProducto) === String(idProducto));

  if (indice === -1) return false;

  const cantidadNum = Number(nuevaCantidad);

  // Si la cantidad es 0 o menor, se elimina
  if (cantidadNum <= 0) {
    return eliminarDelCarrito(idProducto);
  }

  // Validación de stock
  const stockMaximo = Number(carrito[indice].stock) || 999;
  if (cantidadNum > stockMaximo) {
    return { 
      ok: false, 
      error: `La cantidad solicitada supera el stock disponible (${stockMaximo} unids).` 
    };
  }

  carrito[indice].cantidad = cantidadNum;
  guardarCarrito(carrito);
  return { ok: true };
};

/**
 * Elimina un producto del carrito
 */
export const eliminarDelCarrito = (idProducto) => {
  const carrito = obtenerCarrito();
  const nuevoCarrito = carrito.filter((item) => String(item.idProducto) !== String(idProducto));
  guardarCarrito(nuevoCarrito);
  return { ok: true };
};

/**
 * Vacía completamente el carrito
 */
export const vaciarCarrito = () => {
  guardarCarrito([]);
};

/**
 * Calcula totales y conteo general de productos en el carrito
 */
export const obtenerTotalesCarrito = () => {
  const carrito = obtenerCarrito();
  const totalArticulos = carrito.reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0);
  const subtotal = carrito.reduce(
    (acc, item) => acc + (Number(item.precioVenta) || 0) * (Number(item.cantidad) || 0),
    0
  );

  return {
    totalArticulos,
    subtotal,
    despacho: subtotal > 50000 ? 0 : (subtotal > 0 ? 3990 : 0), // Despacho gratis sobre $50.000
    total: subtotal + (subtotal > 50000 ? 0 : (subtotal > 0 ? 3990 : 0))
  };
};
