using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class AtualizarPermissaoDesativarCargos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Atualizar a permissão de cargos.excluir para cargos.desativar
            migrationBuilder.Sql(@"
                UPDATE Permissoes
                SET 
                    Codigo = 'cargos.desativar',
                    Nome = 'Desativar cargos',
                    Descricao = 'Permite desativar cargos'
                WHERE Codigo = 'cargos.excluir';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverter para cargos.excluir caso necessário
            migrationBuilder.Sql(@"
                UPDATE Permissoes
                SET 
                    Codigo = 'cargos.excluir',
                    Nome = 'Excluir cargos',
                    Descricao = 'Permite excluir cargos'
                WHERE Codigo = 'cargos.desativar';
            ");
        }
    }
}
