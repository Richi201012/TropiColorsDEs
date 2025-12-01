# TropiColorsDEs

## Despliegue en Vercel

1. En Vercel ve a **Project Settings > General > Build & Development Settings**.
2. En **Node.js Version** selecciona `20.x` (o "Use package.json"), ya que el proyecto esta configurado para esa version.
3. Guarda los cambios y vuelve a desplegar.

Notas:
- El archivo `.nvmrc` y el bloque `engines` en `package.json` fuerzan Node 20 tambien en entornos locales/CI.
- Si necesitas otra version tendras que actualizar el runtime configurado en `vercel.json`.

## Configuración de pagos y notificaciones

1. **Llaves de Stripe**  
   - Cliente: define `VITE_STRIPE_PUBLISHABLE_KEY` en los ajustes de variables de Vercel (o en un `.env.local` durante desarrollo).  
   - Servidor: prepara `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` para crear PaymentIntents en `/api/checkout` y validar los eventos entrantes.  
   - Registra el webhook `https://tropi-colors-d-es.vercel.app/api/payment-webhook` con los eventos `payment_intent.succeeded` y `payment_intent.payment_failed`.

2. **WhatsApp (Twilio Sandbox)**  
   - Registra tu cuenta gratuita en Twilio, habilita el Sandbox de WhatsApp y obtén `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` y el número `TWILIO_WHATSAPP_FROM`.  
   - Agrega también `WHATSAPP_ADMIN_NUMBER` (tu teléfono) para que el backend sepa a dónde notificar.

3. **Flujo esperado**  
   - El frontend crea una sesión llamando a `POST /api/checkout` con el carrito y datos de contacto. El backend responde con `clientSecret` y un `orderId`.  
   - Stripe confirma el pago a través del webhook y, en esa confirmación, el backend envía el mensaje de WhatsApp con los datos del pedido.

> El archivo `client/src/lib/stripe.ts` carga la llave pública sólo cuando existe, así que el sitio puede desplegarse aunque aún no configures los secretos. Cuando agregues las variables anteriores ya tendrás visible el formulario de pago en el modal de checkout.
