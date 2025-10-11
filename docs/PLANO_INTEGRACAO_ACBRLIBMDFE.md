# Plano de Integração Completa ACBrLibMDFe

## 📋 Visão Geral

Integração completa da biblioteca ACBrLibMDFe (via DLL nativa) no sistema de gestão de MDFe.

**Metodologia**: Para **CADA PDF** da documentação, seguir o processo:
1. 📖 **LER** o PDF completamente
2. 🔍 **VERIFICAR** se já existe algo implementado no código
3. ✅ **IMPLEMENTAR** ou corrigir conforme especificação do PDF

---

## 📚 Lista Completa de PDFs (60 arquivos)

### **Grupo 1: Documentação Geral (4 PDFs)**

#### PDF 01: `Sobre a ACBrLibMDFe.pdf`
📖 **Ler**: Arquitetura geral da biblioteca
🔍 **Verificar**: Entendimento geral do sistema
✅ **Implementar**: Documentar arquitetura no código

#### PDF 02: `Histórico de Alterações.pdf`
📖 **Ler**: Mudanças de versão
🔍 **Verificar**: Versão da DLL sendo usada
✅ **Implementar**: Anotar breaking changes importantes

#### PDF 03: `Métodos da Biblioteca.pdf`
📖 **Ler**: Visão geral de todos os métodos disponíveis
🔍 **Verificar**: Quais métodos já temos declarados
✅ **Implementar**: Checklist de métodos a implementar

#### PDF 04: `Métodos de Configuração.pdf`
📖 **Ler**: Visão geral dos métodos de configuração
🔍 **Verificar**: Sistema de configuração atual
✅ **Implementar**: Planejar estrutura de configuração

---

### **Grupo 2: Configuração da Biblioteca (7 PDFs)**

#### PDF 05: `Configurações da Biblioteca.pdf`
📖 **Ler**: TODAS as opções de configuração ([MDFe], [DAMDFe], [DFe], etc)
🔍 **Verificar**: Arquivo `ACBrLib.ini` existe?
✅ **Implementar**: Criar `AcbrConfigManager.cs` que gera INI completo

#### PDF 06: `MDFE_ConfigLer.pdf`
📖 **Ler**: Método para ler configuração completa
🔍 **Verificar**: Método `MDFE_ConfigLer` declarado em Native?
✅ **Implementar**:
```csharp
[DllImport("ACBrMDFe64.dll", CallingConvention = CallingConvention.Cdecl)]
public static extern int MDFE_ConfigLer(string eArqConfig);
```

#### PDF 07: `MDFE_ConfigGravar.pdf`
📖 **Ler**: Método para gravar configuração completa
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke + método helper em ConfigManager

#### PDF 08: `MDFE_ConfigLerValor.pdf`
📖 **Ler**: Ler valor específico da configuração
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke para leitura de chave específica

#### PDF 09: `MDFE_ConfigGravarValor.pdf`
📖 **Ler**: Gravar valor específico
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke + método helper

#### PDF 10: `MDFE_ConfigImportar.pdf`
📖 **Ler**: Importar configuração de string INI
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke + método para importar INI

#### PDF 11: `MDFE_ConfigExportar.pdf`
📖 **Ler**: Exportar configuração para string
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke + método para exportar INI

---

### **Grupo 3: Inicialização e Controle (5 PDFs)**

#### PDF 12: `MDFE_Inicializar.pdf`
📖 **Ler**: Como inicializar a biblioteca (parâmetros, retornos)
🔍 **Verificar**: Construtor do Provider chama inicialização?
✅ **Implementar**:
```csharp
[DllImport("ACBrMDFe64.dll", CallingConvention = CallingConvention.Cdecl)]
public static extern int MDFE_Inicializar(string eArqConfig, string eChaveCrypt);

// No Provider
public AcbrLibMDFeProvider(...)
{
    var ret = MDFE_Inicializar(configPath, "");
    if (ret != 0) throw new Exception($"Falha inicializar: {ret}");
}
```

#### PDF 13: `MDFE_Finalizar.pdf`
📖 **Ler**: Como finalizar corretamente (liberar recursos)
🔍 **Verificar**: Dispose() do Provider finaliza?
✅ **Implementar**:
```csharp
[DllImport("ACBrMDFe64.dll", CallingConvention = CallingConvention.Cdecl)]
public static extern int MDFE_Finalizar();

public void Dispose()
{
    MDFE_Finalizar();
}
```

