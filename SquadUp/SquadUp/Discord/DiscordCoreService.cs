using Discord;
using Discord.WebSocket;

namespace SquadUp.Discord
{
    /// <summary>
    /// Core service for handling Discord
    /// </summary>
    public class DiscordCoreService : IHostedService
    {
        /// <summary>
        /// Access to the socket client
        /// </summary>
        public DiscordSocketClient Client { get; }

        //Logger for the service
        private ILogger<DiscordCoreService> _log;

        //Log for the Socket Client
        private ILogger _clientLog;

        //Token for the Discord bot
        private string _token;
        
        public DiscordCoreService(IConfiguration config, ILoggerFactory factory)
        {
            _log = factory.CreateLogger<DiscordCoreService>();
            _clientLog = factory.CreateLogger("Discord");

            Client = new DiscordSocketClient();
            Client.Log += LogAsync;

            _token = config["Discord:Token"] ?? "";
        }
        
        public async Task StartAsync(CancellationToken cancellationToken)
        {
            _log.LogInformation("Starting up Discord...");
            
            //Login and start
            await Client.LoginAsync(TokenType.Bot, _token);
            await Client.StartAsync();
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            //Stop and logout
            await Client.StopAsync();
            await Client.LogoutAsync();
        }
        
        private async Task LogAsync(LogMessage message)
        {
            switch (message.Severity)
            {
                case LogSeverity.Verbose:
                    _clientLog.LogTrace(message.Exception, "[{src}] {msg}", message.Source, message.Message);
                    break;
                case LogSeverity.Debug:
                    _clientLog.LogDebug(message.Exception, "[{src}] {msg}", message.Source, message.Message);
                    break;
                case LogSeverity.Info:
                    _clientLog.LogInformation(message.Exception, "[{src}] {msg}", message.Source, message.Message);
                    break;
                case LogSeverity.Warning:
                    _clientLog.LogWarning(message.Exception, "[{src}] {msg}", message.Source, message.Message);
                    break;
                case LogSeverity.Error:
                    _clientLog.LogError(message.Exception, "[{src}] {msg}", message.Source, message.Message);
                    break;
                case LogSeverity.Critical:
                    _clientLog.LogCritical(message.Exception, "[{src}] {msg}", message.Source, message.Message);
                    break;
            }
        }
    }
}