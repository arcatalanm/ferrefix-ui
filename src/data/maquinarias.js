const CONTRATOS_INICIALES = [
  {
    idContrato: 'ARR-924110',
    fechaContrato: '19/10/2024, 09:30:00',
    idMaquina: 'MAQ-BET-02',
    nombreMaquina: 'Betonera Trompo Eléctrica 150 Litros 0.75HP',
    marcaMaquina: 'Ingco Heavy',
    tarifaDia: 18990,
    diasArriendo: 5,
    fechaInicio: '2024-10-20',
    totalPagar: 94950,
    usuario: {
      idUsuario: 'USR-003',
      rut: '15.432.890-K',
      nombre: 'Juan Maestro',
      telefono: '+56 9 8765 4321',
      email: 'cliente@ferrefix.cl',
      direccion: 'Av. Providencia 1240, Depto 502',
      region: 'Región Metropolitana',
      comuna: 'Providencia'
    },
    estado: 'Vigente'
  }
];

import boschImg from "../assets/maquinarias/arriendo-bosch.webp";
import ingcoImg from "../assets/maquinarias/arriendo-ingco.webp";
import krafterImg from "../assets/maquinarias/arriendo-krafter.webp";
import husqvarnaImg from "../assets/maquinarias/arriendo-husqvarna.webp";

export const IMAGENES_MAQUINARIAS = {
  "MAQ-BOSCH-01": boschImg,
  "MAQ-BET-02": ingcoImg,
  "MAQ-GEN-03": krafterImg,
  "MAQ-PLAC-04": husqvarnaImg,
  "Bosch": boschImg,
  "Ingco Heavy": ingcoImg,
  "Krafter Pro": krafterImg,
  "Husqvarna Construction": husqvarnaImg
};

// SISTEMA DE GESTIÓN Y PERSISTENCIA DE ARRIENDO DE MAQUINARIA

const STORAGE_KEY_MAQUINARIAS = 'ferrefix_maquinarias_v1';
const STORAGE_KEY_CONTRATOS = 'ferrefix_contratos_arriendo_v1';
export const EVENTO_MAQUINARIAS_ACTUALIZADAS = 'ferrefix:maquinarias_actualizadas';

const MAQUINARIAS_INICIALES = [
  {
    idMaquina: 'MAQ-BOSCH-01',
    imagen: boschImg,
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
    imagen: ingcoImg,
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
    imagen: krafterImg,
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
    imagen: husqvarnaImg,
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
    const parsed = JSON.parse(data);
    return parsed.map((m) => ({
      ...m,
      imagen: IMAGENES_MAQUINARIAS[m.idMaquina] || IMAGENES_MAQUINARIAS[m.marca] || m.imagen
    }));
  } catch (error) {
    console.error('Error al leer maquinarias:', error);
    return MAQUINARIAS_INICIALES;
  }
};

export const obtenerContratosArriendo = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return CONTRATOS_INICIALES;
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY_CONTRATOS);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_CONTRATOS, JSON.stringify(CONTRATOS_INICIALES));
      return CONTRATOS_INICIALES;
    }
    return JSON.parse(data);
  } catch {
    return CONTRATOS_INICIALES;
  }
};

/**
 * Registra un contrato de arriendo y cambia el estado de la máquina a 'Arrendada'
 */
export const registrarArriendo = (datos) => {
  const { idMaquina, rutUsuario, nombreUsuario, telefono, email, direccion, region, comuna, diasArriendo, fechaInicio } = datos;

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

  const contrato = {
    idContrato: `ARR-${Date.now().toString().slice(-6)}`,
    fechaContrato: new Date().toLocaleString('es-CL'),
    idMaquina: maquina.idMaquina,
    nombreMaquina: maquina.nombre,
    marcaMaquina: maquina.marca,
    tarifaDia: maquina.tarifaDia,
    diasArriendo: diasNum,
    fechaInicio: fechaInicio || new Date().toISOString().slice(0, 10),
    totalPagar: totalArriendo,
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
