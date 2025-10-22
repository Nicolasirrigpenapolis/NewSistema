using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Backend.Api.Interfaces;
using Backend.Api.DTOs;
using System.Linq;
using Backend.Api.Models;
using Backend.Api.Providers.MDFe;

namespace Backend.Api.Controllers
{
    /// <summary>
    /// Controller responsável pelas operações do MDFe (CRUD + SEFAZ)
    /// </summary>
    [ApiController]
    [Route("api/mdfe")]
    // [Authorize] // REMOVIDO para desenvolvimento - Exigir autenticação para todas as operações
    public class MDFeBasicController : ControllerBase
    {
        private readonly IMDFeBusinessService _mdfeBusinessService;
        private readonly IMDFeService _mdfeService;
        private readonly ILogger<MDFeBasicController> _logger;

        public MDFeBasicController(
            IMDFeBusinessService mdfeBusinessService,
            IMDFeService mdfeService,
            ILogger<MDFeBasicController> logger)
        {
            _mdfeBusinessService = mdfeBusinessService;
            _mdfeService = mdfeService;
            _logger = logger;
        }

        /// <summary>
        /// Listar MDFes com paginação
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<PagedResult<MDFeResponseDto>>> GetMDFes(
            [FromQuery] int? emitenteId,
            [FromQuery] int pagina = 1,
            [FromQuery] int tamanhoPagina = 10)
        {
            try
            {
                var result = await _mdfeBusinessService.GetMDFesAsync(emitenteId, pagina, tamanhoPagina);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar MDFes");
                return StatusCode(500, new { message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Obter MDFe por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<MDFe>> GetMDFe(int id)
        {
            try
            {
                var mdfe = await _mdfeBusinessService.GetMDFeByIdAsync(id);
                if (mdfe == null)
                    return NotFound(new { message = "MDFe não encontrado" });

                return Ok(mdfe);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar MDFe {Id}", id);
                return StatusCode(500, new { message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Criar novo MDFe em branco (estado "Em Digitação")
        /// </summary>
        [HttpPost("novo")]
        public async Task<ActionResult> NovoMDFe()
        {
            try
            {
                _logger.LogInformation("[MDFe] Iniciando criação de novo MDF-e em branco");

                var mdfe = await _mdfeBusinessService.CreateBlankMDFeAsync();
                
                _logger.LogInformation("[MDFe] MDF-e criado com sucesso. ID: {Id}, Status: {Status}", 
                    mdfe.Id, mdfe.StatusSefaz);

                return Ok(new 
                { 
                    id = mdfe.Id,
                    numero = mdfe.NumeroMdfe,
                    serie = mdfe.Serie,
                    status = mdfe.StatusSefaz,
                    message = "MDF-e criado com sucesso. Complete os dados para transmissão."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MDFe] Erro ao criar novo MDF-e em branco");
                return StatusCode(500, new { message = "Erro ao criar MDF-e: " + ex.Message });
            }
        }

        /// <summary>
        /// Criar novo MDFe
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<MDFe>> CreateMDFe(MDFeCreateDto mdfeDto)
        {
            try
            {
                var mdfe = await _mdfeBusinessService.CreateMDFeAsync(mdfeDto);
                return CreatedAtAction(nameof(GetMDFe), new { id = mdfe.Id }, mdfe);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar MDFe");
                return StatusCode(500, new { message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Atualizar MDFe
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<MDFe>> UpdateMDFe(int id, MDFeCreateDto mdfeDto)
        {
            try
            {
                var mdfe = await _mdfeBusinessService.UpdateMDFeAsync(id, mdfeDto);
                if (mdfe == null)
                    return NotFound(new { message = "MDFe não encontrado" });

                return Ok(mdfe);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar MDFe {Id}", id);
                return StatusCode(500, new { message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Excluir MDFe
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMDFe(int id)
        {
            try
            {
                var success = await _mdfeBusinessService.DeleteMDFeAsync(id);
                if (!success)
                    return NotFound(new { message = "MDFe não encontrado" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao excluir MDFe {Id}", id);
                return StatusCode(500, new { message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Obter próximo número do MDFe
        /// </summary>
        [HttpGet("proximo-numero")]
        public async Task<ActionResult<int>> ObterProximoNumero([FromQuery] string? emitenteCnpj)
        {
            try
            {
                var proximoNumero = await _mdfeBusinessService.GetProximoNumeroAsync(emitenteCnpj);
                return Ok(proximoNumero);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter próximo número");
                return StatusCode(500, new { message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Gerar MDFe
        /// </summary>
        [HttpPost("{id}/gerar")]
        public async Task<ActionResult> GerarMDFe(int id)
        {
            try
            {
                var xml = await _mdfeService.GerarXmlAsync(id);
                if (string.IsNullOrEmpty(xml))
                    return BadRequest(new { message = "Erro ao gerar XML do MDFe" });

                return Ok(new { xml, sucesso = true, mensagem = "MDFe gerado com sucesso" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar MDFe {Id}", id);
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Transmitir MDFe para SEFAZ
        /// </summary>
        [HttpPost("{id}/transmitir")]
        public async Task<ActionResult> TransmitirMDFe(int id)
        {
            try
            {
                var resultado = await _mdfeService.TransmitirAsync(id);
                return Ok(new { resultado, sucesso = true, mensagem = "MDFe transmitido com sucesso" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao transmitir MDFe {Id}", id);
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Gerar e baixar PDF do DAMDFE
        /// </summary>
        [HttpGet("{id}/pdf")]
        public async Task<ActionResult> BaixarPDF(int id)
        {
            try
            {
                var pdfBytes = await _mdfeService.GerarPDFAsync(id);

                // Buscar o MDFe para pegar o número
                var mdfe = await _mdfeService.GetByIdAsync(id);
                var numero = mdfe?.NumeroMdfe.ToString().PadLeft(9, '0') ?? id.ToString();
                var nomeArquivo = $"DAMDFE_{numero}_{DateTime.Now:yyyyMMdd}.pdf";

                return File(pdfBytes, "application/pdf", nomeArquivo);
            }
            catch (FileNotFoundException ex)
            {
                _logger.LogWarning(ex, "XML do MDFe {Id} não encontrado", id);
                return NotFound(new { sucesso = false, mensagem = "XML do MDFe não encontrado. O MDFe foi transmitido?" });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Erro ao gerar PDF do MDFe {Id}", id);
                return BadRequest(new { sucesso = false, mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar PDF do MDFe {Id}", id);
                return StatusCode(500, new { sucesso = false, mensagem = "Erro ao gerar PDF do DAMDFE" });
            }
        }

        /// <summary>
        /// Consultar status do MDFe na SEFAZ
        /// </summary>
        [HttpPost("consultar-status")]
        public async Task<ActionResult> ConsultarStatus([FromBody] ConsultarStatusRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.ChaveAcesso))
                {
                    return BadRequest(new { sucesso = false, mensagem = "Chave de acesso não informada" });
                }
                var resultado = await _mdfeService.ConsultarPorChaveAsync(request.ChaveAcesso);
                return Ok(new { sucesso = true, mensagem = "Consulta realizada com sucesso", dados = resultado });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao consultar status do MDFe");
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Carregar INI do MDFe
        /// </summary>
        [HttpPost("carregar-ini")]
        public async Task<ActionResult> CarregarINI([FromBody] MDFeCreateDto mdfeData)
        {
            try
            {
                var mdfe = await _mdfeBusinessService.CreateMDFeAsync(mdfeData);
                return Ok(new { sucesso = true, mensagem = "MDFe criado a partir do INI", dados = mdfe });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { sucesso = false, mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao carregar INI");
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Gerar INI simplificado
        /// </summary>
        [HttpPost("gerar-ini")]
        public async Task<ActionResult> GerarINI([FromBody] MDFeGerarINIDto dados)
        {
            try
            {
                var iniContent = await _mdfeService.GerarINIAsync(dados);
                return Ok(new { sucesso = true, mensagem = "INI gerado com sucesso", ini = iniContent });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar INI");
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Compara um INI arbitr�rio com o modelo oficial e retorna diverg�ncias.
        /// </summary>
        [HttpPost("validar-ini")]
        public ActionResult ValidarIni([FromBody] ValidarIniRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.IniConteudo))
            {
                return BadRequest(new { sucesso = false, mensagem = "Conte�do INI n�o informado" });
            }

            try
            {
                var resultado = _mdfeService.CompararIniComModelo(request.IniConteudo);
                return Ok(new
                {
                    sucesso = resultado.IsMatch,
                    conforme = resultado.IsMatch,
                    divergencias = resultado,
                    mensagem = resultado.IsMatch ? "INI est� conforme o modelo" : "INI possui diverg�ncias em rela��o ao modelo"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao validar INI");
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }

        /// <summary>`r`n        /// Salvar rascunho (CREATE ou UPDATE)
        /// </summary>
        [HttpPost("salvar-rascunho")]
        public async Task<ActionResult> SalvarRascunho([FromBody] SalvarRascunhoDto dados)
        {
            try
            {
                var mdfe = await _mdfeBusinessService.SalvarRascunhoAsync(dados);
                return Ok(new { sucesso = true, mensagem = "Rascunho salvo com sucesso", id = mdfe.Id });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { sucesso = false, mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao salvar rascunho");
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Carregar rascunho
        /// </summary>
        [HttpGet("carregar-rascunho/{id}")]
        public async Task<ActionResult> CarregarRascunho(int id)
        {
            try
            {
                var mdfe = await _mdfeBusinessService.GetMDFeByIdAsync(id);
                if (mdfe == null)
                    return NotFound(new { sucesso = false, mensagem = "Rascunho não encontrado" });

                if (mdfe.StatusSefaz != "RASCUNHO")
                    return BadRequest(new { sucesso = false, mensagem = "Este MDFe não é mais um rascunho" });

                return Ok(new { sucesso = true, mensagem = "Rascunho carregado com sucesso", dados = mdfe });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao carregar rascunho {Id}", id);
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Obter status do serviço
        /// </summary>
        [HttpGet("status")]
        public async Task<ActionResult> ObterStatus()
        {
            try
            {
                var status = await _mdfeService.ObterStatusServicoAsync();
                return Ok(new { sucesso = true, mensagem = "Status do serviço obtido com sucesso", dados = status, timestamp = DateTime.UtcNow });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter status");
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Consultar MDFe por chave de acesso
        /// </summary>
        [HttpGet("consultar/{chave}")]
        public async Task<ActionResult> ConsultarPorChave(string chave)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(chave))
                    return BadRequest(new { sucesso = false, mensagem = "Chave não informada" });
                var resultado = await _mdfeService.ConsultarPorChaveAsync(chave);
                return Ok(new { sucesso = true, mensagem = "Consulta realizada com sucesso", dados = resultado });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao consultar MDFe por chave");
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Consultar recibo de processamento de lote
        /// </summary>
        [HttpPost("consultar-recibo")]
        public async Task<ActionResult> ConsultarRecibo([FromBody] ConsultarReciboRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { sucesso = false, mensagem = "Dados inválidos", erros = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                var resultado = await _mdfeService.ConsultarReciboAsync(request.Recibo);
                return Ok(new { sucesso = true, mensagem = "Consulta de recibo realizada com sucesso", dados = resultado });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao consultar recibo do MDFe");
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Cancelar MDFe
        /// </summary>
        [HttpPost("{id}/cancelar")]
        public async Task<ActionResult> Cancelar(int id, [FromBody] CancelarMDFeRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { sucesso = false, mensagem = "Dados inválidos", erros = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                var resultado = await _mdfeService.CancelarAsync(id, request.Justificativa);
                return Ok(new { sucesso = true, mensagem = "Cancelamento solicitado com sucesso", dados = resultado });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { sucesso = false, mensagem = "MDFe não encontrado" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { sucesso = false, mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao cancelar MDFe {Id}", id);
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Encerrar MDFe
        /// </summary>
        [HttpPost("{id}/encerrar")]
        public async Task<ActionResult> Encerrar(int id, [FromBody] EncerrarMDFeRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { sucesso = false, mensagem = "Dados inválidos", erros = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                var resultado = await _mdfeService.EncerrarAsync(id, request.CodigoMunicipioEncerramento, request.DataEncerramento);
                return Ok(new { sucesso = true, mensagem = "Encerramento solicitado com sucesso", dados = resultado });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { sucesso = false, mensagem = "MDFe não encontrado" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { sucesso = false, mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao encerrar MDFe {Id}", id);
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }

        // ===================== DISTRIBUIÇÃO =====================
        [HttpPost("distribuicao/nsu")]
        public async Task<ActionResult> DistribuicaoPorNSU([FromBody] DistribuicaoPorNSURequest request, [FromServices] IMDFeProvider provider)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { sucesso = false, mensagem = "Dados inválidos", erros = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
            try
            {
                var r = await provider.DistribuicaoPorNSUAsync(request.UF, request.CnpjCpf, request.NSU);
                return Ok(new { sucesso = r.Sucesso, mensagem = r.Mensagem, dados = r.Dados });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro distribuição por NSU");
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }

        [HttpPost("distribuicao/ultnsu")]
        public async Task<ActionResult> DistribuicaoPorUltNSU([FromBody] DistribuicaoPorUltNSURequest request, [FromServices] IMDFeProvider provider)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { sucesso = false, mensagem = "Dados inválidos", erros = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
            try
            {
                var r = await provider.DistribuicaoPorUltNSUAsync(request.UF, request.CnpjCpf, request.UltNSU);
                return Ok(new { sucesso = r.Sucesso, mensagem = r.Mensagem, dados = r.Dados });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro distribuição por UltNSU");
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }

        [HttpPost("distribuicao/chave")]
        public async Task<ActionResult> DistribuicaoPorChave([FromBody] DistribuicaoPorChaveRequest request, [FromServices] IMDFeProvider provider)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { sucesso = false, mensagem = "Dados inválidos", erros = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
            try
            {
                var r = await provider.DistribuicaoPorChaveAsync(request.UF, request.CnpjCpf, request.Chave);
                return Ok(new { sucesso = r.Sucesso, mensagem = r.Mensagem, dados = r.Dados });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro distribuição por Chave");
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Obter dados completos do MDFe para wizard
        /// </summary>
        [HttpGet("data/wizard-complete/{id}")]
        public async Task<ActionResult> ObterMDFeWizardCompleto(int id)
        {
            try
            {
                var mdfe = await _mdfeBusinessService.GetMDFeByIdAsync(id);
                if (mdfe == null)
                    return NotFound(new { sucesso = false, mensagem = "MDFe não encontrado" });

                // Estruturar resposta com MDFe e entidades para o wizard
                var resposta = new
                {
                    mdfe = new
                    {
                        id = mdfe.Id,
                        emitenteId = mdfe.EmitenteId,
                        veiculoId = mdfe.VeiculoId,
                        condutorId = mdfe.CondutorId,
                        contratanteId = mdfe.ContratanteId,
                        seguradoraId = mdfe.SeguradoraId,
                        numeroMdfe = mdfe.NumeroMdfe,
                        serie = mdfe.Serie,
                        dataEmissao = mdfe.DataEmissao,
                        dataInicioViagem = mdfe.DataInicioViagem,
                        dhInicioViagem = mdfe.DhInicioViagem,
                        ufIni = mdfe.UfIni,
                        ufFim = mdfe.UfFim,
                        valorTotal = mdfe.ValorTotal,
                        pesoBrutoTotal = mdfe.PesoBrutoTotal,
                        infoAdicional = mdfe.InfoAdicional,
                        tipoCarga = mdfe.TipoCarga,
                        descricaoProduto = mdfe.DescricaoProduto,
                        cepCarregamento = mdfe.CepCarregamento,
                        cepDescarregamento = mdfe.CepDescarregamento,
                        municipioIni = mdfe.MunicipioIni,
                        municipioFim = mdfe.MunicipioFim,
                        codigoMunicipioCarregamento = mdfe.CodigoMunicipioCarregamento,
                        nomeMunicipioCarregamento = mdfe.NomeMunicipioCarregamento,
                        codigoMunicipioDescarregamento = mdfe.CodigoMunicipioDescarregamento,
                        nomeMunicipioDescarregamento = mdfe.NomeMunicipioDescarregamento,
                        statusSefaz = mdfe.StatusSefaz,
                        chaveAcesso = mdfe.ChaveAcesso,
                        protocolo = mdfe.Protocolo,

                        // Arrays de documentos (como arrays simples de strings)
                        documentosCTe = !string.IsNullOrEmpty(mdfe.DocumentosCTeJson)
                            ? System.Text.Json.JsonSerializer.Deserialize<string[]>(mdfe.DocumentosCTeJson)
                            : new string[0],
                        documentosNFe = !string.IsNullOrEmpty(mdfe.DocumentosNFeJson)
                            ? System.Text.Json.JsonSerializer.Deserialize<string[]>(mdfe.DocumentosNFeJson)
                            : new string[0],
                        reboquesIds = mdfe.Reboques?.Select(r => r.ReboqueId).ToArray() ?? new int[0],

                        // Localidades de carregamento e descarregamento
                        localidadesCarregamento = mdfe.LocaisCarregamento?.Any() == true
                            ? mdfe.LocaisCarregamento.Select(l => new {
                                uf = l.Municipio?.Uf ?? "",
                                municipio = l.Municipio?.Nome ?? l.DescricaoMunicipio ?? "",
                                codigoIBGE = l.Municipio?.Codigo ?? 0
                            }).ToArray()
                            : (!string.IsNullOrEmpty(mdfe.LocalidadesCarregamentoJson)
                                ? System.Text.Json.JsonSerializer.Deserialize<object[]>(mdfe.LocalidadesCarregamentoJson) ?? Array.Empty<object>()
                                : Array.Empty<object>()),

                        localidadesDescarregamento = mdfe.LocaisDescarregamento?.Any() == true
                            ? mdfe.LocaisDescarregamento.Select(l => new {
                                uf = l.Municipio?.Uf ?? "",
                                municipio = l.Municipio?.Nome ?? l.DescricaoMunicipio ?? "",
                                codigoIBGE = l.Municipio?.Codigo ?? 0
                            }).ToArray()
                            : (!string.IsNullOrEmpty(mdfe.LocalidadesDescarregamentoJson)
                                ? System.Text.Json.JsonSerializer.Deserialize<object[]>(mdfe.LocalidadesDescarregamentoJson) ?? Array.Empty<object>()
                                : Array.Empty<object>()),

                        // Snapshots das entidades
                        emitenteRazaoSocial = mdfe.EmitenteRazaoSocial,
                        emitenteCnpj = mdfe.EmitenteCnpj,
                        emitenteEndereco = mdfe.EmitenteEndereco,
                        condutorNome = mdfe.CondutorNome,
                        condutorCpf = mdfe.CondutorCpf,
                        veiculoPlaca = mdfe.VeiculoPlaca,
                        veiculoTara = mdfe.VeiculoTara,
                        // Estrutura para compatibilidade com frontend atual
                        emit = mdfe.Emitente != null ? new
                        {
                            CNPJ = mdfe.EmitenteCnpj ?? mdfe.Emitente.Cnpj,
                            IE = mdfe.Emitente.Ie,
                            xNome = mdfe.EmitenteRazaoSocial ?? mdfe.Emitente.RazaoSocial,
                            xFant = mdfe.Emitente.NomeFantasia,
                            enderEmit = new
                            {
                                xLgr = mdfe.Emitente.Endereco,
                                nro = mdfe.Emitente.Numero,
                                xCpl = mdfe.Emitente.Complemento,
                                xBairro = mdfe.Emitente.Bairro,
                                cMun = mdfe.Emitente.CodMunicipio.ToString(),
                                xMun = mdfe.Emitente.Municipio,
                                CEP = mdfe.Emitente.Cep,
                                UF = mdfe.Emitente.Uf,
                                fone = "",
                                email = ""
                            }
                        } : null
                    },
                    entities = new
                    {
                        emitentes = mdfe.Emitente != null ? new[] { new { id = mdfe.EmitenteId, data = mdfe.Emitente } } : Array.Empty<object>(),
                        veiculos = mdfe.Veiculo != null ? new[] { new { id = mdfe.VeiculoId, data = mdfe.Veiculo } } : Array.Empty<object>(),
                        condutores = mdfe.Condutor != null ? new[] { new { id = mdfe.CondutorId, data = mdfe.Condutor } } : Array.Empty<object>(),
                        contratantes = mdfe.Contratante != null ? new[] { new { id = mdfe.ContratanteId, data = mdfe.Contratante } } : Array.Empty<object>(),
                        seguradoras = mdfe.Seguradora != null ? new[] { new { id = mdfe.SeguradoraId, data = mdfe.Seguradora } } : Array.Empty<object>(),
                        reboques = mdfe.Reboques != null && mdfe.Reboques.Any()
                            ? mdfe.Reboques.Select(r => new { id = r.ReboqueId, data = r.Reboque }).ToArray()
                            : Array.Empty<object>()
                    }
                };

                return Ok(resposta);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter dados completos do MDFe {Id}", id);
                return StatusCode(500, new { sucesso = false, mensagem = "Erro interno do servidor" });
            }
        }
    }

    public class ConsultarStatusRequest
    {
        public string ChaveAcesso { get; set; } = string.Empty;
    }
}






