import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../../components/UI/feedback/GenericForm';
import { createUsuarioConfigWithCargos } from '../../../../components/Usuarios/UsuarioConfigWithCargos';
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

  const handleBack = () => navigate('/admin/usuarios');

  const handleSave = async (dados: any) => {
    setError(null);
    try {
      if (isEdit && id) {
        // No dedicated update API here; fallback: call register if password provided or navigate back
        console.warn('Edição via formulário de página: operation may be limited.');
        navigate('/admin/usuarios', { replace: true, state: { revalidate: true } });
        return;
      }

      // criação
      const result = await authService.register({
        nome: dados.nome,
        username: dados.username,
        password: dados.password || '',
        cargoId: dados.cargoId
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

  const viewSections = useMemo(() => usuarioFromState || initialData ? usuarioConfig.view.getSections(usuarioFromState ?? initialData!) : [], [usuarioConfig, usuarioFromState, initialData]);

  if (loading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-card rounded-xl p-6 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{isEdit ? (usuarioConfig.form.editTitle || usuarioConfig.form.title) : usuarioConfig.form.title}</h1>
          <p className="text-muted-foreground mt-2">{isEdit ? (usuarioConfig.form.editSubtitle || usuarioConfig.form.subtitle) : usuarioConfig.form.subtitle}</p>
        </div>
        <button onClick={handleBack} className="px-4 py-2 rounded-lg border bg-card">Voltar</button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>}

      { (viewOnlyFromState && (usuarioFromState ?? initialData)) ? (
        <div className="max-w-4xl mx-auto bg-card rounded-xl p-6">
          {viewSections.map(section => (
            <div key={section.title} className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${section.color}, ${section.bgColor})` }}>
                  <Icon name={section.icon} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{section.title}</h3>
                  {section.subtitle && <p className="text-muted-foreground text-sm">{section.subtitle}</p>}
                </div>
              </div>

              <div className="rounded-xl p-4 border" style={{ background: `linear-gradient(to bottom right, ${section.bgColor}15, ${section.bgColor}25)`, borderColor: `${section.color}30` }}>
                <div className={`grid ${section.columns === 1 ? 'grid-cols-1' : section.columns === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                  {section.fields.map(field => (
                    <div key={String(field.label)} className={field.colSpan === 2 ? 'col-span-2' : ''}>
                      <label className="text-sm font-semibold text-foreground">{field.label}</label>
                      <div className="mt-2 bg-card p-3 rounded">{(field as any).formatter ? (field as any).formatter((field as any).value) : ((field as any).value ?? 'N/A')}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <GenericForm<any>
          data={initialData ?? (usuarioConfig.form.defaultValues as any)}
          sections={usuarioConfig.form.getSections(initialData ?? undefined)}
          isEditing={isEdit}
          title={isEdit ? (usuarioConfig.form.editTitle || usuarioConfig.form.title) : usuarioConfig.form.title}
          subtitle={isEdit ? (usuarioConfig.form.editSubtitle || usuarioConfig.form.subtitle) : usuarioConfig.form.subtitle}
          headerIcon={usuarioConfig.form.headerIcon}
          headerColor={usuarioConfig.form.headerColor}
          onSave={handleSave}
          onCancel={handleBack}
          pageClassName="max-w-3xl mx-auto"
        />
      )}
    </div>
  );
}
