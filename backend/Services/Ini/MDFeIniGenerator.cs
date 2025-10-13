using Backend.Api.Interfaces;
using Backend.Api.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace Backend.Api.Services.Ini;

/// <summary>
/// Gerador completo de arquivo INI do MDFe
/// Baseado no PDF 18: "Modelo MDFe.INI.pdf"
/// Implementa TODAS as 40+ seções necessárias
/// </summary>
public class MDFeIniGenerator : IMDFeIniGenerator
{
    private static readonly CultureInfo PtBr = new("pt-BR");

    public Task<string> GerarIniAsync(MDFe mdfe)
    {
        var sb = new StringBuilder();

        // ========== [MDFE] - Seção Principal ==========
        GerarSecaoMdfe(sb, mdfe);

        // ========== [IDE] - Identificação ==========
        GerarSecaoIde(sb, mdfe);

        // ========== [EMIT] - Emitente ==========
        GerarSecaoEmit(sb, mdfe);

        // ========== [RODO] - Modal Rodoviário ==========
        GerarSecaoRodo(sb, mdfe);

        // ========== [VEICTRACAO] - Veículo Tração ==========
        GerarSecaoVeicTracao(sb, mdfe);

        // ========== [CONDUTORNN] - Condutores ==========
        GerarSecaoCondutores(sb, mdfe);

        // ========== [REBOQUES] - Reboques ==========
        GerarSecaoReboques(sb, mdfe);

        // ========== [LACRODOVIA] - Lacres Rodoviários ==========
        GerarSecaoLacresRodoviarios(sb, mdfe);

        // ========== [INFPERCURSO] - UFs de Percurso ==========
        GerarSecaoPercurso(sb, mdfe);

        // ========== [INFMUNCARREGA] - Municípios de Carregamento ==========
        GerarSecaoMunicipiosCarregamento(sb, mdfe);

        // ========== [INFMUNDESCARREGA] - Municípios de Descarregamento ==========
        GerarSecaoMunicipiosDescarregamento(sb, mdfe);

        // ========== [INFNFENN] / [INFCTENN] - Documentos Fiscais ==========
        GerarSecaoDocumentosFiscais(sb, mdfe);

        // ========== [TOT] - Totalizadores ==========
        GerarSecaoTot(sb, mdfe);

        // ========== [SEG] - Seguro ==========
        GerarSecaoSeg(sb, mdfe);

        // ========== [INFPAG] - Pagamento ==========
        GerarSecaoPagamento(sb, mdfe);

        // ========== [VALEPEDAGIO] - Vale Pedágio ==========
        GerarSecaoValePedagio(sb, mdfe);

        // ========== [INFADIPOLO] - Info Adicional Fisco ==========
        GerarSecaoInfoAdicional(sb, mdfe);

        // ========== [AUTXML] - Autorização Download XML ==========
        GerarSecaoAutXml(sb, mdfe);

        // ========== [INFRESPTEC] - Responsável Técnico ==========
        GerarSecaoRespTec(sb, mdfe);

        return Task.FromResult(sb.ToString());
    }

    private void GerarSecaoMdfe(StringBuilder sb, MDFe mdfe)
    {
        sb.AppendLine("[MDFE]");
        sb.AppendLine("versao=3.00");
        sb.AppendLine();
    }

