using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using Discord;
using Discord.Rest;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SquadUp.Authentication;
using SquadUp.Model;

namespace SquadUp.Controllers
{
    /// <summary>
    /// Controller handling authentication
    /// </summary>
    [ApiController]
    [AllowAnonymous]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private IConfiguration _config;
        private ILogger<AuthController> _logger;
        private SquadUpContext _db;
        
        public AuthController(IConfiguration config, ILogger<AuthController> logger, SquadUpContext db)
        {
            _config = config;
            _logger = logger;
            _db = db;
        }
        
        /// <summary>
        /// Login with Discord OAuth2
        /// </summary>
        [Route("login")]
        public async Task<ActionResult> Login()
        {
            string clientId = _config.GetValue<string>("Discord:Auth:ClientId") ?? "";
            string clientSecret = _config.GetValue<string>("Discord:Auth:ClientSecret") ?? "";

            //Only allow JSON requests
            if (!Request.HasJsonContentType())
                return BadRequest();

            using StreamReader sr = new StreamReader(Request.Body);
            await using JsonTextReader jtr = new JsonTextReader(sr);
            
            //Deserialize incoming OAuth code
            JsonSerializer ser = new JsonSerializer();
            OAuthCode? code = ser.Deserialize<OAuthCode>(jtr);
            
            //Return 400 if no code was provided
            if (code == null)
                return BadRequest();
            
            //Exchange code for access token
            HttpClient client = new HttpClient() { BaseAddress = new Uri("https://discord.com") };
            
            HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "/api/v10/oauth2/token");
            request.Content = new FormUrlEncodedContent([
                new ("grant_type", "authorization_code"),
                new ("code", code.Value.Code),
                new ("redirect_uri", code.Value.RedirectUri)
            ]);
            
            //Add B64 encoded authentication header
            byte[] authBytes = Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}");
            string authHeader = Convert.ToBase64String(authBytes);
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authHeader);

            //Async send the exchange request
            HttpResponseMessage resp = await client.SendAsync(request);

            //TODO Actually provide parsable error
            if (resp.StatusCode != HttpStatusCode.OK)
                return StatusCode(401, $"Discord returned {resp.StatusCode}");
            
            //Deserialize the response
            OAuthAccessToken token = JsonConvert.DeserializeObject<OAuthAccessToken>(await resp.Content.ReadAsStringAsync());
            
            //Attempt Discord login
            DiscordRestClient ds = new DiscordRestClient();
            await ds.LoginAsync(TokenType.Bearer, token.AccessToken);

            if (ds.LoginState == LoginState.LoggedIn)
            {
                _logger.LogInformation("Token exchanged for {uid}", ds.CurrentUser.Id);

                ClaimsPrincipal usr = new ClaimsPrincipal([new ClaimsIdentity([
                    new Claim("uid", $"{ds.CurrentUser.Id}"),
                    new Claim("username", ds.CurrentUser.GlobalName ?? ds.CurrentUser.Username),
                    new Claim("token", token.AccessToken)
                ])]);
                
                //Sign in with the Discord auth handler
                await HttpContext.SignInAsync(DiscordAuthenticationHandler.SchemeName,
                    usr, new AuthenticationProperties(new Dictionary<string, string?>()
                    {
                        { "token", token.AccessToken },
                        { "refresh", token.RefreshToken },
                        { "expire", $"{token.ExpiresIn}" }
                    }));
                
                return Ok();
            }

            return Unauthorized();
        }

        /// <summary>
        /// Logout from the application
        /// </summary>
        [Route("logout")]
        public async Task<ActionResult> Logout()
        {
            //Just sign out from Discord
            await HttpContext.SignOutAsync(DiscordAuthenticationHandler.SchemeName);
            return Ok();
        }
    }
}