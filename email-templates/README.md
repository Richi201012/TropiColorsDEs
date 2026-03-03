# Email de Confirmación de Compra - Tropicolors

## 📋 Resumen Ejecutivo

Este documento contiene las especificaciones técnicas y guía de implementación para el correo electrónico de confirmación de compra de Tropicolors.

---

## 🎨 Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| **Primary Blue** | `#003F91` | Header, botones principales, acentos |
| **Turquoise** | `#00A8B5` | Iconos, badges, sección de confianza |
| **Yellow** | `#FFCD00` | Badge de estado |
| **Magenta** | `#FF2E63` | Acentos highlight |
| **White** | `#FFFFFF` | Fondo principal |
| **Light Gray** | `#f4f6f8` | Fondo externo |
| **Dark** | `#1e293b` | Texto principal, footer |

---

## 🔤 Tipografía

- **Familia**: Poppins (Google Fonts)
- **Fallback**: Arial, sans-serif
- **Tamaños**:
  - Título principal: 26px
  - Subtítulo: 16px
  - Número de pedido: 22px
  - Total: 22px
  - Cuerpo: 13-15px
  - Microcopy: 12px

---

## 📱 Responsive Design

### Mobile-First
- Ancho máximo del contenedor: 600px
- Padding móvil: 20px
- Stack de columnas en móvil (display: block)
- Imágenes de producto: 80x80px en móvil

### Breakpoint
```css
@media screen and (max-width: 600px)
```

---

## 🛡️ Mejores Prácticas Anti-Spam

### Configuración DNS
```
- SPF: v=spf1 include:_spf.tuproveedor.com ~all
- DKIM: publickey._domainkey.tudominio.com
- DMARC: v=DMARC1; p=quarantine; rua=mailto:dmarc@tudominio.com
```

### Contenido Optimizado
- ✅ Relación texto/imagen equilibrada (60/40)
- ✅ No usar TODO MAYÚSCULAS en asunto
- ✅ Evitar palabras spam: "gratis", "urgente", "100%", "sin riesgo"
- ✅ Links con texto descriptivo (no "clic aquí")
- ✅ Personalización con nombre del cliente
- ✅ Preferir dominio propio en links
- ✅ Incluir política de privacidad

### Asunto Recomendado
```
✅ "Confirmación de tu pedido #TC-2847591 - Tropicolors"
❌ "¡GRATIS! Tu pedido está confirmado URGENTE"
```

---

## 🌙 Modo Oscuro (Dark Mode)

El template incluye soporte nativo para dark mode mediante:

```css
@media (prefers-color-scheme: dark) {
    .dark-mode-bg { background-color: #1a1a2e !important; }
    .dark-mode-text { color: #ffffff !important; }
    .dark-mode-card { background-color: #16213e !important; }
}
```

**Nota**: Los clientes de email handlean dark mode de diferentes maneras:
- Apple Mail: Soporta media queries
- Gmail: Convierte a dark mode automáticamente
- Outlook: Soporte limitado

---

## 📧 Compatibilidad con Clientes de Email

### Probado en:
- ✅ Gmail (Web & App)
- ✅ Apple Mail (iOS & macOS)
- ✅ Outlook (Desktop & Web)
- ✅ Yahoo Mail
- ✅ Proton Mail

### Técnicas de Compatibilidad:
- ✅ Table-based layout (sin divs floats)
- ✅ Inline CSS (no clases externas)
- ✅ Estilos en línea para cada elemento
- ✅ Width explícitos en tablas
- ✅ VML para botones (Outlook)
- ✅ Meta tags para Apple Mail

---

## 🔧 Personalización del Template

### Datos a Reemplazar (Placeholders)

```javascript
// Datos del cliente
{{customer_name}}        // "María García López"
{{customer_email}}      // "maria@ejemplo.com"
{{customer_phone}}      // "+52 55 1234 5678"

// Datos del pedido
{{order_number}}        // "TC-2847591"
{{order_date}}          // "25 feb 2026, 12:34 PM"
{{order_status}}        // "Pendiente de envío"

// Datos de envío
{{shipping_address}}    // "Av. Principal #123, Int. 4B"
{{shipping_neighborhood}} // "Colonia Centro"
{{shipping_city}}       // "Ciudad de México"
{{shipping_state}}     // "CDM"
{{shipping_zip}}       // "06000"
{{shipping_country}}   // "México"

// Productos
{{products}}            // Loop de productos

// Totales
{{subtotal}}            // "$243.00"
{{shipping_cost}}       // "$75.00"
{{taxes}}               // "$38.88"
{{total}}               // "$356.88"

// Links
{{order_url}}           // "https://tropicolors.com/pedido/TC-2847591"
{{shop_url}}           // "https://tropicolors.com"
{{unsubscribe_url}}    // "https://tropicolors.com/unsubscribe"

// Redes sociales
{{facebook_url}}       // "https://facebook.com/tropicolors"
{{whatsapp_url}}       // "https://wa.me/525551146856"
{{instagram_url}}      // "https://instagram.com/tropicolors"
```

