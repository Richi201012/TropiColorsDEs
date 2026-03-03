# Sistema de Facturación SaaS - TropicColors

## Estado: ✅ CONECTADO A FIREBASE

> **Nota**: Este sistema usa **Firebase Firestore** como base de datos en lugar de PostgreSQL/Drizzle.

## 1. Arquitectura General

### Stack Tecnológico
- **Frontend**: React + TypeScript + Tailwind CSS + Radix UI
- **Backend**: Express + TypeScript
- **Base de datos**: PostgreSQL + Drizzle ORM
- **PDF**: jsPDF + jspdf-autotable
- **Email**: Nodemailer

### Estructura de Módulos

```
server/
├── services/
│   ├── invoice.service.ts      # Lógica de facturación
│   ├── pdf.service.ts         # Generación de PDF
│   └── email.service.ts       # Envío de emails
├── routes/
│   └── invoices.ts            # Endpoints API de facturas
└── db.ts                      # Conexión a base de datos

shared/
├── schema.ts                  # Esquemas de base de datos
└── types.ts                   # Tipos compartidos

client/src/
├── components/
│   └── invoices/
│       ├── InvoiceForm.tsx    # Formulario de facturación
│       ├── InvoiceList.tsx    # Lista de facturas
│       └── InvoiceModal.tsx   # Modal de creación
└── pages/
    └── invoices.tsx           # Página de gestión
```

---

## 2. Esquema de Base de Datos

### Tabla: invoices

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| invoiceNumber | VARCHAR(20) | Número de factura único |
| issuerName | TEXT | Nombre del emisor |
| issuerRFC | VARCHAR(13) | RFC del emisor |
| issuerAddress | TEXT | Dirección fiscal emisor |
| issuerEmail | TEXT | Email del emisor |
| issuerPhone | VARCHAR(20) | Teléfono del emisor |
| customerName | TEXT | Nombre del cliente |
| customerRFC | VARCHAR(13) | RFC del cliente |
| customerEmail | TEXT | Email del cliente |
| customerAddress | TEXT | Dirección fiscal |
| subtotal | INTEGER | Subtotal en centavos |
| taxRate | DECIMAL(5,2) | Tasa de IVA (%) |
| taxAmount | INTEGER | Monto de IVA en centavos |
| total | INTEGER | Total en centavos |
| currency | VARCHAR(3) | Moneda (MXN) |
| status | ENUM | pendiente/enviada/pagada |
| notes | TEXT | Notas adicionales |
| items | JSONB | Array de conceptos |
| pdfPath | TEXT | Ruta del PDF generado |
| sentAt | TIMESTAMP | Fecha de envío |
| createdAt | TIMESTAMP | Fecha de creación |
| updatedAt | TIMESTAMP | Fecha de actualización |

### Tabla: invoice_concepts

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| invoiceId | UUID | FK a invoices |
| description | TEXT | Descripción del concepto |
| quantity | DECIMAL(10,2) | Cantidad |
| unitPrice | INTEGER | Precio unitario en centavos |
| amount | INTEGER | Importe total en centavos |

---

## 3. Validaciones (Zod)

### Schema: InvoiceCreateInput

```typescript
{
  // Datos del emisor
  issuerName: string.min(2).max(200),
  issuerRFC: string.regex(/^[A-Z]{3,4}[0-9]{6}[A-Z0-9]{3}$/),
  issuerAddress: string.min(5).max(500),
  issuerEmail: string.email(),
  issuerPhone: string.optional(),

  // Datos del cliente
  customerName: string.min(2).max(200),
  customerRFC: string.regex(/^[A-Z]{3,4}[0-9]{6}[A-Z0-9]{3}$/),
  customerEmail: string.email(),
  customerAddress: string.min(5).max(500),

  // Conceptos
  items: array.object({
    description: string.min(1).max(500),
    quantity: number.positive().max(999999),
    unitPrice: number.positive().max(999999999),
  }).min(1),

  // Impuestos
  taxRate: number.min(0).max(100).default(16),

  // Opcional
  notes: string.optional(),
  sendEmail: boolean.default(true),
}
```

---

## 4. API Endpoints

### POST /api/invoices
Crear una nueva factura.

**Request Body:**
```json
{
  "issuerName": "TropicColors SA de CV",
  "issuerRFC": "TCO980123ABC",
  "issuerAddress": "Av. Principal 123, Ciudad de México",
  "issuerEmail": "facturas@tropicolors.com",
  "issuerPhone": "55-1234-5678",
  "customerName": "Cliente Ejemplo SA de CV",
  "customerRFC": "CEA010101AAA",
  "customerEmail": "cliente@ejemplo.com",
  "customerAddress": "Calle Cliente 456, Guadalajara",
  "items": [
    {
      "description": "Colorante Alimenticio Rojo 40",
      "quantity": 10,
      "unitPrice": 15000
    }
  ],
  "taxRate": 16,
  "notes": "Gracias por su preferencia",
  "sendEmail": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "invoiceNumber": "TCO-0001",
    "subtotal": 150000,
    "taxAmount": 24000,
    "total": 174000,
    "status": "pendiente",
    "sentAt": null
  }
}
```

### GET /api/invoices
Listar todas las facturas.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "invoiceNumber": "TCO-0001",
      "customerName": "Cliente Ejemplo",
      "total": 174000,
      "status": "enviada",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### GET /api/invoices/:id
Obtener detalles de una factura.

### POST /api/invoices/:id/send
Enviar factura por email.

### GET /api/invoices/:id/pdf
Descargar PDF de factura.

---