#### PDF 14: `MDFE_Nome.pdf`
📖 **Ler**: Obter nome da biblioteca
🔍 **Verificar**: Método existe?
✅ **Implementar**: P/Invoke + health check

#### PDF 15: `MDFE_Versao.pdf`
📖 **Ler**: Obter versão da biblioteca
🔍 **Verificar**: Método existe?
✅ **Implementar**: P/Invoke + health check

#### PDF 16: `MDFE_UltimoRetorno.pdf`
📖 **Ler**: Obter última mensagem de erro/retorno
🔍 **Verificar**: Método existe?
✅ **Implementar**: P/Invoke + uso em exception handling

---

### **Grupo 4: Geração de INI do MDFe (3 PDFs)**

#### PDF 17: `Preenchimento do Arquivo .INI.pdf`
📖 **Ler**: Regras de preenchimento, campos obrigatórios, formatos
🔍 **Verificar**: `MDFeIniGenerator.cs` existe?
✅ **Implementar**: Criar ou expandir gerador seguindo TODAS as regras

#### PDF 18: `Modelo MDFe.INI.pdf`
📖 **Ler**: ⭐ **PRINCIPAL** - Modelo completo com TODAS as seções
🔍 **Verificar**: Quais seções já estão implementadas no gerador?
✅ **Implementar**: Implementar TODAS as seções faltantes:
- [MDFE], [IDE], [EMIT], [RODO]
- [VEICTRACAO], [CONDUTORNN], [REBOQUES], [REBOQNN]
- [LACRODOVIA], [LACRODNN]
- [INFPERCURSO], [UFPERNN]
- [INFMUNCARREGA], [MUNCARREGANN]
- [INFMUNDESCARREGA], [MUNDESCARREGANN]
- [INFNFENN], [INFCTENN], [INFMDFETRANSPNN]
- [TOT], [PRODPRED]
- [SEG], [AVERBNN], [INFRESPSEGINFOSG]
- [CONTRNN], [INFPAG], [COMPNN]
- [INFPRAZOPAG], [INFPRNN]
- [INFBANCARIO], [INFBANCNN]
- [VALEPEDAGIO], [DISPNN]
- [INFADIPOLO], [INFCPLNN]
- [AUTXML], [AUTNN]
- [INFRESPTEC]

#### PDF 19: `Pagamento da Operação de Transporte.pdf`
📖 **Ler**: Detalhes sobre seções de pagamento
🔍 **Verificar**: Seções [INFPAG], [COMPNN], [INFPRNN] implementadas?
✅ **Implementar**: Gerar seções de pagamento corretamente

---

### **Grupo 5: Manipulação de MDFe (13 PDFs)**

#### PDF 20: `MDFE_CarregarINI.pdf`
📖 **Ler**: Carregar MDFe de arquivo INI ou string
🔍 **Verificar**: Método declarado?
✅ **Implementar**:
```csharp
[DllImport("ACBrMDFe64.dll", CallingConvention = CallingConvention.Cdecl)]
public static extern int MDFE_CarregarINI(string eArquivoOuINI);
```

#### PDF 21: `MDFE_CarregarXML.pdf`
📖 **Ler**: Carregar MDFe de arquivo XML
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke

#### PDF 22: `MDFE_LimparLista.pdf`
📖 **Ler**: Limpar lista de MDFe carregados
🔍 **Verificar**: Método declarado e usado antes de carregar novo?
✅ **Implementar**: P/Invoke + usar antes de cada operação

#### PDF 23: `MDFE_Assinar.pdf`
📖 **Ler**: Assinar MDFe carregado (certificado digital)
🔍 **Verificar**: Método declarado? Certificado configurado?
✅ **Implementar**: P/Invoke + fluxo de assinatura

#### PDF 24: `MDFE_Validar.pdf`
📖 **Ler**: Validar XML contra schema XSD
🔍 **Verificar**: Método declarado? Schemas copiados?
✅ **Implementar**: P/Invoke + validação antes de enviar

#### PDF 25: `MDFE_ValidarRegrasdeNegocios.pdf`
📖 **Ler**: Validar regras de negócio SEFAZ
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke + validação extra

#### PDF 26: `MDFE_VerificarAssinatura.pdf`
📖 **Ler**: Verificar se assinatura é válida
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke + verificação pós-assinatura

#### PDF 27: `MDFE_ObterXml.pdf`
📖 **Ler**: Obter XML gerado/assinado
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke + retorno de XML

