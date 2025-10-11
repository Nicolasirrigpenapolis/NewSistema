using System;
using System.Collections.Generic;

namespace Backend.Api.Services.Ini
{
    public sealed class IniComparisonResult
    {
        public bool IsMatch { get; private set; }
        public List<string> MissingSections { get; init; } = new();
        public List<string> ExtraSections { get; init; } = new();
        public Dictionary<string, List<string>> MissingKeys { get; init; } = new(StringComparer.OrdinalIgnoreCase);
        public Dictionary<string, List<string>> ExtraKeys { get; init; } = new(StringComparer.OrdinalIgnoreCase);
        public Dictionary<string, List<string>> EmptyValues { get; init; } = new(StringComparer.OrdinalIgnoreCase);
        public Dictionary<string, List<string>> PlaceholderValues { get; init; } = new(StringComparer.OrdinalIgnoreCase);

        public void ComputeIsMatch()
        {
            var hasMissingKeys = HasAny(MissingKeys);
            var hasExtraKeys = HasAny(ExtraKeys);
            var hasEmptyValues = HasAny(EmptyValues);
            var hasPlaceholderValues = HasAny(PlaceholderValues);

            IsMatch = MissingSections.Count == 0
                && ExtraSections.Count == 0
                && !hasMissingKeys
                && !hasExtraKeys
                && !hasEmptyValues
                && !hasPlaceholderValues;
        }

        private static bool HasAny(IDictionary<string, List<string>> dictionary)
        {
            foreach (var entry in dictionary)
            {
                if (entry.Value.Count > 0)
                {
                    return true;
                }
            }

            return false;
        }
    }
}

