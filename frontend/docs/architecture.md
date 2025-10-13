# Arquitetura de Formulários e Componentes UI

## 📋 Visão Geral

Este documento descreve a arquitetura padronizada de formulários e componentes de interface do sistema NewSistema (MDFe Management). A reorganização foi implementada para eliminar duplicação de código, padronizar a aparência de formulários e modais, e facilitar a manutenção.

---

## 🏗️ Componentes Base

### FormShell

**Localização:** `frontend/src/components/ui/FormShell.tsx`

O `FormShell` é o componente base para todos os formulários e modais do sistema. Ele encapsula a estrutura visual padrão incluindo:

- Header com título e subtítulo
- Botão de fechar (quando em modo modal)
- Área de conteúdo com scroll
- Footer com botões de ação
- Tratamento de erros
- Estados de carregamento
- Suporte para modo modal e página

#### Props Principais

```typescript
interface FormShellProps {
  title: string;                    // Título principal
  subtitle?: string;                // Subtítulo opcional
  actions?: ReactNode;              // Botões de ação (Save, Cancel, etc.)
  children: ReactNode;              // Conteúdo do formulário
  isModal?: boolean;                // true = modal overlay, false = página normal
  maxWidth?: string;                // Largura máxima ('xl', '4xl', '6xl', etc.)
  className?: string;               // Classes CSS adicionais
  loading?: boolean;                // Estado de carregamento
  error?: string | null;            // Mensagem de erro
  onClose?: () => void;             // Callback para fechar modal
}
```

#### Exemplo de Uso

```tsx
import { FormShell } from '@/components/ui';

function MeuFormulario() {
  const actions = (
    <>
      <button onClick={handleCancel}>Cancelar</button>
      <button onClick={handleSave}>Salvar</button>
    </>
  );

  return (
    <FormShell
      title="Novo Condutor"
      subtitle="Preencha os dados do condutor"
      actions={actions}
      maxWidth="4xl"
    >
      {/* Conteúdo do formulário aqui */}
    </FormShell>
  );
}
```

---

### ListShell

**Localização:** `frontend/src/components/ui/ListShell.tsx`

O `ListShell` é o componente base para páginas de listagem/tabelas. Fornece estrutura padronizada para:

- Header com título e ações (botão Novo, Importar, Exportar, etc.)
- Área de filtros
- Conteúdo da lista/tabela
- Estados de carregamento e erro

#### Props Principais

```typescript
interface ListShellProps {
  title: string;                    // Título da lista
  subtitle?: string;                // Subtítulo opcional
  headerActions?: ReactNode;        // Botões no header (Novo, Import, Export)
  filters?: ReactNode;              // Componentes de filtro/busca
  children: ReactNode;              // Tabela ou lista
  className?: string;               // Classes CSS adicionais
  loading?: boolean;                // Estado de carregamento
  error?: string | null;            // Mensagem de erro
}
```

#### Exemplo de Uso

```tsx
import { ListShell } from '@/components/ui';

function ListarCondutores() {
  const headerActions = (
    <button onClick={handleNovo}>
      <Icon name="plus" /> Novo Condutor
    </button>
  );

  const filters = (
    <div>
      <input type="search" placeholder="Buscar..." />
      <select>
        <option>Todos</option>
        <option>Ativos</option>
        <option>Inativos</option>
      </select>
    </div>
  );

  return (
    <ListShell
      title="Condutores"
      subtitle="Gerencie os condutores cadastrados"
      headerActions={headerActions}
      filters={filters}
    >
      <table>{/* Tabela aqui */}</table>
    </ListShell>
  );
}
```

---

## 📝 Componentes de Formulário

### GenericForm

**Localização:** `frontend/src/components/UI/feedback/GenericForm.tsx`

Componente que renderiza formulários dinâmicos baseados em configuração de seções e campos. Utiliza `FormShell` internamente para manter consistência visual.

#### Características

- Renderização dinâmica de campos baseada em configuração
- Suporte para múltiplas seções com ícones e cores
- Validação de campos obrigatórios
- Suporte para diversos tipos de campo (text, select, textarea, checkbox, etc.)
- Integração automática com FormShell

#### Exemplo de Uso

```tsx
import { GenericForm } from '@/components/UI/feedback/GenericForm';

function FormCondutor() {
  const sections = [
    {
      title: 'Dados Pessoais',
      subtitle: 'Informações básicas do condutor',
      icon: 'user',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      columns: 2,
      fields: [
        {
          key: 'nome',
          label: 'Nome Completo',
          type: 'text',
          required: true,
          colSpan: 2
        },
        {
          key: 'cpf',
          label: 'CPF',
          type: 'text',
          required: true
        },
        {
          key: 'telefone',
          label: 'Telefone',
          type: 'text'
        }
      ]
    }
  ];

  return (
    <GenericForm
      data={condutor}
      sections={sections}
      title="Editar Condutor"
      subtitle="Atualize os dados do condutor"
      onSave={handleSave}
      onCancel={handleBack}
      submitLabel="Salvar"
      pageClassName="max-w-5xl"
    />
  );
}
```

