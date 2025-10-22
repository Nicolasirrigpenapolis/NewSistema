import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermissionContext } from '../../../contexts/PermissionContext';
import { useToast } from '../../../contexts/ToastContext';
import {
  Home,
  Truck,
  Users,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
  Shield,
  Briefcase,
  MapPin,
  Package,
  Wrench,
  DollarSign,
  Building2,
  Search,
  FileCheck,
  Clock,
  ClipboardList
} from 'lucide-react';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  permission?: string;
  children?: MenuItem[];
  onSelect?: () => void;
  disabled?: boolean;
  status?: 'soon' | 'beta';
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { hasPermission, permissions } = usePermissionContext();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Operações', 'Gestão Operacional']);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  // Log das permissões disponíveis
  useEffect(() => {
    console.log('[SIDEBAR] Permissões carregadas:', permissions.length, permissions);
    console.log('[SIDEBAR] Exemplo de permissões:', permissions.slice(0, 5));
    console.log('[SIDEBAR] Tipo da primeira permissão:', typeof permissions[0]);
  }, [permissions]);

  const menuItems: MenuItem[] = useMemo(() => ([
    {
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      path: '/dashboard',
    },
    {
      label: 'Operações',
      icon: <Truck className="w-5 h-5" />,
      children: [
        {
          label: 'Veículos',
          icon: <Truck className="w-4 h-4" />,
          path: '/veiculos',
          permission: 'veiculos.listar',
        },
        {
          label: 'Reboques',
          icon: <Package className="w-4 h-4" />,
          path: '/reboques',
          permission: 'reboques.listar',
        },
        {
          label: 'Condutores',
          icon: <Users className="w-4 h-4" />,
          path: '/condutores',
          permission: 'condutores.listar',
        },
      ],
    },
    {
      label: 'Documentos Fiscais',
      icon: <FileCheck className="w-5 h-5" />,
      children: [
        {
          label: 'MDF-e',
          icon: <FileText className="w-4 h-4" />,
          path: '/documentos/mdfe',
          permission: 'mdfe.listar',
        },
        {
          label: 'NF-e',
          icon: <FileText className="w-4 h-4" />,
          permission: 'nfe.listar',
          disabled: true,
          status: 'soon',
          onSelect: () => showToast('O módulo de NF-e está em preparação e será liberado em breve.', {
            title: 'Funcionalidade em breve',
            variant: 'warning',
          }),
        },
        {
          label: 'CT-e',
          icon: <FileText className="w-4 h-4" />,
          permission: 'cte.listar',
          disabled: true,
          status: 'soon',
          onSelect: () => showToast('O módulo de CT-e está em preparação e será liberado em breve.', {
            title: 'Funcionalidade em breve',
            variant: 'warning',
          }),
        },
      ],
    },
    {
      label: 'Cadastros',
      icon: <FileText className="w-5 h-5" />,
      children: [
        {
          label: 'Contratantes',
          icon: <Briefcase className="w-4 h-4" />,
          path: '/contratantes',
          permission: 'contratantes.listar',
        },
        {
          label: 'Seguradoras',
          icon: <Shield className="w-4 h-4" />,
          path: '/seguradoras',
          permission: 'seguradoras.listar',
        },
        {
          label: 'Municípios',
          icon: <MapPin className="w-4 h-4" />,
          path: '/municipios',
          permission: 'municipios.listar',
        },
        {
          label: 'Fornecedores',
          icon: <Building2 className="w-4 h-4" />,
          path: '/fornecedores',
          permission: 'fornecedores.listar',
        },
      ],
    },
    {
      label: 'Gestão Operacional',
      icon: <ClipboardList className="w-5 h-5" />,
      children: [
        {
          label: 'Manutenções de Veículos',
          icon: <Wrench className="w-4 h-4" />,
          path: '/manutencoes',
          permission: 'relatorios.manutencao',
        },
        {
          label: 'Viagens',
          icon: <DollarSign className="w-4 h-4" />,
          path: '/viagens',
          permission: 'relatorios.despesas',
        },
      ],
    },
    {
      label: 'Administração',
      icon: <Settings className="w-5 h-5" />,
      children: [
        {
          label: 'Usuários',
          icon: <Users className="w-4 h-4" />,
          path: '/admin/usuarios',
          permission: 'usuarios.listar',
        },
        {
          label: 'Cargos',
          icon: <Shield className="w-4 h-4" />,
          path: '/admin/cargos',
          permission: 'cargos.listar',
        },
        {
          label: 'Configurar Emitente',
          icon: <Settings className="w-4 h-4" />,
          path: '/configuracoes/emitente',
          permission: 'emitente.configurar',
        },
      ],
    },
  ]), [showToast]);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const hasAccess = (item: MenuItem): boolean => {
    if (!item.permission) {
      return true;
    }
    const access = hasPermission(item.permission);
    console.log(`[SIDEBAR] Verificando acesso para "${item.label}" (${item.permission}):`, access);
    console.log(`[SIDEBAR] - Permissões disponíveis:`, permissions.slice(0, 3));
    console.log(`[SIDEBAR] - Procurando por:`, item.permission);
    console.log(`[SIDEBAR] - Resultado de hasPermission:`, access);
    return access;
  };

  // Função recursiva para buscar itens
  const searchItems = (items: MenuItem[], query: string): MenuItem[] => {
    if (!query) return items;

    const lowerQuery = query.toLowerCase();
    const results: MenuItem[] = [];

    items.forEach((item) => {
      if (item.children) {
        const matchingChildren = searchItems(item.children, query);
        if (matchingChildren.length > 0) {
          results.push({ ...item, children: matchingChildren });
        } else if (item.label.toLowerCase().includes(lowerQuery)) {
          results.push(item);
        }
      } else {
        if (item.label.toLowerCase().includes(lowerQuery)) {
          results.push(item);
        }
      }
    });

    return results;
  };

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    console.log('[SIDEBAR] Filtrando menu items, total de itens:', items.length);
    return items
      .map((item) => {
        if (item.children) {
          console.log(`[SIDEBAR] Processando seção "${item.label}" com ${item.children.length} filhos`);
          const filteredChildren = filterMenuItems(item.children);
          console.log(`[SIDEBAR] Seção "${item.label}" após filtro: ${filteredChildren.length} filhos`);
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
          return null;
        }
        const hasAccessResult = hasAccess(item);
        console.log(`[SIDEBAR] Item "${item.label}" (sem filhos): ${hasAccessResult ? 'PERMITIDO' : 'NEGADO'}`);
        return hasAccessResult ? item : null;
      })
      .filter((item): item is MenuItem => item !== null);
  };

  const filteredMenuItems = useMemo(() => {
    console.log('[SIDEBAR] Recalculando filteredMenuItems com', permissions.length, 'permissões');
    const filtered = filterMenuItems(menuItems);
    return searchItems(filtered, searchQuery);
  }, [menuItems, searchQuery, permissions]);

  // Auto-expandir seções quando houver busca
  useEffect(() => {
    if (searchQuery) {
      const sectionsToExpand: string[] = [];
      filteredMenuItems.forEach((item) => {
        if (item.children && item.children.length > 0) {
          sectionsToExpand.push(item.label);
        }
      });
      setExpandedSections(sectionsToExpand);
    }
  }, [searchQuery, filteredMenuItems]);

  const renderStatusBadge = (status?: MenuItem['status']) => {
    if (!status) {
      return null;
    }

    const styles = status === 'soon'
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-400/20 dark:text-blue-200';

    const label = status === 'soon' ? 'Em breve' : status;

    return (
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles}`}>
        {label}
      </span>
    );
  };

  const renderMenuItem = (item: MenuItem, level: number = 0): React.ReactNode => {
    const isActive = item.path === location.pathname;
    const isExpanded = expandedSections.includes(item.label);
    const labelContent = (
      <span className="flex items-center gap-3">
        <span className="group-hover:scale-110 transition-transform duration-200">
          {item.icon}
        </span>
        <span className="flex items-center gap-2">
          <span>{item.label}</span>
          {renderStatusBadge(item.status)}
        </span>
      </span>
    );

    if (item.children) {
      return (
        <div key={item.label} className="mb-1">
          <button
            onClick={() => toggleSection(item.label)}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all duration-200 group ${
              level === 0
                ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md text-sm'
            }`}
          >
            {labelContent}
            <span className="transition-transform duration-200">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          </button>
          {isExpanded && (
            <div className="ml-3 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-2">
              {item.children.map((child) => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    if (!item.path || item.disabled) {
      return (
        <button
          key={item.label}
          onClick={item.onSelect}
          className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ${
            level > 0 ? 'ml-3 text-sm' : ''
          } ${item.disabled ? 'cursor-not-allowed text-slate-400 dark:text-slate-500 opacity-80' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
        >
          {labelContent}
          {item.status === 'soon' && <Clock className="ml-auto h-4 w-4 opacity-50" />}
        </button>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => onClose()}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
          isActive
            ? 'bg-blue-600 text-white font-medium shadow-md transform scale-[1.02]'
            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:translate-x-1'
        } ${level > 0 ? 'ml-3 text-sm' : ''}`}
      >
        {labelContent}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {filteredMenuItems.length} resultado(s) encontrado(s)
          </p>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {filteredMenuItems.length > 0 ? (
          filteredMenuItems.map((item) => renderMenuItem(item))
        ) : (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500">
            <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum item encontrado</p>
          </div>
        )}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 top-16 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => onClose()}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed top-16 left-0 bottom-0 w-72 bg-card border-r border-border z-50 transform transition-all duration-300 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex fixed top-16 left-0 bottom-0 w-72 bg-card border-r border-border z-30 flex-col shadow-sm">
        {sidebarContent}
      </aside>
    </>
  );
}
