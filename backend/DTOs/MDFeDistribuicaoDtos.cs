using System.ComponentModel.DataAnnotations;

namespace Backend.Api.DTOs
{
    public class DistribuicaoPorNSURequest
    {
        [Required] [RegularExpression(@"^[A-Z]{2}$")] public string UF { get; set; } = string.Empty;
        [Required] [RegularExpression(@"^[0-9]{11,14}$")] public string CnpjCpf { get; set; } = string.Empty;
        [Required] [RegularExpression(@"^[0-9]{1,15}$")] public string NSU { get; set; } = string.Empty;
    }
    public class DistribuicaoPorUltNSURequest
    {
        [Required] [RegularExpression(@"^[A-Z]{2}$")] public string UF { get; set; } = string.Empty;
        [Required] [RegularExpression(@"^[0-9]{11,14}$")] public string CnpjCpf { get; set; } = string.Empty;
        [Required] [RegularExpression(@"^[0-9]{1,15}$")] public string UltNSU { get; set; } = string.Empty;
    }
    public class DistribuicaoPorChaveRequest
    {
        [Required] [RegularExpression(@"^[A-Z]{2}$")] public string UF { get; set; } = string.Empty;
        [Required] [RegularExpression(@"^[0-9]{11,14}$")] public string CnpjCpf { get; set; } = string.Empty;
        [Required] [RegularExpression(@"^[0-9]{44}$")] public string Chave { get; set; } = string.Empty;
    }
}
