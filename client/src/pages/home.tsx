import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { SiFacebook, SiWhatsapp } from "react-icons/si";
import { useState, useEffect } from "react";
import logoImage from "@assets/logo-2021100510533067100_1764265250371.jpeg";

const WHATSAPP_LINK = "https://wa.me/525551146856?text=Hola%20quiero%20cotizar%20colorantes%20Tropicolors";

const products = [
  {
    id: 1,
    name: "Colorante Líquido 30 ml",
    description: "Colorante líquido de alta concentración perfecto para pequeñas preparaciones de repostería y bebidas.",
    presentations: ["30 ml"],
    colors: ["Rojo", "Azul", "Verde", "Amarillo", "Rosa", "Naranja", "Morado", "Negro"],
    type: "Líquido",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    id: 2,
    name: "Colorante Líquido 60 ml",
    description: "Mayor cantidad para proyectos medianos. Ideal para pasteles, betunes y decoraciones elaboradas.",
    presentations: ["60 ml"],
    colors: ["Rojo", "Azul", "Verde", "Amarillo", "Rosa", "Naranja", "Morado", "Negro"],
    type: "Líquido",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    name: "Colorante Líquido 120 ml",
    description: "Presentación económica para uso frecuente en panaderías y negocios de repostería.",
    presentations: ["120 ml"],
    colors: ["Rojo", "Azul", "Verde", "Amarillo", "Rosa", "Naranja", "Morado", "Negro"],
    type: "Líquido",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: 4,
    name: "Colorante en Gel 30 ml",
    description: "Concentrado en gel para colores más intensos sin alterar la textura de tus preparaciones.",
    presentations: ["30 ml"],
    colors: ["Rojo", "Azul", "Verde", "Amarillo", "Rosa", "Naranja", "Morado"],
    type: "Gel",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: 5,
    name: "Colorante en Polvo",
    description: "Colorante en polvo de larga duración, perfecto para chocolate, fondant y decoraciones secas.",
    presentations: ["15 g", "30 g"],
    colors: ["Dorado", "Plateado", "Rojo", "Azul", "Verde", "Rosa"],
    type: "Polvo",
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    id: 6,
    name: "Pack Surtido de Colores",
    description: "Set completo con los colores más populares. Perfecto para quienes inician en repostería.",
    presentations: ["6 piezas x 15 ml", "12 piezas x 10 ml"],
    colors: ["Variados"],
    type: "Pack",
    gradient: "from-pink-500 via-purple-500 to-cyan-500",
  },
];

const benefits = [
  {
    icon: Droplet,
    title: "Alta Concentración",
    description: "Pequeñas gotas para colores intensos y vibrantes",
  },
  {
    icon: Sparkles,
    title: "Colores Brillantes",
    description: "Tonos vivos que destacan en cualquier preparación",
  },
  {
    icon: ThumbsUp,
    title: "No Altera Sabor",
    description: "Fórmula neutra que no modifica el gusto de tus recetas",
  },
  {
    icon: Wallet,
    title: "Económico y Rendidor",
    description: "Máximo rendimiento con mínima cantidad de producto",
  },
  {
    icon: Utensils,
    title: "Apto para Alimentos",
    description: "Seguro para bebidas, postres, repostería y más",
  },
  {
    icon: Droplets,
    title: "Fácil de Mezclar",
    description: "Se disuelve rápidamente en agua o alcohol",
  },
  {
    icon: Package,
    title: "Variedad de Presentaciones",
    description: "Tamaños para uso doméstico y profesional",
  },
];