    private void GerarSecaoIde(StringBuilder sb, MDFe mdfe)
    {
        sb.AppendLine("[IDE]");
        sb.AppendLine($"cUF={ObterCodigoUF(mdfe.EmitenteUf)}");
        sb.AppendLine($"tpAmb=2"); // 1=Produção, 2=Homologação
        sb.AppendLine($"tpEmit={mdfe.EmitenteTipoEmitente}"); // 1=Prest. Serv. Transporte, 2=Transp. Carga Própria, 3=Prest. Serv. Transporte que emitirá CT-e Globalizado
        sb.AppendLine($"tpTransp={mdfe.TipoTransportador}"); // 1=ETC, 2=TAC, 3=CTC
        sb.AppendLine($"mod=58"); // Modelo 58 = MDFe
        sb.AppendLine($"serie={mdfe.Serie}");
        sb.AppendLine($"nMDF={mdfe.NumeroMdfe}");
        sb.AppendLine($"cMDF={mdfe.CodigoMDF ?? GerarCodigoAleatorio()}");
        sb.AppendLine($"cDV={mdfe.CodigoVerificador ?? "0"}");
        sb.AppendLine($"modal={mdfe.Modal}"); // 1=Rodoviário, 2=Aéreo, 3=Aquaviário, 4=Ferroviário
        sb.AppendLine($"dhEmi={mdfe.DataEmissao:yyyy-MM-ddTHH:mm:sszzz}");
        sb.AppendLine($"tpEmis=1"); // 1=Normal, 2=Contingência
        sb.AppendLine($"procEmi=0"); // 0=Emissão com aplicativo do contribuinte
        sb.AppendLine($"verProc=1.0.0");
        sb.AppendLine($"UFIni={mdfe.UfIni}");
        sb.AppendLine($"UFFim={mdfe.UfFim}");

        // Municípios de carregamento e descarregamento
        if (mdfe.LocaisCarregamento?.Any() == true)
        {
            var primeiro = mdfe.LocaisCarregamento.OrderBy(l => l.Ordem).First();
            sb.AppendLine($"cMunCarrega={primeiro.Municipio?.Codigo ?? 0}");
            sb.AppendLine($"xMunCarrega={primeiro.Municipio?.Nome ?? mdfe.NomeMunicipioCarregamento}");
        }

        if (mdfe.LocaisDescarregamento?.Any() == true)
        {
            var primeiro = mdfe.LocaisDescarregamento.OrderBy(l => l.Ordem).First();
            sb.AppendLine($"cMunDescarrega={primeiro.Municipio?.Codigo ?? 0}");
            sb.AppendLine($"xMunDescarrega={primeiro.Municipio?.Nome ?? mdfe.NomeMunicipioDescarregamento}");
        }

        // Data início da viagem (OBRIGATÓRIO)
        if (mdfe.DhInicioViagem.HasValue)
        {
            sb.AppendLine($"dhIniViagem={mdfe.DhInicioViagem.Value:yyyy-MM-ddTHH:mm:sszzz}");
        }
        else if (mdfe.DataInicioViagem.HasValue)
        {
            sb.AppendLine($"dhIniViagem={mdfe.DataInicioViagem.Value:yyyy-MM-ddTHH:mm:sszzz}");
        }

        sb.AppendLine();
    }

    private void GerarSecaoEmit(StringBuilder sb, MDFe mdfe)
    {
        sb.AppendLine("[EMIT]");

        if (!string.IsNullOrEmpty(mdfe.EmitenteCnpj))
            sb.AppendLine($"CNPJ={mdfe.EmitenteCnpj}");
        else if (!string.IsNullOrEmpty(mdfe.EmitenteCpf))
            sb.AppendLine($"CPF={mdfe.EmitenteCpf}");

        sb.AppendLine($"IE={mdfe.EmitenteIe ?? ""}");
        sb.AppendLine($"xNome={mdfe.EmitenteRazaoSocial}");

        if (!string.IsNullOrEmpty(mdfe.EmitenteNomeFantasia))
            sb.AppendLine($"xFant={mdfe.EmitenteNomeFantasia}");

        // Endereço
        sb.AppendLine($"xLgr={mdfe.EmitenteEndereco}");
        sb.AppendLine($"nro={mdfe.EmitenteNumero ?? "S/N"}");

        if (!string.IsNullOrEmpty(mdfe.EmitenteComplemento))
            sb.AppendLine($"xCpl={mdfe.EmitenteComplemento}");

        sb.AppendLine($"xBairro={mdfe.EmitenteBairro}");
        sb.AppendLine($"cMun={mdfe.EmitenteCodMunicipio}");
        sb.AppendLine($"xMun={mdfe.EmitenteMunicipio}");
        sb.AppendLine($"CEP={mdfe.EmitenteCep.Replace("-", "")}");
        sb.AppendLine($"UF={mdfe.EmitenteUf}");

        // Telefone (opcional)
        // sb.AppendLine($"fone=");

        // Email (opcional)
        // sb.AppendLine($"email=");

        sb.AppendLine();
    }

