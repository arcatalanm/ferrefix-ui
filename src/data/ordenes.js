// SISTEMA DE GESTIÓN Y PERSISTENCIA DE ÓRDENES / BOLETAS

const STORAGE_KEY_ORDENES = 'ferrefix_ordenes_v1';
export const EVENTO_ORDENES_ACTUALIZADAS = 'ferrefix:ordenes_actualizadas';

const ORDENES_INICIALES = [
  {
    idOrden: 'ORD-20240701',
    fecha: '2024-10-10 14:32',
    cliente: {
      nombre: 'Pedro González',
      email: 'pedro.gonzalez@example.com',
      direccion: 'Los Crisantemos 450, Depto 603, Cerrillos',
      telefono: '+56 9 8765 4321'
    },
    items: [
      { idProducto: '5422223214', nombre: 'Taladro Percutor Inalámbrico 20V', cantidad: 1, precioUnitario: 129990 }
    ],
    total: 129990,
    estado: 'Completada',
    metodoPago: 'WebPay Plus (Débito)'
  },
  {
    idOrden: 'ORD-20240702',
    fecha: '2024-10-11 10:15',
    cliente: {
      nombre: 'María Valenzuela',
      email: 'm.valenzuela@obraingenieria.cl',
      direccion: 'Av. Providencia 1240, Providencia',
      telefono: '+56 9 9123 4567'
    },
    items: [
      { idProducto: '5422223215', nombre: 'Sierra Circular 7-1/4" 1800W', cantidad: 2, precioUnitario: 149990 },
      { idProducto: '5422223216', nombre: 'Esmeril Angular 4-1/2" 850W', cantidad: 1, precioUnitario: 54990 }
    ],
    total: 354970,
    estado: 'Completada',
    metodoPago: 'Transferencia Bancaria'
  },
  {
    idOrden: 'ORD-20240703',
    fecha: '2024-10-12 18:40',
    cliente: {
      nombre: 'Juan Carlos Muñoz',
      email: 'jc.munoz@construccion.cl',
      direccion: 'Pasaje El Roble 89, Maipú',
      telefono: '+56 9 7890 1234'
    },
    items: [
      { idProducto: '5422223217', nombre: 'Cemento Bío Bío Extra Especial 25kg', cantidad: 10, precioUnitario: 4990 }
    ],
    total: 49900,
    estado: 'En Preparación',
    metodoPago: 'WebPay Plus (Crédito)'
  }
];

const notificarOrdenes = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENTO_ORDENES_ACTUALIZADAS));
  }
};

export const obtenerOrdenes = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return ORDENES_INICIALES;
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY_ORDENES);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_ORDENES, JSON.stringify(ORDENES_INICIALES));
      return ORDENES_INICIALES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error al leer órdenes de localStorage:', e);
    return ORDENES_INICIALES;
  }
};

export const crearOrden = (datosOrden) => {
  const ordenes = obtenerOrdenes();
  const timestamp = Date.now().toString().slice(-6);
  const correlativo = String(ordenes.length + 1).padStart(4, '0');

  const nuevaOrden = {
    ...datosOrden,
    idOrden: datosOrden.idOrden || `ORD-2024-${timestamp}`,
    numeroBoleta: datosOrden.numeroBoleta || `BOL-2024-${correlativo}`,
    fecha: new Date().toLocaleString('es-CL', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    estado: datosOrden.estado || 'Completada'
  };

  const listaActualizada = [nuevaOrden, ...ordenes];
  localStorage.setItem(STORAGE_KEY_ORDENES, JSON.stringify(listaActualizada));
  notificarOrdenes();
  return nuevaOrden;
};

