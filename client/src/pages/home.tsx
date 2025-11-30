import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Droplet,
  Sparkles,
  ThumbsUp,
  Wallet,
  Utensils,
  Droplets,
  Package,
  Phone,
  Mail,
  Clock,
  Menu,
  X,
  MessageCircle,
  ChevronDown,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Search,
  Star,
  Zap,
  Award,
  Quote,
} from "lucide-react";
import { SiFacebook, SiWhatsapp } from "react-icons/si";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import logoImage from "@assets/logo-2021100510533067100_1764265250371.jpeg";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FloatingBlob({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.floor(Math.random() * 100),
  y: Math.floor(Math.random() * 100),
  size: Math.floor(Math.random() * 6 + 2),
  delay: Math.floor(Math.random() * 5),
  duration: Math.floor(Math.random() * 10 + 10),
}));

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-br from-white/20 to-white/5"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

const WHATSAPP_LINK = "https://wa.me/525551146856";

type ProductSection = { name: string; color: string; products: { id: number; name: string; description: string; price: number; size: string; use: string; gradient: string }[] };

const productSections: ProductSection[] = [
  {
    name: "Rojos y Rosas",
    color: "pink",
    products: [
      { id: 1, name: "Rosa Brillante 250", description: "Colorante artificial para alimentos y limpieza. Tono rosa chicle intenso.", price: 6500, size: "10 Kg", use: "Alimentos y Limpieza", gradient: "from-pink-400 to-rose-600" },
      { id: 2, name: "Rosa Brillante 125", description: "Colorante artificial comestible y para limpieza. Color rosa brillante vibrante.", price: 380, size: "1 Kg", use: "Alimentos y Limpieza", gradient: "from-pink-500 to-pink-700" },
      { id: 3, name: "Rosa Brillante Sobres", description: "Exhibidor con sobres individuales de 5g. Ideal para uso doméstico.", price: 594, size: "100 sobres x 5g", use: "Alimentos y Limpieza", gradient: "from-pink-500 to-rose-500" },
      { id: 4, name: "Rojo Fresa 125", description: "Colorante artificial rojo fresa. Ideal para bebidas, postres y repostería.", price: 340, size: "1 Kg", use: "Alimentos", gradient: "from-red-400 to-rose-500" },
      { id: 5, name: "Rojo Fresa 250", description: "Colorante rojo fresa concentrado. Mayor rendimiento para uso profesional.", price: 669, size: "1 Kg", use: "Alimentos", gradient: "from-red-500 to-rose-600" },
      { id: 6, name: "Rojo Grosella 250", description: "Colorante rojo grosella intenso. Excelente para bebidas y postres.", price: 648, size: "1 Kg", use: "Alimentos", gradient: "from-red-600 to-red-800" },
      { id: 7, name: "Rojo Uva 125", description: "Colorante artificial tono uva. Perfecto para aguas frescas y gelatinas.", price: 400, size: "1 Kg", use: "Alimentos", gradient: "from-red-500 to-red-700" },
      { id: 8, name: "Rojo Púrpura 125", description: "Colorante rojo púrpura para alimentos. Tono elegante y vibrante.", price: 320, size: "1 Kg", use: "Alimentos", gradient: "from-rose-500 to-purple-600" },
      { id: 9, name: "Rosa Brillante Cubeta", description: "Presentación industrial en cubeta. Ideal para negocios de alto volumen.", price: 5800, size: "20 Kg", use: "Alimentos y Limpieza", gradient: "from-pink-400 to-rose-500" },
    ],
  },
  {
    name: "Amarillos y Naranjas",
    color: "yellow",
    products: [
      { id: 10, name: "Amarillo Huevo 125 Sobres", description: "Exhibidor con 100 sobres. Ideal para panadería, pollo y pastas.", price: 486, size: "100 sobres x 5g", use: "Alimentos (Pan, Pollo)", gradient: "from-yellow-400 to-yellow-600" },
      { id: 11, name: "Amarillo Naranja 250", description: "Colorante artificial amarillo-naranja concentrado. Alta intensidad de color.", price: 420, size: "1 Kg", use: "Alimentos", gradient: "from-yellow-500 to-orange-500" },
      { id: 12, name: "Amarillo Limón 250", description: "Colorante amarillo limón para alimentos. Tono brillante y natural.", price: 360, size: "1 Kg", use: "Alimentos", gradient: "from-yellow-300 to-yellow-500" },
      { id: 13, name: "Naranja 850 Pack 18pz", description: "Pack de 18 piezas especial para carne al pastor. Color naranja intenso.", price: 3600, size: "18 piezas x 250g", use: "Carne Al Pastor", gradient: "from-orange-500 to-amber-500" },
      { id: 14, name: "Naranja 850 Pack 12pz", description: "Pack de 12 piezas para tacos al pastor. Rinde para grandes cantidades.", price: 2400, size: "12 piezas x 250g", use: "Carne Al Pastor", gradient: "from-orange-400 to-orange-600" },
      { id: 15, name: "Naranja 850 Individual", description: "Colorante naranja especial para carne al pastor. Presentación individual.", price: 240, size: "250g", use: "Carne Al Pastor", gradient: "from-orange-400 to-orange-600" },
      { id: 16, name: "Amarillo Naranja 125", description: "Colorante amarillo-naranja claro. Perfecto para bebidas y postres.", price: 240, size: "1 Kg", use: "Alimentos", gradient: "from-yellow-500 to-orange-500" },
      { id: 17, name: "Amarillo Huevo 250 Cubeta", description: "Cubeta industrial de 20 Kg. Para negocios de panadería y pollo.", price: 5616, size: "20 Kg", use: "Alimentos (Pan, Pollo)", gradient: "from-yellow-400 to-yellow-600" },
      { id: 18, name: "Amarillo Limón 125 Cubeta", description: "Cubeta de 20 Kg. Ideal para negocios con alto consumo.", price: 3200, size: "20 Kg", use: "Alimentos", gradient: "from-yellow-300 to-yellow-500" },
      { id: 19, name: "Amarillo Naranja 125 Cubeta", description: "Cubeta industrial. Rendimiento profesional para grandes producciones.", price: 3780, size: "20 Kg", use: "Alimentos", gradient: "from-orange-400 to-orange-600" },
      { id: 20, name: "Amarillo Canario Cubeta", description: "Colorante amarillo canario en cubeta. Tono brillante y vibrante.", price: 3456, size: "20 Kg", use: "Alimentos", gradient: "from-yellow-300 to-yellow-500" },
      { id: 21, name: "Amarillo Huevo 125", description: "Colorante para pan, pollo, pastas y más. Uso profesional y doméstico.", price: 210, size: "1 Kg", use: "Alimentos (Pan, Pollo)", gradient: "from-yellow-400 to-yellow-600" },
      { id: 22, name: "Amarillo Huevo 250", description: "Concentración alta para mayor rendimiento. Ideal para grandes producciones.", price: 420, size: "1 Kg", use: "Alimentos", gradient: "from-yellow-400 to-yellow-600" },
    ],
  },
  {
    name: "Azules y Verdes",
    color: "blue",
    products: [
      { id: 23, name: "Azul 125", description: "Colorante artificial azul para alimentos y limpieza. Color intenso.", price: 410, size: "1 Kg", use: "Alimentos y Limpieza", gradient: "from-blue-500 to-cyan-500" },
      { id: 24, name: "Azul Sobres 100pz", description: "Exhibidor con 100 sobres de 5g. Práctico para uso individual.", price: 490, size: "100 sobres x 5g", use: "Alimentos", gradient: "from-blue-400 to-blue-600" },
      { id: 25, name: "Azul 250", description: "Colorante azul concentrado. Mayor intensidad y rendimiento.", price: 750, size: "1 Kg", use: "Alimentos", gradient: "from-blue-500 to-blue-700" },
      { id: 26, name: "Verde Limón 125 (6 Kg)", description: "Presentación de 6 Kg. Ideal para negocios medianos.", price: 1050, size: "6 Kg", use: "Alimentos", gradient: "from-green-500 to-emerald-500" },
      { id: 27, name: "Verde Limón 125 Cubeta", description: "Cubeta industrial de 20 Kg. Para alto consumo.", price: 3200, size: "20 Kg", use: "Alimentos", gradient: "from-green-400 to-emerald-600" },
      { id: 28, name: "Verde Limón 125", description: "Colorante verde limón brillante. Tono fresco y vibrante.", price: 210, size: "1 Kg", use: "Alimentos", gradient: "from-green-400 to-emerald-500" },
      { id: 29, name: "Verde Esmeralda 125", description: "Colorante verde esmeralda intenso. Ideal para bebidas y postres.", price: 270, size: "1 Kg", use: "Alimentos", gradient: "from-green-500 to-emerald-600" },
      { id: 30, name: "Verde Limón 250", description: "Verde limón concentrado. Mayor rendimiento por kilogramo.", price: 313, size: "1 Kg", use: "Alimentos", gradient: "from-green-400 to-emerald-500" },
      { id: 31, name: "Verde Esmeralda 250", description: "Verde esmeralda alta concentración. Color profundo y elegante.", price: 583, size: "1 Kg", use: "Alimentos", gradient: "from-green-500 to-emerald-700" },
    ],
  },
  {
    name: "Negros, Marrones y Violetas",
    color: "gray",
    products: [
      { id: 32, name: "Negro 250 (1 Kg)", description: "Colorante negro para alimentos y limpieza. Color intenso y uniforme.", price: 820, size: "1 Kg", use: "Alimentos y Limpieza", gradient: "from-gray-700 to-gray-900" },
      { id: 33, name: "Negro 250 (100g)", description: "Presentación pequeña ideal para uso doméstico o pruebas.", price: 113, size: "100g", use: "Alimentos", gradient: "from-gray-700 to-gray-900" },
      { id: 34, name: "Café Caramelo 125", description: "Colorante café caramelo. Perfecto para postres y bebidas de café.", price: 260, size: "1 Kg", use: "Alimentos", gradient: "from-amber-700 to-amber-900" },
      { id: 35, name: "Café Chocolate 250", description: "Colorante café chocolate intenso. Ideal para repostería y bebidas.", price: 631, size: "1 Kg", use: "Alimentos", gradient: "from-amber-800 to-amber-900" },
      { id: 36, name: "Violeta Industrial", description: "Colorante violeta para uso industrial. Alta concentración.", price: 720, size: "1 Kg", use: "Industrial", gradient: "from-violet-500 to-purple-600" },
    ],
  },
];

