using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCertificadoAndAmbienteFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AmbienteSefaz",
                table: "Empresas");

            migrationBuilder.DropColumn(
                name: "CaminhoArquivoCertificado",
                table: "Empresas");

            migrationBuilder.DropColumn(
                name: "SenhaCertificado",
                table: "Empresas");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AmbienteSefaz",
                table: "Empresas",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CaminhoArquivoCertificado",
                table: "Empresas",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SenhaCertificado",
                table: "Empresas",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }
    }
}

