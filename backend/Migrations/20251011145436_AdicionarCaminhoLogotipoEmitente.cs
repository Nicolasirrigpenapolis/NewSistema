using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarCaminhoLogotipoEmitente : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MDFeLacresUnidadeCarga_MDFeUnidadesCarga_UnidadeCargaId",
                table: "MDFeLacresUnidadeCarga");

            migrationBuilder.DropForeignKey(
                name: "FK_MDFeLacresUnidadeTransporte_MDFeUnidadesTransporte_MDFeUnidadeTransporteId",
                table: "MDFeLacresUnidadeTransporte");

            migrationBuilder.DropForeignKey(
                name: "FK_MDFeUnidadesCarga_MDFeUnidadesTransporte_MDFeUnidadeTransporteId",
                table: "MDFeUnidadesCarga");

            migrationBuilder.DropColumn(
                name: "ReceitaTotal",
                table: "Viagens");

            migrationBuilder.AddColumn<int>(
                name: "CondutorId",
                table: "Viagens",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "KmFinal",
                table: "Viagens",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "KmInicial",
                table: "Viagens",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IniPath",
                table: "MDFes",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UltimoIniConteudo",
                table: "MDFes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "XmlAutorizadoPath",
                table: "MDFes",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CaminhoLogotipo",
                table: "Empresas",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ReceitasViagem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ViagemId = table.Column<int>(type: "int", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Valor = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DataReceita = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Origem = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Observacoes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReceitasViagem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReceitasViagem_Viagens_ViagemId",
                        column: x => x.ViagemId,
                        principalTable: "Viagens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Viagens_CondutorId",
                table: "Viagens",
                column: "CondutorId");

            migrationBuilder.CreateIndex(
                name: "IX_ReceitasViagem_ViagemId",
                table: "ReceitasViagem",
                column: "ViagemId");

            migrationBuilder.AddForeignKey(
                name: "FK_MDFeLacresUnidadeCarga_MDFeUnidadesCarga_UnidadeCargaId",
                table: "MDFeLacresUnidadeCarga",
                column: "UnidadeCargaId",
                principalTable: "MDFeUnidadesCarga",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

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

            migrationBuilder.AddForeignKey(
                name: "FK_Viagens_Condutores_CondutorId",
                table: "Viagens",
                column: "CondutorId",
                principalTable: "Condutores",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MDFeLacresUnidadeCarga_MDFeUnidadesCarga_UnidadeCargaId",
                table: "MDFeLacresUnidadeCarga");

            migrationBuilder.DropForeignKey(
                name: "FK_MDFeLacresUnidadeTransporte_MDFeUnidadesTransporte_MDFeUnidadeTransporteId",
                table: "MDFeLacresUnidadeTransporte");

            migrationBuilder.DropForeignKey(
                name: "FK_MDFeUnidadesCarga_MDFeUnidadesTransporte_MDFeUnidadeTransporteId",
                table: "MDFeUnidadesCarga");

            migrationBuilder.DropForeignKey(
                name: "FK_Viagens_Condutores_CondutorId",
                table: "Viagens");

            migrationBuilder.DropTable(
                name: "ReceitasViagem");

            migrationBuilder.DropIndex(
                name: "IX_Viagens_CondutorId",
                table: "Viagens");

            migrationBuilder.DropColumn(
                name: "CondutorId",
                table: "Viagens");

            migrationBuilder.DropColumn(
                name: "KmFinal",
                table: "Viagens");

            migrationBuilder.DropColumn(
                name: "KmInicial",
                table: "Viagens");

            migrationBuilder.DropColumn(
                name: "IniPath",
                table: "MDFes");

            migrationBuilder.DropColumn(
                name: "UltimoIniConteudo",
                table: "MDFes");

            migrationBuilder.DropColumn(
                name: "XmlAutorizadoPath",
                table: "MDFes");

            migrationBuilder.DropColumn(
                name: "CaminhoLogotipo",
                table: "Empresas");

            migrationBuilder.AddColumn<decimal>(
                name: "ReceitaTotal",
                table: "Viagens",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddForeignKey(
                name: "FK_MDFeLacresUnidadeCarga_MDFeUnidadesCarga_UnidadeCargaId",
                table: "MDFeLacresUnidadeCarga",
                column: "UnidadeCargaId",
                principalTable: "MDFeUnidadesCarga",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MDFeLacresUnidadeTransporte_MDFeUnidadesTransporte_MDFeUnidadeTransporteId",
                table: "MDFeLacresUnidadeTransporte",
                column: "MDFeUnidadeTransporteId",
                principalTable: "MDFeUnidadesTransporte",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MDFeUnidadesCarga_MDFeUnidadesTransporte_MDFeUnidadeTransporteId",
                table: "MDFeUnidadesCarga",
                column: "MDFeUnidadeTransporteId",
                principalTable: "MDFeUnidadesTransporte",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
