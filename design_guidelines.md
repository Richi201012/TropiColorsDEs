# TROPICOLORS Design Guidelines

## Design Approach
**Reference-Based**: Inspired by MGX (https://mgx-8u5s7o11w3w.mgx.world/) featuring large blocks, modern typography, ample spacing, and clean buttons. Create a modern, clean, highly visual responsive design.

## Typography
- **Font Family**: Poppins or Montserrat (Google Fonts)
- **Hierarchy**: Large hero titles, clear section headers, readable body text

## Color Palette (Brand Colors - Use Decisively)
- Primary Blue: `#003F91`
- Turquoise: `#00A8B5`
- Yellow: `#FFCD00`
- Magenta: `#FF2E63`
- White: `#FFFFFF`

## Layout System
- **Spacing**: Tailwind units of 4, 6, 8, 12, 16, 20 (p-4, p-8, py-12, py-16, py-20)
- **Responsive Grid**: Flexbox and CSS Grid for product cards and benefit sections
- **Container**: Max-width containers with appropriate padding
- **Sections**: Full-width colored backgrounds alternating with white sections

## Component Library

### Header
- Fixed navbar with TROPICOLORS logo (left)
- Navigation menu with smooth scroll links (Inicio, Productos, Sobre nosotros, Beneficios, Contacto, Cotizar)
- Primary "Cotizar por WhatsApp" button (right side)
- Mobile responsive hamburger menu

### Hero Section
- **Large block** with ample vertical padding (py-20 to py-32)
- Main title: "Colorantes Artificiales Tropicolors"
- Subtitle: "Alta concentración, colores intensos y calidad para tus alimentos"
- Two CTAs: "Ver productos" (scroll action), "Cotizar por WhatsApp" (WhatsApp link)
- White background with CSS color splash accents (abstract colorful shapes/gradients)

### Products Section
- Responsive grid: 1 column mobile, 2 columns tablet, 3 columns desktop
- Product cards with:
  - Product image (placeholder if needed)
  - Product name (bold)
  - Description
  - Presentation details (30ml, 60ml, 120ml, etc.)
  - "Comprar" button (dummy)
  - "Cotizar por WhatsApp" button (functional)
- Minimum 6 products: Liquid 30ml, 60ml, 120ml, Gel 30ml, Powder, Color pack

### About Section
- Clean typography-focused layout
- Text: "Tropicolors es una microempresa mexicana especializada en colorantes artificiales para alimentos y productos de limpieza..."
- Optional supporting imagery (products, team, or process)

### Benefits Section
- Visual cards/icons grid (2-3 columns desktop, 1 column mobile)
- 7 benefits:
  1. Alta concentración
  2. Colores brillantes
  3. No altera sabor
  4. Económico y rendidor
  5. Apto para alimentos y bebidas
  6. Se mezcla fácilmente
  7. Presentaciones variadas

### WhatsApp CTA Section
- **Prominent colored background** block
- Large heading: "¿Quieres precios de mayoreo o una cotización personalizada?"
- Large CTA button: "📲 Cotizar por WhatsApp"

### Contact Section
- Display information clearly:
  - Tel/WhatsApp: +52 55 5114 6856
  - Email: tropicolors@hotmail.com
  - Facebook: Tropicolors
  - Horario: 9:00 – 18:00
- Optional aesthetic contact form (non-functional)

### Footer
- TROPICOLORS logo (small)
- Copyright text: "© 2024 Tropicolors. Todos los derechos reservados"
- Links to WhatsApp, email, Facebook

### Floating WhatsApp Button
- Fixed bottom-right corner
- Circular button with WhatsApp icon
- Always links to: https://wa.me/525551146856?text=Hola%20quiero%20cotizar%20colorantes%20Tropicolors

## UI Elements
- **Buttons**: Rounded corners (rounded-lg or rounded-full), soft shadows, smooth hover transitions
- **Cards**: Subtle shadows, rounded corners, white backgrounds
- **Icons**: Use Font Awesome or Heroicons via CDN
- **Smooth Scroll**: Implement smooth scrolling for navigation links

## Images
- **Hero**: Abstract color splashes or gradient background (CSS-based preferred)
- **Products**: Product photos in cards (use placeholders initially)
- **About/Benefits**: Optional supporting imagery showing products or usage

## Animations
- Subtle hover effects on buttons (scale, shadow, color transitions)
- Smooth scroll animations when navigating sections
- Minimal scroll-triggered entrance animations (optional)

## Critical Links
All "Cotizar" buttons must link to: `https://wa.me/525551146856?text=Hola%20quiero%20cotizar%20colorantes%20Tropicolors`