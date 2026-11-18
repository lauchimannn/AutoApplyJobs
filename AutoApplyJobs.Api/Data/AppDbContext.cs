
using AutoApplyJobs.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoApplyJobs.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Resume> Resumes => Set<Resume>();
}
