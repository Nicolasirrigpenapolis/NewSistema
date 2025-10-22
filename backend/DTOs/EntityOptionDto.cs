namespace Backend.Api.DTOs
{
    /// <summary>
    /// DTO para opções de entidades em combobox/select
    /// </summary>
    public class EntityOption
    {
        public string Id { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    /// <summary>
    /// Resposta com todas as entidades para o wizard
    /// </summary>
    public class WizardEntitiesResponse
    {
        public List<EntityOption> Emitentes { get; set; } = new();
        public List<EntityOption> Condutores { get; set; } = new();
        public List<EntityOption> Veiculos { get; set; } = new();
        public List<EntityOption> Contratantes { get; set; } = new();
        public List<EntityOption> Seguradoras { get; set; } = new();
    }
}
