using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoApplyJobs.Api.Migrations;

/// <inheritdoc />
public partial class _20261117110436_AddResumeExtractionFields : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<DateTime>(
            name: "ExtractedAt",
            table: "Resumes",
            type: "TEXT",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "ExtractedData",
            table: "Resumes",
            type: "TEXT",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "ExtractionError",
            table: "Resumes",
            type: "TEXT",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "ExtractionStatus",
            table: "Resumes",
            type: "TEXT",
            nullable: false,
            defaultValue: "");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "ExtractedAt",
            table: "Resumes");

        migrationBuilder.DropColumn(
            name: "ExtractedData",
            table: "Resumes");

        migrationBuilder.DropColumn(
            name: "ExtractionError",
            table: "Resumes");

        migrationBuilder.DropColumn(
            name: "ExtractionStatus",
            table: "Resumes");
    }
}
