import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  AlignLeft, 
  ListChecks, 
  MessageSquareQuote, 
  Activity, 
  FileSearch, 
  ChevronRight, 
  Copy, 
  Check, 
  RotateCcw,
  MousePointer2,
  BrainCircuit,
  Zap,
  Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { analyzeText, AnalysisType } from './services/geminiService';

const ANALYSIS_OPTIONS: { id: AnalysisType; label: string; icon: any; color: string; accent: string }[] = [
  { id: 'summary', label: 'Summary', icon: AlignLeft, color: 'bg-indigo-600', accent: 'text-indigo-400' },
  { id: 'key-points', label: 'Key Points', icon: ListChecks, color: 'bg-cyan-500', accent: 'text-cyan-400' },
  { id: 'sentiment', label: 'Sentiment', icon: Activity, color: 'bg-emerald-500', accent: 'text-emerald-400' },
  { id: 'tone', label: 'Tone', icon: MessageSquareQuote, color: 'bg-amber-500', accent: 'text-amber-400' },
  { id: 'critique', label: 'Critique', icon: FileSearch, color: 'bg-rose-500', accent: 'text-rose-400' },
];

export default function App() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisType | null>(null);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (type: AnalysisType) => {
    if (!inputText.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setActiveAnalysis(type);
    setResult(null);

    try {
      const output = await analyzeText(inputText, type);
      setResult(output);
    } catch (error) {
      setResult('#### ⚠️ Hata\nAnaliz sırasında bir sorun oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen selection:bg-indigo-500/30 selection:text-white flex flex-col relative overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Navigation Bar */}
      <header className="h-20 shrink-0 flex items-center justify-between px-6 md:px-10 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-display">SYNAPSE</span>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-widest whitespace-nowrap">Gemini Engine v3.1</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center">
            <span className="text-xs font-bold">JD</span>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 p-6 md:p-10 relative z-10 overflow-visible">
        
        {/* Left Column: Input Space */}
        <section className="col-span-1 md:col-span-7 flex flex-col gap-4 min-h-[500px]">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MousePointer2 className="w-3 h-3" />
              Metin Kaynağı
            </h2>
            <span className="text-xs text-slate-500 font-mono italic">{inputText.length.toLocaleString()} Karakter</span>
          </div>
          
          <div className="flex-1 glass-panel p-8 backdrop-blur-md flex flex-col group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-3xl opacity-50 pointer-events-none"></div>
            <textarea
              className="flex-1 w-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder:text-slate-700 resize-none font-sans text-lg relative z-10"
              placeholder="Analiz materyalini buraya yerleştirin..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <div className="mt-8 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-3 relative z-10">
              {ANALYSIS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleAnalyze(opt.id)}
                  disabled={!inputText.trim() || isAnalyzing}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-center",
                    activeAnalysis === opt.id && !isAnalyzing ? "bg-white/10 border-indigo-500/50" : "bg-white/5 border-white/5 hover:bg-white/10",
                    (!inputText.trim() || isAnalyzing) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn("p-2 rounded-lg text-white mb-1", opt.color)}>
                    <opt.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-white">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Intelligence Results */}
        <section className="col-span-1 md:col-span-5 flex flex-col gap-6" ref={resultsRef}>
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="result-card flex flex-col items-center justify-center gap-4 py-24"
              >
                <div className="relative">
                  <BrainCircuit className="w-12 h-12 text-indigo-500 animate-pulse" />
                  <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.3em] mb-1">Synthesizing</p>
                  <p className="text-sm text-slate-500">Gemini motoru kurgulanıyor...</p>
                </div>
                <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
                  />
                </div>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-6"
              >
                <div className="result-card relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                    <Sparkles className="w-5 h-5 text-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap className="w-3 h-3 fill-indigo-400" />
                    GEMINI SYNTHESIS
                  </h3>
                  <div className="markdown-body">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                  <div className="mt-8 flex items-center justify-end gap-3">
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all hover:text-white"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button 
                      onClick={() => {setResult(null); setActiveAnalysis(null);}}
                      className="p-2 border border-white/5 rounded-xl text-slate-500 hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metric Widgets (Dynamic based on analysis if available, otherwise static placeholders for UI feel) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Intelligence</p>
                    <p className="text-xl font-semibold text-cyan-400">Advanced</p>
                    <div className="w-full h-1 bg-slate-800 mt-3 rounded-full overflow-hidden">
                      <div className="w-4/5 h-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Efficiency</p>
                    <p className="text-xl font-semibold text-purple-400">98.2%</p>
                    <p className="text-[10px] text-slate-500 mt-2 italic flex items-center gap-1">
                      <Info className="w-2 h-2" />
                      Optimized Flow
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 border border-white/5 border-dashed rounded-3xl flex flex-col items-center justify-center p-12 text-center opacity-30">
                <BrainCircuit className="w-12 h-12 mb-4" />
                <p className="text-sm font-semibold uppercase tracking-[0.2em]">Sonuç Bekleniyor</p>
                <p className="text-xs mt-2 italic">Bir analiz türü seçerek başlayın</p>
              </div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* App Footer / Status Bar */}
      <footer className="h-12 flex items-center justify-between px-6 md:px-10 border-t border-white/5 bg-black/40 backdrop-blur-md relative z-50">
        <div className="flex items-center gap-4 md:gap-6 text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em] overflow-hidden">
          <span className="flex items-center gap-1.5"><div className="w-1 h-1 bg-emerald-500 rounded-full" /> PWA Ready</span>
          <span className="hidden sm:inline">●</span>
          <span className="hidden sm:inline">Secure Node</span>
          <span>●</span>
          <span className="whitespace-nowrap">Latency: 380MS</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="h-4 w-px bg-white/10"></div>
           <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest italic">Intelligence by Google Gemini</span>
        </div>
      </footer>
    </div>
  );
}
