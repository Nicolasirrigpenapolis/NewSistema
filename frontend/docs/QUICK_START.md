# 🚀 Quick Start Guide - FormShell & ListShell

## TL;DR

**Novos componentes base para formulários e listas!**

- Use `FormShell` para todos os formulários
- Use `ListShell` para todas as listagens
- Use `GenericForm` quando precisar de formulários dinâmicos (já usa FormShell internamente)

---

## 📦 Import

```typescript
// Componentes base
import { FormShell, ListShell, Icon } from '@/components/ui';

// Componentes de formulário
import { 
  GenericForm, 
  GenericFormModal, 
  GenericViewModal, 
  ConfirmDeleteModal 
} from '@/components/UI/feedback';

// Types
import type { FormShellProps, ListShellProps, FormSection } from '@/types/modal';
```

---

## 🎯 Casos de Uso

### 1. Formulário Customizado (Página)

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
      title="Novo Cadastro"
      subtitle="Preencha os campos abaixo"
      actions={actions}
      maxWidth="4xl"
      loading={loading}
      error={error}
    >
      <form onSubmit={handleSubmit}>
        {/* seus campos aqui */}
      </form>
    </FormShell>
  );
}
```

### 2. Formulário Modal Customizado

```tsx
import { FormShell } from '@/components/ui';

function MeuModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <FormShell
      title="Edição Rápida"
      isModal={true}
      maxWidth="md"
      onClose={onClose}
      actions={<button onClick={handleSave}>Salvar</button>}
    >
      {/* campos aqui */}
    </FormShell>
  );
}
```

### 3. Formulário Dinâmico (Seções Configuráveis)

```tsx
import { GenericForm } from '@/components/UI/feedback';

const sections = [
  {
    title: 'Dados Básicos',
    icon: 'user',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    columns: 2,
    fields: [
      { key: 'nome', label: 'Nome', type: 'text', required: true, colSpan: 2 },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'telefone', label: 'Telefone', type: 'text' }
    ]
  }
];

function MeuForm() {
  return (
    <GenericForm
      data={formData}
      sections={sections}
      title="Cadastro"
      onSave={handleSave}
      onCancel={handleBack}
      pageClassName="max-w-4xl"
    />
  );
}
```

### 4. Modal de Formulário Dinâmico

```tsx
import { GenericFormModal } from '@/components/UI/feedback';

return (
  <GenericFormModal
    isOpen={modalOpen}
    onClose={handleClose}
    data={item}
    sections={sections}
    title="Editar"
    onSave={handleSave}
  />
);
```

### 5. Modal de Visualização

```tsx
import { GenericViewModal } from '@/components/UI/feedback';

const actions = [
  { label: 'Editar', icon: 'edit', onClick: handleEdit, variant: 'primary' },
  { label: 'Excluir', icon: 'trash', onClick: handleDelete, variant: 'danger' }
];

return (
  <GenericViewModal
    isOpen={viewOpen}
    onClose={handleClose}
    item={item}
    title="Detalhes"
    sections={viewSections}
    actions={actions}
  />
);
```

### 6. Confirmação de Exclusão

```tsx
import { ConfirmDeleteModal } from '@/components/UI/feedback';

return (
  <ConfirmDeleteModal
    isOpen={deleteOpen}
    onClose={handleClose}
    onConfirm={handleDelete}
    title="Excluir Item"
    message="Tem certeza que deseja excluir?"
    itemName={item.nome}
    loading={deleting}
  />
);
```

### 7. Página de Listagem

```tsx
import { ListShell } from '@/components/ui';

function MinhaLista() {
  const headerActions = (
    <button onClick={handleNovo}>
      <Icon name="plus" /> Novo
    </button>
  );

  const filters = (
    <div className="flex gap-4">
      <input type="search" placeholder="Buscar..." />
      <select>{/* opções */}</select>
    </div>
  );

  return (
    <ListShell
      title="Lista de Itens"
      subtitle="Gerencie seus itens"
      headerActions={headerActions}
      filters={filters}
      loading={loading}
      error={error}
    >
      <table>{/* sua tabela */}</table>
    </ListShell>
  );
}
```

---

## 🎨 Configurações Comuns

### maxWidth

```typescript
'sm'   // 640px  - Modais pequenos
'md'   // 768px  - Modais médios
'lg'   // 1024px - Formulários simples
'xl'   // 1280px - Padrão (DEFAULT)
'2xl'  // 1536px - Formulários grandes
'4xl'  // 896px  - Formulários complexos
'6xl'  // 1152px - Formulários muito complexos
```

### Tipos de Campo (FormSection)

```typescript
'text'     // Input texto
'email'    // Input email
'number'   // Input numérico
'select'   // Dropdown
'textarea' // Área de texto
'checkbox' // Checkbox
```

### Variantes de Botão (ModalAction)

```typescript
'primary'   // Azul (padrão)
'secondary' // Cinza/Border
'danger'    // Vermelho
'warning'   // Amarelo
'success'   // Verde
```

---

## ✅ Checklist para Novos Formulários

- [ ] Usar `FormShell` ou `GenericForm` como base
- [ ] Passar `title` e `subtitle`
- [ ] Definir `maxWidth` apropriado
- [ ] Adicionar `actions` (botões)
- [ ] Tratar estados `loading` e `error`
- [ ] Para modais: `isModal={true}` e `onClose`
- [ ] Testar em modo claro e escuro
- [ ] Testar responsividade

---

## 🔧 Migração de Formulários Antigos

### Antes

```tsx
<div className="page-container">
  <div className="header">
    <h1>Título</h1>
  </div>
  <div className="content">
    {/* campos */}
  </div>
  <div className="footer">
    <button>Cancelar</button>
    <button>Salvar</button>
  </div>
</div>
```

### Depois

```tsx
<FormShell
  title="Título"
  actions={
    <>
      <button>Cancelar</button>
      <button>Salvar</button>
    </>
  }
>
  {/* campos */}
</FormShell>
```

---

## 🎯 Padrões de Uso

### Formulário Padrão
```
FormShell (wrapper)
  └── <form> (seus campos)
```

### Formulário Dinâmico
```
GenericForm
  └── FormShell (automático)
      └── <form> (gerado das sections)
```

### Modal
```
FormShell (isModal=true)
  └── Overlay + Centered Card
      └── seu conteúdo
```

---

## 💡 Dicas

1. **Use GenericForm quando possível** - menos código, mais consistente
2. **maxWidth='4xl'** é bom para formulários médios/grandes
3. **isModal={true}** para ações rápidas, false para edições complexas
4. **Sempre passe onClose** quando usar isModal
5. **Use barrel exports** para imports limpos: `from '@/pages/Condutores'`

---

## 📚 Mais Informações

- [Documentação Completa](./architecture.md)
- [Relatório de Reorganização](./REORGANIZATION_SUMMARY.md)
- [Type Definitions](../src/types/modal.ts)

---

**Happy Coding! 🚀**
