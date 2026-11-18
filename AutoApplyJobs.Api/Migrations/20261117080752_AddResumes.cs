using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoApplyJobs.Api.Migrations;

/// <inheritdoc />
public partial class _20261117080752_AddResumes : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Resumes",
            columns: table => new
            {
                Id = table.Column<int>(type: "INTEGER", nullable: false)
                    .Annotation("Sqlite:Autoincrement", true),
                OriginalFileName = table.Column<string>(type: "TEXT", nullable: false),
                StoredFileName = table.Column<string>(type: "TEXT", nullable: false),
                FileExtension = table.Column<string>(type: "TEXT", nullable: false),
                FileSize = table.Column<long>(type: "INTEGER", nullable: false),
                IsDefault = table.Column<bool>(type: "INTEGER", nullable: false),
                UploadedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Resumes", x => x.Id);
            });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "Resumes");
    }
}