#### PDF 28: `MDFE_GravarXml.pdf`
📖 **Ler**: Gravar XML em arquivo
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke + salvamento de XML

#### PDF 29: `MDFE_ObterIni.pdf`
📖 **Ler**: Obter INI do MDFe carregado
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke + retorno de INI

#### PDF 30: `MDFE_GravarIni.pdf`
📖 **Ler**: Gravar INI em arquivo
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke + salvamento de INI

#### PDF 31: `MDFE_GerarChave.pdf`
📖 **Ler**: Gerar chave de acesso do MDFe
🔍 **Verificar**: Método declarado? Já temos geração própria?
✅ **Implementar**: P/Invoke OU usar método existente do modelo

#### PDF 32: `MDFE_ObterCertificados.pdf`
📖 **Ler**: Listar certificados disponíveis no sistema
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke + helper para seleção de certificado

---

### **Grupo 6: Transmissão e Consultas (6 PDFs)**

#### PDF 33: `MDFE_Enviar.pdf`
📖 **Ler**: ⭐ **CRÍTICO** - Transmitir MDFe para SEFAZ (parâmetros, resposta)
🔍 **Verificar**: Método `TransmitirComIniAsync` existe?
✅ **Implementar**:
```csharp
[DllImport("ACBrMDFe64.dll", CallingConvention = CallingConvention.Cdecl)]
public static extern int MDFE_Enviar(int ALote, bool AImprimir, bool ASincrono,
    StringBuilder sResposta, ref int esTamanho);

// No Provider
public async Task<ProviderResult<object>> TransmitirComIniAsync(int mdfeId, string ini)
{
    MDFE_LimparLista();
    MDFE_CarregarINI(ini);
    MDFE_Assinar();
    MDFE_Validar();

    var resposta = new StringBuilder(256000);
    int tamanho = resposta.Capacity;
    int ret = MDFE_Enviar(1, false, true, resposta, ref tamanho);

    // Parsear resposta INI
    return ParseEnvioResponse(resposta.ToString());
}
```

#### PDF 34: `MDFE_Consultar.pdf`
📖 **Ler**: Consultar MDFe por chave de acesso
🔍 **Verificar**: Método `ConsultarPorChaveAsync` existe?
✅ **Implementar**: P/Invoke + parse resposta

#### PDF 35: `MDFE_ConsultarRecibo.pdf`
📖 **Ler**: Consultar processamento por número de recibo
🔍 **Verificar**: Método `ConsultarReciboAsync` existe?
✅ **Implementar**: P/Invoke + parse resposta

#### PDF 36: `MDFE_StatusServico.pdf`
📖 **Ler**: Consultar status do serviço SEFAZ
🔍 **Verificar**: Método `ObterStatusAsync` existe?
✅ **Implementar**: P/Invoke + parse resposta

#### PDF 37: `MDFE_ConsultaMDFeNaoEnc.pdf`
📖 **Ler**: Consultar MDFes não encerrados por CNPJ
🔍 **Verificar**: Método existe?
✅ **Implementar**: P/Invoke + parse resposta

#### PDF 38: `MDFE_GetPath.pdf`
📖 **Ler**: Obter path onde XML foi salvo
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke + helper

#### PDF 39: `MDFE_GetPathEvento.pdf`
📖 **Ler**: Obter path onde XML de evento foi salvo
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke + helper

---

### **Grupo 7: Eventos do MDFe (9 PDFs)**

#### PDF 40: `Cancelamento.pdf`
📖 **Ler**: ⭐ Formato INI para evento de cancelamento
🔍 **Verificar**: Gerador de INI de cancelamento existe?
✅ **Implementar**:
```csharp
// MDFeEventoIniGenerator.cs
public string GerarIniCancelamento(MDFe mdfe, string justificativa, string protocolo)
{
    var sb = new StringBuilder();
    sb.AppendLine("[EVENTO]");
    sb.AppendLine("idLote=1");
    sb.AppendLine();
    sb.AppendLine("[EVENTO001]");
    sb.AppendLine($"cOrgao={ObterCodigoUF(mdfe.EmitenteUf)}");
    sb.AppendLine($"CNPJCPF={mdfe.EmitenteCnpj}");
    sb.AppendLine($"chMDFe={mdfe.ChaveAcesso}");
    sb.AppendLine($"dhEvento={DateTime.Now:yyyy-MM-ddTHH:mm:ss}");
    sb.AppendLine("tpEvento=110111");
    sb.AppendLine("nSeqEvento=1");
    sb.AppendLine("versaoEvento=3.00");
    sb.AppendLine($"nProt={protocolo}");
    sb.AppendLine($"xJust={justificativa}");
    return sb.ToString();
}
```

