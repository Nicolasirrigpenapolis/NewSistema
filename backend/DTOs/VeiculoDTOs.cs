using System.ComponentModel.DataAnnotations;
using Backend.Api.Attributes;

namespace Backend.Api.DTOs
{
    public class VeiculoCreateDto
    {
        [Required(ErrorMessage = "Placa é obrigatória")]
        [StringLength(8, ErrorMessage = "Placa deve ter no máximo 8 caracteres")]
        [PlacaVeiculo(ErrorMessage = "Placa deve estar no formato ABC1234 ou ABC1A23 (Mercosul)")]
        public string Placa { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "Marca deve ter no máximo 100 caracteres")]
        public string? Marca { get; set; }

        [Required(ErrorMessage = "Tara é obrigatória")]
        [Range(1, int.MaxValue, ErrorMessage = "Tara deve ser maior que zero")]
        public int Tara { get; set; }
        
        [Required(ErrorMessage = "Tipo de rodado é obrigatório")]
        [MaxLength(50, ErrorMessage = "Tipo de rodado deve ter no máximo 50 caracteres")]
        public string TipoRodado { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tipo de carroceria é obrigatório")]
        [MaxLength(50, ErrorMessage = "Tipo de carroceria deve ter no máximo 50 caracteres")]
        public string TipoCarroceria { get; set; } = string.Empty;

        [Required(ErrorMessage = "UF é obrigatória")]
        [StringLength(2, MinimumLength = 2, ErrorMessage = "UF deve ter exatamente 2 caracteres")]
        [RegularExpression(@"^[A-Z]{2}$", ErrorMessage = "UF deve conter apenas letras maiúsculas")]
        public string Uf { get; set; } = string.Empty;
    }

    public class VeiculoUpdateDto : VeiculoCreateDto
    {
        // Mesmas propriedades que VeiculoCreateDto
    }

    public class VeiculoResponseDto
    {
        public int Id { get; set; }
        public string Placa { get; set; } = string.Empty;
        public string? Marca { get; set; }
        public int Tara { get; set; }
        public string TipoRodado { get; set; } = string.Empty;
        public string TipoCarroceria { get; set; } = string.Empty;
        public string Uf { get; set; } = string.Empty;
        public bool Ativo { get; set; }
        public DateTime DataCriacao { get; set; }
    }

    public class VeiculoListDto
    {
        public int Id { get; set; }
        public string Placa { get; set; } = string.Empty;
        public string? Marca { get; set; }
        public int Tara { get; set; }
        public string TipoRodado { get; set; } = string.Empty;
        public string TipoCarroceria { get; set; } = string.Empty;
        public string Uf { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }
}