const allProducts = productSections.flatMap(section => section.products);

const benefits = [
  { icon: Droplet, title: "Alta Concentración", description: "Pequeñas cantidades para colores intensos y vibrantes" },
  { icon: Sparkles, title: "Colores Brillantes", description: "Tonos vivos que destacan en cualquier preparación" },
  { icon: ThumbsUp, title: "No Altera Sabor", description: "Fórmula neutra que no modifica el gusto de tus recetas" },
  { icon: Wallet, title: "Económico y Rendidor", description: "Máximo rendimiento con mínima cantidad de producto" },
  { icon: Utensils, title: "Apto para Alimentos", description: "Seguro para bebidas, postres, repostería y más" },
  { icon: Droplets, title: "Fácil de Mezclar", description: "Se disuelve rápidamente en agua o alcohol" },
  { icon: Package, title: "Variedad de Presentaciones", description: "Tamaños para uso doméstico y profesional" },
];

const testimonials = [
  {
    id: 1,
    name: "Daniela Cruz",
    business: "Repostería Dulce Sueño",
    rating: 5,
    text: "Los colorantes de Tropicolors son excelentes. Mis pasteles se ven mucho más vibrantes y los clientes están encantados con los resultados.",
    image: "ML",
  },
  {
    id: 2,
    name: "Carlos Mendoza",
    business: "Panadería La Tradicional",
    rating: 5,
    text: "Llevo 3 años usando sus productos. La calidad es consistente y el precio es muy competitivo. Totalmente recomendado.",
    image: "CM",
  },
  {
    id: 3,
    name: "Ana García",
    business: "Negocio de Bebidas Gourmet",
    rating: 5,
    text: "Excelente servicio y productos. El equipo de Tropicolors siempre está disponible para ayudar con las cotizaciones.",
    image: "AG",
  },
];