## 5. Diseño UI/UX

### Colores (Tailwind)
- Primary: `#0D9488` (teal-600)
- Primary Hover: `#0F766E` (teal-700)
- Secondary: `#6366F1` (indigo-500)
- Success: `#10B981` (emerald-500)
- Error: `#EF4444` (red-500)
- Warning: `#F59E0B` (amber-500)
- Background: `#F8FAFC` (slate-50)
- Surface: `#FFFFFF`
- Border: `#E2E8F0` (slate-200)
- Text Primary: `#1E293B` (slate-800)
- Text Secondary: `#64748B` (slate-500)

### Tipografía
- Font Family: Inter / system-ui
- Headings: 600-700 weight
- Body: 400-500 weight
- H1: 24px
- H2: 20px
- H3: 16px
- Body: 14px
- Small: 12px

### Espaciado
- Base: 4px
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- 2XL: 48px

### Componentes

#### InvoiceForm
- Modal de 800px max-width
- 4 secciones con collapsible:
  1. Datos del Emisor
  2. Datos del Cliente
  3. Conceptos (tabla editable)
  4. Configuración (IVA, notas)
- Botones: Cancelar / Vista Previa / Generar
- Validación en tiempo real con mensajes inline
- Totales calculados automáticamente

#### InvoiceList
- Tabla con columnas:
  - Número de factura
  - Cliente
  - Fecha
  - Total
  - Estado (badge)
  - Acciones (ver, descargar, enviar)
- Filtros por estado
- Búsqueda por cliente o número

#### ConceptTable
- Filas editables
- Columns: Descripción, Cantidad, P. Unitario, Importe
- Botón agregar fila
- Eliminar fila por botón
- Auto-cálculo de subtotal

---

## 6. Layout del PDF

### Encabezado (Header)
```
┌─────────────────────────────────────────────────┐
│ [LOGO]                    FACTURA              │
│ TropicColors SA de CV      No. TCO-0001       │
│ RFC: TCO980123ABC          Fecha: 15/01/2024  │
│                            Vigencia: 30 días  │
└─────────────────────────────────────────────────┘
```

### Datos Fiscales (2 columnas)
```
EMISOR                          CLIENTE
TropicColors SA de CV          Cliente Ejemplo SA de CV
Av. Principal 123              Calle Cliente 456
Ciudad de México, CP 01000     Guadalajara, CP 44000
RFC: TCO980123ABC              RFC: CEA010101AAA
Email: facturas@tropicolors    Email: cliente@ejemplo.com
```

### Tabla de Conceptos
```
┌────────────────────────────────────────────────────────┐
│ #  │ Descripción              │ Cantidad │ P. Unitario │
│────┼─────────────────────────┼──────────┼─────────────│
│ 1  │ Colorante Rojo 40        │ 10 pz    │ $150.00     │
│    │                          │          │ $1,500.00   │
│ 2  │ Colorante Azul 1         │ 5 pz     │ $200.00     │
│    │                          │          │ $1,000.00   │
└────────────────────────────────────────────────────────┘
                                              Subtotal: $2,500.00
                                              IVA 16%: $400.00
                                              ──────────────────
                                              TOTAL: $2,900.00
                                              ==================
```

### Pie de página
```
│ Notas: Gracias por su preferencia              │
│Forma de pago: Pago único                       │
│Método de pago: Transferencia electrónica (TEF) │
│┌──────────────────────────────────────────────┐│
│TropicColors SA de CV | RFC: TCO980123ABC     ││
│Este documento es una representación impresa   ││
│de un comprobante fiscal digital               ││
└──────────────────────────────────────────────┘│
```

---

## 7. Flujo Completo

### Creación de Factura
```
1. Usuario abre modal/página de facturas
2. Usuario completa datos del emisor (o usa datos predefinidos)
3. Usuario ingresa datos del cliente
4. Usuario agrega conceptos en tabla
5. Sistema calcula subtotal, IVA y total en tiempo real
6. Usuario hace click en "Generar Factura"
7. Frontend envía datos al backend
8. Backend valida todos los campos
9. Backend calcula totales (no confiar en frontend)
10. Backend genera número de factura único
11. Backend guarda en base de datos
12. Backend genera PDF
13. Si sendEmail=true:
    a. Backend envía email con PDF adjunto
    b. Actualiza status a "enviada"
    c. Guarda fecha de envío
14. Frontend muestra éxito
15. Usuario puede descargar PDF o ver detalles
```

---

## 8. Seguridad

### Validaciones
- Todos los inputs sanitizados con Zod
- RFC validado con regex mexicano
- Email validado con RFC 5322
- Cantidades positivas
- Montos máximos permitidos

### Protección
- Rate limiting en endpoints
- Sanitización de HTML en notas
- Variables SMTP en environment
- No guardar passwords en código

---

## 9. Decisiones Técnicas

### jsPDF vs PDFKit
- **jsPDF**: Más ligero, funciona en cliente y servidor, fácil de usar
- **PDFKit**: Más potente pero complejo para Node.js
- **Elección**: jsPDF por simplicidad y compatibilidad

### Estado de Factura
- `pendiente`: Factura creada pero no enviada
- `enviada`: Enviada por email al cliente
- `pagada`: Cliente realizó el pago (futuro)

### Número de Factura
- Formato: `TCO-XXXX` (TCO = TropicColors)
- Secuencial con padding de ceros
- Unique constraint en base de datos

### Cálculos
- Siempre en centavos para precisión (INTEGER)
- Redondeo a 2 decimales
- Validar que subtotal + IVA = total
