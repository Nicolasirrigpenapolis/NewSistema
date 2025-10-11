using Backend.Api.Models;

namespace Backend.Api.Validation
{
    public interface IMDFeFieldValidator
    {
        List<MDFeFieldError> Validar(MDFe mdfe);
    }
}

