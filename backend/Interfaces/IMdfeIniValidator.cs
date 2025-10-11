using Backend.Api.Services.Ini;

namespace Backend.Api.Interfaces
{
    public interface IMdfeIniValidator
    {
        IniComparisonResult CompareWithTemplate(string iniContent);
        IniDocument Parse(string iniContent);
        string GetTemplateContent();
    }
}

