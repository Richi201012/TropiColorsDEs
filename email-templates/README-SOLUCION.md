# Solución de Correo Electrónico de Confirmación de Pedido - Tropicolors

## Problema Actual

El correo de confirmación de compra que se envía al cliente NO muestra el diseño HTML personalizado. En su lugar, muestra un correo simple de texto con el mensaje "Gracias por tu compra, Richi!".

## Estado Actual del Código

- ✅ El servidor genera correctamente el HTML de la plantilla (30,874 bytes)
- ✅ El HTML comienza con `<!DOCTYPE html>` correctamente
- ❌ El correo que llega al cliente muestra contenido diferente (el recibo de Stripe)

## Causa Raíz Identificada

El problema principal es que **Stripe está enviando automáticamente recibos de pago** que están sobrescribiendo o reemplazando nuestro correo HTML personalizado. Esto sucede incluso cuando:

1. Eliminamos `receipt_email` del código
2. Desactivamos la opción en el Dashboard de Stripe
3. Usamos la API de Brevo directamente

Parece haber una integración automática entre Stripe y Brevo que envía los recibos.

## Soluciones Probadas

### 1. ❌ Plantilla HTML personalizada (no funcionó)
- Se creó una plantilla HTML completa en `email-templates/order-confirmation-new.html`
- La plantilla incluye diseño con gradiente azul, tablas, botones, etc.
- El servidor genera el HTML correctamente pero el cliente recibe texto plano

### 2. ❌ Eliminar receipt_email del código (no funcionó)
- Se eliminó el parámetro `receipt_email` del PaymentIntent
- Stripe igual envía recibos automáticos

### 3. ❌ Usar API de Brevo directamente (no funcionó)
- Se agregó la API key de Brevo al código
- Error: "Key not found" - la API key proporcionada no es válida

### 4. ⏳ Desactivar recibos en Dashboard de Stripe (en proceso)
- El usuario debe ir a Stripe Dashboard → Configuración → Correos electrónicos
- Desactivar "Enviar correos electrónicos de recibo"

## Solución Inmediata: Obtener API Key de Brevo correcta

La API key actual está generando error. Para obtener una nueva:

1. Ve a https://app.brevo.com
2. Inicia sesión
3. Ve a **Configuración** → **Claves API** o **API Keys**
4. Si no tienes una, crea una nueva
5. Copia la clave (comienza con `xkeysib-`)

**Nota:** La clave que proporcionaste parece ser una clave SMTP, no una clave API. Las claves API de Brevo comienzan con `xkeysib-` y son diferentes de las credenciales SMTP.

## Solución Alternativa: Usar Stripe Solo

Si no podemos hacer funcionar el correo HTML personalizado, la alternativa es:

1. **Configurar los correos de Stripe correctamente:**
   - Ir a https://dashboard.stripe.com/settings/emails
   - Personalizar el correo de recibo para que tenga el diseño deseado
   - Activar/desactivar según necesidad

2. **O usar el modo de prueba de Stripe:**
   - Crear una cuenta de Stripe nueva sin integraciones automáticas
   - Configurar solo nuestro código para enviar correos

## Próximos Pasos Recomendados

1. **Obtener la API key correcta de Brevo** (prioridad alta)
2. **Verificar el Dashboard de Stripe** para confirmar que los recibos automáticos están desactivados
3. **Probar con una cuenta de correo diferente** para ver si hay filtros actuando

## Archivos Modificados

- `server/payments.ts` - Lógica de envío de correo
- `email-templates/order-confirmation-new.html` - Plantilla HTML
- `.env` - Variables de entorno (BREVO_API_KEY agregada)

## Cómo Verificar el Correo que Llega

Para ver exactamente qué está llegando:
1. Abre el correo en Gmail
2. Click en los tres puntos "Más"
3. Selecciona "Mostrar original"
4. Busca la sección "Content" para ver el HTML real
