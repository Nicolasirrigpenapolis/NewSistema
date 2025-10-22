import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import { Button, Input, Label } from '../../../ui';
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Empresa {
  id: string;
  nome: string;
  nomeExibicao: string;
  logo: string;
  logoLogin: string;
  fundoLogin: string;
  corPrimaria: string;
  corSecundaria: string;
}

interface LoginForm {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  username?: string;
  password?: string;
  general?: string;
}

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string>('');
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [logoUpload, setLogoUpload] = useState<string | null>(null);
  const [fundoUpload, setFundoUpload] = useState<string | null>(null);

  const [form, setForm] = useState<LoginForm>({
    username: '',
    password: '',
    rememberMe: false
  });

  const [imageLoaded, setImageLoaded] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Carregar empresas disponíveis
  useEffect(() => {
    const carregarEmpresas = async () => {
      try {
        setLoadingEmpresas(true);
        const response = await api.get<{ success: boolean; data: Empresa[] }>('/empresas/disponiveis');
        
        if (response.data.success && response.data.data.length > 0) {
          setEmpresas(response.data.data);
          
          // Verificar se já tem empresa salva no localStorage
          const empresaSalva = localStorage.getItem('empresaSelecionada');
          if (empresaSalva) {
            const empresaExiste = response.data.data.find(e => e.id === empresaSalva);
            if (empresaExiste) {
              setEmpresaSelecionada(empresaSalva);
              localStorage.setItem('empresaSelecionada', empresaSalva);
            } else {
              // Se não existe mais, seleciona Irrigação por padrão
              const empresaIrrigacao = response.data.data.find(e => e.id === 'irrigacao');
              const empresaPadrao = empresaIrrigacao || response.data.data[0];
              setEmpresaSelecionada(empresaPadrao.id);
              localStorage.setItem('empresaSelecionada', empresaPadrao.id);
            }
          } else {
            // Se não tem salva, seleciona Irrigação por padrão
            const empresaIrrigacao = response.data.data.find(e => e.id === 'irrigacao');
            const empresaPadrao = empresaIrrigacao || response.data.data[0];
            setEmpresaSelecionada(empresaPadrao.id);
            localStorage.setItem('empresaSelecionada', empresaPadrao.id);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
        setAlert({ type: 'error', message: 'Erro ao carregar empresas disponíveis' });
      } finally {
        setLoadingEmpresas(false);
      }
    };

    carregarEmpresas();
  }, []);

  // Redirecionar se já autenticado
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Limpar alertas após 5 segundos
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Usar dados da empresa selecionada no radio button (do ConfiguracoesEmpresas.json)
  const empresaAtual = useMemo(() => {
    return empresas.find(e => e.id === empresaSelecionada);
  }, [empresas, empresaSelecionada]);

  const brandName = useMemo(() => {
    return empresaAtual?.nomeExibicao || '';
  }, [empresaAtual]);

  const brandLogo = useMemo(() => {
    // Prioridade: 1) Logo do upload, 2) Logo do JSON
    if (logoUpload) {
      return logoUpload;
    }
    if (empresaAtual?.logoLogin) {
      return empresaAtual.logoLogin;
    }
    return null;
  }, [logoUpload, empresaAtual]);

  const backgroundImage = useMemo(() => {
    // Prioridade: 1) Fundo do upload, 2) Fundo do JSON
    if (fundoUpload) {
      return fundoUpload;
    }
    if (empresaAtual?.fundoLogin) {
      return empresaAtual.fundoLogin;
    }
    return null;
  }, [fundoUpload, empresaAtual]);

  // Atualizar título da página conforme empresa selecionada
  useEffect(() => {
    if (empresaAtual?.nomeExibicao) {
      document.title = `${empresaAtual.nomeExibicao} - Login`;
    } else {
      document.title = 'Login';
    }
  }, [empresaAtual]);

  // Buscar logo e fundo do emitente quando empresa for selecionada
  useEffect(() => {
    if (!empresaSelecionada) {
      setLogoUpload(null);
      setFundoUpload(null);
      return;
    }

    // Mapeamento de imagens estáticas por empresa
    const imagensPorEmpresa: Record<string, { logo?: string; fundo?: string }> = {
      'irrigacao': {
        logo: '/imagens/logo_IP.png',
        fundo: '/imagens/imagem_login_IP.jpg'
      },
      'chinellato': {
        logo: '/imagens/logo_chinellato.png',
        fundo: '/imagens/imagem_login_chinellato.jpg'
      }
    };

    const imagens = imagensPorEmpresa[empresaSelecionada];
    setLogoUpload(imagens?.logo || null);
    setFundoUpload(imagens?.fundo || null);
  }, [empresaSelecionada]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.username) {
      newErrors.username = 'Nome de usuário é obrigatório';
    } else if (form.username.length < 3) {
      newErrors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
    }

    if (!form.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (form.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Salvar empresa selecionada antes de fazer login
    if (empresaSelecionada) {
      localStorage.setItem('empresaSelecionada', empresaSelecionada);
    }

    setIsSubmitting(true);
    setErrors({});
    setAlert(null);

    try {
      const result = await login({
        username: form.username,
        password: form.password
      });

      if (result.success) {
        setAlert({ type: 'success', message: result.message });
      } else {
        setAlert({ type: 'error', message: result.message });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro inesperado. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LoginForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  useEffect(() => {
    if (!backgroundImage) {
      setImageLoaded(false);
      return;
    }

    setImageLoaded(false);
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => {
      console.error('Erro ao carregar imagem de fundo:', backgroundImage);
      setImageLoaded(false);
    };
    img.src = backgroundImage;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [backgroundImage]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10 text-foreground transition-colors sm:px-6"
      style={{
        backgroundImage: imageLoaded
          ? `linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url('${backgroundImage}')`
          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="flex w-full justify-center">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white/10 shadow-[0_35px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-colors dark:bg-white/5">
          <div className="pointer-events-none absolute inset-x-12 top-0 h-32 rounded-full bg-[#34d399]/25 blur-3xl" />
          <div className="relative px-8 py-10 sm:px-10">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-white/90 shadow-[0_20px_45px_rgba(15,23,42,0.25)] dark:bg-white/80">
                {brandLogo ? (
                  <img
                    src={brandLogo}
                    alt={brandName}
                    className="h-28 w-28 object-contain drop-shadow-[0_10px_20px_rgba(52,211,153,0.45)]"
                    loading="lazy"
                  />
                ) : (
                  <Building2 className="h-20 w-20 text-[#34d399] drop-shadow-[0_10px_20px_rgba(52,211,153,0.45)]" />
                )}
              </div>
              <div className="mt-3 space-y-1 text-white">
                <h2 className="text-2xl font-semibold tracking-tight">{brandName || 'Sistema de Gestão'}</h2>
                <p className="text-sm text-slate-200">
                  Acesse sua plataforma de gestão para gerenciar emissões, orçamentos e processos administrativos.
                </p>
              </div>
            </div>

            {alert && (
              <div
                role="alert"
                className={cn(
                  'mt-6 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm shadow-sm backdrop-blur-md',
                  alert.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-200'
                    : 'bg-red-500/10 text-red-200'
                )}
              >
                {alert.type === 'success' ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                )}
                <span className="font-medium">{alert.message}</span>
              </div>
            )}

            {/* Seleção de Empresa */}
            {!loadingEmpresas && empresas.length > 0 && (
              <div className="mt-6 space-y-3">
                <Label className="text-sm font-semibold text-slate-200">
                  Selecione a Empresa
                </Label>
                <div className="space-y-2">
                  {empresas.map((empresa) => (
                    <label
                      key={empresa.id}
                      className={cn(
                        'flex items-center gap-3 rounded-xl p-4 cursor-pointer transition-all',
                        'bg-black/30 hover:bg-black/40 backdrop-blur-sm',
                        empresaSelecionada === empresa.id && 'ring-2 ring-offset-2 ring-offset-transparent',
                        empresaSelecionada === empresa.id && `ring-[${empresa.corPrimaria}]`,
                        empresaSelecionada === empresa.id && 'bg-black/50'
                      )}
                      style={{
                        borderColor: empresaSelecionada === empresa.id ? empresa.corPrimaria : 'transparent',
                        borderWidth: empresaSelecionada === empresa.id ? '2px' : '0px'
                      }}
                    >
                      <input
                        type="radio"
                        name="empresa"
                        value={empresa.id}
                        checked={empresaSelecionada === empresa.id}
                        onChange={(e) => {
                          const novaEmpresa = e.target.value;
                          setEmpresaSelecionada(novaEmpresa);
                          localStorage.setItem('empresaSelecionada', novaEmpresa);
                          
                          // Disparar evento customizado para notificar mudança de empresa
                          const event = new CustomEvent('empresaMudou', {
                            detail: { empresaSelecionada: novaEmpresa }
                          });
                          window.dispatchEvent(event);
                        }}
                        className="h-4 w-4 text-[#34d399] focus:ring-2 focus:ring-[#34d399]/40"
                        style={{
                          accentColor: empresa.corPrimaria
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-white">{empresa.nomeExibicao}</p>
                        <p className="text-sm text-slate-300">{empresa.nome}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-slate-200">
                  Usuário
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={form.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                  autoComplete="username"
                  className={cn(
                    'h-11 rounded-xl bg-black/40 px-4 text-slate-100 shadow-inner focus-visible:ring-2 focus-visible:ring-[#34d399]/40',
                    errors.username && 'focus-visible:ring-red-500'
                  )}
                />
                {errors.username && (
                  <p className="flex items-center gap-2 text-sm text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    {errors.username}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-200">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={form.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="current-password"
                    className={cn(
                      'h-11 rounded-xl bg-black/40 px-4 pr-12 text-slate-100 shadow-inner focus-visible:ring-2 focus-visible:ring-[#34d399]/40',
                      errors.password && 'focus-visible:ring-red-500'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="flex items-center gap-2 text-sm text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-slate-300">
                <label className="inline-flex items-center gap-2">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                    disabled={isSubmitting}
                    className="h-4 w-4 rounded bg-black/30 text-[#34d399] focus:ring-2 focus:ring-[#34d399]/40"
                  />
                  <span>Lembrar de mim</span>
                </label>

                <Link
                  to="/auth/forgot-password"
                  className="font-semibold text-[#34d399] underline-offset-4 transition hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl bg-[#34d399] text-[#0f172a] shadow-[0_18px_28px_rgba(52,211,153,0.35)] transition hover:bg-[#2ec194] focus-visible:ring-2 focus-visible:ring-[#34d399]/40"
                size="lg"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            <div className="mt-10 space-y-1 text-center text-xs text-slate-300">
              <p>Versão 1.00</p>
              <p className="text-[11px] tracking-wide">
                Uso restrito. Entre em contato com o administrador de TI para habilitar seu acesso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
