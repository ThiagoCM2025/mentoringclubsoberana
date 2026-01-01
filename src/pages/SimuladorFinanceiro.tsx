import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Crown,
  Target,
  DollarSign,
  Users,
  TrendingUp,
  Sparkles,
  Save,
  FolderOpen,
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  Info,
  Trash2,
  X,
  Calculator,
  Shield,
  Scale,
  Rocket,
  FileText,
  Pencil,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";

// Brand assets
import isotipoSFramedGold from "@/assets/brand/isotipo-s-framed-gold.png";

// Types
interface SimulatorValues {
  meta: number;
  ticketMedio: number;
  cpl: number;
  taxaLeadReuniao: number;
  taxaConversao: number;
}

interface Scenario {
  id: string;
  name: string;
  date: string;
  values: SimulatorValues;
  results: CalculatedResults;
}

interface CalculatedResults {
  contratos: number;
  reunioes: number;
  leads: number;
  investimento: number;
  cac: number;
  roi: number;
  lucro: number;
  percentualInvestimento: number;
}

interface AIScenario {
  tipo: "conservador" | "equilibrado" | "agressivo";
  nome: string;
  ticketMedio: number;
  cpl: number;
  taxaLeadReuniao: number;
  taxaConversao: number;
  analise: string;
  recomendacao: string;
}

interface AIResponse {
  relatorioGeral: string;
  cenarios: AIScenario[];
  conclusao: string;
}

// Calculate results for a scenario
const calculateResults = (values: SimulatorValues): CalculatedResults => {
  const contratos = Math.ceil(values.meta / values.ticketMedio);
  const reunioes = Math.ceil(contratos / (values.taxaConversao / 100));
  const leads = Math.ceil(reunioes / (values.taxaLeadReuniao / 100));
  const investimento = leads * values.cpl;
  const cac = investimento / contratos;
  const roi = values.meta / investimento;
  const lucro = values.meta - investimento;
  const percentualInvestimento = (investimento / values.meta) * 100;

  return { contratos, reunioes, leads, investimento, cac, roi, lucro, percentualInvestimento };
};

// Animated Number Component
const AnimatedNumber = ({ 
  value, 
  prefix = "", 
  suffix = "", 
  decimals = 0,
}: { 
  value: number; 
  prefix?: string; 
  suffix?: string; 
  decimals?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      const startValue = prevValue.current;
      const endValue = value;
      const duration = 500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (endValue - startValue) * easeOut;
        
        setDisplayValue(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          prevValue.current = value;
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value]);

  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(displayValue);

  return <span>{prefix}{formatted}{suffix}</span>;
};

// Simulator Slider Component
const SimulatorSlider = ({
  icon: Icon,
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix = "",
  suffix = "",
  isAIAnimating = false,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  isAIAnimating?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  const handleEditSubmit = () => {
    const numValue = parseFloat(editValue.replace(/\D/g, ''));
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
    }
    setIsEditing(false);
  };

  const formattedValue = new Intl.NumberFormat('pt-BR').format(value);

  return (
    <div className={`space-y-3 p-4 rounded-xl bg-brand-black/60 border transition-all duration-300 ${
      isAIAnimating 
        ? "border-gold shadow-lg shadow-gold/20 ring-2 ring-gold/30" 
        : "border-gold/20 hover:border-gold/40"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${isAIAnimating ? "text-gold" : "text-cream/60"}`} />
          <span className="text-sm text-cream/80 font-inter">{label}</span>
        </div>
        {isEditing ? (
          <Input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
            className="w-32 h-8 text-right bg-brand-black border-gold/50 text-gold font-semibold"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className={`text-lg font-playfair font-bold group flex items-center gap-1.5 transition-colors ${
              isAIAnimating ? "text-gold animate-pulse" : "text-gold hover:text-gold-light"
            }`}
            title="Clique para editar"
          >
            {prefix}{formattedValue}{suffix}
            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
          </button>
        )}
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={min}
        max={max}
        step={step}
        className="cursor-pointer"
      />
      <div className="flex justify-between text-xs text-cream/50 font-inter">
        <span>{prefix}{new Intl.NumberFormat('pt-BR').format(min)}{suffix}</span>
        <span>{prefix}{new Intl.NumberFormat('pt-BR').format(max)}{suffix}</span>
      </div>
    </div>
  );
};