function Header({ scrollToSection }: { scrollToSection: (id: string) => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border"
          : "bg-transparent"
      }`}
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection("inicio")} data-testid="link-logo">
            <img src={logoImage} alt="Tropicolors Logo" className="h-10 sm:h-12 w-auto rounded-md" />
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
            <Button
              onClick={() => window.open(WHATSAPP_LINK, "_blank")}
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white border-[#20BD5A] gap-2"
              data-testid="button-whatsapp-header"
            >
              <SiWhatsapp className="w-4 h-4" />
              <span className="hidden md:inline">Cotizar por WhatsApp</span>
              <span className="md:hidden">Cotizar</span>
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
            <div className="pt-4">
              <Button
                onClick={() => window.open(WHATSAPP_LINK, "_blank")}
                className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white border-[#20BD5A] gap-2"
                data-testid="button-whatsapp-mobile"
              >
                <SiWhatsapp className="w-4 h-4" />
                Cotizar por WhatsApp
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero({ scrollToSection }: { scrollToSection: (id: string) => void }) {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      data-testid="section-hero"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
      
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[hsl(var(--tropicolors-magenta))] to-transparent opacity-20 rounded-full blur-3xl motion-safe:animate-pulse" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-bl from-[hsl(var(--tropicolors-turquoise))] to-transparent opacity-15 rounded-full blur-3xl motion-safe:animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-tr from-[hsl(var(--tropicolors-yellow))] to-transparent opacity-15 rounded-full blur-3xl motion-safe:animate-pulse" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-gradient-to-tl from-[hsl(var(--tropicolors-blue))] to-transparent opacity-20 rounded-full blur-3xl motion-safe:animate-pulse" style={{ animationDelay: "0.5s" }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5">
            Colorantes de Alta Calidad
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[hsl(var(--tropicolors-blue))] via-[hsl(var(--tropicolors-turquoise))] to-[hsl(var(--tropicolors-magenta))] bg-clip-text text-transparent">
              Colorantes Artificiales
            </span>
            <br />
            <span className="text-foreground">Tropicolors</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Alta concentración, colores intensos y calidad premium para tus alimentos.
            <span className="hidden sm:inline"> Perfectos para repostería, bebidas, postres y productos de limpieza.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => scrollToSection("productos")}
              className="w-full sm:w-auto gap-2 text-base px-8"
              data-testid="button-ver-productos"
            >
              Ver Productos
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.open(WHATSAPP_LINK, "_blank")}
              className="w-full sm:w-auto gap-2 text-base px-8 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
              data-testid="button-cotizar-hero"
            >
              <SiWhatsapp className="w-5 h-5" />
              Cotizar por WhatsApp
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--tropicolors-magenta))]" />
              <span>Colores vibrantes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--tropicolors-turquoise))]" />
              <span>Alta concentración</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--tropicolors-yellow))]" />
              <span>Calidad garantizada</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 motion-safe:animate-bounce">
        <button
          onClick={() => scrollToSection("productos")}
          className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
          data-testid="button-scroll-down"
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </button>
      </div>
    </section>
  );
}

function ProductsSection() {
  return (
    <section id="productos" className="py-20 sm:py-28 bg-muted/30" data-testid="section-productos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm">Catálogo</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Nuestros <span className="text-primary">Productos</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre nuestra línea completa de colorantes artificiales para todas tus necesidades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-visible hover-elevate transition-all duration-300" data-testid={`card-product-${product.id}`}>
              <div className={`h-48 bg-gradient-to-br ${product.gradient} relative overflow-hidden rounded-t-xl`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Droplet className="w-16 h-16 mx-auto mb-2 opacity-90" />
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {product.type}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Presentaciones</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {product.presentations.map((p) => (
                        <Badge key={p} variant="secondary" className="text-xs">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Colores disponibles</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {product.colors.slice(0, 5).map((c) => (
                        <Badge key={c} variant="outline" className="text-xs">
                          {c}
                        </Badge>
                      ))}
                      {product.colors.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.colors.length - 5}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button variant="secondary" className="flex-1" data-testid={`button-comprar-${product.id}`}>
                    Comprar
                  </Button>
                  <Button
                    onClick={() => window.open(WHATSAPP_LINK, "_blank")}
                    className="flex-1 bg-[#25D366] hover:bg-[#20BD5A] text-white border-[#20BD5A] gap-1.5"
                    data-testid={`button-cotizar-${product.id}`}
                  >
                    <SiWhatsapp className="w-4 h-4" />
                    Cotizar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
                <div className="text-sm text-muted-foreground">Clientes satisfechos</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-accent">20+</div>
                <div className="text-sm text-muted-foreground">Colores disponibles</div>
              </div>
              <div className="text-center sm:text-left col-span-2 sm:col-span-1">
                <div className="text-3xl sm:text-4xl font-bold text-[hsl(var(--tropicolors-magenta))]">5+</div>
                <div className="text-sm text-muted-foreground">Años de experiencia</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-accent/20 to-[hsl(var(--tropicolors-magenta))]/20 p-8 flex items-center justify-center">
              <img
                src={logoImage}
                alt="Tropicolors Logo"
                className="w-full max-w-md rounded-xl shadow-2xl"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-[hsl(var(--tropicolors-yellow))] to-[hsl(var(--tropicolors-magenta))] rounded-full opacity-20 blur-2xl" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-[hsl(var(--tropicolors-turquoise))] to-[hsl(var(--tropicolors-blue))] rounded-full opacity-20 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section id="beneficios" className="py-20 sm:py-28 bg-primary/5" data-testid="section-beneficios">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm">Ventajas</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            ¿Por qué elegir <span className="text-primary">Tropicolors</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre todos los beneficios de nuestros colorantes de alta calidad
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="group hover-elevate transition-all duration-300 overflow-visible"
              data-testid={`card-benefit-${index}`}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatsAppCTA() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-primary via-primary/90 to-accent" data-testid="section-cta">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            ¿Quieres precios de mayoreo o una cotización personalizada?
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Contáctanos por WhatsApp y recibe atención personalizada. Respondemos rápido.
          </p>
          <Button
            size="lg"
            onClick={() => window.open(WHATSAPP_LINK, "_blank")}
            className="bg-white text-primary hover:bg-white/90 border-white gap-3 text-lg px-10 py-6 h-auto"
            data-testid="button-cotizar-cta"
          >
            <MessageCircle className="w-6 h-6" />
            Cotizar por WhatsApp
          </Button>
          <p className="text-white/60 text-sm">
            Horario de atención: 9:00 - 18:00 hrs
          </p>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contacto" className="py-20 sm:py-28" data-testid="section-contacto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-8">
            <div>
              <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm">Contacto</Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Contáctanos
              </h2>
              <p className="text-lg text-muted-foreground">
                Estamos listos para atenderte y resolver todas tus dudas sobre nuestros productos.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="hover-elevate">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                    <SiWhatsapp className="w-6 h-6 text-[#25D366]" />
                  </div>
                  <div>
                    <div className="font-medium">WhatsApp / Teléfono</div>
                    <a
                      href="tel:+525551146856"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="link-phone"
                    >
                      +52 55 5114 6856
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Correo Electrónico</div>
                    <a
                      href="mailto:tropicolors@hotmail.com"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="link-email"
                    >
                      tropicolors@hotmail.com
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#1877F2]/10 flex items-center justify-center flex-shrink-0">
                    <SiFacebook className="w-6 h-6 text-[#1877F2]" />
                  </div>
                  <div>
                    <div className="font-medium">Facebook</div>
                    <a
                      href="https://facebook.com/Tropicolors"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="link-facebook"
                    >
                      Tropicolors
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <div className="font-medium">Horario de Atención</div>
                    <span className="text-muted-foreground">9:00 - 18:00 hrs (Lun - Sáb)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <Card className="p-2">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-xl font-semibold">Envíanos un mensaje</h3>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre</label>
                    <Input placeholder="Tu nombre" data-testid="input-name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Correo electrónico</label>
                    <Input type="email" placeholder="tu@email.com" data-testid="input-email" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mensaje</label>
                    <Textarea
                      placeholder="¿En qué podemos ayudarte?"
                      className="min-h-[120px] resize-none"
                      data-testid="input-message"
                    />
                  </div>
                  <Button className="w-full" data-testid="button-send-message">
                    Enviar mensaje
                  </Button>
                </form>
                <p className="text-xs text-center text-muted-foreground">
                  O contáctanos directamente por{" "}
                  <a
                    href={WHATSAPP_LINK}
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
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border py-12" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <img src={logoImage} alt="Tropicolors Logo" className="h-12 w-auto rounded-md" data-testid="img-footer-logo" role="img" />
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              © {currentYear} Tropicolors. Todos los derechos reservados.
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-4">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center hover:bg-[#25D366]/20 transition-colors"
              data-testid="link-footer-whatsapp"
            >
              <SiWhatsapp className="w-5 h-5 text-[#25D366]" />
            </a>
            <a
              href="mailto:tropicolors@hotmail.com"
              className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              data-testid="link-footer-email"
            >
              <Mail className="w-5 h-5 text-primary" />
            </a>
            <a
              href="https://facebook.com/Tropicolors"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-[#1877F2]/10 flex items-center justify-center hover:bg-[#1877F2]/20 transition-colors"
              data-testid="link-footer-facebook"
            >
              <SiFacebook className="w-5 h-5 text-[#1877F2]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FloatingWhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      data-testid="button-floating-whatsapp"
    >
      <SiWhatsapp className="w-7 h-7 text-white" />
    </a>
  );
}

export default function Home() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const offsetPosition = element.offsetTop - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header scrollToSection={scrollToSection} />
      <main>
        <Hero scrollToSection={scrollToSection} />
        <ProductsSection />
        <AboutSection />
        <BenefitsSection />
        <WhatsAppCTA />
        <ContactSection />
      </main>
      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
}
