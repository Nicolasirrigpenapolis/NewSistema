import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/UI/button';
import { Input } from '../../../components/UI/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/UI/select';
import { Textarea } from '../../../components/UI/textarea';
import { Label } from '../../../components/UI/label';
import Icon from '../../../components/UI/Icon';
import { fornecedoresService, Fornecedor, FornecedorCreateDto } from '../../../services/fornecedoresService';

export function FornecedorForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FornecedorCreateDto>({
    nome: '',
    cnpjCpf: '',
    tipoPessoa: 'J',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    uf: '',
    cep: '',
    observacoes: '',
    ativo: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && id) {
      carregarFornecedor();
    }
  }, [id, isEditing]);

  const carregarFornecedor = async () => {
    try {
      setLoading(true);
      const response = await fornecedoresService.getFornecedorById(Number(id));

      if (response.success && response.data) {
        const fornecedor = response.data;
        setFormData({
          nome: fornecedor.nome,
          cnpjCpf: fornecedor.cnpjCpf,
          tipoPessoa: fornecedor.tipoPessoa,
          email: fornecedor.email || '',
          telefone: fornecedor.telefone || '',
          endereco: fornecedor.endereco || '',
          cidade: fornecedor.cidade || '',
          uf: fornecedor.uf || '',
          cep: fornecedor.cep || '',
          observacoes: fornecedor.observacoes || '',
          ativo: fornecedor.ativo
        });
      } else {
        setError(response.message || 'Erro ao carregar fornecedor');
      }
    } catch (err) {
      setError('Erro inesperado ao carregar fornecedor');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FornecedorCreateDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Formatação automática para alguns campos
    if (field === 'cnpjCpf') {
      const formatted = fornecedoresService.formatDocument(value, formData.tipoPessoa);
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else if (field === 'cep') {
      const formatted = fornecedoresService.formatCep(value);
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else if (field === 'telefone') {
      const formatted = fornecedoresService.formatTelefone(value);
      setFormData(prev => ({ ...prev, [field]: formatted }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.cnpjCpf.trim()) {
      newErrors.cnpjCpf = 'CNPJ/CPF é obrigatório';
    } else if (!fornecedoresService.validateDocument(formData.cnpjCpf, formData.tipoPessoa)) {
      newErrors.cnpjCpf = formData.tipoPessoa === 'F'
        ? 'CPF deve ter 11 dígitos'
        : 'CNPJ deve ter 14 dígitos';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.cep && !/^\d{5}-\d{3}$/.test(formData.cep)) {
      newErrors.cep = 'CEP deve estar no formato 00000-000';
    }

    if (formData.uf && formData.uf.length !== 2) {
      newErrors.uf = 'UF deve ter 2 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      let response;

      if (isEditing && id) {
        response = await fornecedoresService.updateFornecedor({
          id: Number(id),
          ...formData
        });
      } else {
        response = await fornecedoresService.createFornecedor(formData);
      }

      if (response.success) {
        setSuccess(isEditing ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor criado com sucesso!');
        setTimeout(() => {
          navigate('/fornecedores');
        }, 2000);
      } else {
        setError(response.message || 'Erro ao salvar fornecedor');
      }
    } catch (err) {
      setError('Erro inesperado ao salvar fornecedor');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const ufsOptions = [
    { value: 'AC', label: 'AC' }, { value: 'AL', label: 'AL' }, { value: 'AP', label: 'AP' },
    { value: 'AM', label: 'AM' }, { value: 'BA', label: 'BA' }, { value: 'CE', label: 'CE' },
    { value: 'DF', label: 'DF' }, { value: 'ES', label: 'ES' }, { value: 'GO', label: 'GO' },
    { value: 'MA', label: 'MA' }, { value: 'MT', label: 'MT' }, { value: 'MS', label: 'MS' },
    { value: 'MG', label: 'MG' }, { value: 'PA', label: 'PA' }, { value: 'PB', label: 'PB' },
    { value: 'PR', label: 'PR' }, { value: 'PE', label: 'PE' }, { value: 'PI', label: 'PI' },
    { value: 'RJ', label: 'RJ' }, { value: 'RN', label: 'RN' }, { value: 'RS', label: 'RS' },
    { value: 'RO', label: 'RO' }, { value: 'RR', label: 'RR' }, { value: 'SC', label: 'SC' },
    { value: 'SP', label: 'SP' }, { value: 'SE', label: 'SE' }, { value: 'TO', label: 'TO' }
  ];

  if (loading && isEditing) {
    return (
      <div className="w-full px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/fornecedores')}
          className="flex items-center gap-2"
        >
          <Icon name="arrow-left" size="sm" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isEditing ? 'Atualize as informações do fornecedor' : 'Cadastre um novo fornecedor para manutenções'}
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <Icon name="alert-circle" className="text-red-400 mr-2" size="sm" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <Icon name="check-circle" className="text-green-400 mr-2" size="sm" />
            <span className="text-green-800 dark:text-green-200">{success}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informações Básicas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Digite o nome do fornecedor"
                className={errors.nome ? 'border-red-500' : ''}
              />
              {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoPessoa">Tipo de Pessoa *</Label>
              <Select value={formData.tipoPessoa} onValueChange={(value) => handleInputChange('tipoPessoa', value as 'F' | 'J')}>
                <SelectTrigger id="tipoPessoa">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="F">Pessoa Física</SelectItem>
                  <SelectItem value="J">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpjCpf">{`${formData.tipoPessoa === 'F' ? 'CPF' : 'CNPJ'} *`}</Label>
              <Input
                id="cnpjCpf"
                value={formData.cnpjCpf}
                onChange={(e) => handleInputChange('cnpjCpf', e.target.value)}
                placeholder={formData.tipoPessoa === 'F' ? '000.000.000-00' : '00.000.000/0000-00'}
                className={errors.cnpjCpf ? 'border-red-500' : ''}
              />
              {errors.cnpjCpf && <p className="text-sm text-red-500">{errors.cnpjCpf}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@exemplo.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(00) 00000-0000"
                className={errors.telefone ? 'border-red-500' : ''}
              />
              {errors.telefone && <p className="text-sm text-red-500">{errors.telefone}</p>}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Endereço
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-3 space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                placeholder="Rua, Avenida, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => handleInputChange('cidade', e.target.value)}
                placeholder="Nome da cidade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uf">UF</Label>
              <Select value={formData.uf} onValueChange={(value) => handleInputChange('uf', value)}>
                <SelectTrigger id="uf" className={errors.uf ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a UF" />
                </SelectTrigger>
                <SelectContent>
                  {ufsOptions.map((uf) => (
                    <SelectItem key={uf.value} value={uf.value}>{uf.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.uf && <p className="text-sm text-red-500">{errors.uf}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => handleInputChange('cep', e.target.value)}
                placeholder="00000-000"
                className={errors.cep ? 'border-red-500' : ''}
              />
              {errors.cep && <p className="text-sm text-red-500">{errors.cep}</p>}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informações Adicionais
          </h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Observações sobre o fornecedor..."
                rows={4}
              />
            </div>

            {/* Status "Ativo" só aparece na edição */}
            {isEditing && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => handleInputChange('ativo', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fornecedor ativo
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/fornecedores')}
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            {isEditing ? 'Atualizar' : 'Criar'} Fornecedor
          </Button>
        </div>
      </form>
    </div>
  );
}