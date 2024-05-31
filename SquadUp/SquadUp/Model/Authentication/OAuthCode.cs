using Newtonsoft.Json;

namespace SquadUp.Model
{
    /// <summary>
    /// Struct handling an OAuth2 code for exchange
    /// </summary>
    public struct OAuthCode
    {
        [JsonProperty(PropertyName = "code")]
        public string Code { get; init; }
        
        [JsonProperty(PropertyName = "redirect")]
        public string RedirectUri { get; init; }
    }
}