#### PDF 41: `MDFE_Cancelar.pdf`
📖 **Ler**: Método para cancelar MDFe
🔍 **Verificar**: Método `CancelarAsync` existe?
✅ **Implementar**: P/Invoke + uso do INI de cancelamento

#### PDF 42: `MDFE_EncerrarMDFe.pdf`
📖 **Ler**: Método para encerrar MDFe
🔍 **Verificar**: Método `EncerrarAsync` existe?
✅ **Implementar**: P/Invoke + gerador INI encerramento

#### PDF 43: `Inclusão de Condutor.pdf`
📖 **Ler**: Formato INI para incluir condutor
🔍 **Verificar**: Gerador existe?
✅ **Implementar**: Método no EventoIniGenerator

#### PDF 44: `Inclusão de DF-e.pdf`
📖 **Ler**: Formato INI para incluir documento fiscal
🔍 **Verificar**: Gerador existe?
✅ **Implementar**: Método no EventoIniGenerator

#### PDF 45: `MDFE_EnviarEvento.pdf`
📖 **Ler**: Método genérico para enviar qualquer evento
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke + uso nos eventos

#### PDF 46: `MDFE_CarregarEventoINI.pdf`
📖 **Ler**: Carregar evento de arquivo INI
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke + uso antes de enviar evento

#### PDF 47: `MDFE_CarregarEventoXML.pdf`
📖 **Ler**: Carregar evento de arquivo XML
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke

#### PDF 48: `MDFE_LimparListaEventos.pdf`
📖 **Ler**: Limpar lista de eventos
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke + uso antes de carregar evento

---

### **Grupo 8: Distribuição DFe (3 PDFs)**

#### PDF 49: `MDFE_DistribuicaoDFePorNSU.pdf`
📖 **Ler**: Baixar documento por NSU específico
🔍 **Verificar**: Método `DistribuicaoPorNSUAsync` existe?
✅ **Implementar**:
```csharp
[DllImport("ACBrMDFe64.dll", CallingConvention = CallingConvention.Cdecl)]
public static extern int MDFE_DistribuicaoDFePorNSU(int AcUFAutor, string eCNPJCPF,
    string eNSU, StringBuilder sResposta, ref int esTamanho);

public async Task<ProviderResult<object>> DistribuicaoPorNSUAsync(string uf, string cnpj, string nsu)
{
    var resposta = new StringBuilder(256000);
    int tamanho = resposta.Capacity;
    int ret = MDFE_DistribuicaoDFePorNSU(ObterCodigoUF(uf), cnpj, nsu, resposta, ref tamanho);
    return ParseDistribuicaoResponse(resposta.ToString());
}
```

#### PDF 50: `MDFE_DistribuicaoDFePorUltNSU.pdf`
📖 **Ler**: Baixar documentos a partir do último NSU
🔍 **Verificar**: Método `DistribuicaoPorUltNSUAsync` existe?
✅ **Implementar**: P/Invoke + parse resposta [DISTRIBUICAODFE]

#### PDF 51: `MDFE_DistribuicaoDFePorChave.pdf`
📖 **Ler**: Baixar documento por chave de acesso
🔍 **Verificar**: Método `DistribuicaoPorChaveAsync` existe?
✅ **Implementar**: P/Invoke + parse resposta

---

### **Grupo 9: Impressão e PDF (7 PDFs)**

#### PDF 52: `MDFE_Imprimir.pdf`
📖 **Ler**: Imprimir DAMDFe direto na impressora
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke

#### PDF 53: `MDFE_ImprimirPDF.pdf`
📖 **Ler**: ⭐ Gerar PDF do DAMDFe
🔍 **Verificar**: Método `GerarPdfAsync` existe?
✅ **Implementar**:
```csharp
[DllImport("ACBrMDFe64.dll", CallingConvention = CallingConvention.Cdecl)]
public static extern int MDFE_ImprimirPDF();

public async Task<ProviderResult<byte[]>> GerarPdfAsync(string chave)
{
    // Carregar MDFe
    MDFE_Consultar(chave);

    // Gerar PDF
    int ret = MDFE_ImprimirPDF();
    if (ret != 0) throw new Exception("Erro gerar PDF");

    // Obter path do PDF
    var pdfPath = MDFE_GetPath(...);

    // Ler bytes
    var bytes = File.ReadAllBytes(pdfPath);
    return ProviderResult<byte[]>.Success(bytes);
}
```