---

### GenericFormModal

**Localização:** `frontend/src/components/UI/feedback/GenericFormModal.tsx`

Versão modal do `GenericForm`. Ideal para formulários rápidos ou pequenos que devem aparecer sobre a página atual.

#### Diferenças do GenericForm

- Aparece como overlay modal
- Possui botão X para fechar
- Bloqueia interação com a página de fundo
- Utiliza `FormShell` com `isModal={true}`

#### Exemplo de Uso

```tsx
import { GenericFormModal } from '@/components/UI/feedback/GenericFormModal';

function CRUDComponent() {
  return (
    <GenericFormModal
      isOpen={modalOpen}
      onClose={handleClose}
      data={item}
      sections={sections}
      title="Editar Item"
      onSave={handleSave}
    />
  );
}
```

---

### GenericViewModal

**Localização:** `frontend/src/components/UI/feedback/GenericViewModal.tsx`

Modal para visualização (somente leitura) de dados de uma entidade.

#### Características

- Modo somente leitura
- Suporte para status badges
- Botões de ação personalizáveis (Editar, Excluir, etc.)
- Formatação automática de campos

#### Exemplo de Uso

```tsx
import { GenericViewModal } from '@/components/UI/feedback/GenericViewModal';

const sections = [
  {
    title: 'Informações',
    icon: 'info-circle',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    columns: 2,
    fields: [
      { label: 'Nome', value: condutor.nome },
      { label: 'CPF', value: condutor.cpf, formatter: formatCPF }
    ]
  }
];

const actions = [
  {
    label: 'Editar',
    icon: 'edit',
    onClick: handleEdit,
    variant: 'primary'
  },
  {
    label: 'Excluir',
    icon: 'trash',
    onClick: handleDelete,
    variant: 'danger'
  }
];

return (
  <GenericViewModal
    isOpen={viewOpen}
    onClose={handleClose}
    item={condutor}
    title="Detalhes do Condutor"
    sections={sections}
    actions={actions}
    statusConfig={statusConfig}
  />
);
```

---

### ConfirmDeleteModal

**Localização:** `frontend/src/components/UI/feedback/ConfirmDeleteModal.tsx`

Modal de confirmação para ações de exclusão.

#### Características

- Visual de alerta com ícone de aviso
- Mensagem personalizável
- Botões Cancelar e Excluir
- Estado de carregamento durante exclusão

#### Exemplo de Uso

```tsx
import { ConfirmDeleteModal } from '@/components/UI/feedback/ConfirmDeleteModal';

return (
  <ConfirmDeleteModal
    isOpen={deleteOpen}
    onClose={handleClose}
    onConfirm={handleDelete}
    title="Excluir Condutor"
    message="Tem certeza que deseja excluir este condutor?"
    itemName={condutor.nome}
    loading={deleting}
  />
);
```

---

## 🎨 Icon Component

**Localização:** `frontend/src/components/ui/Icon.tsx`

Componente wrapper para ícones Font Awesome.

```tsx
import { Icon } from '@/components/ui';

<Icon name="user" className="text-blue-500" />
<Icon name="trash" onClick={handleDelete} />
```

---

## 📂 Organização de Pastas

### Estrutura Recomendada por Domínio

```
pages/
  Condutores/
    forms/
      FormCondutor.tsx
    lists/
      ListarCondutores.tsx
    views/
      DetalhesCondutor.tsx
    index.ts              # Barrel export
```

### Barrel Exports (index.ts)

```typescript
// pages/Condutores/index.ts
export { FormCondutor } from './forms/FormCondutor';
export { ListarCondutores } from './lists/ListarCondutores';
export { DetalhesCondutor } from './views/DetalhesCondutor';
```

### Importação Limpa

```typescript
// Antes
import { FormCondutor } from '@/pages/Condutores/forms/FormCondutor';
import { ListarCondutores } from '@/pages/Condutores/lists/ListarCondutores';

// Depois
import { FormCondutor, ListarCondutores } from '@/pages/Condutores';
```

---

## 🎯 Padrões e Boas Práticas

### 1. Quando Usar FormShell vs GenericForm

- **Use FormShell diretamente** quando:
  - O formulário tem layout totalmente customizado
  - Não segue o padrão de seções
  - É extremamente simples

- **Use GenericForm** quando:
  - O formulário segue o padrão de seções
  - Pode ser configurado via JSON/objeto
  - Precisa de consistência visual com outros formulários

### 2. Modal vs Página

