using NLog;
using NLog.Config;
using NLog.Targets;
using NLog.Web;
using LogLevel = NLog.LogLevel;

namespace SquadUp.Logging
{
    /// <summary>
    /// Class used to initialize logging
    /// </summary>
    internal static class LoggingBootstrap
    {
        private const string LogLayout =
            "${date} [${logger}/${level:uppercase=true}] ${message} ${onexception:Inner=${newline}${exception:format=tostring}}";
        
        //Environment for logging init
        private static IWebHostEnvironment? s_env;
        
        public static void InitLogging(WebApplicationBuilder builder)
        {
            s_env = builder.Environment;
            
            //Reset and init configuration
            LogManager.Configuration = null;
            LogManager.Setup()
                .SetupExtensions(InitExtensions)
                .LoadConfiguration(InitTargets);

            //Clear and add NLog provider
            builder.Logging.ClearProviders();
            builder.Logging.AddNLogWeb();

            s_env = null;
        }

        private static void InitExtensions(ISetupExtensionsBuilder exts)
        {
            //TODO Add ASP.NET Core extensions
        }

        private static void InitTargets(ISetupLoadConfigurationBuilder builder)
        {
            //Logging files
            string logsDir = Path.Combine(s_env!.ContentRootPath, "Logs");
            string latestFile = Path.Combine(logsDir, "latest.log");
            string rollingFile = Path.Combine(logsDir, $"{DateTime.Now:dd_MM_yyyy-HH_mm_ss}.log");

            //File logging
            builder.ForLogger("*")
                .FilterMinLevel(LogLevel.Info)
                .WriteTo(new FileTarget()
                {
                    FileName = latestFile,
                    Layout = LogLayout,
                    DeleteOldFileOnStartup = true
                });
            builder.ForLogger("*")
                .FilterMinLevel(LogLevel.Debug)
                .WriteToFile(rollingFile, LogLayout);
            
            //Suppress all ASP.NET and EF logs
            builder.ForLogger("Microsoft.AspNetCore.*")
                .WriteToNil(s_env.IsProduction() ? LogLevel.Warn : LogLevel.Info);
            builder.ForLogger("Microsoft.EntityFrameworkCore.*")
                .WriteToNil(LogLevel.Warn);

            //Write remaining logs to console
            builder.ForLogger("*")
                .FilterMinLevel(s_env.IsProduction() ? LogLevel.Info : LogLevel.Debug)
                .WriteToConsole(LogLayout);
        }
    }
}