type CartItem = { id: number; name: string; price: number; quantity: number };

function Header({ scrollToSection, cartCount, onCartClick }: { scrollToSection: (id: string) => void; cartCount: number; onCartClick: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Inicio", id: "inicio" },
    { label: "Productos", id: "productos" },
    { label: "Nosotros", id: "nosotros" },
    { label: "Beneficios", id: "beneficios" },
    { label: "Contacto", id: "contacto" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border" : "bg-transparent"}`} data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection("inicio")} data-testid="link-logo">
            <img src={logoImage} alt="Tropicolors Logo" className="h-20 sm:h-12 w-auto rounded-md" />
          </div>

          <nav className="hidden lg:flex items-center gap-1" data-testid="nav-desktop">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-md hover-elevate"
                data-testid={`nav-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <Button onClick={onCartClick} variant="outline" size="icon" className="relative" data-testid="button-cart">
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
            <Button
              onClick={() => window.open(`${WHATSAPP_LINK}?text=Hola%20quiero%20cotizar%20colorantes%20Tropicolors`, "_blank")}
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white border-[#20BD5A] gap-2"
              data-testid="button-whatsapp-header"
            >
              <SiWhatsapp className="w-4 h-4" />
              <span className="hidden md:inline">Cotizar</span>
            </Button>
          </div>

          <button
            className="lg:hidden p-2 rounded-md hover-elevate"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="button-menu-toggle"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-background/98 backdrop-blur-lg border-b border-border" data-testid="nav-mobile">
          <nav className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  scrollToSection(item.id);
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-base font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors"
                data-testid={`nav-mobile-${item.id}`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 space-y-2">
              <Button
                onClick={onCartClick}
                variant="outline"
                className="w-full justify-start gap-2"
                data-testid="button-cart-mobile"
              >
                <ShoppingCart className="w-4 h-4" />
                Carrito ({cartCount})
              </Button>
              <Button
                onClick={() => window.open(`${WHATSAPP_LINK}?text=Hola%20quiero%20cotizar%20colorantes%20Tropicolors`, "_blank")}
                className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white border-[#20BD5A] gap-2"
                data-testid="button-whatsapp-mobile"
              >
                <SiWhatsapp className="w-4 h-4" />
                Cotizar
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero({ scrollToSection }: { scrollToSection: (id: string) => void }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      data-testid="section-hero"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
      
      <FloatingBlob 
        className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[hsl(var(--tropicolors-magenta))] to-transparent opacity-30 rounded-full blur-3xl" 
        delay={0} 
      />
      <FloatingBlob 
        className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-bl from-[hsl(var(--tropicolors-turquoise))] to-transparent opacity-25 rounded-full blur-3xl" 
        delay={1} 
      />
      <FloatingBlob 
        className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-tr from-[hsl(var(--tropicolors-yellow))] to-transparent opacity-25 rounded-full blur-3xl" 
        delay={2} 
      />
      <FloatingBlob 
        className="absolute bottom-40 right-1/4 w-64 h-64 bg-gradient-to-tl from-[hsl(var(--tropicolors-blue))] to-transparent opacity-30 rounded-full blur-3xl" 
        delay={0.5} 
      />
      <FloatingBlob 
        className="absolute top-1/3 left-1/3 w-48 h-48 bg-gradient-to-br from-pink-500 to-transparent opacity-20 rounded-full blur-2xl" 
        delay={3} 
      />
      
      <ParticleField />

      <motion.div 
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{ y, opacity }}
      >
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5 backdrop-blur-sm">
              Colorantes Artificiales Premium
            </Badge>
          </motion.div>

          <div className="space-y-6">
            <motion.h1 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-foreground leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-[hsl(var(--tropicolors-blue))] via-[hsl(var(--tropicolors-turquoise))] to-[hsl(var(--tropicolors-magenta))] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                TROPICOLORS
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Colorantes de alta calidad para alimentos y productos de limpieza. 
              <span className="text-foreground font-medium"> Colores vibrantes</span>, máximo rendimiento y economía.
            </motion.p>
          </div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Button
              onClick={() => scrollToSection("productos")}
              className="px-8 py-6 text-lg group relative overflow-hidden"
              size="lg"
              data-testid="button-explore-products"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Explorar Productos
              </span>
            </Button>
            <Button
              onClick={() => window.open(`${WHATSAPP_LINK}?text=Hola%20quiero%20más%20información%20sobre%20sus%20productos`, "_blank")}
              variant="outline"
              className="px-8 py-6 text-lg border-2 group"
              size="lg"
              data-testid="button-contact-hero"
            >
              <SiWhatsapp className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Contáctanos
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <button
          onClick={() => scrollToSection("productos")}
          className="p-3 rounded-full bg-muted/50 hover:bg-muted transition-all hover:scale-110 backdrop-blur-sm border border-border/50"
          data-testid="button-scroll-down"
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </button>
      </motion.div>
    </section>
  );
}

const categoryColors: Record<string, string> = {
  "Rojos y Rosas": "bg-gradient-to-r from-pink-500 to-rose-500",
  "Amarillos y Naranjas": "bg-gradient-to-r from-yellow-400 to-orange-500",
  "Azules y Verdes": "bg-gradient-to-r from-blue-500 to-emerald-500",
  "Negros, Marrones y Violetas": "bg-gradient-to-r from-gray-600 to-violet-600",
};

function ProductsSection({ cart, setCart }: { cart: CartItem[]; setCart: (cart: CartItem[]) => void }) {
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(productSections[0].name);
  const [filteredProducts, setFilteredProducts] = useState(productSections[0].products);
  const { toast } = useToast();

  useEffect(() => {
    const currentSection = productSections.find(s => s.name === activeCategory);
    if (!currentSection) return;

    if (!searchTerm.trim()) {
      setFilteredProducts(currentSection.products);
      return;
    }
    
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = currentSection.products.filter(p =>
      p.name.toLowerCase().includes(lowerSearch)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, activeCategory]);

  const handleAddToCart = (product: (typeof allProducts)[0]) => {
    const quantity = quantities[product.id] || 1;
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, quantity }]);
    }
    
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    
    toast({
      title: "Agregado al carrito",
      description: `${product.name} x${quantity} agregado correctamente`,
    });
  };

  const updateQuantity = (id: number, value: number) => {
    if (value > 0) setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="productos" className="py-20 sm:py-28 bg-muted/30 relative overflow-hidden" data-testid="section-productos" ref={sectionRef}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm">Catálogo</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Nuestros <span className="text-primary">Productos</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Selecciona una categoría para ver nuestros colorantes
          </p>

          <motion.div 
            className="flex flex-wrap justify-center gap-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {productSections.map((section, index) => (
              <motion.button
                key={section.name}
                onClick={() => {
                  setActiveCategory(section.name);
                  setSearchTerm("");
                }}
                className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                  activeCategory === section.name
                    ? `${categoryColors[section.name]} text-white shadow-lg scale-105`
                    : "bg-card border border-border text-foreground hover:border-primary/50 hover:shadow-md"
                }`}
                whileHover={{ scale: activeCategory === section.name ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-testid={`button-category-${section.name}`}
              >
                {section.name}
                <span className="ml-2 text-xs opacity-80">({section.products.length})</span>
              </motion.button>
            ))}
          </motion.div>

          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar en esta categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-11 shadow-sm"
              data-testid="input-product-search"
            />
          </div>
        </motion.div>

        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h3 className={`text-2xl font-bold text-transparent bg-clip-text ${categoryColors[activeCategory]} inline-block`}>
            {activeCategory}
          </h3>
        </motion.div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No se encontraron productos que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                variants={staggerItem}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card className="group overflow-visible hover-elevate transition-all duration-300 flex flex-col h-full" data-testid={`card-product-${product.id}`}>
                  <div className={`h-48 bg-gradient-to-br ${product.gradient} relative overflow-hidden rounded-t-xl`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center text-white">
                        <Droplet className="w-16 h-16 mx-auto mb-2 opacity-90 drop-shadow-lg" />
                        <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                          Colorante en Polvo
                        </Badge>
                      </div>
                    </motion.div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-black/30 text-white border-0 backdrop-blur-sm text-xs">
                        Premium
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                    <div>
                      <h4 className="text-lg font-semibold mb-1" data-testid={`text-product-name-${product.id}`}>{product.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">{product.size}</Badge>
                        <Badge variant="secondary" className="text-xs">{product.use}</Badge>
                      </div>
                      <p className="text-2xl font-bold text-primary">${product.price.toLocaleString('es-MX')}</p>
                    </div>

                    <div className="flex-1" />

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Cantidad:</span>
                        <div className="flex items-center border border-border rounded-md bg-muted/30">
                          <button
                            onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) - 1)}
                            className="p-2 hover:bg-muted transition-colors"
                            data-testid={`button-decrease-${product.id}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={quantities[product.id] || 1}
                            onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                            className="w-12 text-center border-0 focus:ring-0 text-sm bg-transparent font-medium"
                            data-testid={`input-quantity-${product.id}`}
                          />
                          <button
                            onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) + 1)}
                            className="p-2 hover:bg-muted transition-colors"
                            data-testid={`button-increase-${product.id}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white border-[#20BD5A] gap-1.5 group/btn"
                        data-testid={`button-add-to-cart-${product.id}`}
                      >
                        <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        Agregar al Carrito
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="nosotros" className="py-20 sm:py-28" data-testid="section-nosotros">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-8">
            <div>
              <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm">Sobre Nosotros</Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                Conoce <span className="text-primary">Tropicolors</span>
              </h2>
            </div>
            
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                <strong className="text-foreground">Tropicolors</strong> es una microempresa mexicana especializada en colorantes artificiales para alimentos y productos de limpieza.
              </p>
              <p>
                Nuestros productos ofrecen <strong className="text-foreground">alta concentración</strong>, excelente rendimiento y <strong className="text-foreground">colores vibrantes</strong> para repostería, bebidas, postres y mucho más.
              </p>
              <p>
                Con años de experiencia en el mercado, nos hemos convertido en la opción preferida de reposteros, panaderos y hogares que buscan calidad y economía en sus colorantes.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4">
              <div className="text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-primary">100+</div>
                <p className="text-sm text-muted-foreground mt-2">Clientes Satisfechos</p>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-primary">36+</div>
                <p className="text-sm text-muted-foreground mt-2">Productos</p>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-primary">5+</div>
                <p className="text-sm text-muted-foreground mt-2">Años en el Mercado</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-2xl" />
            <div className="relative bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Teléfono</h4>
                    <p className="text-muted-foreground">+52 55 5114 6856</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-muted-foreground">tropicolors@hotmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Horario</h4>
                    <p className="text-muted-foreground">Lunes a Viernes: 9:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="beneficios" className="py-20 sm:py-28 bg-muted/30 relative overflow-hidden" data-testid="section-beneficios" ref={ref}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[hsl(var(--tropicolors-blue))] via-[hsl(var(--tropicolors-turquoise))] to-[hsl(var(--tropicolors-magenta))]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm">Beneficios</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            ¿Por qué elegir <span className="text-primary">Tropicolors</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre los beneficios que hacen de nuestros colorantes la opción perfecta
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          data-testid="benefits-grid"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                variants={staggerItem}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card
                  className="hover-elevate transition-all duration-300 h-full border-t-4 border-t-transparent hover:border-t-primary"
                  data-testid={`card-benefit-${index}`}
                >
                  <CardContent className="p-6 space-y-4">
                    <motion.div 
                      className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="w-7 h-7 text-primary" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden" data-testid="section-testimonials" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-[hsl(var(--tropicolors-turquoise))]/5" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm">Testimonios</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Lo que dicen nuestros <span className="text-primary">clientes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conoce las experiencias de empresas que confían en Tropicolors
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={staggerItem}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="hover-elevate h-full relative overflow-hidden group" data-testid={`card-testimonial-${testimonial.id}`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
                <CardContent className="p-6 space-y-4 relative">
                  <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.1 }}
                      >
                        <span className="font-bold text-white text-lg">{testimonial.image}</span>
                      </motion.div>
                      <div>
                        <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>

                  <p className="text-muted-foreground leading-relaxed italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-12 flex justify-center gap-4 flex-wrap"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
            <Award className="w-4 h-4 mr-2" />
            100+ Clientes Satisfechos
          </Badge>
          <Badge className="bg-[hsl(var(--tropicolors-turquoise))]/10 text-[hsl(var(--tropicolors-turquoise))] border-[hsl(var(--tropicolors-turquoise))]/20 px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            Respuesta en 24h
          </Badge>
        </motion.div>
      </div>
    </section>
  );
}


function WhatsAppCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden" data-testid="section-whatsapp-cta" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#25D366]/10 via-[#25D366]/5 to-[#25D366]/10" />
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#25D366]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#25D366]/15 rounded-full blur-3xl" />
      </div>
      
      <motion.div 
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-6"
        >
          <div className="w-20 h-20 mx-auto bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30">
            <SiWhatsapp className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-[#25D366]/30 text-[#25D366]">Contacto Rápido</Badge>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
          ¿Listo para <span className="text-[#25D366]">cotizar</span>?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Envíanos un mensaje por WhatsApp y te responderemos en menos de 24 horas con tu cotización personalizada.
        </p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={() => window.open(`https://wa.me/525551146856?text=Hola%20Tropicolors%20me%20gustaría%20conocer%20más%20sobre%20sus%20productos`, "_blank")}
            size="lg"
            className="px-8 py-6 text-lg bg-[#25D366] hover:bg-[#20BD5A] text-white border-[#20BD5A] gap-2 shadow-lg shadow-[#25D366]/20 group"
            data-testid="button-whatsapp-cta"
          >
            <SiWhatsapp className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Abrir WhatsApp
          </Button>
          <Button
            onClick={() => window.open("tel:+525551146856", "_blank")}
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg gap-2"
          >
            <Phone className="w-5 h-5" />
            Llamar Ahora
          </Button>
        </motion.div>

        <motion.p 
          className="mt-6 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          +52 55 5114 6856 · Lunes a Viernes 9:00 - 18:00
        </motion.p>
      </motion.div>
    </section>
  );
}

