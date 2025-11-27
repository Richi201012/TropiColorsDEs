# Tropicolors - Colorantes Artificiales

## Overview

Tropicolors is a single-page React application for a company specializing in artificial food colorant powders and concentrates for the food industry and cleaning products. The application serves as a marketing and sales platform featuring a complete product catalog of 36 items organized by color categories, integrated shopping cart with WhatsApp checkout, company information, testimonials, and direct WhatsApp integration for quotations. Built with modern web technologies and Framer Motion animations, it delivers a visually-stunning, highly responsive experience with MGX-inspired design patterns including animated hero sections, scroll-triggered animations, and bold brand colors.

## Recent Changes (November 2025)

- Added animated hero section with floating color blobs and particle effects
- Implemented scroll-triggered fade-in animations across all sections using Framer Motion
- Enhanced product cards with hover effects and staggered entry animations
- Added gradient backgrounds and decorative overlays between sections
- Improved testimonials section with animated stars and quotes
- Created dedicated WhatsApp CTA section with prominent green styling
- Enhanced footer with company info, contact details, and animated social links
- Added toast notifications when products are added to cart
- Fixed ParticleField particles memoized as PARTICLES constant to prevent re-render issues
- Enhanced product catalog with detailed descriptions, sizes, and use cases for each product:
  - Products now show descriptions explaining the colorant's purpose
  - Size badges indicate packaging (1 Kg, 6 Kg, 20 Kg Cubeta, Sobres)
  - Use badges show intended use (Alimentos, Limpieza, Industrial, Carne Al Pastor, Pan/Pollo)
- Updated stats to show "36+ Productos" to match actual catalog size

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing (single-page application architecture)

**UI Component Library**
- Shadcn/ui (New York style variant) providing a comprehensive set of accessible, customizable components
- Radix UI primitives for headless, accessible component foundations
- Tailwind CSS for utility-first styling with custom design tokens

**State Management**
- TanStack Query (React Query) for server state management and data fetching
- React hooks for local component state

**Design System**
- Custom color palette defined in CSS variables featuring brand colors (Primary Blue #003F91, Turquoise #00A8B5, Yellow #FFCD00, Magenta #FF2E63)
- Poppins font family loaded from Google Fonts
- Responsive breakpoints using Tailwind's mobile-first approach
- Custom elevation system with hover and active states for interactive elements

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server framework
- HTTP server created with Node's native `http` module
- Middleware stack includes JSON body parsing, URL-encoded form parsing, and static file serving

**Development vs Production**
- Development: Vite middleware integration for HMR and on-demand compilation
- Production: Pre-built static assets served from `dist/public`
- Build process uses esbuild for server bundling with selective dependency bundling

**Routing Structure**
- API routes prefixed with `/api`
- Client-side routing handled by Wouter
- Fallback to index.html for SPA behavior (all non-API routes)

### Data Storage

**Database**
- PostgreSQL configured via Drizzle ORM
- Neon serverless PostgreSQL driver for connection pooling and edge compatibility
- Schema definition in TypeScript with Drizzle's type-safe query builder

**Current Schema**
- Users table with UUID primary keys, username, and password fields
- Schema extensibility planned for product catalogs, quotations, or contact forms

**ORM & Migrations**
- Drizzle Kit for schema migrations (`drizzle.config.ts`)
- Type-safe schema inference with Zod validation schemas
- Migration files generated in `/migrations` directory

**Storage Abstraction**
- Interface-based storage layer (`IStorage`) allowing multiple implementations
- In-memory storage (`MemStorage`) for development/testing
- Production storage would connect to PostgreSQL via Drizzle

### External Dependencies

**Third-Party UI Libraries**
- Radix UI: Complete suite of accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- Embla Carousel: Touch-friendly carousel/slider component
- React Hook Form with Zod resolvers for form validation
- Lucide React & React Icons: Icon libraries for UI elements

**Styling & Utilities**
- Tailwind CSS: Utility-first CSS framework with custom configuration
- Class Variance Authority (CVA): Type-safe variant styling
- clsx & tailwind-merge: Conditional class name utilities
- PostCSS with Autoprefixer for CSS processing

**WhatsApp Integration**
- Direct WhatsApp Web API links using `wa.me` format
- Pre-formatted message parameter: "Hola quiero cotizar colorantes Tropicolors"
- Phone number: +52 55 5114 6856
- Integration via standard anchor tags (no SDK required)

**Developer Tools (Replit-specific)**
- Vite plugins for runtime error overlay, cartographer, and dev banner
- TSX for TypeScript execution in development
- Custom build script combining Vite (client) and esbuild (server)

**Additional Services**
- Google Fonts API for Poppins font family
- Date-fns for date manipulation utilities
- Session management support via express-session and connect-pg-simple (configured but not actively used)