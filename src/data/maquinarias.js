// SISTEMA DE GESTIÓN Y PERSISTENCIA DE ARRIENDO DE MAQUINARIA

import { obtenerSesionActiva } from './auth';

const STORAGE_KEY_MAQUINARIAS = 'ferrefix_maquinarias_v1';
const STORAGE_KEY_CONTRATOS = 'ferrefix_contratos_arriendo_v1';
export const EVENTO_MAQUINARIAS_ACTUALIZADAS = 'ferrefix:maquinarias_actualizadas';

const MAQUINARIAS_INICIALES = [
  {
    idMaquina: 'MAQ-BOSCH-01',
    nombre: 'Martillo Demoledor Bosch GSH 16-28 Professional 1750W',
    marca: 'Bosch',
    categoria: 'Demolición y Perforación Pesada',
    tarifaDia: 28990,
    estado: 'Disponible', // 'Disponible' | 'Arrendada'
    especificaciones: {
      'Potencia Absorbida': '1.750 Watts',
      'Energía de Impacto': '41 Joules',
      'Portaherramientas': 'Hexagonal 28 mm',
      'Peso': '17.9 kg',
      'Rendimiento de arranque': '13 toneladas de hormigón al día',
      'Tecnología': 'Sistema Vibration Control para reducción de fatiga en faena'
    },
    incluye: 'Cincel de punta, cincel plano, paño de limpieza y maletín de transporte con ruedas'
  },
  {
    idMaquina: 'MAQ-BET-02',
    nombre: 'Betonera Trompo Eléctrica 150 Litros 0.75HP',
    marca: 'Ingco Heavy',
    categoria: 'Hormigón y Mezcla',
    tarifaDia: 18990,
    estado: 'Disponible',
    especificaciones: {
      'Capacidad de Tambor': '150 Litros',
      'Motor': '0.75 HP Eléctrico 220V',
      'Ruedas': 'Goma maciza 10" para fácil traslado en obra',
      'Espesor Tambor': 'Chapa de acero 1.8 mm'
    },
    incluye: 'Cable con enchufe industrial Legrand y manubrio de volteo reforzado'
  },
  {
    idMaquina: 'MAQ-GEN-03',
    nombre: 'Generador Eléctrico a Gasolina 6.5kVA Monofásico',
    marca: 'Krafter Pro',
    categoria: 'Energía y Grupos Electrógenos',
    tarifaDia: 24990,
    estado: 'Disponible',
    especificaciones: {
      'Potencia Nominal': '5.500 Watts (Peak 6.500W)',
      'Voltaje': '230V / 50Hz',
      'Autonomía': '9.5 horas al 75% de carga',
      'Capacidad Estanque': '25 Litros Gasolina 93'
    },
    incluye: 'Kit de ruedas de transporte y horómetro digital'
  },
  {
    idMaquina: 'MAQ-PLAC-04',
    nombre: 'Placa Compactadora Vibratoria 90kg Motor 6.5HP',
    marca: 'Husqvarna Construction',
    categoria: 'Compactación y Pavimento',
    tarifaDia: 22990,
    estado: 'Disponible',
    especificaciones: {
      'Peso Operativo': '90 kg',
      'Fuerza Centrífuga': '15 kN',
      'Profundidad de Compactación': 'Hasta 30 cm',
      'Motor': '4 Tiempos 196cc OHV'
    },
    incluye: 'Tanque de agua para asfalto y ruedas rebatibles'
  }
];

const notificarMaquinarias = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENTO_MAQUINARIAS_ACTUALIZADAS));
  }
};

const parseFechaLocal = (valor) => {
  if (!valor) return null;

  const texto = String(valor).slice(0, 10);
  const [anio, mes, dia] = texto.split('-').map(Number);

  if (anio && mes && dia) {
    return new Date(anio, mes - 1, dia);
  }

  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const inicioDelDia = (fecha) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

const aFechaISO = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

/** Calcula la fecha de devolución a partir del inicio y la cantidad de días. */
export const calcularFechaDevolucion = (fechaInicio, dias) => {
  const inicio = parseFechaLocal(fechaInicio) || inicioDelDia(new Date());
  const fecha = new Date(inicio);
  fecha.setDate(fecha.getDate() + Math.max(1, Number(dias) || 1));
  return aFechaISO(fecha);
};

/**
 * Estado operativo del contrato:
 * - Vigente: aún quedan más de 2 días para la devolución.
 * - Por vencer: vence hoy o dentro de los próximos 2 días.
 * - Atrasada: la fecha de devolución ya pasó.
 * - Devuelto: la máquina ya fue devuelta.
 */
export const calcularEstadoContrato = (contrato) => {
  if (!contrato) return 'Vigente';
  if (contrato.estado === 'Devuelto' || contrato.estado === 'Devuelta') return 'Devuelto';

  const devolucion =
    parseFechaLocal(contrato.fechaDevolucion) ||
    parseFechaLocal(calcularFechaDevolucion(contrato.fechaInicio, contrato.diasArriendo));

  if (!devolucion) return 'Vigente';

  const diferenciaDias = Math.round(
    (inicioDelDia(devolucion).getTime() - inicioDelDia(new Date()).getTime()) / 86400000
  );

  if (diferenciaDias < 0) return 'Atrasada';
  if (diferenciaDias <= 2) return 'Por vencer';
  return 'Vigente';
};

export const obtenerMaquinarias = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return MAQUINARIAS_INICIALES;
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY_MAQUINARIAS);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_MAQUINARIAS, JSON.stringify(MAQUINARIAS_INICIALES));
      return MAQUINARIAS_INICIALES;
    }
    const guardadas = JSON.parse(data);
    return Array.isArray(guardadas) ? guardadas : MAQUINARIAS_INICIALES;
  } catch (error) {
    console.error('Error al leer maquinarias:', error);
    return MAQUINARIAS_INICIALES;
  }
};

