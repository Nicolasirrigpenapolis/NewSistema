using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarSoftDeleteUsuarioCargo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DataExclusao",
                table: "Usuarios",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoExclusao",
                table: "Usuarios",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsuarioExclusao",
                table: "Usuarios",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataExclusao",
                table: "Cargos",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoExclusao",
                table: "Cargos",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsuarioExclusao",
                table: "Cargos",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DataExclusao",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "MotivoExclusao",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "UsuarioExclusao",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "DataExclusao",
                table: "Cargos");

            migrationBuilder.DropColumn(
                name: "MotivoExclusao",
                table: "Cargos");

            migrationBuilder.DropColumn(
                name: "UsuarioExclusao",
                table: "Cargos");
        }
    }
}