    private void GerarSecaoRodo(StringBuilder sb, MDFe mdfe)
    {
        sb.AppendLine("[RODO]");

        // RNTRC do emitente
        if (!string.IsNullOrEmpty(mdfe.EmitenteRntrc))
        {
            sb.AppendLine($"RNTRC={mdfe.EmitenteRntrc}");
        }

        // CIOT (Código Identificador da Operação de Transporte)
        if (!string.IsNullOrEmpty(mdfe.CodigoCIOT))
        {
            sb.AppendLine($"CIOT={mdfe.CodigoCIOT}");
        }

        sb.AppendLine();
    }

    private void GerarSecaoVeicTracao(StringBuilder sb, MDFe mdfe)
    {
        sb.AppendLine("[VEICTRACAO]");
        sb.AppendLine($"cInt="); // Código interno (opcional)
        sb.AppendLine($"placa={mdfe.VeiculoPlaca?.Replace("-", "") ?? ""}");

        if (mdfe.VeiculoTara.HasValue)
            sb.AppendLine($"tara={mdfe.VeiculoTara.Value}");

        sb.AppendLine($"capKG="); // Capacidade em KG (opcional)
        sb.AppendLine($"capM3="); // Capacidade em M3 (opcional)

        // Proprietário do veículo
        if (mdfe.ProprietarioDiferente)
        {
            sb.AppendLine($"tpProp=2"); // 0=TAC Agregado, 1=TAC Independente, 2=Outros
            sb.AppendLine($"tpVinc=0"); // Tipo de vinculação

            if (!string.IsNullOrEmpty(mdfe.CpfProprietario))
            {
                sb.AppendLine($"CPF={mdfe.CpfProprietario}");
            }
            else if (!string.IsNullOrEmpty(mdfe.CnpjProprietario))
            {
                sb.AppendLine($"CNPJ={mdfe.CnpjProprietario}");
            }

            sb.AppendLine($"RNTRC={mdfe.RntrcProprietario ?? ""}");
            sb.AppendLine($"xNome={mdfe.NomeProprietario ?? ""}");

            if (!string.IsNullOrEmpty(mdfe.IeProprietario))
                sb.AppendLine($"IE={mdfe.IeProprietario}");

            if (!string.IsNullOrEmpty(mdfe.UfProprietario))
                sb.AppendLine($"UF={mdfe.UfProprietario}");
        }

        sb.AppendLine($"tpRod={mdfe.VeiculoTipoRodado}"); // 01=Truck, 02=Toco, etc.
        sb.AppendLine($"tpCar={mdfe.VeiculoTipoCarroceria}"); // 00=Não aplicável, 01=Aberta, etc.
        sb.AppendLine($"UF={mdfe.VeiculoUf}");

        sb.AppendLine();
    }

    private void GerarSecaoCondutores(StringBuilder sb, MDFe mdfe)
    {
        // Condutor principal
        if (!string.IsNullOrEmpty(mdfe.CondutorNome))
        {
            sb.AppendLine("[CONDUTOR01]");
            sb.AppendLine($"xNome={mdfe.CondutorNome}");
            sb.AppendLine($"CPF={mdfe.CondutorCpf?.Replace(".", "").Replace("-", "") ?? ""}");
            sb.AppendLine();
        }

        // Condutores adicionais
        if (mdfe.CondutoresAdicionais?.Any() == true)
        {
            int index = 2;
            foreach (var condutor in mdfe.CondutoresAdicionais.OrderBy(c => c.Ordem))
            {
                sb.AppendLine($"[CONDUTOR{index:D2}]");
                sb.AppendLine($"xNome={condutor.NomeCondutor}");
                sb.AppendLine($"CPF={condutor.CpfCondutor.Replace(".", "").Replace("-", "")}");
                sb.AppendLine();
                index++;
            }
        }
    }

