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
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { SiFacebook, SiWhatsapp } from "react-icons/si";
import { useState, useEffect } from "react";
import logoImage from "@assets/logo-2021100510533067100_1764265250371.jpeg";

const WHATSAPP_LINK = "https://wa.me/525551146856";

const products = [
  {
    id: 1,
    name: "Colorante Artificial Azul 125",
    price: 410,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    name: "Colorante Artificial Naranja 850",
    price: 3600,
    gradient: "from-orange-500 to-amber-500",
  },
  {
    id: 3,
    name: "Exhibidor Sobres Rosa Brillante 125",
    price: 594,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: 4,
    name: "Colorante Artificial Tropicolors Verde Limón 125 6kg",
    price: 1050,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: 5,
    name: "Colorante Artificial Negro 250",
    price: 820,
    gradient: "from-gray-700 to-gray-900",
  },
  {
    id: 6,
    name: "Colorante Artificial Cafe Caramelo 125",
    price: 260,
    gradient: "from-amber-700 to-amber-900",
  },
  {
    id: 7,
    name: "Colorante Artificial Tropicolors Verde Limón 125 20kg",
    price: 3200,
    gradient: "from-green-400 to-emerald-600",
  },
  {
    id: 8,
    name: "Colorante Naranja 850",
    price: 2400,
    gradient: "from-orange-400 to-orange-600",
  },
  {
    id: 9,
    name: "Colorante Rosa Brillante 250",
    price: 6500,
    gradient: "from-pink-400 to-rose-600",
  },
  {
    id: 10,
    name: "Colorante Rosa Brillante 125",
    price: 380,
    gradient: "from-pink-500 to-pink-700",
  },
  {
    id: 11,
    name: "Exhibidor Amarillo Huevo 125 Sobres 100pz",
    price: 486,
    gradient: "from-yellow-400 to-yellow-600",
  },
  {
    id: 12,
    name: "Colorante Artificial Violeta I Uso Industrial",
    price: 720,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: 13,
    name: "Colorante En Polvo Azul Tropicolors 100pz 5g",
    price: 490,
    gradient: "from-blue-400 to-blue-600",
  },
  {
    id: 14,
    name: "Colorante Artificial Amarilo Naranja 250",
    price: 420,
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    id: 15,
    name: "Colorante Artificial Para Alimentos Amarillo Limón 250",
    price: 360,
    gradient: "from-yellow-300 to-yellow-500",
  },
];