#### PDF 54: `MDFE_SalvarPDF.pdf`
📖 **Ler**: Salvar PDF em arquivo específico
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke

#### PDF 55: `MDFE_ImprimirEvento.pdf`
📖 **Ler**: Imprimir evento (cancelamento, encerramento)
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke

#### PDF 56: `MDFE_ImprimirEventoPDF.pdf`
📖 **Ler**: Gerar PDF de evento
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke

#### PDF 57: `MDFE_SalvarEventoPDF.pdf`
📖 **Ler**: Salvar PDF de evento em arquivo
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke

#### PDF 58: `MDFE_EnviarEmail.pdf`
📖 **Ler**: Enviar MDFe por email
🔍 **Verificar**: Método declarado? Configuração SMTP?
✅ **Implementar**: P/Invoke + configurar SMTP no INI

#### PDF 59: `MDFE_EnviarEmailEvento.pdf`
📖 **Ler**: Enviar evento por email
🔍 **Verificar**: Método declarado?
✅ **Implementar**: P/Invoke

---

### **Grupo 10: Métodos Auxiliares (1 PDF)**

#### PDF 60: `Métodos MDFe.pdf`
📖 **Ler**: Visão geral de todos os métodos MDFe
🔍 **Verificar**: Todos os métodos listados estão declarados?
✅ **Implementar**: Checklist final de cobertura

---

## 🗂️ Checklist de Implementação por Arquivo

### **Backend/Providers/MDFe/Native/AcbrLibMDFeNative.cs**
- [ ] Declarações P/Invoke de TODOS os 60 métodos

### **Backend/Providers/MDFe/AcbrConfigManager.cs**
- [ ] Gerar ACBrLib.ini completo
- [ ] Ler configurações de appsettings.json
- [ ] Configurar certificado
- [ ] Configurar paths absolutos

### **Backend/Services/Ini/MDFeIniGenerator.cs**
- [ ] Implementar TODAS as 40+ seções do INI
- [ ] Validar campos obrigatórios
- [ ] Formatar datas/valores conforme PDF

### **Backend/Services/Ini/MDFeEventoIniGenerator.cs**
- [ ] Gerar INI cancelamento (110111)
- [ ] Gerar INI encerramento (110112)
- [ ] Gerar INI inclusão condutor (110114)
- [ ] Gerar INI inclusão DF-e (110115)

### **Backend/Providers/MDFe/AcbrIniResponseParser.cs**
- [ ] Parse resposta transmissão ([Envio], [Retorno], [MDFeNNN])
- [ ] Parse resposta eventos ([Evento], [EventoNNN])
- [ ] Parse resposta distribuição ([DISTRIBUICAODFE])
- [ ] Parse resposta consultas

### **Backend/Providers/MDFe/AcbrLibMDFeProvider.cs**
- [ ] Implementar TODOS os métodos de IMDFeProvider
- [ ] Inicialização e finalização corretas
- [ ] Tratamento de erros com UltimoRetorno
- [ ] Logging de todas operações

---

## 🚀 Ordem de Implementação Recomendada

1. **PDFs 01-04**: Ler documentação geral
2. **PDFs 05-11**: Configuração
3. **PDFs 12-16**: Inicialização
4. **PDFs 17-19**: Geração INI
5. **PDFs 20-32**: Manipulação MDFe
6. **PDFs 33-39**: Transmissão e consultas
7. **PDFs 40-48**: Eventos
8. **PDFs 49-51**: Distribuição
9. **PDFs 52-59**: PDF e Email
10. **PDF 60**: Revisão final

---

## ⚠️ REGRA DE OURO

Para **CADA UM DOS 60 PDFs**:
1. 📖 **LER** completamente o PDF
2. 🔍 **VERIFICAR** se já existe código relacionado
3. ✅ **IMPLEMENTAR** conforme especificação exata do PDF

**NÃO PULE NENHUM PDF!** Cada um contém detalhes essenciais.

---

**Data de Criação**: 2025-10-09
**Versão**: 3.0 (Todos os 60 PDFs Listados)