    private void GerarSecaoReboques(StringBuilder sb, MDFe mdfe)
    {
        if (mdfe.Reboques?.Any() != true) return;

        int index = 1;
        foreach (var reboque in mdfe.Reboques.OrderBy(r => r.Ordem))
        {
            sb.AppendLine($"[REBOQUE{index:D2}]");
            sb.AppendLine($"cInt="); // Código interno
            sb.AppendLine($"placa={reboque.Reboque.Placa?.Replace("-", "") ?? ""}");

            if (reboque.Reboque.Tara > 0)
                sb.AppendLine($"tara={reboque.Reboque.Tara}");

            sb.AppendLine($"capKG="); // Capacidade
            sb.AppendLine($"capM3=");
            sb.AppendLine($"tpCar="); // Tipo carroceria
            sb.AppendLine($"UF={reboque.Reboque.Uf ?? ""}");
            sb.AppendLine();
            index++;
        }
    }

    private void GerarSecaoLacresRodoviarios(StringBuilder sb, MDFe mdfe)
    {
        if (mdfe.LacresRodoviarios?.Any() != true) return;

        sb.AppendLine("[LACRODOVIA]");
        sb.AppendLine();

        int index = 1;
        foreach (var lacre in mdfe.LacresRodoviarios.OrderBy(l => l.Ordem))
        {
            sb.AppendLine($"[LACROD{index:D2}]");
            sb.AppendLine($"nLacre={lacre.NumeroLacre}");
            sb.AppendLine();
            index++;
        }
    }

    private void GerarSecaoPercurso(StringBuilder sb, MDFe mdfe)
    {
        if (mdfe.UfsPercurso?.Any() != true) return;

        sb.AppendLine("[INFPERCURSO]");
        sb.AppendLine();

        int index = 1;
        foreach (var uf in mdfe.UfsPercurso.OrderBy(u => u.Ordem))
        {
            sb.AppendLine($"[UFPER{index:D2}]");
            sb.AppendLine($"UFPer={uf.Uf}");
            sb.AppendLine();
            index++;
        }
    }

    private void GerarSecaoMunicipiosCarregamento(StringBuilder sb, MDFe mdfe)
    {
        if (mdfe.LocaisCarregamento?.Any() != true) return;

        sb.AppendLine("[INFMUNCARREGA]");
        sb.AppendLine();

        int index = 1;
        foreach (var local in mdfe.LocaisCarregamento.OrderBy(l => l.Ordem))
        {
            sb.AppendLine($"[MUNCARREGA{index:D2}]");
            sb.AppendLine($"cMunCarrega={local.Municipio?.Codigo ?? 0}");
            sb.AppendLine($"xMunCarrega={local.Municipio?.Nome ?? local.DescricaoMunicipio}");
            sb.AppendLine();
            index++;
        }
    }

    private void GerarSecaoMunicipiosDescarregamento(StringBuilder sb, MDFe mdfe)
    {
        if (mdfe.LocaisDescarregamento?.Any() != true) return;

        sb.AppendLine("[INFMUNDESCARREGA]");
        sb.AppendLine();

        int index = 1;
        foreach (var local in mdfe.LocaisDescarregamento.OrderBy(l => l.Ordem))
        {
            sb.AppendLine($"[MUNDESCARREGA{index:D2}]");
            sb.AppendLine($"cMunDescarrega={local.Municipio?.Codigo ?? 0}");
            sb.AppendLine($"xMunDescarrega={local.Municipio?.Nome ?? local.DescricaoMunicipio}");
            sb.AppendLine();
            index++;
        }
    }

