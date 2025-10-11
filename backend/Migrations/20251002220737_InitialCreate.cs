using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cargos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataUltimaAlteracao = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cargos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Condutores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Cpf = table.Column<string>(type: "nvarchar(11)", maxLength: 11, nullable: false),
                    Telefone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataUltimaAlteracao = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Condutores", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Contratantes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Cnpj = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: true),
                    Cpf = table.Column<string>(type: "nvarchar(11)", maxLength: 11, nullable: true),
                    RazaoSocial = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NomeFantasia = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Endereco = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Numero = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Complemento = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Bairro = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CodMunicipio = table.Column<int>(type: "int", nullable: false),
                    Municipio = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Cep = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: false),
                    Uf = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Telefone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataUltimaAlteracao = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contratantes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Empresas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Cnpj = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: true),
                    Cpf = table.Column<string>(type: "nvarchar(11)", maxLength: 11, nullable: true),
                    Ie = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    RazaoSocial = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NomeFantasia = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Endereco = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Numero = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Complemento = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Bairro = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CodMunicipio = table.Column<int>(type: "int", nullable: false),
                    Municipio = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Cep = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: false),
                    Uf = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Telefone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    TipoEmitente = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CaminhoArquivoCertificado = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SenhaCertificado = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CaminhoSalvarXml = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Rntrc = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    SerieInicial = table.Column<int>(type: "int", nullable: false),
                    TipoTransportador = table.Column<int>(type: "int", nullable: false),
                    ModalTransporte = table.Column<int>(type: "int", nullable: false),
                    AmbienteSefaz = table.Column<int>(type: "int", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataUltimaAlteracao = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empresas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Estados",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Uf = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CodigoIbge = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Estados", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Permissoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Codigo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Modulo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissoes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Reboques",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Placa = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: false),
                    Tara = table.Column<int>(type: "int", nullable: false),
                    TipoRodado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TipoCarroceria = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Uf = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Rntrc = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataUltimaAlteracao = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reboques", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Seguradoras",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Cnpj = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: false),
                    RazaoSocial = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NomeFantasia = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Apolice = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataUltimaAlteracao = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Seguradoras", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Veiculos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Placa = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: false),
                    Marca = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Tara = table.Column<int>(type: "int", nullable: false),
                    TipoRodado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TipoCarroceria = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Uf = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataUltimaAlteracao = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Veiculos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CargoId = table.Column<int>(type: "int", nullable: true),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataUltimaAlteracao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataUltimoLogin = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Usuarios_Cargos_CargoId",
                        column: x => x.CargoId,
                        principalTable: "Cargos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Municipios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Codigo = table.Column<int>(type: "int", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Uf = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    EstadoId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Municipios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Municipios_Estados_EstadoId",
                        column: x => x.EstadoId,
                        principalTable: "Estados",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CargoPermissoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CargoId = table.Column<int>(type: "int", nullable: false),
                    PermissaoId = table.Column<int>(type: "int", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CargoPermissoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CargoPermissoes_Cargos_CargoId",
                        column: x => x.CargoId,
                        principalTable: "Cargos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CargoPermissoes_Permissoes_PermissaoId",
                        column: x => x.PermissaoId,
                        principalTable: "Permissoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmitenteId = table.Column<int>(type: "int", nullable: false),
                    EmitenteCnpj = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: false),
                    EmitenteCpf = table.Column<string>(type: "nvarchar(11)", maxLength: 11, nullable: true),
                    EmitenteIe = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    EmitenteRazaoSocial = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EmitenteNomeFantasia = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    EmitenteEndereco = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EmitenteNumero = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    EmitenteComplemento = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    EmitenteBairro = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EmitenteCodMunicipio = table.Column<int>(type: "int", nullable: false),
                    EmitenteMunicipio = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EmitenteCep = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: false),
                    EmitenteUf = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    EmitenteTipoEmitente = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EmitenteRntrc = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CondutorId = table.Column<int>(type: "int", nullable: true),
                    CondutorNome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CondutorCpf = table.Column<string>(type: "nvarchar(11)", maxLength: 11, nullable: true),
                    CondutorTelefone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    VeiculoId = table.Column<int>(type: "int", nullable: true),
                    VeiculoPlaca = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: true),
                    VeiculoTara = table.Column<int>(type: "int", nullable: true),
                    VeiculoTipoRodado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    VeiculoTipoCarroceria = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    VeiculoUf = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    MunicipioCarregamentoId = table.Column<int>(type: "int", nullable: true),
                    Serie = table.Column<int>(type: "int", nullable: false),
                    NumeroMdfe = table.Column<int>(type: "int", nullable: false),
                    ChaveAcesso = table.Column<string>(type: "nvarchar(44)", maxLength: 44, nullable: true),
                    CodigoUf = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: true),
                    CodigoVerificador = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    CodigoNumericoAleatorio = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: true),
                    VersaoModal = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    UfIni = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    UfFim = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Modal = table.Column<int>(type: "int", nullable: false),
                    TipoTransportador = table.Column<int>(type: "int", nullable: false),
                    DataEmissao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataInicioViagem = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ValorTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    QuantidadeCTe = table.Column<int>(type: "int", nullable: true),
                    QuantidadeNFe = table.Column<int>(type: "int", nullable: true),
                    Lote = table.Column<int>(type: "int", nullable: true),
                    UnidadeMedida = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    InfoAdicional = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    StatusSefaz = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Protocolo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DataAutorizacao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    XmlGerado = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    XmlRetorno = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataUltimaAlteracao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TipoCarga = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: true),
                    DescricaoProduto = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CepCarregamento = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: true),
                    CepDescarregamento = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: true),
                    ProprietarioDiferente = table.Column<bool>(type: "bit", nullable: false),
                    CnpjProprietario = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: true),
                    CpfProprietario = table.Column<string>(type: "nvarchar(11)", maxLength: 11, nullable: true),
                    NomeProprietario = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IeProprietario = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    UfProprietario = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: true),
                    RntrcProprietario = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ContratanteId = table.Column<int>(type: "int", nullable: true),
                    ContratanteCnpj = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: true),
                    ContratanteCpf = table.Column<string>(type: "nvarchar(11)", maxLength: 11, nullable: true),
                    ContratanteRazaoSocial = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ContratanteNomeFantasia = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ContratanteIe = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ContratanteEndereco = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ContratanteNumero = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ContratanteComplemento = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ContratanteBairro = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ContratanteCodMunicipio = table.Column<int>(type: "int", nullable: true),
                    ContratanteMunicipio = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ContratanteCep = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: true),
                    ContratanteUf = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: true),
                    SeguradoraId = table.Column<int>(type: "int", nullable: true),
                    TipoResponsavelSeguro = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    SeguradoraCnpj = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: true),
                    SeguradoraRazaoSocial = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SeguradoraNomeFantasia = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SeguradoraEndereco = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SeguradoraNumero = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    SeguradoraComplemento = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SeguradoraBairro = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SeguradoraCodMunicipio = table.Column<int>(type: "int", nullable: true),
                    SeguradoraMunicipio = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SeguradoraCep = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: true),
                    SeguradoraUf = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: true),
                    SeguradoraTelefone = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    SeguradoraEmail = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    NumeroApoliceSeguro = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NumeroAverbacaoSeguro = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ComponentesPagamentoJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValorTotalContrato = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TipoPagamento = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    ValesPedagioJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SemValePedagio = table.Column<bool>(type: "bit", nullable: false),
                    ProdutoPredominante = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    LatitudeCarregamento = table.Column<decimal>(type: "decimal(10,6)", nullable: true),
                    LongitudeCarregamento = table.Column<decimal>(type: "decimal(10,6)", nullable: true),
                    LatitudeDescarregamento = table.Column<decimal>(type: "decimal(10,6)", nullable: true),
                    LongitudeDescarregamento = table.Column<decimal>(type: "decimal(10,6)", nullable: true),
                    Transmitido = table.Column<bool>(type: "bit", nullable: false),
                    Autorizado = table.Column<bool>(type: "bit", nullable: false),
                    Encerrado = table.Column<bool>(type: "bit", nullable: false),
                    Cancelado = table.Column<bool>(type: "bit", nullable: false),
                    NumeroRecibo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DataTransmissao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataEncerramento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataCancelamento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    XmlAssinado = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    XmlAutorizado = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MunicipioIni = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MunicipioFim = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PesoBrutoTotal = table.Column<decimal>(type: "decimal(18,3)", nullable: true),
                    UsuarioCriacao = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    UsuarioUltimaAlteracao = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    VersaoSistema = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ObservacoesInternas = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LocalidadesCarregamentoJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LocalidadesDescarregamentoJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RotaPercursoJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DocumentosCTeJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DocumentosNFeJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DadosOriginaisJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataGeracao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CodigoCIOT = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFes_Condutores_CondutorId",
                        column: x => x.CondutorId,
                        principalTable: "Condutores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MDFes_Contratantes_ContratanteId",
                        column: x => x.ContratanteId,
                        principalTable: "Contratantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MDFes_Empresas_EmitenteId",
                        column: x => x.EmitenteId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MDFes_Municipios_MunicipioCarregamentoId",
                        column: x => x.MunicipioCarregamentoId,
                        principalTable: "Municipios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MDFes_Seguradoras_SeguradoraId",
                        column: x => x.SeguradoraId,
                        principalTable: "Seguradoras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MDFes_Veiculos_VeiculoId",
                        column: x => x.VeiculoId,
                        principalTable: "Veiculos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MDFeCondutores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    NomeCondutor = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CpfCondutor = table.Column<string>(type: "nvarchar(11)", maxLength: 11, nullable: false),
                    Ordem = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeCondutores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeCondutores_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFeCtes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    ChaveCte = table.Column<string>(type: "nvarchar(44)", maxLength: 44, nullable: false),
                    SegCodigoBarras = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    SegundoCodigoBarras = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    IndReentrega = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    MunicipioDescargaId = table.Column<int>(type: "int", nullable: true),
                    ValorTotal = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    PesoBruto = table.Column<decimal>(type: "decimal(10,3)", nullable: true),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ordem = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeCtes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeCtes_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MDFeCtes_Municipios_MunicipioDescargaId",
                        column: x => x.MunicipioDescargaId,
                        principalTable: "Municipios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MDFeEventos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    TipoEvento = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Justificativa = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ProtocoloEvento = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DataEvento = table.Column<DateTime>(type: "datetime2", nullable: false),
                    XmlEvento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    XmlRetornoEvento = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeEventos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeEventos_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFeLacresRodoviarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    NumeroLacre = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Ordem = table.Column<int>(type: "int", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeLacresRodoviarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeLacresRodoviarios_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFeLocaisCarregamento",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    MunicipioId = table.Column<int>(type: "int", nullable: false),
                    DescricaoMunicipio = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Ordem = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeLocaisCarregamento", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeLocaisCarregamento_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MDFeLocaisCarregamento_Municipios_MunicipioId",
                        column: x => x.MunicipioId,
                        principalTable: "Municipios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MDFeLocaisDescarregamento",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    MunicipioId = table.Column<int>(type: "int", nullable: false),
                    DescricaoMunicipio = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Ordem = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeLocaisDescarregamento", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeLocaisDescarregamento_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MDFeLocaisDescarregamento_Municipios_MunicipioId",
                        column: x => x.MunicipioId,
                        principalTable: "Municipios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MDFeMdfeTransps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    ChaveMdfeTransp = table.Column<string>(type: "nvarchar(44)", maxLength: 44, nullable: false),
                    IndReentrega = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    MunicipioDescargaId = table.Column<int>(type: "int", nullable: true),
                    QuantidadeRateada = table.Column<decimal>(type: "decimal(18,3)", nullable: true),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ordem = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeMdfeTransps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeMdfeTransps_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MDFeMdfeTransps_Municipios_MunicipioDescargaId",
                        column: x => x.MunicipioDescargaId,
                        principalTable: "Municipios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MDFeNfes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    ChaveNfe = table.Column<string>(type: "nvarchar(44)", maxLength: 44, nullable: false),
                    SegCodigoBarras = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    SegundoCodigoBarras = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    PinSuframa = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    IndReentrega = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    MunicipioDescargaId = table.Column<int>(type: "int", nullable: true),
                    ValorTotal = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    PesoBruto = table.Column<decimal>(type: "decimal(10,3)", nullable: true),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ordem = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeNfes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeNfes_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MDFeNfes_Municipios_MunicipioDescargaId",
                        column: x => x.MunicipioDescargaId,
                        principalTable: "Municipios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MDFeReboques",
                columns: table => new
                {
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    ReboqueId = table.Column<int>(type: "int", nullable: false),
                    Ordem = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeReboques", x => new { x.MDFeId, x.ReboqueId });
                    table.ForeignKey(
                        name: "FK_MDFeReboques_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MDFeReboques_Reboques_ReboqueId",
                        column: x => x.ReboqueId,
                        principalTable: "Reboques",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFeUfsPercurso",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    Uf = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Ordem = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeUfsPercurso", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeUfsPercurso_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFeValesPedagio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    CnpjFornecedor = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: false),
                    NumeroCompra = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ValorVale = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    TipoVale = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    NomeFornecedor = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ordem = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeValesPedagio", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeValesPedagio_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFeEntregasParciais",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    QuantidadeParcial = table.Column<decimal>(type: "decimal(12,4)", nullable: false),
                    DescricaoEntrega = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DataEntrega = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LocalEntrega = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Ordem = table.Column<int>(type: "int", nullable: false),
                    QuantidadeTotal = table.Column<decimal>(type: "decimal(12,4)", nullable: true),
                    MDFeCteId = table.Column<int>(type: "int", nullable: true),
                    MDFeNfeId = table.Column<int>(type: "int", nullable: true),
                    MDFeMdfeTranspId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeEntregasParciais", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeEntregasParciais_MDFeCtes_MDFeCteId",
                        column: x => x.MDFeCteId,
                        principalTable: "MDFeCtes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MDFeEntregasParciais_MDFeMdfeTransps_MDFeMdfeTranspId",
                        column: x => x.MDFeMdfeTranspId,
                        principalTable: "MDFeMdfeTransps",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MDFeEntregasParciais_MDFeNfes_MDFeNfeId",
                        column: x => x.MDFeNfeId,
                        principalTable: "MDFeNfes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MDFeEntregasParciais_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFeNfesPrestacaoParcial",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NFeId = table.Column<int>(type: "int", nullable: false),
                    QtdeParcial = table.Column<decimal>(type: "decimal(15,2)", nullable: true),
                    DenominacaoMercadoria = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ordem = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeNfesPrestacaoParcial", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeNfesPrestacaoParcial_MDFeNfes_NFeId",
                        column: x => x.NFeId,
                        principalTable: "MDFeNfes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFeProdutosPerigosos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    NumeroONU = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: false),
                    NomeEmbarque = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ClasseRisco = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: false),
                    GrupoEmbalagem = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    QuantidadeTotal = table.Column<decimal>(type: "decimal(12,4)", nullable: false),
                    UnidadeMedida = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Observacoes = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Ordem = table.Column<int>(type: "int", nullable: false),
                    NomeApropriado = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    QuantidadeTotalProduto = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    QuantidadeVolumoTipo = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    MDFeCteId = table.Column<int>(type: "int", nullable: true),
                    MDFeNfeId = table.Column<int>(type: "int", nullable: true),
                    MDFeMdfeTranspId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeProdutosPerigosos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeProdutosPerigosos_MDFeCtes_MDFeCteId",
                        column: x => x.MDFeCteId,
                        principalTable: "MDFeCtes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MDFeProdutosPerigosos_MDFeMdfeTransps_MDFeMdfeTranspId",
                        column: x => x.MDFeMdfeTranspId,
                        principalTable: "MDFeMdfeTransps",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MDFeProdutosPerigosos_MDFeNfes_MDFeNfeId",
                        column: x => x.MDFeNfeId,
                        principalTable: "MDFeNfes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MDFeProdutosPerigosos_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFeUnidadesTransporte",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    TipoUnidadeTransporte = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: false),
                    CodigoInterno = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Placa = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: true),
                    Tara = table.Column<decimal>(type: "decimal(10,3)", nullable: true),
                    CapacidadeKg = table.Column<decimal>(type: "decimal(10,3)", nullable: true),
                    CapacidadeM3 = table.Column<decimal>(type: "decimal(10,3)", nullable: true),
                    TipoRodado = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: true),
                    TipoCarroceria = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: true),
                    Uf = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: true),
                    Ordem = table.Column<int>(type: "int", nullable: false),
                    IdentificacaoUnidadeTransporte = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    QuantidadeRateada = table.Column<decimal>(type: "decimal(10,3)", nullable: true),
                    MDFeCteId = table.Column<int>(type: "int", nullable: true),
                    MDFeNfeId = table.Column<int>(type: "int", nullable: true),
                    MDFeMdfeTranspId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeUnidadesTransporte", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeUnidadesTransporte_MDFeCtes_MDFeCteId",
                        column: x => x.MDFeCteId,
                        principalTable: "MDFeCtes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MDFeUnidadesTransporte_MDFeMdfeTransps_MDFeMdfeTranspId",
                        column: x => x.MDFeMdfeTranspId,
                        principalTable: "MDFeMdfeTransps",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MDFeUnidadesTransporte_MDFeNfes_MDFeNfeId",
                        column: x => x.MDFeNfeId,
                        principalTable: "MDFeNfes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MDFeUnidadesTransporte_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFeLacresUnidadeTransporte",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    NumeroLacre = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ordem = table.Column<int>(type: "int", nullable: false),
                    MDFeUnidadeTransporteId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeLacresUnidadeTransporte", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeLacresUnidadeTransporte_MDFeUnidadesTransporte_MDFeUnidadeTransporteId",
                        column: x => x.MDFeUnidadeTransporteId,
                        principalTable: "MDFeUnidadesTransporte",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MDFeLacresUnidadeTransporte_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFeUnidadesCarga",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    TipoUnidadeCarga = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: false),
                    IdUnidadeCarga = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    QtdRat = table.Column<decimal>(type: "decimal(18,3)", nullable: true),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ordem = table.Column<int>(type: "int", nullable: false),
                    MDFeUnidadeTransporteId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeUnidadesCarga", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeUnidadesCarga_MDFeUnidadesTransporte_MDFeUnidadeTransporteId",
                        column: x => x.MDFeUnidadeTransporteId,
                        principalTable: "MDFeUnidadesTransporte",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MDFeUnidadesCarga_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFeLacresUnidadeCarga",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UnidadeCargaId = table.Column<int>(type: "int", nullable: false),
                    NumeroLacre = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ordem = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeLacresUnidadeCarga", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeLacresUnidadeCarga_MDFeUnidadesCarga_UnidadeCargaId",
                        column: x => x.UnidadeCargaId,
                        principalTable: "MDFeUnidadesCarga",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CargoPermissoes_CargoId_PermissaoId",
                table: "CargoPermissoes",
                columns: new[] { "CargoId", "PermissaoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CargoPermissoes_PermissaoId",
                table: "CargoPermissoes",
                column: "PermissaoId");

            migrationBuilder.CreateIndex(
                name: "IX_Cargos_Nome",
                table: "Cargos",
                column: "Nome",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Condutores_Cpf",
                table: "Condutores",
                column: "Cpf",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contratantes_Cnpj",
                table: "Contratantes",
                column: "Cnpj",
                unique: true,
                filter: "[Cnpj] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Contratantes_Cpf",
                table: "Contratantes",
                column: "Cpf",
                unique: true,
                filter: "[Cpf] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_Cnpj",
                table: "Empresas",
                column: "Cnpj",
                unique: true,
                filter: "[Cnpj] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_Cpf",
                table: "Empresas",
                column: "Cpf",
                unique: true,
                filter: "[Cpf] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeCondutores_CpfCondutor",
                table: "MDFeCondutores",
                column: "CpfCondutor");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeCondutores_MDFeId",
                table: "MDFeCondutores",
                column: "MDFeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeCtes_ChaveCte",
                table: "MDFeCtes",
                column: "ChaveCte",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MDFeCtes_MDFeId",
                table: "MDFeCtes",
                column: "MDFeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeCtes_MunicipioDescargaId",
                table: "MDFeCtes",
                column: "MunicipioDescargaId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeEntregasParciais_MDFeCteId",
                table: "MDFeEntregasParciais",
                column: "MDFeCteId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeEntregasParciais_MDFeId",
                table: "MDFeEntregasParciais",
                column: "MDFeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeEntregasParciais_MDFeMdfeTranspId",
                table: "MDFeEntregasParciais",
                column: "MDFeMdfeTranspId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeEntregasParciais_MDFeNfeId",
                table: "MDFeEntregasParciais",
                column: "MDFeNfeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeEventos_MDFeId",
                table: "MDFeEventos",
                column: "MDFeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeLacresRodoviarios_MDFeId",
                table: "MDFeLacresRodoviarios",
                column: "MDFeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeLacresUnidadeCarga_UnidadeCargaId",
                table: "MDFeLacresUnidadeCarga",
                column: "UnidadeCargaId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeLacresUnidadeTransporte_MDFeId",
                table: "MDFeLacresUnidadeTransporte",
                column: "MDFeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeLacresUnidadeTransporte_MDFeUnidadeTransporteId",
                table: "MDFeLacresUnidadeTransporte",
                column: "MDFeUnidadeTransporteId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeLocaisCarregamento_MDFeId",
                table: "MDFeLocaisCarregamento",
                column: "MDFeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeLocaisCarregamento_MunicipioId",
                table: "MDFeLocaisCarregamento",
                column: "MunicipioId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeLocaisDescarregamento_MDFeId",
                table: "MDFeLocaisDescarregamento",
                column: "MDFeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeLocaisDescarregamento_MunicipioId",
                table: "MDFeLocaisDescarregamento",
                column: "MunicipioId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeMdfeTransps_ChaveMdfeTransp",
                table: "MDFeMdfeTransps",
                column: "ChaveMdfeTransp",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MDFeMdfeTransps_MDFeId",
                table: "MDFeMdfeTransps",
                column: "MDFeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeMdfeTransps_MunicipioDescargaId",
                table: "MDFeMdfeTransps",
                column: "MunicipioDescargaId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeNfes_ChaveNfe",
                table: "MDFeNfes",
                column: "ChaveNfe",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MDFeNfes_MDFeId",
                table: "MDFeNfes",
                column: "MDFeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeNfes_MunicipioDescargaId",
                table: "MDFeNfes",
                column: "MunicipioDescargaId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeNfesPrestacaoParcial_NFeId",
                table: "MDFeNfesPrestacaoParcial",
                column: "NFeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeProdutosPerigosos_MDFeCteId",
                table: "MDFeProdutosPerigosos",
                column: "MDFeCteId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeProdutosPerigosos_MDFeId",
                table: "MDFeProdutosPerigosos",
                column: "MDFeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeProdutosPerigosos_MDFeMdfeTranspId",
                table: "MDFeProdutosPerigosos",
                column: "MDFeMdfeTranspId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeProdutosPerigosos_MDFeNfeId",
                table: "MDFeProdutosPerigosos",
                column: "MDFeNfeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeReboques_ReboqueId",
                table: "MDFeReboques",
                column: "ReboqueId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFes_ChaveAcesso",
                table: "MDFes",
                column: "ChaveAcesso",
                unique: true,
                filter: "[ChaveAcesso] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_MDFes_CondutorId",
                table: "MDFes",
                column: "CondutorId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFes_ContratanteId",
                table: "MDFes",
                column: "ContratanteId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFes_EmitenteId_Serie_NumeroMdfe",
                table: "MDFes",
                columns: new[] { "EmitenteId", "Serie", "NumeroMdfe" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MDFes_MunicipioCarregamentoId",
                table: "MDFes",
                column: "MunicipioCarregamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFes_SeguradoraId",
                table: "MDFes",
                column: "SeguradoraId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFes_VeiculoId",
                table: "MDFes",
                column: "VeiculoId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeUfsPercurso_MDFeId",
                table: "MDFeUfsPercurso",
                column: "MDFeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeUnidadesCarga_MDFeId",
                table: "MDFeUnidadesCarga",
                column: "MDFeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeUnidadesCarga_MDFeUnidadeTransporteId",
                table: "MDFeUnidadesCarga",
                column: "MDFeUnidadeTransporteId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeUnidadesTransporte_MDFeCteId",
                table: "MDFeUnidadesTransporte",
                column: "MDFeCteId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeUnidadesTransporte_MDFeId",
                table: "MDFeUnidadesTransporte",
                column: "MDFeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeUnidadesTransporte_MDFeMdfeTranspId",
                table: "MDFeUnidadesTransporte",
                column: "MDFeMdfeTranspId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeUnidadesTransporte_MDFeNfeId",
                table: "MDFeUnidadesTransporte",
                column: "MDFeNfeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeValesPedagio_MDFeId",
                table: "MDFeValesPedagio",
                column: "MDFeId");

            migrationBuilder.CreateIndex(
                name: "IX_Municipios_Codigo",
                table: "Municipios",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Municipios_EstadoId",
                table: "Municipios",
                column: "EstadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Permissoes_Codigo",
                table: "Permissoes",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reboques_Placa",
                table: "Reboques",
                column: "Placa",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Seguradoras_Cnpj",
                table: "Seguradoras",
                column: "Cnpj",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_CargoId",
                table: "Usuarios",
                column: "CargoId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_UserName",
                table: "Usuarios",
                column: "UserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Veiculos_Placa",
                table: "Veiculos",
                column: "Placa",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CargoPermissoes");

            migrationBuilder.DropTable(
                name: "MDFeCondutores");

            migrationBuilder.DropTable(
                name: "MDFeEntregasParciais");

            migrationBuilder.DropTable(
                name: "MDFeEventos");

            migrationBuilder.DropTable(
                name: "MDFeLacresRodoviarios");

            migrationBuilder.DropTable(
                name: "MDFeLacresUnidadeCarga");

            migrationBuilder.DropTable(
                name: "MDFeLacresUnidadeTransporte");

            migrationBuilder.DropTable(
                name: "MDFeLocaisCarregamento");

            migrationBuilder.DropTable(
                name: "MDFeLocaisDescarregamento");

            migrationBuilder.DropTable(
                name: "MDFeNfesPrestacaoParcial");

            migrationBuilder.DropTable(
                name: "MDFeProdutosPerigosos");

            migrationBuilder.DropTable(
                name: "MDFeReboques");

            migrationBuilder.DropTable(
                name: "MDFeUfsPercurso");

            migrationBuilder.DropTable(
                name: "MDFeValesPedagio");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Permissoes");

            migrationBuilder.DropTable(
                name: "MDFeUnidadesCarga");

            migrationBuilder.DropTable(
                name: "Reboques");

            migrationBuilder.DropTable(
                name: "Cargos");

            migrationBuilder.DropTable(
                name: "MDFeUnidadesTransporte");

            migrationBuilder.DropTable(
                name: "MDFeCtes");

            migrationBuilder.DropTable(
                name: "MDFeMdfeTransps");

            migrationBuilder.DropTable(
                name: "MDFeNfes");

            migrationBuilder.DropTable(
                name: "MDFes");

            migrationBuilder.DropTable(
                name: "Condutores");

            migrationBuilder.DropTable(
                name: "Contratantes");

            migrationBuilder.DropTable(
                name: "Empresas");

            migrationBuilder.DropTable(
                name: "Municipios");

            migrationBuilder.DropTable(
                name: "Seguradoras");

            migrationBuilder.DropTable(
                name: "Veiculos");

            migrationBuilder.DropTable(
                name: "Estados");
        }
    }
}

