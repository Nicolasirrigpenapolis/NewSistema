using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSearchAndFilterIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Viagens_DataFim",
                table: "Viagens",
                column: "DataFim");

            migrationBuilder.CreateIndex(
                name: "IX_Viagens_DataInicio",
                table: "Viagens",
                column: "DataInicio");

            migrationBuilder.CreateIndex(
                name: "IX_Seguradoras_RazaoSocial",
                table: "Seguradoras",
                column: "RazaoSocial");

            migrationBuilder.CreateIndex(
                name: "IX_MDFes_DataEmissao",
                table: "MDFes",
                column: "DataEmissao");

            migrationBuilder.CreateIndex(
                name: "IX_MDFes_DataInicioViagem",
                table: "MDFes",
                column: "DataInicioViagem");

            migrationBuilder.CreateIndex(
                name: "IX_MDFes_StatusSefaz",
                table: "MDFes",
                column: "StatusSefaz");

            migrationBuilder.CreateIndex(
                name: "IX_ManutencaoVeiculos_DataManutencao",
                table: "ManutencaoVeiculos",
                column: "DataManutencao");

            migrationBuilder.CreateIndex(
                name: "IX_Fornecedores_Nome",
                table: "Fornecedores",
                column: "Nome");

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_RazaoSocial",
                table: "Empresas",
                column: "RazaoSocial");

            migrationBuilder.CreateIndex(
                name: "IX_Contratantes_RazaoSocial",
                table: "Contratantes",
                column: "RazaoSocial");

            migrationBuilder.CreateIndex(
                name: "IX_Condutores_Nome",
                table: "Condutores",
                column: "Nome");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Viagens_DataFim",
                table: "Viagens");

            migrationBuilder.DropIndex(
                name: "IX_Viagens_DataInicio",
                table: "Viagens");

            migrationBuilder.DropIndex(
                name: "IX_Seguradoras_RazaoSocial",
                table: "Seguradoras");

            migrationBuilder.DropIndex(
                name: "IX_MDFes_DataEmissao",
                table: "MDFes");

            migrationBuilder.DropIndex(
                name: "IX_MDFes_DataInicioViagem",
                table: "MDFes");

            migrationBuilder.DropIndex(
                name: "IX_MDFes_StatusSefaz",
                table: "MDFes");

            migrationBuilder.DropIndex(
                name: "IX_ManutencaoVeiculos_DataManutencao",
                table: "ManutencaoVeiculos");

            migrationBuilder.DropIndex(
                name: "IX_Fornecedores_Nome",
                table: "Fornecedores");

            migrationBuilder.DropIndex(
                name: "IX_Empresas_RazaoSocial",
                table: "Empresas");

            migrationBuilder.DropIndex(
                name: "IX_Contratantes_RazaoSocial",
                table: "Contratantes");

            migrationBuilder.DropIndex(
                name: "IX_Condutores_Nome",
                table: "Condutores");
        }
    }
}
