import {
  ChangelogRelease,
  SystemAnnouncement,
} from '../models/announcement.model';

export const DEMO_ANNOUNCEMENTS: SystemAnnouncement[] = [
  {
    id: 1,
    tipo: 'CAIDA_SERVICIO',
    titulo: 'Intermitencia Externa en Proveedor de Servicios Electrónicos (OSE SUNAT)',
    mensaje:
      'El servicio de validación de comprobantes de OSE SUNAT presenta latencias anormales de hasta 45 segundos. La plataforma ha activado el encolamiento asíncrono preventivo en Amazon SQS para garantizar que ninguna venta se pierda.',
    afectaServicio: true,
    publicadoPorNombre: 'Aldair (Tech Lead)',
    publicadoPorRol: 'DEV_INGENIERO',
    inicioEvento: '2026-03-13T09:15:00Z',
    finEstimado: '2026-03-13T14:00:00Z',
    createdAt: '2026-03-13T09:20:00Z',
  },
  {
    id: 2,
    tipo: 'MANTENIMIENTO_PROGRAMADO',
    titulo: 'Mantenimiento Preventivo de Base de Datos Amazon RDS MySQL 8.4',
    mensaje:
      'Actualización menor del motor y reindexación nocturna de tablas transaccionales en el cluster Multi-AZ. Se realizará un failover automático transparente de 90 segundos.',
    afectaServicio: false,
    publicadoPorNombre: 'Henry (Administrador General)',
    publicadoPorRol: 'ADMIN',
    inicioEvento: '2026-03-15T23:00:00Z',
    finEstimado: '2026-03-16T00:30:00Z',
    createdAt: '2026-03-12T16:00:00Z',
  },
  {
    id: 3,
    tipo: 'SEGURIDAD',
    titulo: 'Actualización Obligatoria de Contraseñas y Política de Cero Confianza',
    mensaje:
      'En cumplimiento con la auditoría de seguridad semestral, todos los agentes de soporte y desarrolladores deberán actualizar sus claves a un mínimo de 12 caracteres con caracteres alfanuméricos y símbolos.',
    afectaServicio: false,
    publicadoPorNombre: 'Comité de Seguridad TI',
    publicadoPorRol: 'ADMIN',
    createdAt: '2026-03-10T11:00:00Z',
  },
  {
    id: 4,
    tipo: 'COMUNICADO_OPERATIVO',
    titulo: 'Despliegue del Nuevo Portal Web OpsHub en Amazon CloudFront',
    mensaje:
      'Se ha completado el despliegue del portal web de alta disponibilidad en Angular 21, ofreciendo tiempos de carga inferiores a 250ms a nivel nacional vía CDN CloudFront.',
    afectaServicio: false,
    publicadoPorNombre: 'Aldair (Tech Lead)',
    publicadoPorRol: 'DEV_INGENIERO',
    createdAt: '2026-03-08T08:00:00Z',
  },
];

export const DEMO_CHANGELOGS: ChangelogRelease[] = [
  {
    id: 1,
    versionTag: 'v2.5.0',
    titulo: 'Módulo de Facturación Offline, Boletas Bluetooth y Guías GRE',
    tipoRelease: 'MINOR',
    resumen:
      'Emisión desconectada con sincronización asíncrona SQS, soporte para impresión térmica ESC/POS en React Native y validación de Guías de Remisión Electrónicas.',
    detalles: [
      'Encolamiento local en SQLite cifrado para comprobantes fuera de línea en la app móvil.',
      'Impresión directa por Bluetooth 58mm/80mm hacia ticketeras portátiles.',
      'Soporte completo para GRE Remitente y Transportista con validación hash SUNAT.',
      'Resolución del issue #INC-2026-0042 de desborde de memoria en colas SQS.',
    ],
    redactadoPorNombre: 'Aldair (Tech Lead)',
    fechaLanzamiento: '2026-03-15',
    createdAt: '2026-03-12T18:00:00Z',
  },
  {
    id: 2,
    versionTag: 'v2.4.0',
    titulo: 'Integración Niubiz / MercadoPago y Tablero Kanban Drag & Drop',
    tipoRelease: 'MINOR',
    resumen:
      'Pasarelas de pago con links dinámicos, QR interoperable Yape/Plin y nuevo panel de priorización RICE con cálculo de impacto en ARR.',
    detalles: [
      'Webhooks bidireccionales con conciliación automática de transacciones con pasarelas.',
      'Tablero Kanban interactivo Drag & Drop en Angular 21 para feedback de producto.',
      'Simulador de bloqueo concurrente optimista con HTTP 409 Conflict.',
      'Trazabilidad de clientes solicitantes vinculados a cartera anual de ingresos.',
    ],
    redactadoPorNombre: 'Aldair (Tech Lead)',
    fechaLanzamiento: '2026-02-28',
    createdAt: '2026-02-28T12:00:00Z',
  },
  {
    id: 3,
    versionTag: 'v2.3.0',
    titulo: 'Autenticación Multi-Factor TOTP y Ficha Comercial 360°',
    tipoRelease: 'MAJOR',
    resumen:
      'Autenticación de doble factor obligatoria para emisión fiscal y directorio comercial 360° con semáforo de Churn Risk.',
    detalles: [
      'Implementación del algoritmo RFC 6238 TOTP compatible con Google Authenticator.',
      'Cálculo automático de retención y salud de cuentas SaaS con ARR superior a $10K USD.',
      'Gestión de contactos autorizados RU06 con validación de seguridad.',
      'Cierre preventivo de sesiones simultáneas no autorizadas.',
    ],
    redactadoPorNombre: 'Henry (Administrador)',
    fechaLanzamiento: '2026-01-20',
    createdAt: '2026-01-20T10:00:00Z',
  },
];
