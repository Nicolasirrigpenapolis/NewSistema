import React, { useEffect, useState } from 'react';
import { Icon } from '../../../ui';
import { useEmpresa } from '../../../contexts/EmpresaContext';
import { emitenteService, EmitenteDto } from '../../../services/emitenteService';
import { InputCNPJ } from '../../../components/UI/InputCNPJ';
import { InputMasked } from '../../../components/UI/InputMasked';
import { CNPJData } from '../../../types/apiResponse';
import { cleanNumericString } from '../../../utils/formatters';

interface MensagemFeedback {
	tipo: 'sucesso' | 'erro' | 'aviso';
	texto: string;
}

const emitentePadrao: Partial<EmitenteDto> = {
	razaoSocial: '',
	nomeFantasia: '',
	cnpj: '',
	cpf: '',
	ie: '',
	endereco: '',
	numero: '',
	complemento: '',
	bairro: '',
	municipio: '',
	cep: '',
	uf: '',
	telefone: '',
	email: '',
	tipoEmitente: 'PrestadorServico',
	tipoTransportador: 1,
	modalTransporte: 1,
	serieInicial: 1,
	ativo: true,
	caminhoSalvarXml: '',
	rntrc: '',
	caminhoCertificadoDigital: '',
	senhaCertificadoDigital: '',
	caminhoImagemFundo: '',
};

const normalizarEmitente = (dados?: EmitenteDto | null): Partial<EmitenteDto> => ({
	...emitentePadrao,
	...dados,
	codMunicipio: dados?.codMunicipio,
	id: dados?.id,
	cnpj: dados?.cnpj ?? '',
	cpf: dados?.cpf ?? '',
	ie: dados?.ie ?? '',
	nomeFantasia: dados?.nomeFantasia ?? '',
	numero: dados?.numero ?? '',
	complemento: dados?.complemento ?? '',
	telefone: dados?.telefone ?? '',
	email: dados?.email ?? '',
	caminhoSalvarXml: dados?.caminhoSalvarXml ?? '',
	rntrc: dados?.rntrc ?? '',
	caminhoCertificadoDigital: dados?.caminhoCertificadoDigital ?? '',
	senhaCertificadoDigital: dados?.senhaCertificadoDigital ?? '',
	caminhoImagemFundo: dados?.caminhoImagemFundo ?? '',
	tipoEmitente: dados?.tipoEmitente || emitentePadrao.tipoEmitente || 'PrestadorServico',
	tipoTransportador: dados?.tipoTransportador ?? emitentePadrao.tipoTransportador,
	modalTransporte: dados?.modalTransporte ?? emitentePadrao.modalTransporte,
	serieInicial: dados?.serieInicial ?? emitentePadrao.serieInicial,
	ativo: dados?.ativo ?? true,
});

const tipoEmitenteOptions = [
	{ value: 'PrestadorServico', label: 'Prestador de Serviço (ETC)' },
	{ value: 'EntregaPropria', label: 'Entrega Própria (Carga Própria)' },
];

const tipoTransportadorOptions = [
	{ value: 1, label: 'ETC - Empresa de Transporte de Cargas' },
	{ value: 2, label: 'TAC - Transportador Autônomo de Cargas' },
	{ value: 3, label: 'CTC - Cooperativa de Transporte de Cargas' },
];

const modalTransporteOptions = [
	{ value: 1, label: 'Rodoviário' },
	{ value: 2, label: 'Aéreo' },
	{ value: 3, label: 'Aquaviário' },
	{ value: 4, label: 'Ferroviário' },
];

type TabType = 'dados' | 'endereco' | 'mdfe' | 'certificado';

