/**
 * InvoiceForm Component
 * 
 * Formulario para crear facturas profesionales
 * Estilo SaaS moderno (Stripe/Notion-like)
 * 
 * Características:
 * - Validación en tiempo real
 * - Tabla de conceptos editable
 * - Cálculos automáticos de totales
 * - Feedback visual de éxito/error
 */

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Receipt, 
  User, 
  Building2, 
  FileText,
  Send,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";

// ============================================
// Types / Interfaces
// ============================================

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceFormData {
  // Emisor (prellenado)
  issuerName: string;
  issuerRFC: string;
  issuerAddress: string;
  issuerEmail: string;
  issuerPhone: string;
  
  // Cliente
  customerName: string;
  customerRFC: string;
  customerEmail: string;
  customerAddress: string;
  
  // Conceptos
  items: InvoiceItem[];
  
  // Configuración
  taxRate: number;
  notes: string;
  sendEmail: boolean;
}

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
  initialData?: Partial<InvoiceFormData>;
}

// Datos por defecto del emisor
const DEFAULT_ISSUER = {
  issuerName: "TropicColors SA de CV",
  issuerRFC: "TCO980123ABC",
  issuerAddress: "Av. Principal 123, Col. Centro, Ciudad de México, CP 01000",
  issuerEmail: "facturas@tropicolors.com",
  issuerPhone: "55-1234-5678",
};

// ============================================
// Helper Functions
// ============================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(cents);
}

