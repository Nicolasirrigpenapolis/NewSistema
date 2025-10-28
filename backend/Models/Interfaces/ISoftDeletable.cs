namespace Backend.Api.Models.Interfaces
{
    /// <summary>
    /// Interface para entidades que suportam exclusão lógica (Soft Delete)
    /// </summary>
    public interface ISoftDeletable
    {
        bool Ativo { get; set; }
        DateTime? DataExclusao { get; set; }
        string? UsuarioExclusao { get; set; }
        string? MotivoExclusao { get; set; }
    }
}