---

## 📦 Estructura del HTML

```
order-confirmation.html
├── <head>
│   ├── Meta tags (viewport, description)
│   ├── Google Fonts (Poppins)
│   ├── Estilos reset
│   ├── Dark mode queries
│   └── Responsive queries
│
├── <body>
│   ├── Preview text (hidden)
│   ├── Main wrapper table
│   ├── Container (600px max)
│   │   ├── HEADER (Primary Blue #003F91)
│   │   ├── ORDER CONFIRMATION (Order details card)
│   │   ├── SHIPPING INFO (Two column layout)
│   │   ├── PRODUCT SUMMARY (Product cards)
│   │   ├── PAYMENT SUMMARY (Totals table)
│   │   ├── CTA BUTTONS (Primary & Secondary)
│   │   ├── TRUST SECTION (Returns, Support)
│   │   └── FOOTER (Social,, Legal)
│ Contact   └── End container
```

---

## 💡 Microcopy Included

### Header
- "¡Gracias por tu compra!"
- "Estamos preparando tu pedido con mucho cuidado."

### Shipping
- "📦 Información de envío"
- "⚠️ Revisa que estos datos sean correctos. Si necesitas hacer un cambio, contáctanos de inmediato."

### Trust
- "✉️ Te notificaremos cuando tu pedido sea enviado."
- "🔄 Política de devoluciones: 30 días para devoluciones sin costo"
- "💬 Soporte: WhatsApp +52 55 5114 6856"

---

## 🔐 Protección de Datos

### Datos NO incluidos en el email:
- ❌ Contraseñas
- ❌ Números completos de tarjeta (solo últimos 4 dígitos)
- ❌ Historial de navegación
- ❌ Datos sensibles del cliente

### Datos sí incluidos:
- ✅ Nombre para personalización
- ✅ Número de pedido (no sensible)
- ✅ Dirección de envío (necesario para transparencia)
- ✅ Resumen de compra (para verificación)

---

## 🚀 Implementación

### Integración con tu Backend

**Node.js/Express:**
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Leer template
const template = fs.readFileSync('./email-templates/order-confirmation.html', 'utf-8');

// Reemplazar placeholders
const html = template
  .replace('{{customer_name}}', order.customer.name)
  .replace('{{order_number}}', order.orderNumber)
  // ... más reemplazos

await transporter.sendMail({
  from: '"Tropicolors" <noreply@tropicolors.com>',
  to: order.customer.email,
  subject: `Confirmación de tu pedido #${order.orderNumber} - Tropicolors`,
  html: html
});
```

---

## 📏 Especificaciones Técnicas

|属性|Valor|
|---|---|
|Ancho máximo|600px|
|Alto mínimo|Auto (contenido)|
|Fondo exterior|#f4f6f8|
|Fondo container|#ffffff|
|Borde radio|12px|
|Padding estándar|30px|
|Tamaño imágenes producto|80x80px (móvil), 100x100px (desktop)|
|Tamaño logo|160px ancho|

---

## ✅ Checklist Pre-Envío

- [ ] Reemplazar todos los placeholders con datos reales
- [ ] Verificar que las imágenes tengan URLs absolutas
- [ ] Probar en dispositivos móviles
- [ ] Probar en diferentes clientes de email
- [ ] Verificar links funcionan correctamente
- [ ] Confirmar asunto no tiene palabras spam
- [ ] Verificar configuración SPF/DKIM/DMARC
- [ ] Prueba A/B del asunto (opcional)

---

## 📞 Soporte

Para dudas sobre implementación:
- **Email**: tropicolors@hotmail.com
- **WhatsApp**: +52 55 5114 6856

---

*Documento generado para Tropicolors - 2026*