export const obtenerContratosArriendo = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY_CONTRATOS);
    const contratos = data ? JSON.parse(data) : [];
    if (!Array.isArray(contratos)) return [];

    return contratos.map((contrato) => ({
      ...contrato,
      fechaDevolucion:
        contrato.fechaDevolucion ||
        calcularFechaDevolucion(contrato.fechaInicio, contrato.diasArriendo)
    }));
  } catch {
    return [];
  }
};

/**
 * Registra un contrato de arriendo y cambia el estado de la máquina a 'Arrendada'.
 * El arriendo requiere una sesión de cliente activa.
 */
export const registrarArriendo = (datos) => {
  const { idMaquina, rutUsuario, nombreUsuario, telefono, email, direccion, region, comuna, diasArriendo, fechaInicio } = datos;
  const sesion = obtenerSesionActiva();

  if (!sesion) {
    return { ok: false, error: 'Debes iniciar sesión para arrendar una máquina.' };
  }

  const maquinarias = obtenerMaquinarias();
  const index = maquinarias.findIndex((m) => m.idMaquina === idMaquina);

  if (index === -1) {
    return { ok: false, error: 'La máquina solicitada no existe.' };
  }

  if (maquinarias[index].estado === 'Arrendada') {
    return { ok: false, error: 'Esta máquina se encuentra actualmente arrendada en faena.' };
  }

  const maquina = maquinarias[index];
  const diasNum = Math.max(1, Number(diasArriendo) || 1);
  const totalArriendo = maquina.tarifaDia * diasNum;
  const fechaInicioFinal = fechaInicio || new Date().toISOString().slice(0, 10);

  const contrato = {
    idContrato: `ARR-${Date.now().toString().slice(-6)}`,
    fechaContrato: new Date().toLocaleString('es-CL'),
    idMaquina: maquina.idMaquina,
    nombreMaquina: maquina.nombre,
    marcaMaquina: maquina.marca,
    tarifaDia: maquina.tarifaDia,
    diasArriendo: diasNum,
    fechaInicio: fechaInicioFinal,
    fechaDevolucion: calcularFechaDevolucion(fechaInicioFinal, diasNum),
    totalPagar: totalArriendo,
    idUsuario: datos.idUsuario || sesion.idUsuario || null,
    usuario: {
      rut: rutUsuario.trim(),
      nombre: nombreUsuario.trim(),
      telefono: telefono.trim(),
      email: email.trim(),
      direccion: direccion.trim(),
      region,
      comuna
    },
    estado: 'Vigente'
  };

  // Actualizar estado de máquina
  maquinarias[index].estado = 'Arrendada';
  localStorage.setItem(STORAGE_KEY_MAQUINARIAS, JSON.stringify(maquinarias));

  // Guardar contrato
  const contratos = obtenerContratosArriendo();
  localStorage.setItem(STORAGE_KEY_CONTRATOS, JSON.stringify([contrato, ...contratos]));

  notificarMaquinarias();
  return { ok: true, contrato };
};

/**
 * Da de alta la devolución de una máquina
 */
export const devolverMaquina = (idMaquina) => {
  const maquinarias = obtenerMaquinarias();
  const index = maquinarias.findIndex((m) => m.idMaquina === idMaquina);
  if (index !== -1) {
    maquinarias[index].estado = 'Disponible';
    localStorage.setItem(STORAGE_KEY_MAQUINARIAS, JSON.stringify(maquinarias));
    notificarMaquinarias();
    return true;
  }
  return false;
};

/**
 * Registra la devolución de un contrato activo y libera la máquina.
 */
export const devolverContrato = (idContrato) => {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  const contratos = obtenerContratosArriendo();
  const index = contratos.findIndex((c) => c.idContrato === idContrato);
  if (index === -1) return false;

  const contrato = contratos[index];
  contratos[index] = {
    ...contrato,
    estado: 'Devuelto',
    fechaDevolucionReal: new Date().toISOString().slice(0, 10)
  };
  localStorage.setItem(STORAGE_KEY_CONTRATOS, JSON.stringify(contratos));

  const maquinarias = obtenerMaquinarias();
  const indexMaquina = maquinarias.findIndex((m) => m.idMaquina === contrato.idMaquina);
  if (indexMaquina !== -1) {
    maquinarias[indexMaquina].estado = 'Disponible';
    localStorage.setItem(STORAGE_KEY_MAQUINARIAS, JSON.stringify(maquinarias));
  }

  notificarMaquinarias();
  return true;
};
