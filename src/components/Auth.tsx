import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, Mail, Lock, User, LogIn, ChevronRight, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthProps {
  onLogin: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

export default function Auth({ onLogin }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-transparent', textColor: 'text-slate-500' };
    
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasDigits = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    const isMinLength = pass.length >= 8;

    // Zayıf: 8'den az VEYA (Sadece harf/Sayı)
    if (!isMinLength || (hasLetters && !hasDigits && !hasSpecial) || (hasDigits && !hasLetters && !hasSpecial)) {
      return { score: 1, label: 'Zayıf', color: 'bg-rose-500', textColor: 'text-rose-400' };
    }
    
    // Orta: 8+ karakter VEYA (Harf + Sayı)
    if (isMinLength && hasLetters && hasDigits && !hasSpecial) {
      return { score: 2, label: 'Orta', color: 'bg-amber-500', textColor: 'text-amber-400' };
    }
    
    // Güçlü: 8+ karakter VEYA (Harf + Sayı + Özel Karakter)
    if (isMinLength && hasLetters && hasDigits && hasSpecial) {
      return { score: 3, label: 'Güçlü!', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
    }
    
    return { score: 1, label: 'Zayıf', color: 'bg-rose-500', textColor: 'text-rose-400' };
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Empty Field Check
    if (mode === 'register' && !name.trim()) newErrors.name = 'Lütfen isminizi giriniz.';
    if (!email.trim()) newErrors.email = 'Lütfen e-posta adresinizi giriniz.';
    if (mode !== 'forgot' && !password.trim()) newErrors.password = 'Lütfen şifrenizi giriniz.';

    // Email Format Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email)) {
      newErrors.email = 'Lütfen geçerli bir e-posta adresi giriniz.';
    }

    // Password Length Check (8-20 Range)
    if (mode !== 'forgot' && password.trim()) {
      if (password.length < 8 || password.length > 20) {
        newErrors.password = 'Şifre 8-20 karakter arasında olmalıdır.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);

    // Save Name logic
    if (mode === 'register' && name) {
      localStorage.setItem('userName', name);
    } else if (mode === 'login') {
      if (!localStorage.getItem('userName')) {
        localStorage.setItem('userName', 'Misafir');
      }
    }

    // Simulated login delay
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('synapse_is_logged_in', 'true');
      onLogin();
    }, 1500);
  };

  const clearErrors = () => setErrors({});

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearErrors();
    setShowPassword(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#02040a]">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel p-8 md:p-10 flex flex-col items-center">
          {/* Logo */}
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2 font-display">Synapse</h1>
          <p className="text-slate-400 text-sm mb-8 text-center px-4">Yapay zeka ile metinlerinizi en yüksek hızda analiz edin.</p>

          <AnimatePresence mode="wait">
            <motion.form 
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit}
              className="w-full space-y-4"
            >
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">İsim Soyisim</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => { setName(e.target.value); if (errors.name) validate(); }}
                      className={cn(
                        "w-full bg-white/5 border rounded-xl px-10 py-3 text-sm text-white focus:outline-none transition-all",
                        errors.name ? "border-rose-500/50 bg-rose-500/5" : "border-white/10 focus:border-indigo-500"
                      )}
                      placeholder="Adınız"
                    />
                  </div>
                  {errors.name && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-rose-400 flex items-center gap-1 mt-1 ml-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </motion.p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (errors.email) validate(); }}
                    className={cn(
                      "w-full bg-white/5 border rounded-xl px-10 py-3 text-sm text-white focus:outline-none transition-all",
                      errors.email ? "border-rose-500/50 bg-rose-500/5" : "border-white/10 focus:border-indigo-500"
                    )}
                    placeholder="ornek@mail.com"
                  />
                </div>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-rose-400 flex items-center gap-1 mt-1 ml-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </motion.p>
                )}
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Şifre</label>
                    {password && (
                      <span className={cn("text-[10px] font-bold uppercase tracking-tight transition-colors", strength.textColor)}>
                        {strength.label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      maxLength={20}
                      onChange={(e) => { setPassword(e.target.value); if (errors.password) validate(); }}
                      className={cn(
                        "w-full bg-white/5 border rounded-xl pl-10 pr-12 py-3 text-sm text-white focus:outline-none transition-all",
                        errors.password ? "border-rose-500/50 bg-rose-500/5" : 
                        (password.length >= 8 ? "border-emerald-500/30 bg-emerald-500/[0.02]" : "border-white/10 focus:border-indigo-500")
                      )}
                      placeholder="8-20 karakter"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-600 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator Bars */}
                  {mode === 'register' && password && (
                    <div className="flex gap-1.5 px-1 pt-0.5">
                      {[1, 2, 3].map((step) => (
                        <div 
                          key={step}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-all duration-500",
                            strength.score >= step ? strength.color : "bg-white/5"
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {errors.password && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-rose-400 flex items-center gap-1 mt-1 ml-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {errors.password}
                    </motion.p>
                  )}
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span className="text-sm">İşleniyor...</span>
                  </div>
                ) : (
                  <>
                    {mode === 'login' ? 'Giriş Yap' : mode === 'register' ? 'Kayıt Ol' : 'Sıfırlama Bağlantısı Gönder'}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          <div className="mt-6 flex flex-col gap-3 w-full items-center">
            {mode === 'login' ? (
              <>
                <button 
                  onClick={() => switchMode('forgot')}
                  className="text-xs text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  Şifremi mi unuttun?
                </button>
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  Hesabınız yok mu? 
                  <button onClick={() => switchMode('register')} className="text-indigo-400 font-bold hover:underline italic">Hemen Kaydol</button>
                </div>
              </>
            ) : (
              <button 
                onClick={() => switchMode('login')}
                className="text-xs text-indigo-400 font-bold hover:underline"
              >
                Giriş Ekranına Dön
              </button>
            )}

            <div className="w-full h-px bg-white/5 my-2" />

            <button 
              onClick={() => {
                localStorage.setItem('userName', 'Misafir');
                localStorage.setItem('synapse_is_logged_in', 'true');
                onLogin();
              }}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2 group"
            >
              Misafir Olarak Hızlı Giriş
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
