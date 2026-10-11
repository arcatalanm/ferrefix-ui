import taladroPercutor from '../assets/products/taladro-percutor.webp';
import sierraCircular from '../assets/products/sierra-circular.webp';
import esmerilAngular from '../assets/products/esmeril-angular.webp';
import cementoBioBio from '../assets/products/cemento-biobio.webp';
import setBrocas from '../assets/products/set-brocas.webp';
import generadorElectrico from '../assets/products/generador-electrico.webp';
import llaveMonomando from '../assets/products/llave-monomando.webp';
import esmalteCeresita from '../assets/products/esmalte-ceresita.webp';
import arnesSeguridad from '../assets/products/arnes-seguridad.webp';
import tornillosDrywall from '../assets/products/tornillos-drywall.webp';

export const PRODUCTOS = [
  {
    idProducto: '5422223214',
    nombre: 'Taladro Percutor Inalámbrico 20V Max XR',
    marca: 'DeWalt',
    categoria: 'Herramientas',
    precioVenta: 129990,
    imagen: taladroPercutor,
    stock: 12,
    descripcion: 'Taladro percutor inalámbrico compacto con motor sin carbones (Brushless) de alto rendimiento. Ofrece mayor autonomía y durabilidad para perforaciones exigentes en concreto, madera y metal. Cuenta con luz LED integrada con temporizador para iluminar el área de trabajo en espacios reducidos.',
    especificaciones: {
      'Potencia / Voltaje': '20V MAX',
      'Tipo de Motor': 'Brushless (Sin escobillas)',
      'Velocidad variable': '0 - 550 / 0 - 2,000 RPM',
      'Impactos por minuto': '0 - 34,000 GPM',
      'Mandril': '1/2 pulgada (13 mm) metálico autoajustable',
      'Peso': '1.6 kg',
      'Garantía': '3 años oficial de la marca',
      'Incluye': '2 Baterías 20V 2.0Ah, cargador rápido y maletín rígido'
    }
  },
  {
    idProducto: '5422223215',
    nombre: 'Sierra Circular 7-1/4" 1800W con Guía Láser',
    marca: 'Makita',
    categoria: 'Herramientas',
    precioVenta: 149990,
    imagen: sierraCircular,
    stock: 8,
    descripcion: 'Sierra circular potente diseñada para cortes longitudinales y transversales precisos en madera maciza y derivados. Equipada con base de aluminio resistente, soplador de polvo integrado y empuñadura ergonómica antideslizante para mayor control y seguridad.',
    especificaciones: {
      'Potencia': '1800 Watts',
      'Diámetro del disco': '7-1/4" (185 mm)',
      'Velocidad sin carga': '5,800 RPM',
      'Profundidad de corte a 90°': '64 mm',
      'Profundidad de corte a 45°': '43 mm',
      'Peso': '4.2 kg',
      'Garantía': '1 año oficial Makita',
      'Incluye': 'Disco de carburo de 24 dientes, guía paralela y llave'
    }
  },
  {
    idProducto: '5422223216',
    nombre: 'Esmeril Angular 4-1/2" 850W Heavy Duty',
    marca: 'Bosch',
    categoria: 'Herramientas',
    precioVenta: 54990,
    imagen: esmerilAngular,
    stock: 25,
    descripcion: 'Esmeril angular profesional diseñado para corte, desbaste y lijado en metales y mampostería. Su carcasa compacta permite un agarre cómodo con una sola mano, mientras que sus rejillas de ventilación optimizadas extienden la vida útil del motor.',
    especificaciones: {
      'Potencia': '850 Watts',
      'Diámetro del disco': '4-1/2" (115 mm)',
      'Velocidad': '11,000 RPM',
      'Eje': 'M14 estándar',
      'Peso': '1.9 kg',
      'Garantía': '2 años oficial Bosch',
      'Incluye': 'Empuñadura auxiliar, guarda de protección y llave de brida'
    }
  },
  {
    idProducto: '5422223217',
    nombre: 'Cemento Especial Bío Bío Saco 25 kg',
    marca: 'Bío Bío',
    categoria: 'Construcción',
    precioVenta: 4890,
    imagen: cementoBioBio,
    stock: 140,
    descripcion: 'Cemento de uso general de fraguado controlado y alta resistencia mecánica inicial y final. Formulado para la confección de hormigones estructurales, morteros de pega, estucos y radieres residenciales e industriales.',
    especificaciones: {
      'Presentación': 'Saco de 25 kg',
      'Tipo': 'Cemento hidráulico alta resistencia',
      'Norma': 'NCh148 Of.68',
      'Rendimiento estimado': 'Aprox. 0.02 m³ de mortero por saco',
      'Uso recomendado': 'Cimientos, sobrecimientos, losas y albañilería',
      'Almacenamiento': 'Lugar seco y bajo techo sobre tarima'
    }
  },
  {
    idProducto: '5422223218',
    nombre: 'Set de Brocas y Puntas Mixtas 100 Piezas en Estuche',
    marca: 'Bosch',
    categoria: 'Fijaciones',
    precioVenta: 29990,
    imagen: setBrocas,
    stock: 18,
    descripcion: 'Set integral para taladrado y atornillado compatible con todas las marcas de taladros del mercado. Incluye brocas para madera, metal (HSS-TiN) y concreto, además de una amplia variedad de puntas Phillips, Pozidriv, Torx y hexagonales con adaptador magnético.',
    especificaciones: {
      'Cantidad de piezas': '100 unidades',
      'Material brocas metal': 'Acero rápido con recubrimiento de titanio',
      'Brocas para concreto': 'Punta de carburo de tungsteno (3 a 8 mm)',
      'Brocas para madera': 'Puntas centradoras helicoidales (3 a 10 mm)',
      'Estuche': 'Maletín modular de plástico de alto impacto',
      'Garantía': '6 meses'
    }
  },
  {
    idProducto: '5422223219',
    nombre: 'Generador Eléctrico a Gasolina 3000W 7HP Monofásico',
    marca: 'KRAFTER',
    categoria: 'Electricidad',
    precioVenta: 289990,
    imagen: generadorElectrico,
    stock: 5,
    descripcion: 'Generador a combustión ideal para respaldo eléctrico en hogares, parcelas o faenas de construcción donde no hay suministro de red. Posee regulador automático de voltaje (AVR) que protege artefactos sensibles contra fluctuaciones eléctricas.',
    especificaciones: {
      'Potencia Nominal': '2800 Watts',
      'Potencia Máxima': '3000 Watts',
      'Motor': '4 tiempos 7.0 HP OHV monocilíndrico',
      'Capacidad estanque': '15 Litros',
      'Autonomía': 'Aprox. 9 horas a media carga',
      'Voltaje / Frecuencia': '220V / 50 Hz',
      'Sistema de partida': 'Manual retráctil',
      'Garantía': '1 año'
    }
  },
  {
    idProducto: '5422223220',
    nombre: 'Set Llave Monomando Lavaplatos Cuello Flexible Negro Mate',
    marca: 'Stretto',
    categoria: 'Gasfitería',
    precioVenta: 42990,
    imagen: llaveMonomando,
    stock: 15,
    descripcion: 'Grifería monomando moderna con caño de silicona flexible de 360 grados y terminación negro mate de alta resistencia a la corrosión. Incorpora cartucho cerámico antifuga de 35 mm y aireador que reduce hasta un 40% el consumo de agua.',
    especificaciones: {
      'Material': 'Cuerpo de latón macizo y cuello flexible de silicona',
      'Acabado': 'Negro Mate electrostático',
      'Tipo de cierre': 'Cartucho cerámico 35 mm',
      'Conexión': 'Flexibles de acero inoxidable G 1/2"',
      'Presión de trabajo': '1 a 5 bar',
      'Garantía': '5 años'
    }
  },
  {
    idProducto: '5422223221',
    nombre: 'Esmalte al Agua Profesional Blanco Semibrillo 1 Galón',
    marca: 'Ceresita',
    categoria: 'Pinturas',
    precioVenta: 31990,
    imagen: esmalteCeresita,
    stock: 32,
    descripcion: 'Pintura esmalte al agua de formulación premium con tecnología antihongos y antibacterias. Posee excelente lavabilidad, secado rápido y bajo olor, ideal para aplicación en muros interiores y exteriores de baños, cocinas, piezas y fachadas.',
    especificaciones: {
      'Formato': '1 Galón (3.785 Litros)',
      'Terminación': 'Semibrillo',
      'Rendimiento': '40 a 45 m² por mano por galón',
      'Tiempo de secado al tacto': '30 a 60 minutos',
      'Repintado': '4 a 6 horas',
      'Base': 'Acuosa (Lavable con agua)',
      'Uso': 'Interior y exterior'
    }
  },
  {
    idProducto: '5422223222',
    nombre: 'Arnés de Seguridad 4 Argollas Anticaídas con Cabo de Vida',
    marca: 'Steelpro',
    categoria: 'Seguridad',
    precioVenta: 45990,
    imagen: arnesSeguridad,
    stock: 20,
    descripcion: 'Arnés de cuerpo entero diseñado para detención de caídas y posicionamiento en trabajos en altura. Fabricado en cintas de poliéster de alta tenacidad con costuras reforzadas, hebillas de conexión rápida y almohadilla lumbar transpirable para mayor confort.',
    especificaciones: {
      'Argollas': '1 dorsal anticaídas, 2 laterales de posicionamiento, 1 esternal',
      'Cinta': 'Poliéster 45 mm resistencia a la tracción > 25 kN',
      'Cabo de vida': 'Incluido con absorbedor de impacto y mosquetones doble seguro',
      'Certificación': 'Norma Chilena NCh 1258 y certificación CESMEC',
      'Capacidad máxima': '140 kg (usuario + herramientas)',
      'Garantía': '1 año contra defectos de fabricación'
    }
  },
  {
    idProducto: '5422223223',
    nombre: 'Pack 1000 Tornillos Autoperforantes Drywall 6x1-1/4"',
    marca: 'Mamut',
    categoria: 'Fijaciones',
    precioVenta: 11990,
    imagen: tornillosDrywall,
    stock: 55,
    descripcion: 'Tornillos fosfatizados negros con punta broca diseñados para la fijación de planchas de yeso cartón (Volcanita/Gyplac) a perfiles metálicos estructurales (Metalcon) de hasta 0.85 mm de espesor sin necesidad de guía previa.',
    especificaciones: {
      'Medida': '6 x 1-1/4" (Aprox. 32 mm longitud)',
      'Cabeza': 'Trompeta ranura Phillips N°2',
      'Punta': 'Broca autoperforante',
      'Recubrimiento': 'Fosfatizado negro anticorrosivo',
      'Presentación': 'Caja de 1000 unidades',
      'Uso recomendado': 'Tabiquería, cielos falsos y perfiles Metalcon'
    }
  }
];

export const CATEGORIAS_PRODUCTOS = [
  'Todas',
  'Construcción',
  'Maderas',
  'Herramientas',
  'Fijaciones',
  'Gasfitería',
  'Electricidad',
  'Pinturas',
  'Cerámicas',
  'Seguridad'
];