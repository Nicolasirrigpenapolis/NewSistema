import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissionContext } from '../../../contexts/PermissionContext';
import Icon from '../../UI/Icon';
import logoIP from '../../../assets/images/logo-ip.png';
import { useEmpresa } from '../../../contexts/EmpresaContext';

interface SidebarProps {
  aberta: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  id: string;
  path: string;
  label: string;
  icon: string;
  permission?: string;
}

interface MenuGroup {
  id: string;
  label: string;
  items: MenuItem[];
}

interface Module {
  id: string;
  label: string;
  icon: string;
  description: string;
  groups: MenuGroup[];
  permission?: string;
  path?: string; // Para mÃƒÆ’Ã‚Â³dulos que sÃƒÆ’Ã‚Â£o links diretos
}

export function Sidebar({ aberta, isMobile, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission, loading } = usePermissionContext();
  const { empresa } = useEmpresa();
  const nomeEmpresa = empresa?.nomeExibicao || 'Sistema';
  const logoUrl = empresa?.urlLogotipo || logoIP;
  const [expandedModules, setExpandedModules] = useState<string[]>(['dashboard']);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (path: string) => {
    navigate(path);
    // Fechar sidebar em mobile apÃƒÆ’Ã‚Â³s navegaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o
    if (isMobile && onClose) {
      onClose();
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const modules: Module[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'chart-bar',
      description: 'VisÃƒÆ’Ã‚Â£o geral e indicadores do sistema',
      permission: 'dashboard.view',
      path: '/dashboard',
      groups: []
    },
    {
      id: 'fiscal',
      label: 'Documentos Fiscais',
      icon: 'file-invoice',
      description: 'EmissÃƒÆ’Ã‚Â£o e gestÃƒÆ’Ã‚Â£o de documentos fiscais',
      permission: 'mdfe.access',
      groups: [
        {
          id: 'manifestos',
          label: 'Manifestos',
          items: [
            {
              id: 'mdfes',
              path: '/mdfes',
              label: 'Manifestos MDFe',
              icon: 'file-alt',
              permission: 'mdfe.read'
            },
            {
              id: 'municipios',
              path: '/municipios',
              label: 'Localidades',
              icon: 'map-marker-alt',
              permission: 'municipios.read'
            }
          ]
        }
      ]
    },
    {
      id: 'operacional',
      label: 'Operacional',
      icon: 'truck',
      description: 'GestÃƒÆ’Ã‚Â£o operacional completa',
      permission: 'frota.access',
      groups: [
        {
          id: 'frota',
          label: 'Frota',
          items: [
            {
              id: 'veiculos',
              path: '/veiculos',
              label: 'VeÃƒÆ’Ã‚Â­culos & Reboques',
              icon: 'truck',
              permission: 'veiculos.read'
            },
            {
              id: 'condutores',
              path: '/condutores',
              label: 'Motoristas',
              icon: 'user',
              permission: 'condutores.read'
            }
          ]
        },
        {
          id: 'manutencao',
          label: 'ManutenÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o',
          items: [
            {
              id: 'fornecedores',
              path: '/fornecedores',
              label: 'Fornecedores',
              icon: 'store',
              permission: 'fornecedores.read'
            }
          ]
        }
      ]
    },
    {
      id: 'comercial',
      label: 'Comercial',
      icon: 'users',
      description: 'GestÃƒÆ’Ã‚Â£o comercial e contratantes',
      permission: 'comercial.access',
      groups: [
        {
          id: 'clientes',
          label: 'Clientes',
          items: [
            {
              id: 'contratantes',
              path: '/contratantes',
              label: 'Clientes',
              icon: 'handshake',
              permission: 'contratantes.read'
            },
            {
              id: 'seguradoras',
              path: '/seguradoras',
              label: 'Seguradoras',
              icon: 'shield-alt',
              permission: 'seguradoras.read'
            }
          ]
        }
      ]
    },
    {
      id: 'relatorios',
      label: 'RelatÃƒÆ’Ã‚Â³rios',
      icon: 'chart-line',
      description: 'RelatÃƒÆ’Ã‚Â³rios e anÃƒÆ’Ã‚Â¡lises',
      permission: 'relatorios.access',
      groups: [
        {
          id: 'gerenciais',
          label: 'Gerenciais',
          items: [
            {
              id: 'relatorio-manutencao',
              path: '/relatorios/manutencao',
              label: 'ManutenÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o',
              icon: 'wrench',
              permission: 'relatorios.manutencao.read'
            },
            {
              id: 'relatorio-despesas',
              path: '/relatorios/despesas',
              label: 'Financeiro - Viagens',
              icon: 'chart-line',
              permission: 'relatorios.despesas.read'
            }
          ]
        }
      ]
    },
    {
      id: 'sistema',
      label: 'Sistema',
      icon: 'cog',
      description: 'ConfiguraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes e administraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o do sistema',
      permission: 'admin.access',
      groups: [
        {
          id: 'acesso',
          label: 'Acesso',
          items: [
            {
              id: 'usuarios',
              path: '/admin/usuarios',
              label: 'UsuÃƒÆ’Ã‚Â¡rios',
              icon: 'users',
              permission: 'admin.users.read'
            },
            {
              id: 'cargos',
              path: '/admin/cargos',
              label: 'Perfis & PermissÃƒÆ’Ã‚Âµes',
              icon: 'user-cog',
              permission: 'admin.roles.read'
            }
          ]
        },
        {
          id: 'sistema',
          label: 'Sistema',
          items: [
            {
              id: 'config-emitente',
              path: '/configuracoes/emitente',
              label: 'Emitente',
              icon: 'building',
              permission: 'emitente.configurar'
            }
          ]
        }
      ]
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Filtrar mÃƒÆ’Ã‚Â³dulos e itens baseado nas permissÃƒÆ’Ã‚Âµes do usuÃƒÆ’Ã‚Â¡rio e busca
  const availableModules = modules.map(module => {
    // Verificar permissÃƒÆ’Ã‚Â£o do mÃƒÆ’Ã‚Â³dulo primeiro
    if (module.permission && !loading && !hasPermission(module.permission)) {
      return null;
    }

    const availableGroups = module.groups.map(group => {
      const availableItems = group.items.filter(item => {
        // Se nÃƒÆ’Ã‚Â£o tem permissÃƒÆ’Ã‚Â£o definida, mostrar sempre (para itens pÃƒÆ’Ã‚Âºblicos)
        if (!item.permission) return true;

        // Se ainda estÃƒÆ’Ã‚Â¡ carregando permissÃƒÆ’Ã‚Âµes, mostrar todos os itens (para evitar flicker)
        if (loading) {
          return true;
        }

        // Verificar se o usuÃƒÆ’Ã‚Â¡rio tem a permissÃƒÆ’Ã‚Â£o necessÃƒÆ’Ã‚Â¡ria
        const hasAccess = hasPermission(item.permission);
        return hasAccess;
      }).filter(item => {
        // Filtro de busca
        if (!searchQuery) return true;
        const search = searchQuery.toLowerCase();
        return item.label.toLowerCase().includes(search);
      });

      return {
        ...group,
        items: availableItems
      };
    }).filter(group => group.items.length > 0); // SÃƒÆ’Ã‚Â³ mostrar grupos que tÃƒÆ’Ã‚Âªm pelo menos um item

    // Filtro de busca para mÃƒÆ’Ã‚Â³dulos com link direto
    const matchesSearch = !searchQuery ||
      module.label.toLowerCase().includes(searchQuery.toLowerCase());

    // Se tem busca ativa, expandir mÃƒÆ’Ã‚Â³dulos que tenham resultados
    if (searchQuery && availableGroups.length > 0 && !expandedModules.includes(module.id)) {
      setExpandedModules(prev => [...prev, module.id]);
    }

    return {
      ...module,
      groups: availableGroups,
      matchesSearch
    };
  }).filter(module => {
    if (!module) return false;
    // Mostrar se tem link direto e passa no filtro, OU se tem grupos
    if (module.path) return module.matchesSearch;
    return module.groups.length > 0;
  }); // Mostrar mÃƒÆ’Ã‚Â³dulos com link direto OU que tenham pelo menos um grupo


  return (
    <aside className={`
      ${isMobile
        ? `fixed top-0 left-0 h-full z-40 transform transition-transform duration-300 ease-in-out
           ${aberta ? 'translate-x-0' : '-translate-x-full'}
           w-64 pt-16 sm:pt-20`
        : `${aberta ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out
           min-h-full fixed top-16 sm:top-20 left-0 z-40`
      }
      bg-card dark:bg-gray-900
      border-r border-gray-200 dark:border-0
      shadow-lg dark:shadow-gray-900/50
      flex flex-col
    `}>
      <div className={`flex-1 flex flex-col ${aberta || isMobile ? 'p-4' : 'p-2'}`}>
        {(aberta || isMobile) ? (
          <div className="mb-4 flex items-center gap-3">
            {empresa?.urlLogotipo ? (
              <img
                src={logoUrl}
                alt={nomeEmpresa}
                className="w-10 h-10 rounded-md object-contain bg-white border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                <Icon name="building" size="sm" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{nomeEmpresa}</p>
              {empresa?.identificador && (
                <span className="text-xs text-muted-foreground truncate">{empresa.identificador}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4 flex justify-center">
            {empresa?.urlLogotipo ? (
              <img
                src={logoUrl}
                alt={nomeEmpresa}
                className="w-10 h-10 rounded-md object-contain bg-white border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                <Icon name="building" size="sm" />
              </div>
            )}
          </div>
        )}
        {/* Campo de busca rapida */}
        {(aberta || isMobile) && (
          <div className="mb-4">
            <div className="relative">
              <Icon
                name="search"
                size="sm"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Buscar menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2.5 rounded-lg
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-blue-400/50
                  focus:border-primary dark:focus:border-blue-400
                  transition-all duration-200
                  text-sm
                "
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <Icon name="times" size="sm" />
                </button>
              )}
            </div>
          </div>
        )}

        <nav className="flex-1">
          <div className="space-y-3">
            {availableModules.map((module) => {
              const isExpanded = expandedModules.includes(module.id);
              const hasActiveItem = module.groups.some(group =>
                group.items.some(item => isActive(item.path))
              );

              return (
                <div key={module.id} className="mb-2">
                  {/* BotÃƒÆ’Ã‚Â£o do mÃƒÆ’Ã‚Â³dulo/categoria */}
                  <button
                    onClick={() => module.path ? handleNavigate(module.path) : toggleModule(module.id)}
                    className={`
                      w-full flex items-center rounded-lg
                      transition-all duration-200 ease-in-out group
                      ${aberta || isMobile ? 'justify-between px-4 py-3' : 'justify-center p-3'}
                      ${module.path && isActive(module.path)
                        ? 'text-primary dark:text-blue-400 font-bold'
                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                    title={!aberta && !isMobile ? module.label : undefined}
                  >
                    <div className={`flex items-center flex-1 ${aberta || isMobile ? 'gap-3' : ''}`}>
                      <Icon
                        name={module.icon}
                        size="sm"
                        className={`flex-shrink-0 transition-colors duration-200 ${
                          module.path && isActive(module.path)
                            ? 'text-primary dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                        }`}
                      />
                      {(aberta || isMobile) && (
                        <span className="font-semibold text-sm truncate">
                          {module.label}
                        </span>
                      )}
                    </div>

                    {(aberta || isMobile) && !module.path && (
                      <Icon
                        name="chevron-down"
                        size="sm"
                        className={`flex-shrink-0 ml-2 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        } text-gray-500 dark:text-gray-400`}
                      />
                    )}
                  </button>

                  {/* Itens do mÃƒÆ’Ã‚Â³dulo - sÃƒÆ’Ã‚Â³ mostrar quando expandido e sidebar aberta e nÃƒÆ’Ã‚Â£o for link direto */}
                  {isExpanded && (aberta || isMobile) && !module.path && (
                    <div className="mt-3 space-y-2 overflow-hidden transition-all duration-300 ease-in-out">
                      {module.groups.map((group) => (
                        <div key={group.id} className="space-y-1">
                          {group.items.map((item) => {
                              const active = isActive(item.path);
                              return (
                                <button
                                  key={item.id}
                                  className={`
                                    w-full flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg
                                    transition-all duration-200 ease-in-out group relative
                                    hover:bg-accent/50
                                    ${active
                                      ? 'text-primary dark:text-blue-400 font-bold'
                                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }
                                  `}
                                  onClick={() => handleNavigate(item.path)}
                                >
                                  {/* Barra lateral indicadora para item ativo */}
                                  {active && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 dark:bg-blue-400 rounded-r-full transition-all duration-200 shadow-sm" />
                                  )}
                                  <span className={`flex-shrink-0 transition-colors duration-200 ${
                                    active ? 'text-primary dark:text-blue-400' : ''
                                  }`}>
                                    <Icon name={item.icon} size="sm" />
                                  </span>
                                  <span className="font-medium text-sm truncate">
                                    {item.label}
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {(aberta || isMobile) && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-0">
            <div className="px-3 py-2 text-center">
              <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                VersÃƒÆ’Ã‚Â£o
              </span>
              <span className="block text-sm font-semibold text-foreground">
                1.0.0
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
















