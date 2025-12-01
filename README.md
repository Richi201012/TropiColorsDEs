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
   - Servidor: prepara `STRIPE_SECRET_KEY` (crea PaymentIntents), `STRIPE_WEBHOOK_SECRET` (valida eventos), y registra el endpoint `https://tropi-colors-d-es.vercel.app/api/payment-webhook` escuchando al menos `payment_intent.succeeded` y `payment_intent.payment_failed`.  
   - Stripe enviará su recibo si pasas `receipt_email`. Nosotros ya enviamos el correo del sitio usando SMTP.
   - Para pruebas locales el frontend usa por defecto la llave pública `pk_test_51SZal26DEBxCnRhdMu56iaEmlW3a4f66LOxfYk3xXABTjnvDfreSoQOxjEYJQkcBgutgnpPyH90gwnGEqCWOinPT00JAePClQG`. En producción, sobrescribe con tu propia llave usando `VITE_STRIPE_PUBLISHABLE_KEY`.

2. **WhatsApp (Twilio Sandbox)**  
   - Registra tu cuenta gratuita en Twilio, habilita el Sandbox de WhatsApp y obtén `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` y `TWILIO_WHATSAPP_FROM`.  
   - Define `WHATSAPP_ADMIN_NUMBER` con el número (en formato internacional) que debe recibir la notificación cuando se confirme el pago.

3. **Correo SMTP (correo propio)**  
   - Configura tu servidor o proveedor SMTP con las variables:  
     - `EMAIL_SMTP_HOST`, `EMAIL_SMTP_PORT`, `EMAIL_SMTP_SECURE` (`true/false`), `EMAIL_SMTP_USER`, `EMAIL_SMTP_PASS`.  
     - `EMAIL_FROM`: remitente que verá el cliente (ej. `ventas@tropicolors.com`).  
     - `EMAIL_TO`: lista separada por comas para las alertas internas (ej. `ventas@tropicolors.com,admin@...`).  
   - El backend enviará un correo al admin en todos los casos y, cuando Stripe confirme el pago, también mandará un correo de agradecimiento al cliente.

4. **Flujo esperado**  
   - El frontend crea una sesión llamando a `POST /api/checkout` con carrito + datos de contacto. El backend crea el PaymentIntent y guarda la orden (tabla `orders`).  
   - Stripe confirma el pago a través del webhook. En ese webhook actualizamos la orden, enviamos el WhatsApp por Twilio y los correos personalizados.  
   - Si algo falla, Stripe manda `payment_intent.payment_failed` y avisamos al correo interno para dar seguimiento manual.

5. **Base de datos**  
   - Añadimos la tabla `orders` para guardar el carrito, cliente y estado del PaymentIntent. Ejecuta `npm run db:push` después de configurar `DATABASE_URL` para crear/actualizar la tabla.

> El archivo `client/src/lib/stripe.ts` carga la llave pública sólo cuando existe, así que el sitio puede desplegarse aunque aún no configures los secretos. Cuando agregues las variables anteriores ya tendrás visible el formulario de pago en el modal de checkout. En modo local `npm run dev` utiliza los mismos endpoints (`/api/checkout` y `/api/payment-webhook`) a través del servidor Express.
