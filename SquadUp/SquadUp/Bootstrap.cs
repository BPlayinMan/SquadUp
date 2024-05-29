namespace SquadUp
{
    /// <summary>
    /// Utility class to bootstrap the application.
    /// </summary>
    internal static class Bootstrap
    {
        public static WebApplicationBuilder CreateBuilder(string[] args)
        {
            WebApplicationBuilder builder = WebApplication.CreateSlimBuilder(new WebApplicationOptions()
            {
                ApplicationName = "SquadUp",
                ContentRootPath = Environment.GetEnvironmentVariable("SU_ROOT") ?? Directory.GetCurrentDirectory(),
                Args = args,
                EnvironmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
            });
            
            //TODO Configure the builder

            return builder;
        }
    }
}