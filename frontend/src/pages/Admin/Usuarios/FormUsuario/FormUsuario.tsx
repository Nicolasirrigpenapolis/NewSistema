import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../../components/UI/feedback/GenericForm';
import { createUsuarioConfigWithCargos } from '../../../../components/Usuarios/UsuarioConfigWithCargos';
import { FormPageLayout } from '../../../../components/UI/layout/FormPageLayout';
import { cargosService, Cargo } from '../../../../services/cargosService';
import { Icon } from '../../../../ui';
import { authService } from '../../../../services/authService';

interface Usuario {
  id?: number;
  nome: string;
  username?: string;
  cargoId?: number;
  cargoNome?: string;
  ativo?: boolean;
  dataCriacao?: string;
  ultimoLogin?: string;
  password?: string;
}

export function FormUsuario() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isEdit = Boolean(id);
  const usuarioFromState = (location.state as any)?.user as Usuario | undefined;
  const viewOnlyFromState = (location.state as any)?.viewOnly as boolean | undefined;

  const [initialData, setInitialData] = useState<Usuario | null>(usuarioFromState ?? null);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState<boolean>(!usuarioFromState && isEdit);
  const [error, setError] = useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const cargosData = await cargosService.listarCargos();
        if (!mounted) return;
        setCargos(cargosData || []);

        // If we don't have the user in state and an id is present, we can't reliably fetch user (no API helper), so show a message
        if (isEdit && !usuarioFromState) {
          // Try to fetch users list and find by id (fallback)
          const usersRes = await authService.getUsers();
          if (!mounted) return;
          if (usersRes.sucesso && usersRes.data) {
            const found = (usersRes.data || []).find((u: any) => String(u.id) === String(id));
            if (found) {
              setInitialData(found as Usuario);
              setError(null);
            } else {
              setError('Não foi possível localizar o usuário.');
            }
          } else {
            setError(usersRes.mensagem || 'Erro ao carregar dados do usuário.');
          }
        }
      } catch (err) {
        console.error('Erro ao carregar cargos/usuários:', err);
        if (mounted) setError('Erro ao carregar dados.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, isEdit, usuarioFromState]);

  const usuarioConfig = useMemo(() => {
    const options = cargos.filter(c => c.ativo !== false).map(c => ({ value: c.id, label: c.nome }));
    return createUsuarioConfigWithCargos(options);
  }, [cargos]);

  const pageTitle = isEdit
    ? usuarioConfig.form.editTitle || usuarioConfig.form.title
    : usuarioConfig.form.title;

  const pageSubtitle = isEdit
    ? usuarioConfig.form.editSubtitle || usuarioConfig.form.subtitle
    : usuarioConfig.form.subtitle;

  const handleBack = () => navigate('/admin/usuarios');

  const handleSave = async (dados: any) => {
    setError(null);
    setValidationWarnings([]);
    
    // Validações antes de salvar
    const warnings: string[] = [];
    
    // Validar nome
    if (dados.nome && dados.nome.trim().length < 3) {
      warnings.push('⚠️ Nome muito curto. Recomendado pelo menos 3 caracteres.');
    }
    
    // Validar email
    if (dados.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dados.email)) {
        warnings.push('⚠️ Formato de e-mail inválido.');
      }
    }
    
    // Validar username
    if (dados.username && dados.username.trim().length < 3) {
      warnings.push('⚠️ Username muito curto. Recomendado pelo menos 3 caracteres.');
    }
    
    if (dados.username && /\s/.test(dados.username)) {
      warnings.push('⚠️ Username não deve conter espaços.');
    }
    
    // Validar senha
    if (!isEdit && dados.password && dados.password.length < 6) {
      warnings.push('⚠️ Senha muito fraca. Recomendado pelo menos 6 caracteres.');
    }
    
    if (isEdit && dados.password && dados.password.length > 0 && dados.password.length < 6) {
      warnings.push('⚠️ Nova senha muito fraca. Recomendado pelo menos 6 caracteres.');
    }
    
    // Validar cargo
    if (!dados.cargoId) {
      warnings.push('⚠️ Selecione um cargo para o usuário.');
    }
    
    if (warnings.length > 0) {
      setValidationWarnings(warnings);
      setError('Corrija os avisos antes de salvar.');
      throw new Error('Validação falhou');
    }
    
    try {
      if (isEdit && id) {
        // Atualizar usuário existente
        const updateData: any = {
          nome: dados.nome?.trim(),
          email: dados.email?.trim(),
          cargoId: dados.cargoId,
          ativo: dados.ativo !== false
        };

        // Apenas incluir senha se foi preenchida
        if (dados.password && dados.password.trim()) {
          updateData.password = dados.password.trim();
        }

        const result = await authService.updateUser(Number(id), updateData);

        if (result.sucesso) {
          navigate('/admin/usuarios', { replace: true, state: { revalidate: true } });
        } else {
          setError(result.mensagem || 'Erro ao atualizar usuário');
          throw new Error(result.mensagem || 'Erro');
        }
        return;
      }

      // Criação de novo usuário
      const result = await authService.register({
        nome: dados.nome?.trim(),
        username: dados.username?.trim(),
        password: dados.password || '',
        cargoId: dados.cargoId,
        email: dados.email?.trim()
      } as any);

      if (result.sucesso) {
        navigate('/admin/usuarios', { replace: true, state: { revalidate: true } });
      } else {
        setError(result.mensagem || 'Erro ao criar usuário');
        throw new Error(result.mensagem || 'Erro');
      }
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      setError((err as any)?.message || 'Erro ao salvar usuário');
      throw err;
    }
  };

  const viewSections = useMemo(() => {
    if (!(usuarioFromState || initialData)) {
      return [];
    }

    return usuarioConfig.view.getSections(usuarioFromState ?? initialData!);
  }, [usuarioConfig, usuarioFromState, initialData]);

  const canRenderForm = !isEdit || Boolean(initialData);
  const displayData = usuarioFromState ?? initialData;

  return (
    <FormPageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      iconName={usuarioConfig.form.headerIcon}
      headerColor={usuarioConfig.form.headerColor}
      onBack={handleBack}
      isLoading={loading}
      loadingMessage="Carregando dados do usuário..."
      error={error}
      showRequiredHint={!viewOnlyFromState}
    >
      {viewOnlyFromState && displayData ? (
        <div className="max-w-4xl mx-auto space-y-6">
          {viewSections.map((section, index) => (
            <div key={section.title} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              {/* Header da seção sem ícone */}
              <div 
                className="px-6 py-4 border-b border-border"
                style={{ background: `linear-gradient(to right, ${section.bgColor}20, ${section.bgColor}10)` }}
              >
                <h3 className="text-lg font-bold text-foreground">{section.title}</h3>
                {section.subtitle && (
                  <p className="text-muted-foreground text-sm mt-1">{section.subtitle}</p>
                )}
              </div>

              {/* Conteúdo da seção */}
              <div className="p-6">
                <div
                  className={`grid ${section.columns === 1 ? 'grid-cols-1' : section.columns === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-6`}
                >
                  {section.fields.map(field => (
                    <div key={String(field.label)} className={field.colSpan === 2 ? 'col-span-2' : ''}>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                        {field.label}
                      </label>
                      <div className="text-base font-medium text-foreground bg-muted/30 px-4 py-3 rounded-lg border border-border/50">
                        {(field as any).formatter ? (field as any).formatter((field as any).value) : ((field as any).value ?? 'N/A')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        canRenderForm && (
          <div className="space-y-4">
            {/* Card de avisos de validação */}
            {validationWarnings.length > 0 && (
              <div className="max-w-4xl mx-auto bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
                    <Icon name="exclamation-triangle" className="text-white text-sm" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-2">
                      Atenção: Verifique os campos
                    </h4>
                    <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                      {validationWarnings.map((warning, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Card informativo para novos usuários */}
            {!isEdit && (
              <div className="max-w-4xl mx-auto bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                    <Icon name="info-circle" className="text-white text-sm" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Criando novo usuário
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      O usuário receberá acesso ao sistema com as credenciais informadas. 
                      Certifique-se de comunicar o username e senha ao novo usuário de forma segura.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <GenericForm<any>
              data={initialData ?? (usuarioConfig.form.defaultValues as any)}
              sections={usuarioConfig.form.getSections(initialData ?? undefined)}
              isEditing={isEdit}
              title={pageTitle}
              subtitle={pageSubtitle}
              headerIcon={usuarioConfig.form.headerIcon}
              headerColor={usuarioConfig.form.headerColor}
              onSave={handleSave}
              onCancel={handleBack}
              maxWidth="full"
            />
          </div>
        )
      )}
    </FormPageLayout>
  );
}