- **Use Modal (isModal=true)** para:
  - Formulários rápidos com poucos campos (< 5 campos)
  - Confirmações
  - Visualizações rápidas

- **Use Página (isModal=false)** para:
  - Formulários complexos com muitos campos
  - Formulários com múltiplas seções
  - Quando o usuário precisa de contexto da página

### 3. maxWidth Guidelines

- `sm` (640px): Modais de confirmação, alertas
- `md` (768px): Formulários simples (3-5 campos)
- `lg` (1024px): Formulários médios
- `xl` (1280px): Formulários padrão (default)
- `2xl` (1536px): Formulários grandes
- `4xl` (896px): Formulários com muitos campos
- `6xl` (1152px): Formulários muito complexos

### 4. Estrutura de Seções

```typescript
const sections: FormSection[] = [
  {
    title: 'Título da Seção',
    subtitle: 'Descrição opcional',
    icon: 'user',                    // Font Awesome icon name
    color: '#3b82f6',                // Cor principal
    bgColor: '#eff6ff',              // Cor de fundo
    columns: 2,                       // 1, 2 ou 3 colunas
    fields: [
      {
        key: 'fieldName',            // Nome do campo no objeto
        label: 'Label do Campo',
        type: 'text',                // text, select, textarea, checkbox, etc.
        required: true,
        placeholder: 'Digite aqui...',
        colSpan: 2,                  // Ocupar 2 colunas
        disabled: false,
        hint: 'Texto de ajuda'
      }
    ]
  }
];
```

---

## 🔄 Migration Guide

### Migrando de Formulários Antigos

Se você tem um formulário que não usa FormShell:

**Antes:**
```tsx
function MeuForm() {
  return (
    <div className="container">
      <div className="header">
        <h1>Título</h1>
      </div>
      <div className="body">
        {/* campos */}
      </div>
      <div className="footer">
        <button>Cancelar</button>
        <button>Salvar</button>
      </div>
    </div>
  );
}
```

**Depois:**
```tsx
import { FormShell } from '@/components/ui';

function MeuForm() {
  const actions = (
    <>
      <button onClick={handleCancel}>Cancelar</button>
      <button onClick={handleSave}>Salvar</button>
    </>
  );

  return (
    <FormShell
      title="Título"
      actions={actions}
      maxWidth="xl"
    >
      {/* campos */}
    </FormShell>
  );
}
```

---

## 📚 Recursos Adicionais

### Componentes Exportados

```typescript
// De @/components/ui
export { FormShell } from './FormShell';
export { ListShell } from './ListShell';
export { Icon } from './Icon';
export type { FormShellProps, ListShellProps } from './FormShell.types';

// De @/components/UI/feedback
export { GenericForm } from './GenericForm';
export { GenericFormModal } from './GenericFormModal';
export { GenericViewModal } from './GenericViewModal';
export { ConfirmDeleteModal } from './ConfirmDeleteModal';
```

### Types

```typescript
import type { 
  FormShellProps, 
  ListShellProps,
  FormSection,
  FormField,
  ModalSection,
  ModalAction
} from '@/types/modal';
```

---

## ✅ Checklist de Migração

Ao criar ou migrar um formulário:

- [ ] Substituiu containers customizados por FormShell/ListShell
- [ ] Removeu markup duplicado de headers, footers, modais
- [ ] Moveu botões de ação para a prop `actions`
- [ ] Aplicou `maxWidth` apropriado
- [ ] Adicionou tratamento de `loading` e `error`
- [ ] Usou `isModal={true}` se apropriado
- [ ] Criou barrel export (index.ts) na pasta do domínio
- [ ] Testou em modo claro e escuro
- [ ] Testou responsividade

---

## 🐛 Troubleshooting

### Formulário não aparece

- Verifique se está passando `children` para FormShell
- Confirme que `loading` não está travado em `true`

### Modal não fecha

- Certifique-se de passar `onClose` prop
- Verifique se `isModal={true}` está definido

### Campos não aparecem

- Para GenericForm, verifique a estrutura do array `sections`
- Confirme que os campos têm `key` e `type` válidos

### Estilos quebrados

- Verifique se Tailwind CSS está configurado
- Confirme que Font Awesome está carregado para ícones

---

## 📝 Changelog

### v1.0.0 (2025-10-13)

- ✅ Criação dos componentes base FormShell e ListShell
- ✅ Implementação de GenericForm com suporte a FormShell
- ✅ Implementação de GenericFormModal
- ✅ Implementação de GenericViewModal
- ✅ Implementação de ConfirmDeleteModal
- ✅ Criação do componente Icon
- ✅ Documentação completa da arquitetura

---

## 👥 Manutenção

Para dúvidas ou sugestões sobre esta arquitetura, consulte a equipe de desenvolvimento ou abra uma issue no repositório do projeto.
