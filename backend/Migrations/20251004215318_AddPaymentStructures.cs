using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentStructures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MDFeLacresUnidadeTransporte_MDFeUnidadesTransporte_MDFeUnidadeTransporteId",
                table: "MDFeLacresUnidadeTransporte");

            migrationBuilder.DropForeignKey(
                name: "FK_MDFeUnidadesCarga_MDFeUnidadesTransporte_MDFeUnidadeTransporteId",
                table: "MDFeUnidadesCarga");

            migrationBuilder.AddColumn<string>(
                name: "CnpjPagador",
                table: "MDFeValesPedagio",
                type: "nvarchar(14)",
                maxLength: 14,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MDFeAutorizacoesXml",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    Documento = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: false),
                    Ordem = table.Column<int>(type: "int", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeAutorizacoesXml", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeAutorizacoesXml_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFePagamentos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    CnpjCpf = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: true),
                    IdEstrangeiro = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ValorContrato = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IndicadorPagamento = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: false),
                    TipoPagamento = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: false),
                    Observacoes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Ordem = table.Column<int>(type: "int", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFePagamentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFePagamentos_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFeResponsaveisTecnicos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MDFeId = table.Column<int>(type: "int", nullable: false),
                    Cnpj = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: true),
                    NomeContato = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Telefone = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    IdCsrt = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    HashCsrt = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFeResponsaveisTecnicos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFeResponsaveisTecnicos_MDFes_MDFeId",
                        column: x => x.MDFeId,
                        principalTable: "MDFes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFePagamentoBancos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PagamentoId = table.Column<int>(type: "int", nullable: false),
                    CodigoBanco = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CodigoAgencia = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CnpjIpef = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    NumeroContaPagamento = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Ordem = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFePagamentoBancos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFePagamentoBancos_MDFePagamentos_PagamentoId",
                        column: x => x.PagamentoId,
                        principalTable: "MDFePagamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFePagamentoComponentes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PagamentoId = table.Column<int>(type: "int", nullable: false),
                    TipoComponente = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Valor = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    Ordem = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFePagamentoComponentes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFePagamentoComponentes_MDFePagamentos_PagamentoId",
                        column: x => x.PagamentoId,
                        principalTable: "MDFePagamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MDFePagamentoPrazos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PagamentoId = table.Column<int>(type: "int", nullable: false),
                    NumeroParcela = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true),
                    DataVencimento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ValorParcela = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Ordem = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MDFePagamentoPrazos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MDFePagamentoPrazos_MDFePagamentos_PagamentoId",
                        column: x => x.PagamentoId,
                        principalTable: "MDFePagamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MDFeAutorizacoesXml_MDFeId_Documento",
                table: "MDFeAutorizacoesXml",
                columns: new[] { "MDFeId", "Documento" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MDFePagamentoBancos_PagamentoId",
                table: "MDFePagamentoBancos",
                column: "PagamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFePagamentoComponentes_PagamentoId",
                table: "MDFePagamentoComponentes",
                column: "PagamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFePagamentoPrazos_PagamentoId",
                table: "MDFePagamentoPrazos",
                column: "PagamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFePagamentos_MDFeId",
                table: "MDFePagamentos",
                column: "MDFeId");

            migrationBuilder.CreateIndex(
                name: "IX_MDFeResponsaveisTecnicos_MDFeId",
                table: "MDFeResponsaveisTecnicos",
                column: "MDFeId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MDFeLacresUnidadeTransporte_MDFeUnidadesTransporte_MDFeUnidadeTransporteId",
                table: "MDFeLacresUnidadeTransporte",
                column: "MDFeUnidadeTransporteId",
                principalTable: "MDFeUnidadesTransporte",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MDFeUnidadesCarga_MDFeUnidadesTransporte_MDFeUnidadeTransporteId",
                table: "MDFeUnidadesCarga",
                column: "MDFeUnidadeTransporteId",
                principalTable: "MDFeUnidadesTransporte",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MDFeLacresUnidadeTransporte_MDFeUnidadesTransporte_MDFeUnidadeTransporteId",
                table: "MDFeLacresUnidadeTransporte");

            migrationBuilder.DropForeignKey(
                name: "FK_MDFeUnidadesCarga_MDFeUnidadesTransporte_MDFeUnidadeTransporteId",
                table: "MDFeUnidadesCarga");

            migrationBuilder.DropTable(
                name: "MDFeAutorizacoesXml");

            migrationBuilder.DropTable(
                name: "MDFePagamentoBancos");

            migrationBuilder.DropTable(
                name: "MDFePagamentoComponentes");

            migrationBuilder.DropTable(
                name: "MDFePagamentoPrazos");

            migrationBuilder.DropTable(
                name: "MDFeResponsaveisTecnicos");

            migrationBuilder.DropTable(
                name: "MDFePagamentos");

            migrationBuilder.DropColumn(
                name: "CnpjPagador",
                table: "MDFeValesPedagio");

            migrationBuilder.AddForeignKey(
                name: "FK_MDFeLacresUnidadeTransporte_MDFeUnidadesTransporte_MDFeUnidadeTransporteId",
                table: "MDFeLacresUnidadeTransporte",
                column: "MDFeUnidadeTransporteId",
                principalTable: "MDFeUnidadesTransporte",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MDFeUnidadesCarga_MDFeUnidadesTransporte_MDFeUnidadeTransporteId",
                table: "MDFeUnidadesCarga",
                column: "MDFeUnidadeTransporteId",
                principalTable: "MDFeUnidadesTransporte",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