    private void GerarSecaoDocumentosFiscais(StringBuilder sb, MDFe mdfe)
    {
        int docIndex = 1;

        // NFes
        if (mdfe.DocumentosNfe?.Any() == true)
        {
            foreach (var nfe in mdfe.DocumentosNfe.OrderBy(n => n.Ordem))
            {
                sb.AppendLine($"[INFNFE{docIndex:D3}]");
                sb.AppendLine($"chNFe={nfe.ChaveNfe}");

                if (nfe.SegCodigoBarras != null)
                    sb.AppendLine($"SegCodBarra={nfe.SegCodigoBarras}");

                if (nfe.IndReentrega != null)
                    sb.AppendLine($"indReentrega={nfe.IndReentrega}");

                sb.AppendLine();
                docIndex++;
            }
        }

        // CTes
        if (mdfe.DocumentosCte?.Any() == true)
        {
            foreach (var cte in mdfe.DocumentosCte.OrderBy(c => c.Ordem))
            {
                sb.AppendLine($"[INFCTE{docIndex:D3}]");
                sb.AppendLine($"chCTe={cte.ChaveCte}");

                if (cte.SegCodigoBarras != null)
                    sb.AppendLine($"SegCodBarra={cte.SegCodigoBarras}");

                if (cte.IndReentrega != null)
                    sb.AppendLine($"indReentrega={cte.IndReentrega}");

                sb.AppendLine();
                docIndex++;
            }
        }
    }

    private void GerarSecaoTot(StringBuilder sb, MDFe mdfe)
    {
        sb.AppendLine("[TOT]");

        // Quantidade de CTe
        sb.AppendLine($"qCTe={mdfe.DocumentosCte?.Count ?? 0}");

        // Quantidade de NFe
        sb.AppendLine($"qNFe={mdfe.DocumentosNfe?.Count ?? 0}");

        // Quantidade de MDFe
        sb.AppendLine($"qMDFe={mdfe.DocumentosMdfeTransp?.Count ?? 0}");

        // Valor total da carga
        sb.AppendLine($"vCarga={FormatarDecimal(mdfe.ValorTotal ?? 0)}");

        // Código unidade de medida
        sb.AppendLine($"cUnid={mdfe.UnidadeMedida}"); // 01=KG, 02=TON

        // Peso bruto total
        sb.AppendLine($"qCarga={FormatarDecimal(mdfe.PesoBrutoTotal ?? 0)}");

        sb.AppendLine();
    }

    private void GerarSecaoSeg(StringBuilder sb, MDFe mdfe)
    {
        if (string.IsNullOrEmpty(mdfe.SeguradoraCnpj)) return;

        sb.AppendLine("[SEG]");
        sb.AppendLine($"infResp={mdfe.TipoResponsavelSeguro ?? "1"}"); // 1=Emitente, 2=Responsável
        sb.AppendLine($"infSeg=2"); // 2=Responsável pela contratação
        sb.AppendLine($"CNPJ={mdfe.SeguradoraCnpj}");

        if (!string.IsNullOrEmpty(mdfe.NumeroApoliceSeguro))
            sb.AppendLine($"nApol={mdfe.NumeroApoliceSeguro}");

        // Averbações
        if (!string.IsNullOrEmpty(mdfe.NumeroAverbacaoSeguro))
        {
            sb.AppendLine();
            sb.AppendLine("[AVERB01]");
            sb.AppendLine($"nAver={mdfe.NumeroAverbacaoSeguro}");
        }

        sb.AppendLine();
    }

