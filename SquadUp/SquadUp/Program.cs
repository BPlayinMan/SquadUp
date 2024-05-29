namespace SquadUp
{
    internal static class Program
    {
        public static async Task Main(string[] args)
        {
            //Get the builder and initialize the application
            WebApplicationBuilder builder = Bootstrap.CreateBuilder(args);
            WebApplication app = builder.Build();

            //Async run the app
            await app.RunAsync();
        }
    }
}