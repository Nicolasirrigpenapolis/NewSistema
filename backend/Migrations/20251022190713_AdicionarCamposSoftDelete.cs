using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarCamposSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DataExclusao",
                table: "Veiculos",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoExclusao",
                table: "Veiculos",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsuarioExclusao",
                table: "Veiculos",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataExclusao",
                table: "Seguradoras",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoExclusao",
                table: "Seguradoras",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsuarioExclusao",
                table: "Seguradoras",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataExclusao",
                table: "Reboques",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoExclusao",
                table: "Reboques",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsuarioExclusao",
                table: "Reboques",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataExclusao",
                table: "Fornecedores",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoExclusao",
                table: "Fornecedores",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsuarioExclusao",
                table: "Fornecedores",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataExclusao",
                table: "Contratantes",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoExclusao",
                table: "Contratantes",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsuarioExclusao",
                table: "Contratantes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataExclusao",
                table: "Condutores",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoExclusao",
                table: "Condutores",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsuarioExclusao",
                table: "Condutores",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DataExclusao",
                table: "Veiculos");

            migrationBuilder.DropColumn(
                name: "MotivoExclusao",
                table: "Veiculos");

            migrationBuilder.DropColumn(
                name: "UsuarioExclusao",
                table: "Veiculos");

            migrationBuilder.DropColumn(
                name: "DataExclusao",
                table: "Seguradoras");

            migrationBuilder.DropColumn(
                name: "MotivoExclusao",
                table: "Seguradoras");

            migrationBuilder.DropColumn(
                name: "UsuarioExclusao",
                table: "Seguradoras");

            migrationBuilder.DropColumn(
                name: "DataExclusao",
                table: "Reboques");

            migrationBuilder.DropColumn(
                name: "MotivoExclusao",
                table: "Reboques");

            migrationBuilder.DropColumn(
                name: "UsuarioExclusao",
                table: "Reboques");

            migrationBuilder.DropColumn(
                name: "DataExclusao",
                table: "Fornecedores");

            migrationBuilder.DropColumn(
                name: "MotivoExclusao",
                table: "Fornecedores");

            migrationBuilder.DropColumn(
                name: "UsuarioExclusao",
                table: "Fornecedores");

            migrationBuilder.DropColumn(
                name: "DataExclusao",
                table: "Contratantes");

            migrationBuilder.DropColumn(
                name: "MotivoExclusao",
                table: "Contratantes");

            migrationBuilder.DropColumn(
                name: "UsuarioExclusao",
                table: "Contratantes");

            migrationBuilder.DropColumn(
                name: "DataExclusao",
                table: "Condutores");

            migrationBuilder.DropColumn(
                name: "MotivoExclusao",
                table: "Condutores");

            migrationBuilder.DropColumn(
                name: "UsuarioExclusao",
                table: "Condutores");
        }
    }
}