function validateRFC(rfc: string): boolean {
  const rfcRegex = /^[A-Z]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
  return rfcRegex.test(rfc.toUpperCase());
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// Componente Principal
// ============================================

export function InvoiceForm({ onSubmit, isLoading = false, initialData }: InvoiceFormProps) {
  // Estado del formulario
  const [formData, setFormData] = useState<InvoiceFormData>({
    ...DEFAULT_ISSUER,
    customerName: "",
    customerRFC: "",
    customerEmail: "",
    customerAddress: "",
    items: [{ id: generateId(), description: "", quantity: 1, unitPrice: 0 }],
    taxRate: 16,
    notes: "",
    sendEmail: true,
    ...initialData,
  });

  // Estado de validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Calcula totales
  const totals = useMemo(() => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = Math.round(subtotal * (formData.taxRate / 100));
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }, [formData.items, formData.taxRate]);

  // Valida campo específico
  const validateField = useCallback((name: string, value: string | number | InvoiceItem[]): string | null => {
    switch (name) {
      case "customerRFC":
        if (!value) return "El RFC es requerido";
        if (!validateRFC(value as string)) return "RFC inválido (formato: XXXX000101XXX)";
        return null;
      case "customerEmail":
        if (!value) return "El email es requerido";
        if (!validateEmail(value as string)) return "Email inválido";
        return null;
      case "customerName":
        if (!value || (value as string).trim().length < 2) return "El nombre es requerido";
        return null;
      case "customerAddress":
        if (!value || (value as string).trim().length < 5) return "La dirección es requerida";
        return null;
      case "items":
        const items = value as InvoiceItem[];
        if (!items.length) return "Debe agregar al menos un concepto";
        for (const item of items) {
          if (!item.description?.trim()) return "La descripción es requerida";
          if (item.quantity <= 0) return "La cantidad debe ser mayor a 0";
          if (item.unitPrice <= 0) return "El precio debe ser mayor a 0";
        }
        return null;
      default:
        return null;
    }
  }, []);

  // Maneja cambio en campo
  const handleChange = useCallback((field: keyof InvoiceFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validar si ya fue touch
    if (touched[field]) {
      const error = validateField(field, value as string);
      setErrors(prev => ({ ...prev, [field]: error || "" }));
    }
  }, [touched, validateField]);

  // Maneja blur en campo
  const handleBlur = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = formData[field as keyof InvoiceFormData];
    const error = validateField(field, value as string);
    setErrors(prev => ({ ...prev, [field]: error || "" }));
  }, [formData, validateField]);

  // Agrega nuevo concepto
  const addItem = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: generateId(), description: "", quantity: 1, unitPrice: 0 },
      ],
    }));
  }, []);

  // Elimina concepto
  const removeItem = useCallback((id: string) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  }, [formData.items.length]);

  // Actualiza concepto
  const updateItem = useCallback((id: string, field: keyof InvoiceItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id
          ? { ...item, [field]: field === "description" ? value : Number(value) }
          : item
      ),
    }));
  }, []);

  // Envía formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos los campos
    const newErrors: Record<string, string> = {};
    const fieldsToValidate = [
      "customerName", "customerRFC", "customerEmail", "customerAddress", "items"
    ];
    
    for (const field of fieldsToValidate) {
      const value = formData[field as keyof InvoiceFormData];
      const error = validateField(field, value as string);
      if (error) newErrors[field] = error;
    }
    
    setErrors(newErrors);
    setTouched({
      customerName: true,
      customerRFC: true,
      customerEmail: true,
      customerAddress: true,
      items: true,
    });
    
    if (Object.keys(newErrors).length > 0) {
      setSubmitStatus({ type: "error", message: "Por favor corrige los errores antes de continuar" });
      return;
    }
    
    setSubmitStatus({ type: null, message: "" });
    
    // Convertir precios a centavos
    const submitData = {
      ...formData,
      items: formData.items.map(item => ({
        ...item,
        unitPrice: Math.round(item.unitPrice * 100),
      })),
    };
    
    const result = await onSubmit(submitData);
    
    if (result.success) {
      setSubmitStatus({ type: "success", message: "Factura creada correctamente" });
      // Reset formulario
      setFormData({
        ...DEFAULT_ISSUER,
        customerName: "",
        customerRFC: "",
        customerEmail: "",
        customerAddress: "",
        items: [{ id: generateId(), description: "", quantity: 1, unitPrice: 0 }],
        taxRate: 16,
        notes: "",
        sendEmail: true,
      });
      setErrors({});
      setTouched({});
    } else {
      setSubmitStatus({ type: "error", message: result.error || "Error al crear factura" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status Messages */}
      <AnimatePresence>
        {submitStatus.type && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg flex items-center gap-3 ${
              submitStatus.type === "success" 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {submitStatus.type === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{submitStatus.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Datos del Emisor */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-teal-600" />
            Datos del Emisor
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="issuerName">Nombre / Razón Social</Label>
            <Input
              id="issuerName"
              value={formData.issuerName}
              onChange={(e) => handleChange("issuerName", e.target.value)}
              onBlur={() => handleBlur("issuerName")}
              className={errors.issuerName ? "border-red-500" : ""}
            />
            {errors.issuerName && (
              <p className="text-sm text-red-500">{errors.issuerName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issuerRFC">RFC</Label>
            <Input
              id="issuerRFC"
              value={formData.issuerRFC}
              onChange={(e) => handleChange("issuerRFC", e.target.value.toUpperCase())}
              onBlur={() => handleBlur("issuerRFC")}
              placeholder="XAXX000101XXX"
              className={errors.issuerRFC ? "border-red-500" : ""}
            />
            {errors.issuerRFC && (
              <p className="text-sm text-red-500">{errors.issuerRFC}</p>
            )}
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="issuerAddress">Dirección Fiscal</Label>
            <Input
              id="issuerAddress"
              value={formData.issuerAddress}
              onChange={(e) => handleChange("issuerAddress", e.target.value)}
              className={errors.issuerAddress ? "border-red-500" : ""}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issuerEmail">Email</Label>
            <Input
              id="issuerEmail"
              type="email"
              value={formData.issuerEmail}
              onChange={(e) => handleChange("issuerEmail", e.target.value)}
              className={errors.issuerEmail ? "border-red-500" : ""}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issuerPhone">Teléfono</Label>
            <Input
              id="issuerPhone"
              value={formData.issuerPhone}
              onChange={(e) => handleChange("issuerPhone", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Datos del Cliente */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Datos del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nombre / Razón Social *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => handleChange("customerName", e.target.value)}
              onBlur={() => handleBlur("customerName")}
              placeholder="Cliente SA de CV"
              className={touched.customerName && errors.customerName ? "border-red-500" : ""}
            />
            {touched.customerName && errors.customerName && (
              <p className="text-sm text-red-500">{errors.customerName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerRFC">RFC *</Label>
            <Input
              id="customerRFC"
              value={formData.customerRFC}
              onChange={(e) => handleChange("customerRFC", e.target.value.toUpperCase())}
              onBlur={() => handleBlur("customerRFC")}
              placeholder="XEXX010101XXX"
              className={touched.customerRFC && errors.customerRFC ? "border-red-500" : ""}
            />
            {touched.customerRFC && errors.customerRFC && (
              <p className="text-sm text-red-500">{errors.customerRFC}</p>
            )}
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="customerAddress">Dirección Fiscal *</Label>
            <Input
              id="customerAddress"
              value={formData.customerAddress}
              onChange={(e) => handleChange("customerAddress", e.target.value)}
              onBlur={() => handleBlur("customerAddress")}
              placeholder="Calle, Número, Colonia, Ciudad, Estado, CP"
              className={touched.customerAddress && errors.customerAddress ? "border-red-500" : ""}
            />
            {touched.customerAddress && errors.customerAddress && (
              <p className="text-sm text-red-500">{errors.customerAddress}</p>
            )}
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="customerEmail">Email *</Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => handleChange("customerEmail", e.target.value)}
              onBlur={() => handleBlur("customerEmail")}
              placeholder="cliente@ejemplo.com"
              className={touched.customerEmail && errors.customerEmail ? "border-red-500" : ""}
            />
            {touched.customerEmail && errors.customerEmail && (
              <p className="text-sm text-red-500">{errors.customerEmail}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conceptos */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5 text-teal-600" />
            Conceptos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-24">Cantidad</TableHead>
                  <TableHead className="w-32">P. Unitario</TableHead>
                  <TableHead className="w-32 text-right">Importe</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center text-slate-500">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        placeholder="Descripción del producto o servicio"
                        className="border-0 focus-visible:ring-0 focus-visible:border-slate-300"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                        className="text-center"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        disabled={formData.items.length === 1}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="mt-4 border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Concepto
          </Button>

          {touched.items && errors.items && (
            <p className="text-sm text-red-500 mt-2">{errors.items}</p>
          )}
        </CardContent>
      </Card>

      {/* Configuración */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5 text-teal-600" />
            Configuración
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tasa de IVA (%)</Label>
              <Select
                value={formData.taxRate.toString()}
                onValueChange={(value) => handleChange("taxRate", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tasa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% (Exento)</SelectItem>
                  <SelectItem value="8">8% (Reducido)</SelectItem>
                  <SelectItem value="16">16% (Standard)</SelectItem>
                  <SelectItem value="20">20% (Mayor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="sendEmail"
                checked={formData.sendEmail}
                onChange={(e) => handleChange("sendEmail", e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
              />
              <Label htmlFor="sendEmail" className="cursor-pointer">
                Enviar factura por email al cliente
              </Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Notas adicionales que aparecerán en la factura..."
              rows={3}
            />
          </div>
          
          <Separator className="my-4" />
          
          {/* Totales */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA ({formData.taxRate}%):</span>
                <span className="font-medium">{formatCurrency(totals.taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold text-teal-600">
                <span>Total:</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Receipt className="h-4 w-4 mr-2" />
              Generar Factura
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default InvoiceForm;
