using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Models
{
    public class MDFeStatusHistory
    {
        public int Id { get; set; }

        [Required]
        public int MDFeId { get; set; }

        [ForeignKey(nameof(MDFeId))]
        public MDFe MDFe { get; set; } = null!;

        [Required]
        [MaxLength(40)]
        public string Status { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Motivo { get; set; }

        [MaxLength(100)]
        public string? Responsavel { get; set; }

        [MaxLength(60)]
        public string? TraceId { get; set; }

        public DateTime DataRegistro { get; set; } = DateTime.UtcNow;
    }
}