const benefits = [
  {
    icon: Droplet,
    title: "Alta Concentración",
    description: "Pequeñas cantidades para colores intensos y vibrantes",
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

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

function Header({ scrollToSection, cartCount, onCartClick }: { scrollToSection: (id: string) => void; cartCount: number; onCartClick: () => void }) {
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
              onClick={onCartClick}
              variant="outline"
              size="icon"
              className="relative"
              data-testid="button-cart"
            >
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
            Colorantes Artificiales Premium
          </Badge>

          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground leading-tight">
              <span className="bg-gradient-to-r from-[hsl(var(--tropicolors-blue))] via-[hsl(var(--tropicolors-turquoise))] to-[hsl(var(--tropicolors-magenta))] bg-clip-text text-transparent">
                TROPICOLORS
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Colorantes de alta calidad para alimentos y productos de limpieza. Colores vibrantes, máximo rendimiento y economía.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              onClick={() => scrollToSection("productos")}
              className="px-8 py-6 text-lg"
              size="lg"
              data-testid="button-explore-products"
            >
              Explorar Productos
            </Button>
            <Button
              onClick={() => window.open(`${WHATSAPP_LINK}?text=Hola%20quiero%20más%20información%20sobre%20sus%20productos`, "_blank")}
              variant="outline"
              className="px-8 py-6 text-lg border-2"
              size="lg"
              data-testid="button-contact-hero"
            >
              <SiWhatsapp className="w-5 h-5 mr-2" />
              Contáctanos
            </Button>
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

function ProductsSection({ cart, setCart }: { cart: CartItem[]; setCart: (cart: CartItem[]) => void }) {
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const handleAddToCart = (product: typeof products[0]) => {
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
  };

  const updateQuantity = (id: number, value: number) => {
    if (value > 0) {
      setQuantities(prev => ({ ...prev, [id]: value }));
    }
  };

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
            <Card key={product.id} className="group overflow-visible hover-elevate transition-all duration-300 flex flex-col" data-testid={`card-product-${product.id}`}>
              <div className={`h-48 bg-gradient-to-br ${product.gradient} relative overflow-hidden rounded-t-xl`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Droplet className="w-16 h-16 mx-auto mb-2 opacity-90" />
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      Colorante
                    </Badge>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                <div>
                  <h3 className="text-xl font-semibold mb-2" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
                  <p className="text-2xl font-bold text-primary">${product.price.toLocaleString('es-MX')}</p>
                </div>

                <div className="flex-1" />

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Cantidad:</span>
                    <div className="flex items-center border border-border rounded-md">
                      <button
                        onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) - 1)}
                        className="p-1 hover:bg-muted"
                        data-testid={`button-decrease-${product.id}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantities[product.id] || 1}
                        onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                        className="w-12 text-center border-0 focus:ring-0 text-sm"
                        data-testid={`input-quantity-${product.id}`}
                      />
                      <button
                        onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) + 1)}
                        className="p-1 hover:bg-muted"
                        data-testid={`button-increase-${product.id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white border-[#20BD5A] gap-1.5"
                    data-testid={`button-add-to-cart-${product.id}`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Agregar al Carrito
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
                <p className="text-sm text-muted-foreground mt-2">Clientes Satisfechos</p>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-primary">15+</div>
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
  return (
    <section id="beneficios" className="py-20 sm:py-28 bg-muted/30" data-testid="section-beneficios">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm">Beneficios</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            ¿Por qué elegir <span className="text-primary">Tropicolors</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre los beneficios que hacen de nuestros colorantes la opción perfecta
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="benefits-grid">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={index}
                className="hover-elevate transition-all duration-300"
                data-testid={`card-benefit-${index}`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhatsAppCTA() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" data-testid="section-whatsapp-cta">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm">Contacto Rápido</Badge>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
          ¿Tienes preguntas?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Contáctanos a través de WhatsApp para cotizaciones y más información sobre nuestros productos.
        </p>
        <Button
          onClick={() => window.open(`https://wa.me/525551146856?text=Hola%20Tropicolors%20me%20gustaría%20conocer%20más%20sobre%20sus%20productos`, "_blank")}
          size="lg"
          className="px-8 py-6 text-lg bg-[#25D366] hover:bg-[#20BD5A] text-white border-[#20BD5A] gap-2"
          data-testid="button-whatsapp-cta"
        >
          <SiWhatsapp className="w-5 h-5" />
          Abrir WhatsApp
        </Button>
      </div>
    </section>
  );
}

function ContactSection() {
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
              <form className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nombre</label>
                  <Input
                    placeholder="Tu nombre"
                    data-testid="input-contact-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    data-testid="input-contact-email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Teléfono</label>
                  <Input
                    type="tel"
                    placeholder="Tu teléfono"
                    data-testid="input-contact-phone"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Mensaje</label>
                  <Textarea
                    placeholder="Tu mensaje..."
                    className="resize-none"
                    rows={4}
                    data-testid="textarea-contact-message"
                  />
                </div>
                <Button className="w-full" data-testid="button-send-message">
                  Enviar mensaje
                </Button>
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
              href="https://wa.me/525551146856"
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
              href="https://www.facebook.com/colorantestropicolors"
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

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
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
        <WhatsAppCTA />
        <ContactSection />
      </main>
      <Footer />
      <CartModal isOpen={isCartOpen} cart={cart} setCart={setCart} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
