using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace SquadUp.Authentication
{
    public class DiscordAuthenticationHandler : SignInAuthenticationHandler<DiscordAuthenticationOptions>
    {
        /// <summary>
        /// Name of this auth scheme
        /// </summary>
        public const string SchemeName = "Discord";
        
        //TODO Add services and vars
        
        public DiscordAuthenticationHandler(
            IOptionsMonitor<DiscordAuthenticationOptions> options, ILoggerFactory logger, UrlEncoder encoder
        )
            : base(options, logger, encoder)
        {
        }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            throw new NotImplementedException();
        }

        protected override async Task HandleSignOutAsync(AuthenticationProperties? properties)
        {
            throw new NotImplementedException();
        }

        protected override async Task HandleSignInAsync(ClaimsPrincipal user, AuthenticationProperties? properties)
        {
            throw new NotImplementedException();
        }
    }
}