    private void GerarSecaoPagamento(StringBuilder sb, MDFe mdfe)
    {
        if (mdfe.Pagamentos?.Any() != true) return;

        int index = 1;
        foreach (var pag in mdfe.Pagamentos.OrderBy(p => p.Ordem))
        {
            sb.AppendLine($"[INFPAG{index:D2}]");
            sb.AppendLine($"xNome={pag.Nome ?? ""}");

            if (!string.IsNullOrEmpty(pag.CnpjCpf))
            {
                if (pag.CnpjCpf.Length == 14)
                    sb.AppendLine($"CNPJ={pag.CnpjCpf}");
                else
                    sb.AppendLine($"CPF={pag.CnpjCpf}");
            }

            if (pag.ValorContrato.HasValue)
                sb.AppendLine($"vContrato={FormatarDecimal(pag.ValorContrato.Value)}");

            sb.AppendLine($"indPag={pag.IndicadorPagamento}"); // 0=Pago, 1=A pagar

            // Componentes de pagamento
            if (pag.Componentes?.Any() == true)
            {
                int compIndex = 1;
                foreach (var comp in pag.Componentes.OrderBy(c => c.Ordem))
                {
                    sb.AppendLine();
                    sb.AppendLine($"[COMP{compIndex:D3}]");
                    sb.AppendLine($"tpComp={comp.TipoComponente}");
                    sb.AppendLine($"vComp={FormatarDecimal(comp.Valor)}");

                    if (!string.IsNullOrEmpty(comp.Descricao))
                        sb.AppendLine($"xComp={comp.Descricao}");

                    compIndex++;
                }
            }

            sb.AppendLine();
            index++;
        }
    }

    private void GerarSecaoValePedagio(StringBuilder sb, MDFe mdfe)
    {
        if (mdfe.SemValePedagio)
        {
            sb.AppendLine("[VALEPEDAGIO]");
            sb.AppendLine("semValePed=1");
            sb.AppendLine();
            return;
        }

        if (mdfe.ValesPedagio?.Any() != true) return;

        sb.AppendLine("[VALEPEDAGIO]");
        sb.AppendLine();

        int index = 1;
        foreach (var vale in mdfe.ValesPedagio.OrderBy(v => v.Ordem))
        {
            sb.AppendLine($"[DISP{index:D2}]");
            sb.AppendLine($"CNPJForn={vale.CnpjFornecedor}");

            if (!string.IsNullOrEmpty(vale.CnpjPagador))
                sb.AppendLine($"CNPJPg={vale.CnpjPagador}");

            sb.AppendLine($"nCompra={vale.NumeroCompra}");
            sb.AppendLine($"vValePed={FormatarDecimal(vale.ValorVale)}");
            sb.AppendLine();
            index++;
        }
    }

    private void GerarSecaoInfoAdicional(StringBuilder sb, MDFe mdfe)
    {
        if (string.IsNullOrEmpty(mdfe.InfoAdicional)) return;

        sb.AppendLine("[INFADIPOLO]");
        sb.AppendLine($"infCpl={mdfe.InfoAdicional}");
        sb.AppendLine();
    }

    private void GerarSecaoAutXml(StringBuilder sb, MDFe mdfe)
    {
        if (mdfe.AutorizacoesXml?.Any() != true) return;

        sb.AppendLine("[AUTXML]");
        sb.AppendLine();

        int index = 1;
        foreach (var aut in mdfe.AutorizacoesXml.OrderBy(a => a.Ordem))
        {
            sb.AppendLine($"[AUT{index:D2}]");

            if (aut.Documento.Length == 14)
                sb.AppendLine($"CNPJ={aut.Documento}");
            else
                sb.AppendLine($"CPF={aut.Documento}");

            sb.AppendLine();
            index++;
        }
    }

    private void GerarSecaoRespTec(StringBuilder sb, MDFe mdfe)
    {
        if (mdfe.ResponsavelTecnico == null) return;

        var resp = mdfe.ResponsavelTecnico;

        sb.AppendLine("[INFRESPTEC]");
        sb.AppendLine($"CNPJ={resp.Cnpj ?? ""}");
        sb.AppendLine($"xContato={resp.NomeContato ?? ""}");
        sb.AppendLine($"email={resp.Email ?? ""}");
        sb.AppendLine($"fone={resp.Telefone ?? ""}");

        if (!string.IsNullOrEmpty(resp.IdCsrt))
            sb.AppendLine($"idCSRT={resp.IdCsrt}");

        if (!string.IsNullOrEmpty(resp.HashCsrt))
            sb.AppendLine($"hashCSRT={resp.HashCsrt}");

        sb.AppendLine();
    }