function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-20 sm:py-28" data-testid="section-contacto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm">Formulario de Contacto</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Envíanos un Mensaje
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="hover-elevate">
            <CardContent className="p-8 space-y-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-medium mb-2 block">Nombre</label>
                  <Input
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    data-testid="input-contact-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    data-testid="input-contact-email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Teléfono (opcional)</label>
                  <Input
                    type="tel"
                    placeholder="Tu teléfono"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="input-contact-phone"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Mensaje</label>
                  <Textarea
                    placeholder="Tu mensaje..."
                    className="resize-none"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    data-testid="textarea-contact-message"
                  />
                </div>
                <Button className="w-full" disabled={isSubmitting} type="submit" data-testid="button-send-message">
                  {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                </Button>
                {submitStatus === "success" && (
                  <p className="text-sm text-green-600 text-center">¡Mensaje enviado correctamente!</p>
                )}
                {submitStatus === "error" && (
                  <p className="text-sm text-red-600 text-center">Por favor, completa todos los campos requeridos.</p>
                )}
              </form>
              <p className="text-xs text-center text-muted-foreground">
                O contáctanos directamente por{" "}
                <a
                  href={`https://wa.me/525551146856?text=Hola%20quiero%20contactarme%20con%20Tropicolors`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] hover:underline font-medium"
                >
                  WhatsApp
                </a>{" "}
                para respuesta inmediata.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="hover-elevate">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Teléfono</h4>
                    <p className="text-muted-foreground">+52 55 5114 6856</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-muted-foreground">tropicolors@hotmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Horario de Atención</h4>
                    <p className="text-muted-foreground">Lunes a Viernes: 9:00 - 18:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden" data-testid="footer">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-background to-background" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[hsl(var(--tropicolors-blue))] via-[hsl(var(--tropicolors-turquoise))] to-[hsl(var(--tropicolors-magenta))]" />
      
      <div className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={logoImage} alt="Tropicolors Logo" className="h-14 w-auto rounded-lg shadow-md" data-testid="img-footer-logo" />
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--tropicolors-blue))] to-[hsl(var(--tropicolors-turquoise))] bg-clip-text text-transparent">
                    TROPICOLORS
                  </h3>
                  <p className="text-sm text-muted-foreground">Colorantes Artificiales Premium</p>
                </div>
              </div>
              <p className="text-muted-foreground max-w-md mb-6">
                Somos una microempresa mexicana especializada en colorantes artificiales de alta calidad para alimentos y productos de limpieza.
              </p>
              <div className="flex gap-3">
                <motion.a
                  href="https://wa.me/525551146856"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid="link-footer-whatsapp"
                >
                  <SiWhatsapp className="w-5 h-5 text-[#25D366] group-hover:text-white transition-colors" />
                </motion.a>
                <motion.a
                  href="mailto:tropicolors@hotmail.com"
                  className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid="link-footer-email"
                >
                  <Mail className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                </motion.a>
                <motion.a
                  href="https://www.facebook.com/colorantestropicolors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-[#1877F2]/10 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid="link-footer-facebook"
                >
                  <SiFacebook className="w-5 h-5 text-[#1877F2] group-hover:text-white transition-colors" />
                </motion.a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Contacto</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  +52 55 5114 6856
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  tropicolors@hotmail.com
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Lun - Vie: 9:00 - 18:00
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Categorías</h4>
              <ul className="space-y-2 text-muted-foreground">
                {productSections.map((section) => (
                  <li key={section.name}>
                    <a href="#productos" className="hover:text-primary transition-colors">
                      {section.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © {currentYear} Tropicolors. Todos los derechos reservados.
            </p>
            <p className="text-muted-foreground text-sm">
              Hecho con <span className="text-[hsl(var(--tropicolors-magenta))]">♥</span> en México
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function CartModal({ isOpen, cart, setCart, onClose }: { isOpen: boolean; cart: CartItem[]; setCart: (cart: CartItem[]) => void; onClose: () => void }) {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleRemoveItem = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity > 0) {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const cartText = cart
      .map(item => `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toLocaleString('es-MX')}`)
      .join('%0A');
    
    const message = `Hola Tropicolors, quiero cotizar:%0A%0A${cartText}%0A%0ATotal: $${total.toLocaleString('es-MX')}`;
    window.open(`https://wa.me/525551146856?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" data-testid="cart-modal">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Carrito de Compras</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md"
            data-testid="button-close-cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Tu carrito está vacío</p>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">${item.price.toLocaleString('es-MX')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-muted rounded"
                      data-testid={`button-cart-decrease-${item.id}`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-muted rounded"
                      data-testid={`button-cart-increase-${item.id}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 hover:bg-destructive/10 rounded text-destructive ml-2"
                      data-testid={`button-cart-remove-${item.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-semibold ml-4">${(item.price * item.quantity).toLocaleString('es-MX')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${total.toLocaleString('es-MX')}</span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white border-[#20BD5A] py-6 text-lg gap-2"
              data-testid="button-checkout"
            >
              <SiWhatsapp className="w-5 h-5" />
              Cotizar por WhatsApp
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const offsetPosition = element.offsetTop - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header scrollToSection={scrollToSection} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} onCartClick={() => setIsCartOpen(true)} />
      <main>
        <Hero scrollToSection={scrollToSection} />
        <ProductsSection cart={cart} setCart={setCart} />
        <AboutSection />
        <BenefitsSection />
        <TestimonialsSection />
        <WhatsAppCTA />
        <ContactSection />
      </main>
      <Footer />
      <CartModal isOpen={isCartOpen} cart={cart} setCart={setCart} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
