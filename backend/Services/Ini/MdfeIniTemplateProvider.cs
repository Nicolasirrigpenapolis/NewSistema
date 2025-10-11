using System;
using System.IO;
using System.Reflection;

namespace Backend.Api.Services.Ini
{
    /// <summary>
    /// Fornece o documento INI modelo embutido no assembly.
    /// </summary>
    public sealed class MdfeIniTemplateProvider
    {
        private readonly Lazy<string> _templateContent;
        private readonly Lazy<IniDocument> _templateDocument;
        private readonly IniParser _parser;

        private const string ResourceName = "Backend.Api.Templates.modeloini.ini";

        public MdfeIniTemplateProvider(IniParser parser)
        {
            _parser = parser;
            _templateContent = new Lazy<string>(LoadTemplateContent);
            _templateDocument = new Lazy<IniDocument>(() => _parser.Parse(_templateContent.Value));
        }

        public string GetTemplateContent() => _templateContent.Value;

        public IniDocument GetTemplateDocument() => _templateDocument.Value;

        private static string LoadTemplateContent()
        {
            var assembly = Assembly.GetExecutingAssembly();
            using var stream = assembly.GetManifestResourceStream(ResourceName)
                ?? throw new InvalidOperationException($"Recurso embutido '{ResourceName}' não encontrado. Garanta que Templates/modeloini.ini esteja marcado como EmbeddedResource.");
            using var reader = new StreamReader(stream);
            return reader.ReadToEnd();
        }
    }
}