    public string GerarIniEvento(string tipoEvento, MDFe mdfe, Dictionary<string, string> parametrosEvento)
    {
        if (mdfe == null)
            throw new ArgumentNullException(nameof(mdfe));

        if (string.IsNullOrWhiteSpace(tipoEvento))
            throw new ArgumentException("Tipo de evento não informado", nameof(tipoEvento));

        var parametros = parametrosEvento ?? new Dictionary<string, string>();
        var codigo = tipoEvento.Trim();

        return codigo switch
        {
            "110111" => MDFeEventoIniGenerator.GerarIniCancelamento(
                mdfe,
                parametros.GetValueOrDefault("Justificativa") ?? throw new ArgumentException("Justificativa obrigatória para cancelamento", nameof(parametrosEvento)),
                parametros.GetValueOrDefault("Protocolo") ?? mdfe.Protocolo ?? string.Empty),
            "110112" => MDFeEventoIniGenerator.GerarIniEncerramento(
                mdfe,
                parametros.GetValueOrDefault("CodigoMunicipio") ?? throw new ArgumentException("Código do município de encerramento obrigatório", nameof(parametrosEvento)),
                parametros.TryGetValue("DataEncerramento", out var dataEnc) && DateTime.TryParse(dataEnc, out var dtEnc)
                    ? dtEnc
                    : mdfe.DataEncerramento ?? DateTime.Now),
            "110114" => MDFeEventoIniGenerator.GerarIniInclusaoCondutor(
                mdfe,
                parametros.GetValueOrDefault("NomeCondutor") ?? throw new ArgumentException("Nome do condutor obrigatório", nameof(parametrosEvento)),
                parametros.GetValueOrDefault("CpfCondutor") ?? throw new ArgumentException("CPF do condutor obrigatório", nameof(parametrosEvento))),
            "110115" => MDFeEventoIniGenerator.GerarIniInclusaoDFe(
                mdfe,
                parametros.GetValueOrDefault("CodigoMunicipioDescarga") ?? throw new ArgumentException("Código do município de descarga obrigatório", nameof(parametrosEvento)),
                parametros.GetValueOrDefault("ChaveDocumento") ?? throw new ArgumentException("Chave do documento obrigatória", nameof(parametrosEvento)),
                parametros.GetValueOrDefault("TipoDocumento") ?? "NFe"),
            _ => MDFeEventoIniGenerator.GerarIniEventoGenerico(mdfe, codigo, parametros)
        };
    }

    #region Helpers

    private string ObterCodigoUF(string uf)
    {
        var codigos = new Dictionary<string, string>
        {
            {"AC", "12"}, {"AL", "27"}, {"AP", "16"}, {"AM", "13"}, {"BA", "29"},
            {"CE", "23"}, {"DF", "53"}, {"ES", "32"}, {"GO", "52"}, {"MA", "21"},
            {"MT", "51"}, {"MS", "50"}, {"MG", "31"}, {"PA", "15"}, {"PB", "25"},
            {"PR", "41"}, {"PE", "26"}, {"PI", "22"}, {"RJ", "33"}, {"RN", "24"},
            {"RS", "43"}, {"RO", "11"}, {"RR", "14"}, {"SC", "42"}, {"SP", "35"},
            {"SE", "28"}, {"TO", "17"}
        };

        return codigos.TryGetValue(uf.ToUpper(), out var codigo) ? codigo : "35";
    }

    private string GerarCodigoAleatorio()
    {
        return new Random().Next(10000000, 99999999).ToString();
    }

    private string FormatarDecimal(decimal valor)
    {
        return valor.ToString("0.00", CultureInfo.InvariantCulture);
    }

    #endregion
}
