using Microsoft.EntityFrameworkCore;

namespace SquadUp.Model
{
    /// <summary>
    /// DB Context for SquadUp systems
    /// </summary>
    public class SquadUpContext : DbContext
    {
        public SquadUpContext(DbContextOptions<SquadUpContext> opts)
            : base(opts)
        { }
    }
}