using Newtonsoft.Json;

namespace SquadUp.Model
{
    /// <summary>
    /// Struct containing information about an OAuth2 access token
    /// </summary>
    public struct OAuthAccessToken
    {
        [JsonProperty(PropertyName = "access_token")]
        public string AccessToken { get; init; }
        
        [JsonProperty(PropertyName = "token_type")]
        public string TokenType { get; init; }
        
        [JsonProperty(PropertyName = "expires_in")]
        public int ExpiresIn { get; init; }
        
        [JsonProperty(PropertyName = "refresh_token")]
        public string RefreshToken { get; init; }
        
        [JsonProperty(PropertyName = "scope")]
        public string Scope { get; init; }
    }
}