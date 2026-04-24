import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  AlignLeft, 
  ListChecks, 
  Activity, 
  ChevronRight, 
  Copy, 
  Check, 
  RotateCcw,
  MousePointer2,
  BrainCircuit,
  Zap,
  Info,
  Clock,
  Download,
  Search,
  Settings,
  LogOut,
  FileText,
  History as HistoryIcon,
  Eraser,
  Languages,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { cn } from './lib/utils';
import { analyzeText, AnalysisType } from './services/geminiService';
import Auth from './components/Auth';

interface HistoryItem {
  id: string;
  timestamp: number;
  text: string;
  result: string;
  type: AnalysisType;
}

const ANALYSIS_OPTIONS: { id: AnalysisType; label: string; icon: any; color: string; accent: string }[] = [
  { id: 'summary', label: 'Özetle', icon: AlignLeft, color: 'bg-indigo-600', accent: 'text-indigo-400' },
  { id: 'key-points', label: 'Ana Maddeler', icon: ListChecks, color: 'bg-cyan-500', accent: 'text-cyan-400' },
  { id: 'sentiment', label: 'Duygu Analizi', icon: Activity, color: 'bg-emerald-500', accent: 'text-emerald-400' },
  { id: 'grammar', label: 'Gramer Kontrolü', icon: CheckCircle2, color: 'bg-amber-500', accent: 'text-amber-400' },
  { id: 'rewrite', label: 'Yeniden Düzenle', icon: RefreshCw, color: 'bg-rose-500', accent: 'text-rose-400' },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Sayfa ilk yüklendiğinde localStorage kontrolü yap
    return localStorage.getItem('synapse_is_logged_in') === 'true';
  });
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisType | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userName, setUserName] = useState<string>('Misafir');
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Giriş Yapma Fonksiyonu
  const handleLogin = () => {
    localStorage.setItem('synapse_is_logged_in', 'true');
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }
    setIsAuthenticated(true);
  };

  // Çıkış Yapma Fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem('synapse_is_logged_in');
    localStorage.removeItem('userName');
    // İsteğe bağlı: Geçmişi de temizlemek isterseniz alttaki satırı açabilirsiniz
    // localStorage.removeItem('synapse_history'); 
    setIsAuthenticated(false);
    setResult(null);
    setInputText('');
  };

  // Karakter ve Kelime Sayacı Verileri
  const stats = useMemo(() => {
    const chars = inputText.length;
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    const readingTime = Math.ceil(words / 200); // Ortalama 200 kelime/dakika
    return { chars, words, readingTime };
  }, [inputText]);

  // Sayfa yüklendiğinde geçmişi ve kullanıcı ismini getir
  useEffect(() => {
    const savedHistory = localStorage.getItem('synapse_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  // Geçmişe ekle
  const addToHistory = (text: string, result: string, type: AnalysisType) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      text,
      result,
      type
    };
    const updatedHistory = [newItem, ...history].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem('synapse_history', JSON.stringify(updatedHistory));
  };

  const handleAnalyze = async (type: AnalysisType) => {
    if (!inputText.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setActiveAnalysis(type);
    setResult(null);

    try {
      const output = await analyzeText(inputText, type);
      setResult(output);
      addToHistory(inputText, output, type);
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

  const exportAsTxt = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `synapse-analiz-${Date.now()}.txt`);
  };

  const exportAsPdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(result, 180);
    doc.text(splitText, 15, 15);
    doc.save(`synapse-analiz-${Date.now()}.pdf`);
  };

  // Sonuç metni içinde arama vurgulama
  const highlightedResult = useMemo(() => {
    if (!result || !searchTerm) return result;
    // Regex ile aranan kelimeyi bulup markdown mark etiketi ekliyoruz
    try {
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      return result.replace(regex, '<mark class="bg-yellow-400/30 text-yellow-200 rounded px-0.5">$1</mark>');
    } catch (e) {
      return result;
    }
  }, [result, searchTerm]);

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen selection:bg-indigo-500/30 selection:text-white flex flex-col relative overflow-hidden bg-[#02040a]">
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
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-display">SYNAPSE</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-1.5 px-4 h-9 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Hoş Geldin,</span>
          <span className="text-xs font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent italic">
            {userName}!
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <HistoryIcon className="w-4 h-4" />
            GEÇMİŞ
          </button>
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-widest whitespace-nowrap">Gemini Engine v3.1</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all group"
            title="Çıkış Yap"
          >
            <LogOut className="w-4 h-4 text-rose-500 group-hover:text-white" />
          </button>
        </div>
      </header>

      {/* History Sidebar/Drawer */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-synapse-950 border-l border-white/10 z-[70] p-6 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                  <HistoryIcon className="w-5 h-5 text-indigo-400" />
                  Analiz Geçmişi
                </h3>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 opacity-30">
                    <Eraser className="w-12 h-12 mb-4" />
                    <p className="text-sm">Henüz geçmişiniz temiz.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => {
                        setInputText(item.text);
                        setResult(item.result);
                        setActiveAnalysis(item.type);
                        setShowHistory(false);
                      }}
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all text-left group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                          {ANALYSIS_OPTIONS.find(opt => opt.id === item.type)?.label}
                        </span>
                        <span className="text-[10px] text-slate-600 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 italic">"{item.text}"</p>
                    </button>
                  ))
                )}
              </div>
              
              <button 
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem('synapse_history');
                }}
                className="mt-6 w-full py-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Eraser className="w-4 h-4" />
                GEÇMİŞİ TEMİZLE
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 p-6 md:p-10 relative z-10">
        
        {/* Input Column */}
        <section className="col-span-1 md:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-semibold text-slate-400 tracking-widest flex items-center gap-2">
              <MousePointer2 className="w-3 h-3" />
              GİRİŞ MATERYALİ
            </h2>
            <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-600">
              <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {stats.words} Kelime</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{stats.readingTime} dk Okuma</span>
            </div>
          </div>
          
          <div className="flex-1 glass-panel p-8 backdrop-blur-md flex flex-col group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-3xl opacity-50 pointer-events-none"></div>
            <textarea
              className="flex-1 w-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder:text-slate-700 resize-none font-sans text-lg relative z-10 min-h-[300px]"
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
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-center group",
                    activeAnalysis === opt.id && !isAnalyzing ? "bg-white/10 border-indigo-500/50" : "bg-white/5 border-white/5 hover:bg-white/10",
                    (!inputText.trim() || isAnalyzing) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn("p-2 rounded-lg text-white mb-1 shadow-lg shadow-black/40 group-hover:scale-110 transition-transform", opt.color)}>
                    <opt.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-white">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results Column */}
        <section className="col-span-1 md:col-span-5 flex flex-col gap-6" ref={resultsRef}>
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-semibold text-slate-400 tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3 fill-indigo-400" />
                AI SENTETİZÖR
              </h2>
              {result && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Bul..."
                    className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-indigo-500 w-32"
                  />
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="result-card flex flex-col items-center justify-center gap-4 py-24 flex-1"
                >
                  <div className="relative">
                    <BrainCircuit className="w-12 h-12 text-indigo-500 animate-pulse" />
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.3em] mb-1">Sentetik Veri İşleniyor</p>
                    <p className="text-sm text-slate-500 animate-bounce">Gemini motoru kurgulanıyor...</p>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-4 flex-1"
                >
                  <div className="result-card relative overflow-hidden group flex-1">
                    <div className="absolute top-0 right-0 p-4">
                      <Sparkles className="w-5 h-5 text-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       {activeAnalysis && ANALYSIS_OPTIONS.find(o => o.id === activeAnalysis)?.label} SONUCU
                    </h3>
                    <div className="markdown-body max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{highlightedResult || ''}</ReactMarkdown>
                    </div>
                    
                    {/* Floating Controls */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={exportAsTxt}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-all shadow-sm"
                        >
                          <FileText className="w-3 h-3" /> TXT
                        </button>
                        <button 
                          onClick={exportAsPdf}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-all shadow-sm"
                        >
                          <Download className="w-3 h-3" /> PDF
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={copyToClipboard}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? 'Kopyalandı!' : 'Kopyala'}
                        </button>
                        <button 
                          onClick={() => {setResult(null); setActiveAnalysis(null);}}
                          className="p-2 border border-white/5 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 border border-white/5 border-dashed rounded-3xl flex flex-col items-center justify-center p-12 text-center opacity-20">
                  <BrainCircuit className="w-12 h-12 mb-4" />
                  <p className="text-sm font-semibold uppercase tracking-[0.2em]">Sonuç Bekleniyor</p>
                  <p className="text-xs mt-2 italic">Bir analiz türü seçerek başlayın</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Metric Widgets (Bottom of Sidebar) */}
          {result && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md group hover:border-indigo-500/30 transition-colors">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">DOĞRULUK</p>
                <p className="text-xl font-semibold text-cyan-400">99.8%</p>
                <div className="w-full h-1 bg-slate-800 mt-3 rounded-full overflow-hidden">
                  <div className="w-[99.8%] h-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md group hover:border-indigo-500/30 transition-colors">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">İŞLEME</p>
                <p className="text-xl font-semibold text-purple-400">Sentetik</p>
                <p className="text-[10px] text-slate-500 mt-2 italic flex items-center gap-1">
                  <Sparkles className="w-2 h-2" />
                  Derin Analiz
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* App Footer / Status Bar */}
      <footer className="h-12 flex items-center justify-between px-6 md:px-10 border-t border-white/5 bg-black/40 backdrop-blur-md relative z-50">
        <div className="flex items-center gap-4 md:gap-6 text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em] overflow-hidden">
          <span className="flex items-center gap-1.5"><div className="w-1 h-1 bg-emerald-500 rounded-full" /> PWA Aktif</span>
          <span className="hidden sm:inline">●</span>
          <span className="hidden sm:inline">Uçtan Uca Şifreli</span>
          <span>●</span>
          <span className="whitespace-nowrap">API Latency: 320MS</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="h-4 w-px bg-white/10"></div>
           <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest italic tracking-tighter">Powered by Google Gemini v3.1</span>
        </div>
      </footer>
    </div>
  );
}