export function ConfiguracaoEmitente() {
	const { empresa, carregando: carregandoEmpresa, atualizar: atualizarEmpresa } = useEmpresa();
	const [emitente, setEmitente] = useState<EmitenteDto | null>(null);
	const [formData, setFormData] = useState<Partial<EmitenteDto>>(() => normalizarEmitente());
	const [carregandoEmitente, setCarregandoEmitente] = useState(true);
	const [processando, setProcessando] = useState(false);
	const [mensagem, setMensagem] = useState<MensagemFeedback | null>(null);
	const [formAlterado, setFormAlterado] = useState(false);
	const [abaAtiva, setAbaAtiva] = useState<TabType>('dados');

	useEffect(() => {
		void carregarInformacoes();
	}, []);

	useEffect(() => {
		setFormData(normalizarEmitente(emitente));
		setFormAlterado(false);
	}, [emitente]);

	const carregarInformacoes = async () => {
		try {
			setCarregandoEmitente(true);
			await atualizarEmpresa();
			const dadosEmitente = await emitenteService.obterEmitenteAtual();
			setEmitente(dadosEmitente);
			setFormData(normalizarEmitente(dadosEmitente));
			setFormAlterado(false);
		} catch (error) {
			console.error(error);
			setMensagem({ tipo: 'erro', texto: 'Erro ao carregar dados do emitente.' });
		} finally {
			setCarregandoEmitente(false);
		}
	};

	const handleInputChange = (campo: keyof EmitenteDto, valor: any) => {
		setFormData((prev) => ({ ...prev, [campo]: valor }));
		setFormAlterado(true);
	};

	const handleSalvarEmitente = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setProcessando(true);
			const payload: EmitenteDto = {
				...formData,
				id: formData.id ?? emitente?.id,
				cnpj: formData.cnpj ? cleanNumericString(formData.cnpj) : undefined,
				cpf: formData.cpf ? cleanNumericString(formData.cpf) : undefined,
				cep: formData.cep ? cleanNumericString(formData.cep) : '',
				telefone: formData.telefone ? cleanNumericString(formData.telefone) : undefined,
				tipoEmitente: (formData.tipoEmitente as string) || 'PrestadorServico',
				tipoTransportador: formData.tipoTransportador ?? 1,
				modalTransporte: formData.modalTransporte ?? 1,
				serieInicial: formData.serieInicial ?? 1,
				ativo: formData.ativo ?? true,
				caminhoImagemFundo: formData.caminhoImagemFundo ? formData.caminhoImagemFundo.trim() : undefined,
			} as EmitenteDto;

			await emitenteService.salvarEmitente(payload);
			setMensagem({ tipo: 'sucesso', texto: 'Emitente atualizado com sucesso!' });
			setFormAlterado(false);
			await carregarInformacoes();
			setTimeout(() => setMensagem(null), 5000);
		} catch (error: any) {
			console.error(error);
			setMensagem({ tipo: 'erro', texto: error?.message || 'Erro ao salvar emitente.' });
		} finally {
			setProcessando(false);
		}
	};

	const carregando = carregandoEmitente || carregandoEmpresa;

	const tabs = [
		{ id: 'dados' as TabType, label: 'Dados Fiscais', icon: 'building', color: 'blue' },
		{ id: 'endereco' as TabType, label: 'Endereço', icon: 'map-pin', color: 'green' },
		{ id: 'mdfe' as TabType, label: 'MDF-e', icon: 'file-text', color: 'purple' },
		{ id: 'certificado' as TabType, label: 'Certificado', icon: 'shield', color: 'red' },
	];

	return (
		<div className="min-h-screen bg-background p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-foreground">Configuração do Emitente</h1>
						<p className="text-muted-foreground mt-1">Gerencie os dados fiscais e configurações da empresa</p>
					</div>
				</div>

				{/* Mensagem de Feedback */}
				{mensagem && (
					<div
						className={`rounded-xl border-l-4 px-6 py-4 shadow-md ${
							mensagem.tipo === 'sucesso'
								? 'border-green-500 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300'
								: mensagem.tipo === 'erro'
								? 'border-red-500 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'
								: 'border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
						}`}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Icon name={mensagem.tipo === 'sucesso' ? 'check-circle' : mensagem.tipo === 'erro' ? 'alert-circle' : 'info'} size="lg" />
								<span className="font-medium">{mensagem.texto}</span>
							</div>
							<button type="button" onClick={() => setMensagem(null)} className="text-current opacity-70 hover:opacity-100">
								<Icon name="x" />
							</button>
						</div>
					</div>
				)}

				{carregando ? (
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
						<div className="flex flex-col items-center gap-4">
							<div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
							<span className="text-lg text-gray-600 dark:text-gray-400">Carregando configurações...</span>
						</div>
					</div>
				) : (
					<form onSubmit={handleSalvarEmitente} className="space-y-6">
						{/* Tabs com cores */}
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
							<div className="flex border-b border-gray-200 dark:border-gray-700">
								{tabs.map((tab) => (
									<button
										key={tab.id}
										type="button"
										onClick={() => setAbaAtiva(tab.id)}
										className={`flex-1 px-6 py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
											abaAtiva === tab.id
												? `text-${tab.color}-600 dark:text-${tab.color}-400 border-b-2 border-${tab.color}-600 dark:border-${tab.color}-400 bg-${tab.color}-50 dark:bg-${tab.color}-900/20`
												: 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
										}`}
									>
										<Icon name={tab.icon} size="sm" />
										{tab.label}
									</button>
								))}
							</div>

							{/* Conteúdo das Tabs */}
							<div className="p-8">
								{/* Aba Dados Fiscais */}
								{abaAtiva === 'dados' && (
									<div className="space-y-6">
										<div className="grid grid-cols-2 gap-6">
											<div>
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
													Razão Social <span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													value={formData.razaoSocial ?? ''}
													onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
													placeholder="Nome da empresa"
													required
												/>
											</div>

											<div>
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nome Fantasia</label>
												<input
													type="text"
													value={formData.nomeFantasia ?? ''}
													onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
													placeholder="Nome comercial"
												/>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-6">
											<div>
												<InputCNPJ
													value={formData.cnpj ?? ''}
													onChange={(rawValue) => handleInputChange('cnpj', rawValue)}
													onDataFetched={(data: CNPJData) => {
														setFormData(prev => {
															const codMunicipioAtual = prev.codMunicipio;
															const codMunicipioValido = codMunicipioAtual && String(codMunicipioAtual).length === 7;
															const preferText = (apiValue?: string | null, atual?: string | null) => {
																if (apiValue && apiValue.trim().length > 0) {
																	return apiValue;
																}
																return atual ?? '';
															};

															return {
																...prev,
																razaoSocial: preferText(data.razaoSocial, prev.razaoSocial),
																nomeFantasia: preferText(data.nomeFantasia, prev.nomeFantasia),
																cep: preferText(data.cep, prev.cep),
																endereco: preferText(data.logradouro, prev.endereco),
																numero: preferText(data.numero, prev.numero),
																complemento: preferText(data.complemento, prev.complemento),
																bairro: preferText(data.bairro, prev.bairro),
																municipio: preferText(data.municipio, prev.municipio),
																uf: preferText(data.uf, prev.uf),
																codMunicipio: codMunicipioValido
																	? codMunicipioAtual
																	: (data.codigoMunicipio && String(data.codigoMunicipio).length === 7 ? data.codigoMunicipio : prev.codMunicipio),
																telefone: preferText(data.telefone, prev.telefone),
																email: preferText(data.email, prev.email)
															};
														});
														setFormAlterado(true);
													}}
													autoFetch={true}
												/>
											</div>

											<div>
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Inscrição Estadual</label>
												<input
													type="text"
													value={formData.ie ?? ''}
													onChange={(e) => handleInputChange('ie', e.target.value)}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
													placeholder="IE"
												/>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-6">
											<div>
												<InputMasked
													label="Telefone"
													value={formData.telefone ?? ''}
													onChange={(rawValue) => handleInputChange('telefone', rawValue)}
													maskType="telefone"
													placeholder="(00) 00000-0000"
												/>
											</div>

											<div>
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">E-mail</label>
												<input
													type="email"
													value={formData.email ?? ''}
													onChange={(e) => handleInputChange('email', e.target.value)}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
													placeholder="email@empresa.com"
												/>
											</div>
										</div>

										<div className="pt-6 border-t border-gray-200 dark:border-gray-700">
											<label className="flex items-center gap-3 cursor-pointer">
												<input
													type="checkbox"
													checked={formData.ativo ?? true}
													onChange={(e) => handleInputChange('ativo', e.target.checked)}
													className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
												/>
												<span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Emitente Ativo</span>
											</label>
										</div>
									</div>
								)}

								{/* Aba Endereço */}
								{abaAtiva === 'endereco' && (
									<div className="space-y-6">
										<div className="grid grid-cols-4 gap-6">
											<div>
												<InputMasked
													label="CEP"
													value={formData.cep ?? ''}
													onChange={(rawValue) => handleInputChange('cep', rawValue)}
													maskType="cep"
													placeholder="00000-000"
													required={true}
												/>
											</div>

											<div className="col-span-2">
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
													Logradouro <span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													value={formData.endereco ?? ''}
													onChange={(e) => handleInputChange('endereco', e.target.value)}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
													placeholder="Rua, Avenida"
													required
												/>
											</div>

											<div>
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Número</label>
												<input
													type="text"
													value={formData.numero ?? ''}
													onChange={(e) => handleInputChange('numero', e.target.value)}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
													placeholder="S/N"
												/>
											</div>
										</div>

										<div className="grid grid-cols-3 gap-6">
											<div>
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Complemento</label>
												<input
													type="text"
													value={formData.complemento ?? ''}
													onChange={(e) => handleInputChange('complemento', e.target.value)}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
													placeholder="Sala, Andar"
												/>
											</div>

											<div>
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
													Bairro <span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													value={formData.bairro ?? ''}
													onChange={(e) => handleInputChange('bairro', e.target.value)}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
													placeholder="Bairro"
													required
												/>
											</div>

											<div>
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
													Município <span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													value={formData.municipio ?? ''}
													onChange={(e) => handleInputChange('municipio', e.target.value)}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
													placeholder="Município"
													required
												/>
											</div>
										</div>

										<div className="grid grid-cols-4 gap-6">
											<div>
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
													UF <span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													value={formData.uf ?? ''}
													onChange={(e) => handleInputChange('uf', e.target.value.toUpperCase())}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 uppercase text-center"
													placeholder="GO"
													maxLength={2}
													required
												/>
											</div>

											<div className="col-span-3">
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
													Código IBGE <span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													inputMode="numeric"
													pattern="\d{7}"
													maxLength={7}
													value={formData.codMunicipio !== undefined ? String(formData.codMunicipio) : ''}
													onChange={(e) => {
														const digits = e.target.value.replace(/\D/g, '').slice(0, 7);
														handleInputChange('codMunicipio', digits ? Number(digits) : undefined);
													}}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 font-mono"
													placeholder="5208707"
													required
												/>
											</div>
										</div>
									</div>
								)}

								{/* Aba MDF-e */}
								{abaAtiva === 'mdfe' && (
									<div className="space-y-6">
										<div className="grid grid-cols-3 gap-6">
											<div>
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tipo de Emitente</label>
												<select
													value={formData.tipoEmitente ?? 'PrestadorServico'}
													onChange={(e) => handleInputChange('tipoEmitente', e.target.value)}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
													required
												>
													{tipoEmitenteOptions.map((option) => (
														<option key={option.value} value={option.value}>
															{option.label}
														</option>
													))}
												</select>
											</div>

											<div>
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tipo de Transportador</label>
												<select
													value={String(formData.tipoTransportador ?? 1)}
													onChange={(e) => handleInputChange('tipoTransportador', Number(e.target.value))}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
													required
												>
													{tipoTransportadorOptions.map((option) => (
														<option key={option.value} value={String(option.value)}>
															{option.label}
														</option>
													))}
												</select>
											</div>

											<div>
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Modal de Transporte</label>
												<select
													value={String(formData.modalTransporte ?? 1)}
													onChange={(e) => handleInputChange('modalTransporte', Number(e.target.value))}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
													required
												>
													{modalTransporteOptions.map((option) => (
														<option key={option.value} value={String(option.value)}>
															{option.label}
														</option>
													))}
												</select>
											</div>
										</div>

										<div className="grid grid-cols-4 gap-6">
											<div>
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">RNTRC</label>
												<input
													type="text"
													value={formData.rntrc ?? ''}
													onChange={(e) => handleInputChange('rntrc', e.target.value)}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 font-mono"
													placeholder="RNTRC"
												/>
											</div>

											<div>
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Série MDF-e</label>
												<input
													type="number"
													min={1}
													value={formData.serieInicial ?? ''}
													onChange={(e) => {
														const value = e.target.value === '' ? undefined : Math.max(1, Number(e.target.value));
														handleInputChange('serieInicial', value);
													}}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
													placeholder="1"
													required
												/>
											</div>

											<div className="col-span-2">
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Caminho para salvar XML</label>
												<input
													type="text"
													value={formData.caminhoSalvarXml ?? ''}
													onChange={(e) => handleInputChange('caminhoSalvarXml', e.target.value)}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 font-mono"
													placeholder="D:\\MDFe\\XMLs"
												/>
											</div>
										</div>
									</div>
								)}

								{/* Aba Certificado */}
								{abaAtiva === 'certificado' && (
									<div className="space-y-6">
										<div className="grid grid-cols-3 gap-6">
											<div className="col-span-2">
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Caminho do Certificado</label>
												<input
													type="text"
													value={formData.caminhoCertificadoDigital ?? ''}
													onChange={(e) => handleInputChange('caminhoCertificadoDigital', e.target.value)}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 font-mono"
													placeholder="C:\\Certificados\\cert.pfx"
												/>
											</div>

											<div>
												<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Senha do Certificado</label>
												<input
													type="password"
													value={formData.senhaCertificadoDigital ?? ''}
													onChange={(e) => handleInputChange('senhaCertificadoDigital', e.target.value)}
													className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
													placeholder="••••••••"
												/>
											</div>
										</div>

										{formData.caminhoCertificadoDigital && (
											<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center gap-3">
												<Icon name="shield" className="text-yellow-600 dark:text-yellow-400" />
												<div className="flex-1">
													<p className="text-sm text-yellow-700 dark:text-yellow-400 font-mono break-all">{formData.caminhoCertificadoDigital}</p>
												</div>
												{formData.senhaCertificadoDigital && (
													<Icon name="lock" className="text-yellow-600 dark:text-yellow-400" />
												)}
											</div>
										)}
									</div>
								)}
							</div>
						</div>

						{/* Botões de Ação com gradiente */}
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Icon name="info" className={formAlterado ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'} />
								<span className={`font-semibold ${formAlterado ? 'text-yellow-700 dark:text-yellow-300' : 'text-green-700 dark:text-green-300'}`}>
									{formAlterado ? 'Há alterações não salvas' : 'Todas as alterações estão salvas'}
								</span>
							</div>

							<div className="flex items-center gap-4">
								<button
									type="button"
									onClick={() => {
										setFormData(normalizarEmitente(emitente));
										setFormAlterado(false);
										setMensagem({ tipo: 'aviso', texto: 'Formulário restaurado.' });
										setTimeout(() => setMensagem(null), 3000);
									}}
									disabled={!formAlterado || processando}
									className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 shadow-sm"
								>
									<Icon name="refresh-cw" />
									Restaurar
								</button>

								<button
									type="submit"
									disabled={!formAlterado || processando}
									className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold transition disabled:opacity-50 disabled:from-gray-400 disabled:to-gray-500 shadow-lg"
								>
									<Icon name={processando ? 'loader' : 'save'} className={processando ? 'animate-spin' : ''} />
									{processando ? 'Salvando...' : 'Salvar Alterações'}
								</button>
							</div>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
