using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Backend.Api.Services.Ini
{
    public sealed class IniSection
    {
        public IniSection(string name, IDictionary<string, string>? values)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Nome da secao nao informado", nameof(name));
            }

            Name = name;
            var comparer = StringComparer.OrdinalIgnoreCase;
            var source = values != null
                ? new Dictionary<string, string>(values, comparer)
                : new Dictionary<string, string>(comparer);
            KeyValues = new ReadOnlyDictionary<string, string>(source);
        }

        public string Name { get; }

        public IReadOnlyDictionary<string, string> KeyValues { get; }

        public bool TryGetValue(string key, out string value) => KeyValues.TryGetValue(key, out value!);
    }
}


