export interface ModalField {
  label: string;
  value: string | number | boolean | null | undefined;
  type?: 'text' | 'currency' | 'date' | 'status' | 'badge' | 'code' | 'boolean';
  icon?: string;
  formatter?: (value: any) => string;
  colSpan?: 1 | 2 | 3;
  show?: boolean;
}

export interface ModalSection {
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
  bgColor: string;
  fields: ModalField[];
  columns?: 1 | 2 | 3;
}

export interface ModalAction {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  disabled?: boolean;
  loading?: boolean;
}

export interface StatusConfig {
  value: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon?: string;
}

export interface GenericViewModalProps<T = any> {
  isOpen?: boolean;
  onClose?: () => void;
  item?: T;
  data?: T;
  title?: string;
  subtitle?: string;
  headerIcon?: string;
  headerColor?: string;
  sections?: ModalSection[];
  actions?: ModalAction[];
  statusConfig?: StatusConfig;
  idField?: string;
  copyableFields?: Array<{
    fieldKey: string;
    label: string;
  }>;
  config?: ModalConfig<T>;
  onEdit?: () => void;
}

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'toggle' | 'file' | 'folder' | 'cnpj' | 'cpf' | 'cep' | 'telefone' | 'date' | 'localidade';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string | number; label: string }>;
  validation?: (value: any) => string | null;
  colSpan?: 1 | 2 | 3;
  show?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  icon?: string;
  mask?: string;
  maxLength?: number;
  autoFetch?: boolean;
  onDataFetch?: (data: any) => void;
  conditionalShow?: { field: string; value: string };
  dependsOn?: string;
  buttonLabel?: string;
  accept?: string;
}

export interface FormSection {
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
  bgColor: string;
  fields: FormField[];
  columns?: 1 | 2 | 3;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface GenericFormModalProps<T = any> {
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (data: T) => Promise<void>;
  item?: T | null;
  data?: T;
  title?: string;
  subtitle?: string;
  headerIcon?: string;
  headerColor?: string;
  sections?: FormSection[];
  loading?: boolean;
  isEdit?: boolean;
  isEditing?: boolean;
  config?: ModalConfig<T>;
  onCancel?: () => void;
  onFieldChange?: (name: string, value: any) => void;
  customStates?: any;
}

export interface ViewModalConfig<T = any> {
  title: string;
  subtitle?: string;
  headerIcon: string;
  headerColor: string;
  getSections: (item: T) => ModalSection[];
  getActions?: (item: T, onClose: () => void) => ModalAction[];
  getStatusConfig?: (item: T) => StatusConfig | undefined;
  idField?: string;
  copyableFields?: Array<{
    fieldKey: string;
    label: string;
  }>;
}

export interface FormModalConfig<T = any> {
  title: string;
  editTitle?: string;
  subtitle?: string;
  editSubtitle?: string;
  headerIcon: string;
  headerColor: string;
  getSections: (item?: T) => FormSection[];
  validate?: (data: T) => Record<string, string>;
  defaultValues: Partial<T>;
}

export interface CRUDConfig<T = any> {
  view: ViewModalConfig<T>;
  form: FormModalConfig<T>;
  entity: {
    name: string;
    pluralName: string;
    idField: string;
  };
}

// Legacy ModalConfig interface for backward compatibility
export interface ModalConfig<T = any> {
  title: string;
  createTitle?: string;
  editTitle?: string;
  createSubtitle?: string;
  editSubtitle?: string;
  theme: string;
  sections: Array<{
    id: string;
    title: string;
    subtitle?: string;
    fields: Array<{
      name: string;
      label: string;
      type: string;
      required?: boolean;
      placeholder?: string;
      validation?: any;
      options?: Array<{ value: string | number; label: string }>;
      conditional?: { field: string; value: string };
      colSpan?: 1 | 2 | 3;
    }>;
  }>;
  viewFields: Array<{
    name: string;
    label: string;
    type?: string;
    optional?: boolean;
  }>;
}