// Result Card Component
const ResultCard = ({
  title,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  highlight = false,
  icon: Icon,
  delay = 0,
}: {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  highlight?: boolean;
  icon: React.ElementType;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <Card className={`bg-brand-black/60 border transition-all duration-300 ${
      highlight 
        ? "border-gold shadow-lg shadow-gold/30" 
        : "border-gold/20 hover:border-gold/40"
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-4 h-4 ${highlight ? "text-gold" : "text-cream/60"}`} />
          <span className="text-xs text-cream/60 font-inter uppercase tracking-wide">{title}</span>
        </div>
        <p className={`text-2xl font-playfair font-bold ${highlight ? "text-gold" : "text-cream"}`}>
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

// Insight Card Component
const InsightCard = ({
  type,
  message,
}: {
  type: 'warning' | 'success' | 'info';
  message: string;
}) => {
  const config = {
    warning: {
      icon: AlertTriangle,
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      text: "text-yellow-400",
    },
    success: {
      icon: CheckCircle2,
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-400",
    },
    info: {
      icon: Info,
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-400",
    },
  };

  const { icon: Icon, bg, border, text } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-xl ${bg} border ${border}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${text} flex-shrink-0 mt-0.5`} />
        <p className={`text-sm ${text} font-inter`}>{message}</p>
      </div>
    </motion.div>
  );
};

// AI Scenario Card Component
const AIScenarioCard = ({
  scenario,
  meta,
  onApply,
  onSave,
  delay = 0,
}: {
  scenario: AIScenario;
  meta: number;
  onApply: () => void;
  onSave: () => void;
  delay?: number;
}) => {
  const config = {
    conservador: {
      icon: Shield,
      gradient: "from-blue-500/20 to-blue-600/10",
      border: "border-blue-500/40",
      iconColor: "text-blue-400",
      badge: "bg-blue-500/20 text-blue-400",
    },
    equilibrado: {
      icon: Scale,
      gradient: "from-gold/20 to-gold/10",
      border: "border-gold/40",
      iconColor: "text-gold",
      badge: "bg-gold/20 text-gold",
    },
    agressivo: {
      icon: Rocket,
      gradient: "from-orange-500/20 to-orange-600/10",
      border: "border-orange-500/40",
      iconColor: "text-orange-400",
      badge: "bg-orange-500/20 text-orange-400",
    },
  };

  const { icon: Icon, gradient, border, iconColor, badge } = config[scenario.tipo];

  // Calculate results for this scenario
  const scenarioValues: SimulatorValues = {
    meta,
    ticketMedio: scenario.ticketMedio,
    cpl: scenario.cpl,
    taxaLeadReuniao: scenario.taxaLeadReuniao,
    taxaConversao: scenario.taxaConversao,
  };
  const results = calculateResults(scenarioValues);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className={`bg-gradient-to-br ${gradient} border ${border} overflow-hidden`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${iconColor}`} />
              <span className={`px-2 py-0.5 text-xs rounded-full ${badge} uppercase font-semibold tracking-wide`}>
                {scenario.tipo}
              </span>
            </div>
          </div>
          <CardTitle className="text-lg text-cream font-playfair mt-2">
            {scenario.nome}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Values */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-cream/50 text-xs">Ticket Médio</span>
              <p className="text-cream font-semibold">R$ {scenario.ticketMedio.toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <span className="text-cream/50 text-xs">CPL</span>
              <p className="text-cream font-semibold">R$ {scenario.cpl.toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <span className="text-cream/50 text-xs">Lead → Reunião</span>
              <p className="text-cream font-semibold">{scenario.taxaLeadReuniao}%</p>
            </div>
            <div>
              <span className="text-cream/50 text-xs">Conversão</span>
              <p className="text-cream font-semibold">{scenario.taxaConversao}%</p>
            </div>
          </div>

          {/* Calculated Results */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-cream/60">Investimento:</span>
              <span className="text-cream">R$ {results.investimento.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cream/60">Lucro Esperado:</span>
              <span className="text-green-400 font-semibold">R$ {results.lucro.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cream/60">ROI:</span>
              <span className={`font-bold ${results.roi > 10 ? "text-gold" : "text-cream"}`}>
                {results.roi.toFixed(1)}x
              </span>
            </div>
          </div>

          {/* Analysis */}
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-cream/70 mb-2">{scenario.analise}</p>
            <p className="text-xs text-cream/50 italic">{scenario.recomendacao}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onApply}
              size="sm"
              className="flex-1 bg-gold text-brand-black hover:bg-gold-light font-semibold"
            >
              Aplicar
            </Button>
            <Button
              onClick={onSave}
              size="sm"
              variant="outlineGold"
            >
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Component
const SimuladorFinanceiro = () => {
  // State
  const [values, setValues] = useState<SimulatorValues>({
    meta: 50000,
    ticketMedio: 5000,
    cpl: 50,
    taxaLeadReuniao: 20,
    taxaConversao: 30,
  });

  const [isAILoading, setIsAILoading] = useState(false);
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [animatingFields, setAnimatingFields] = useState<Set<string>>(new Set());
  const [scenarios, setScenarios] = useState<Scenario[]>(() => {
    const saved = localStorage.getItem('soberana-simulator-scenarios');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [isScenariosOpen, setIsScenariosOpen] = useState(false);

  // Calculations
  const results = useMemo<CalculatedResults>(() => calculateResults(values), [values]);

  // Chart data
  const chartData = useMemo(() => [
    {
      name: 'Comparativo',
      Investimento: results.investimento,
      'Lucro Esperado': results.lucro,
    },
  ], [results]);

  // Save scenarios to localStorage
  useEffect(() => {
    localStorage.setItem('soberana-simulator-scenarios', JSON.stringify(scenarios));
  }, [scenarios]);

  // Get insights
  const getInsights = () => {
    const insights: { type: 'warning' | 'success' | 'info'; message: string }[] = [];

    if (results.percentualInvestimento > 20) {
      insights.push({
        type: 'warning',
        message: `Atenção: Seu investimento representa ${results.percentualInvestimento.toFixed(1)}% da meta. Considere aumentar o ticket médio ou melhorar as taxas de conversão.`,
      });
    }

    if (results.roi > 10) {
      insights.push({
        type: 'success',
        message: `Excelente! ROI de ${results.roi.toFixed(1)}x indica uma operação muito lucrativa. Continue otimizando!`,
      });
    }

    if (results.roi <= 10 && results.percentualInvestimento <= 20) {
      insights.push({
        type: 'info',
        message: `Operação equilibrada com ROI de ${results.roi.toFixed(1)}x. Há espaço para otimização das taxas de conversão.`,
      });
    }

    return insights;
  };

  // AI Scenarios Handler
  const handleAIScenarios = async () => {
    setIsAILoading(true);
    setAIResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke('simulador-ai', {
        body: { meta: values.meta },
      });

      if (error) throw error;

      if (data?.scenarios) {
        setAIResponse(data.scenarios);
        setShowAIModal(true);
        toast.success('Cenários da IA gerados com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao obter cenários da IA:', error);
      toast.error('Erro ao gerar cenários. Tente novamente.');
    } finally {
      setIsAILoading(false);
    }
  };

  // Apply AI Scenario
  const applyAIScenario = (scenario: AIScenario) => {
    const fieldsToAnimate = ['ticketMedio', 'cpl', 'taxaLeadReuniao', 'taxaConversao'];
    setAnimatingFields(new Set(fieldsToAnimate));

    setTimeout(() => {
      setValues(prev => ({
        ...prev,
        ticketMedio: scenario.ticketMedio,
        cpl: scenario.cpl,
        taxaLeadReuniao: scenario.taxaLeadReuniao,
        taxaConversao: scenario.taxaConversao,
      }));
    }, 100);

    setTimeout(() => {
      setAnimatingFields(new Set());
    }, 1500);

    setShowAIModal(false);
    toast.success(`Cenário "${scenario.nome}" aplicado!`);
  };

  // Save AI Scenario
  const saveAIScenario = (scenario: AIScenario) => {
    if (scenarios.length >= 10) {
      toast.error('Limite de 10 cenários atingido. Delete um cenário para salvar outro.');
      return;
    }

    const scenarioValues: SimulatorValues = {
      meta: values.meta,
      ticketMedio: scenario.ticketMedio,
      cpl: scenario.cpl,
      taxaLeadReuniao: scenario.taxaLeadReuniao,
      taxaConversao: scenario.taxaConversao,
    };

    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: scenario.nome,
      date: new Date().toLocaleDateString('pt-BR'),
      values: scenarioValues,
      results: calculateResults(scenarioValues),
    };

    setScenarios(prev => [...prev, newScenario]);
    toast.success(`Cenário "${scenario.nome}" salvo!`);
  };

  // Save Current Scenario
  const saveScenario = () => {
    if (scenarios.length >= 10) {
      toast.error('Limite de 10 cenários atingido. Delete um cenário para salvar outro.');
      return;
    }

    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: `Cenário ${scenarios.length + 1}`,
      date: new Date().toLocaleDateString('pt-BR'),
      values: { ...values },
      results: { ...results },
    };

    setScenarios(prev => [...prev, newScenario]);
    toast.success('Cenário salvo com sucesso!');
  };

  // Delete Scenario
  const deleteScenario = (id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
    setSelectedScenarios(prev => prev.filter(sId => sId !== id));
    toast.success('Cenário removido!');
  };

  // Load Scenario
  const loadScenario = (scenario: Scenario) => {
    setValues(scenario.values);
    setIsScenariosOpen(false);
    toast.success(`Cenário "${scenario.name}" carregado!`);
  };

  // Toggle Scenario Selection
  const toggleScenarioSelection = (id: string) => {
    setSelectedScenarios(prev => 
      prev.includes(id) 
        ? prev.filter(sId => sId !== id)
        : [...prev, id]
    );
  };

  // Compare Chart Data
  const compareChartData = useMemo(() => {
    if (!isComparing || selectedScenarios.length < 2) return [];
    
    return selectedScenarios.map(id => {
      const scenario = scenarios.find(s => s.id === id);
      if (!scenario) return null;
      return {
        name: scenario.name,
        Investimento: scenario.results.investimento,
        Lucro: scenario.results.lucro,
        ROI: scenario.results.roi,
      };
    }).filter(Boolean);
  }, [isComparing, selectedScenarios, scenarios]);

  const insights = getInsights();

  return (
    <>
      <Helmet>
        <title>Calculadora de Escala Soberana | Método Soberana</title>
        <meta name="description" content="Simule o crescimento do seu escritório de advocacia. Calcule investimentos, ROI e estratégias para alcançar sua meta de faturamento." />
        <meta property="og:title" content="Calculadora de Escala Soberana" />
        <meta property="og:description" content="Ferramenta estratégica para advogadas de elite planejarem seu crescimento." />
      </Helmet>

      <div className="min-h-screen bg-brand-black">
        {/* Header */}
        <header className="border-b border-gold/20 bg-brand-black/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-gold" />
                <div>
                  <h1 className="text-xl md:text-2xl font-playfair font-bold text-gold">
                    Calculadora de Escala Soberana
                  </h1>
                  <p className="text-xs text-cream/60 font-inter hidden sm:block">
                    Planeje seu crescimento com precisão
                  </p>
                </div>
              </div>
              <img
                src={isotipoSFramedGold}
                alt="Soberana"
                className="w-10 h-10 opacity-60"
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Button
              onClick={handleAIScenarios}
              disabled={isAILoading}
              className="bg-gradient-to-r from-gold to-gold-dark text-brand-black hover:from-gold-light hover:to-gold font-semibold"
            >
              {isAILoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                </motion.div>
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {isAILoading ? "Gerando Cenários..." : "Criar Cenários com IA"}
            </Button>

            <Button
              onClick={saveScenario}
              variant="outlineGold"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Cenário
            </Button>

            <Sheet open={isScenariosOpen} onOpenChange={setIsScenariosOpen}>
              <SheetTrigger asChild>
                <Button variant="outlineGold">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Cenários ({scenarios.length})
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-brand-black border-gold/20">
                <SheetHeader>
                  <SheetTitle className="text-gold font-playfair">Cenários Salvos</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {scenarios.length === 0 ? (
                    <p className="text-cream/60 text-sm font-inter text-center py-8">
                      Nenhum cenário salvo ainda.
                    </p>
                  ) : (
                    scenarios.map(scenario => (
                      <div
                        key={scenario.id}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          selectedScenarios.includes(scenario.id)
                            ? "border-gold bg-gold/10"
                            : "border-gold/20 hover:border-gold/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedScenarios.includes(scenario.id)}
                              onChange={() => toggleScenarioSelection(scenario.id)}
                              className="accent-gold"
                            />
                            <span className="text-cream font-semibold">{scenario.name}</span>
                          </div>
                          <button
                            onClick={() => deleteScenario(scenario.id)}
                            className="text-cream/40 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-cream/50 mb-2">{scenario.date}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-cream/70">
                          <span>Meta: R$ {scenario.values.meta.toLocaleString('pt-BR')}</span>
                          <span>ROI: {scenario.results.roi.toFixed(1)}x</span>
                        </div>
                        <Button
                          onClick={() => loadScenario(scenario)}
                          variant="ghost"
                          size="sm"
                          className="w-full mt-3 text-gold hover:bg-gold/10"
                        >
                          Carregar
                        </Button>
                      </div>
                    ))
                  )}

                  {selectedScenarios.length >= 2 && (
                    <Button
                      onClick={() => {
                        setIsComparing(true);
                        setIsScenariosOpen(false);
                      }}
                      className="w-full bg-gold text-brand-black hover:bg-gold-light"
                    >
                      <GitCompare className="w-4 h-4 mr-2" />
                      Comparar Selecionados
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {selectedScenarios.length >= 2 && !isComparing && (
              <Button
                onClick={() => setIsComparing(true)}
                className="bg-gold text-brand-black hover:bg-gold-light"
              >
                <GitCompare className="w-4 h-4 mr-2" />
                Comparar
              </Button>
            )}
          </div>

          {/* Comparison View */}
          <AnimatePresence>
            {isComparing && selectedScenarios.length >= 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-playfair font-bold text-gold">
                    Comparação de Cenários
                  </h2>
                  <Button
                    onClick={() => setIsComparing(false)}
                    variant="ghost"
                    className="text-cream/60 hover:text-cream"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Fechar Comparação
                  </Button>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {selectedScenarios.map(id => {
                    const scenario = scenarios.find(s => s.id === id);
                    if (!scenario) return null;

                    const isBestROI = scenarios
                      .filter(s => selectedScenarios.includes(s.id))
                      .every(s => s.results.roi <= scenario.results.roi);

                    return (
                      <Card key={id} className={`bg-brand-black/60 border ${
                        isBestROI ? "border-gold" : "border-gold/20"
                      }`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-cream flex items-center gap-2">
                            {scenario.name}
                            {isBestROI && (
                              <span className="px-2 py-0.5 text-xs bg-gold/20 text-gold rounded">
                                Melhor ROI
                              </span>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-cream/60">Investimento:</span>
                            <span className="text-cream">
                              R$ {scenario.results.investimento.toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-cream/60">Lucro:</span>
                            <span className="text-green-400">
                              R$ {scenario.results.lucro.toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-cream/60">ROI:</span>
                            <span className={isBestROI ? "text-gold font-bold" : "text-cream"}>
                              {scenario.results.roi.toFixed(1)}x
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Comparison Chart */}
                <Card className="bg-brand-black/60 border border-gold/20 p-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={compareChartData} layout="vertical">
                      <XAxis type="number" stroke="#F2F1EF" opacity={0.5} />
                      <YAxis type="category" dataKey="name" stroke="#F2F1EF" opacity={0.5} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#080808',
                          border: '1px solid rgba(166, 144, 97, 0.3)',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#F2F1EF' }}
                      />
                      <Legend />
                      <Bar dataKey="Investimento" fill="#6B7280" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="Lucro" fill="#A69061" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Grid - 3 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Parameters */}
            <div className="space-y-4">
              <h2 className="text-lg font-playfair font-bold text-cream mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-gold" />
                Parâmetros de Entrada
              </h2>

              <SimulatorSlider
                icon={Target}
                label="Meta de Faturamento Mensal"
                value={values.meta}
                onChange={(v) => setValues(prev => ({ ...prev, meta: v }))}
                min={10000}
                max={500000}
                step={5000}
                prefix="R$ "
                isAIAnimating={animatingFields.has('meta')}
              />

              <SimulatorSlider
                icon={DollarSign}
                label="Ticket Médio por Contrato"
                value={values.ticketMedio}
                onChange={(v) => setValues(prev => ({ ...prev, ticketMedio: v }))}
                min={1000}
                max={100000}
                step={1000}
                prefix="R$ "
                isAIAnimating={animatingFields.has('ticketMedio')}
              />

              <SimulatorSlider
                icon={TrendingUp}
                label="Custo por Lead (CPL)"
                value={values.cpl}
                onChange={(v) => setValues(prev => ({ ...prev, cpl: v }))}
                min={1}
                max={500}
                step={5}
                prefix="R$ "
                isAIAnimating={animatingFields.has('cpl')}
              />

              <SimulatorSlider
                icon={Users}
                label="Taxa Lead → Reunião"
                value={values.taxaLeadReuniao}
                onChange={(v) => setValues(prev => ({ ...prev, taxaLeadReuniao: v }))}
                min={5}
                max={80}
                step={5}
                suffix="%"
                isAIAnimating={animatingFields.has('taxaLeadReuniao')}
              />

              <SimulatorSlider
                icon={TrendingUp}
                label="Taxa Reunião → Contrato"
                value={values.taxaConversao}
                onChange={(v) => setValues(prev => ({ ...prev, taxaConversao: v }))}
                min={5}
                max={80}
                step={5}
                suffix="%"
                isAIAnimating={animatingFields.has('taxaConversao')}
              />
            </div>

            {/* Column 2: Results */}
            <div className="space-y-4">
              <h2 className="text-lg font-playfair font-bold text-cream mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gold" />
                Resultados Calculados
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <ResultCard
                  title="Contratos Necessários"
                  value={results.contratos}
                  icon={Target}
                  delay={0}
                />
                <ResultCard
                  title="Reuniões Necessárias"
                  value={results.reunioes}
                  icon={Users}
                  delay={0.1}
                />
                <ResultCard
                  title="Leads Necessários"
                  value={results.leads}
                  icon={Users}
                  delay={0.2}
                />
                <ResultCard
                  title="Investimento em Tráfego"
                  value={results.investimento}
                  prefix="R$ "
                  icon={DollarSign}
                  delay={0.3}
                />
                <ResultCard
                  title="CAC"
                  value={results.cac}
                  prefix="R$ "
                  decimals={2}
                  icon={DollarSign}
                  delay={0.4}
                />
                <ResultCard
                  title="ROI Esperado"
                  value={results.roi}
                  suffix="x"
                  decimals={1}
                  highlight={results.roi > 10}
                  icon={TrendingUp}
                  delay={0.5}
                />
              </div>
            </div>

            {/* Column 3: Insights + Chart */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-playfair font-bold text-cream mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold" />
                  Insights Estratégicos
                </h2>

                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <InsightCard key={index} type={insight.type} message={insight.message} />
                  ))}
                </div>
              </div>

              {/* Chart */}
              <Card className="bg-brand-black/60 border border-gold/20">
                <CardHeader>
                  <CardTitle className="text-sm text-cream/80 font-inter">
                    Investimento vs Lucro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} layout="vertical">
                      <XAxis type="number" stroke="#F2F1EF" opacity={0.5} />
                      <YAxis type="category" dataKey="name" hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#080808',
                          border: '1px solid rgba(166, 144, 97, 0.3)',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#F2F1EF' }}
                        formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                      />
                      <Legend />
                      <Bar dataKey="Investimento" fill="#6B7280" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="Lucro Esperado" fill="#A69061" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gold/20 py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-cream/60 text-sm font-inter">
              <span className="text-gold font-playfair font-semibold">Método Soberana</span>
              {" "}— De Advogada a CEO
            </p>
          </div>
        </footer>
      </div>

      {/* AI Scenarios Modal */}
      <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
        <DialogContent className="bg-brand-black border-gold/30 max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-playfair text-gold flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              Análise Estratégica da IA
            </DialogTitle>
          </DialogHeader>

          {aiResponse && (
            <div className="space-y-6 mt-4">
              {/* General Report */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/30"
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-gold" />
                  <h3 className="text-lg font-playfair font-bold text-gold">Relatório de Mercado</h3>
                </div>
                <p className="text-cream/80 text-sm font-inter leading-relaxed whitespace-pre-line">
                  {aiResponse.relatorioGeral}
                </p>
              </motion.div>

              {/* Scenarios Grid */}
              <div>
                <h3 className="text-lg font-playfair font-bold text-cream mb-4">
                  Cenários Estratégicos para sua Meta de R$ {values.meta.toLocaleString('pt-BR')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiResponse.cenarios.map((scenario, index) => (
                    <AIScenarioCard
                      key={scenario.tipo}
                      scenario={scenario}
                      meta={values.meta}
                      onApply={() => applyAIScenario(scenario)}
                      onSave={() => saveAIScenario(scenario)}
                      delay={index * 0.15}
                    />
                  ))}
                </div>
              </div>

              {/* Conclusion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-5 rounded-xl bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/30"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-playfair font-bold text-green-400">Recomendação Final</h3>
                </div>
                <p className="text-cream/80 text-sm font-inter leading-relaxed">
                  {aiResponse.conclusao}
                </p>
              </motion.div>

              {/* Save All Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => {
                    aiResponse.cenarios.forEach(scenario => saveAIScenario(scenario));
                    setShowAIModal(false);
                    toast.success('Todos os 3 cenários foram salvos!');
                  }}
                  className="bg-gold text-brand-black hover:bg-gold-light font-semibold px-8"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Todos os Cenários
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SimuladorFinanceiro;
