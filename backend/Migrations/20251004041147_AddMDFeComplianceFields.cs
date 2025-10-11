using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMDFeComplianceFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CodigoMDF",
                table: "MDFes",
                type: "nvarchar(8)",
                maxLength: 8,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CodigoMunicipioCarregamento",
                table: "MDFes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CodigoMunicipioDescarregamento",
                table: "MDFes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DhInicioViagem",
                table: "MDFes",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NomeMunicipioCarregamento",
                table: "MDFes",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NomeMunicipioDescarregamento",
                table: "MDFes",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CodigoMDF",
                table: "MDFes");

            migrationBuilder.DropColumn(
                name: "CodigoMunicipioCarregamento",
                table: "MDFes");

            migrationBuilder.DropColumn(
                name: "CodigoMunicipioDescarregamento",
                table: "MDFes");

            migrationBuilder.DropColumn(
                name: "DhInicioViagem",
                table: "MDFes");

            migrationBuilder.DropColumn(
                name: "NomeMunicipioCarregamento",
                table: "MDFes");

            migrationBuilder.DropColumn(
                name: "NomeMunicipioDescarregamento",
                table: "MDFes");
        }
    }
}

