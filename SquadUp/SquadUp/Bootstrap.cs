using NLog;
using SquadUp.Logging;

namespace SquadUp
{
    /// <summary>
    /// Utility class to bootstrap the application.
    /// </summary>
    internal static class Bootstrap
    {
        //Logger for bootstrapping
        private static Logger? _bsLog;

        /// <summary>
        /// Get the logger for bootstrapping
        /// </summary>
        /// <remarks>
        /// If logging is yet to be initialized, a null logger is returned.
        /// </remarks>
        public static Logger Log => _bsLog ?? LogManager.CreateNullLogger();
        
        public static WebApplicationBuilder CreateBuilder(string[] args)
        {
            WebApplicationBuilder builder = WebApplication.CreateSlimBuilder(new WebApplicationOptions()
            {
                ApplicationName = "SquadUp",
                ContentRootPath = Environment.GetEnvironmentVariable("SU_ROOT") ?? Directory.GetCurrentDirectory(),
                Args = args,
                EnvironmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
            });
            
            LoggingBootstrap.InitLogging(builder);
            
            //TODO Configure the builder

            return builder;
        }
    }
}