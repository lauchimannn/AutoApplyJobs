
using AutoApplyJobs.Api.Data;
using AutoApplyJobs.Api.Models;
using AutoApplyJobs.Api.Services;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoApplyJobs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResumesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    private const long MaxFileSize = 10 * 1024 * 1024;

    private static readonly string[] AllowedExtensions =
    {
        ".pdf", ".doc", ".docx", ".html", ".htm"
    };

    public ResumesController(
        AppDbContext context,
        IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    private string UploadDirectory =>
        Path.Combine(
            _environment.ContentRootPath,
            "App_Data",
            "Resumes"
        );

    // GET: api/resumes
    [HttpGet]
    public async Task<IActionResult> GetResumes()
    {
        var resumes = await _context.Resumes
            .OrderByDescending(r => r.UploadedAt)
            .Select(r => new
            {
                r.Id,
                r.OriginalFileName,
                r.FileExtension,
                r.FileSize,
                r.IsDefault,
                r.UploadedAt,
                r.ExtractionStatus,
                r.ExtractedData,
                r.ExtractionError,
                r.ExtractedAt
            })
            .ToListAsync();

        return Ok(resumes);
    }

    // POST: api/resumes

    [HttpPost]
    [RequestSizeLimit(11 * 1024 * 1024)]
    public async Task<IActionResult> UploadResume(
        [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Please select a file.");

        if (file.Length > MaxFileSize)
            return BadRequest("File size must not exceed 10 MB.");

        var extension = Path.GetExtension(file.FileName)
            .ToLowerInvariant();

        if (!AllowedExtensions.Contains(extension))
            return BadRequest("Only PDF, DOC, DOCX and HTML files are supported.");

        Directory.CreateDirectory(UploadDirectory);

        var storedFileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(UploadDirectory, storedFileName);

        var resume = new Resume
        {
            OriginalFileName = Path.GetFileName(file.FileName),
            StoredFileName = storedFileName,
            FileExtension = extension,
            FileSize = file.Length,
            IsDefault = !await _context.Resumes.AnyAsync(),
            UploadedAt = DateTime.UtcNow,
            ExtractionStatus = "Pending"
        };

        try
        {
            // 1. Save uploaded file
            await using (var stream = new FileStream(
                filePath,
                FileMode.CreateNew,
                FileAccess.Write))
            {
                await file.CopyToAsync(stream);
            }

            // 2. Save resume record first
            _context.Resumes.Add(resume);
            await _context.SaveChangesAsync();

            // 3. Automatically extract CV information
            try
            {
                resume.ExtractionStatus = "Processing";
                await _context.SaveChangesAsync();

                var text = ResumeTextExtractor.ExtractText(
                    filePath,
                    extension
                );

                if (string.IsNullOrWhiteSpace(text))
                    throw new InvalidOperationException(
                        "No readable text found in this resume."
                    );

                var result = ResumeParser.Parse(text);

                // 4. Store extraction result as JSON
                resume.ExtractedData = JsonSerializer.Serialize(result);
                resume.ExtractionStatus = "Extracted";
                resume.ExtractionError = null;
                resume.ExtractedAt = DateTime.UtcNow;
            }
            catch (Exception ex)
            {
                // Keep uploaded file even if extraction fails
                resume.ExtractionStatus = "Extraction Failed";
                resume.ExtractionError = ex.Message;
                resume.ExtractedData = null;
                resume.ExtractedAt = null;
            }

            // 5. Save extraction result and status
            await _context.SaveChangesAsync();

            return Created(
                $"/api/resumes/{resume.Id}/file",
                new
                {
                    resume.Id,
                    resume.OriginalFileName,
                    resume.FileExtension,
                    resume.FileSize,
                    resume.IsDefault,
                    resume.UploadedAt,
                    resume.ExtractionStatus,
                    resume.ExtractedData,
                    resume.ExtractionError,
                    resume.ExtractedAt
                });
        }
        catch
        {
            // Remove file if upload/database saving fails
            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);

            throw;
        }
    }

    // GET: api/resumes/{id}/file
    [HttpGet("{id:int}/file")]
    public async Task<IActionResult> GetResumeFile(int id)
    {
        var resume = await _context.Resumes.FindAsync(id);

        if (resume == null)
            return NotFound("Resume not found.");

        var filePath = Path.Combine(
            UploadDirectory,
            resume.StoredFileName
        );

        if (!System.IO.File.Exists(filePath))
            return NotFound("Resume file not found.");

        var contentType = resume.FileExtension switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".html" or ".htm" => "text/plain",
            _ => "application/octet-stream"
        };

        return PhysicalFile(
            filePath,
            contentType,
            enableRangeProcessing: true
        );
    }

    // PUT: api/resumes/{id}/default
    [HttpPut("{id:int}/default")]
    public async Task<IActionResult> SetDefault(int id)
    {
        var resume = await _context.Resumes.FindAsync(id);

        if (resume == null)
            return NotFound("Resume not found.");

        var resumes = await _context.Resumes.ToListAsync();

        foreach (var item in resumes)
            item.IsDefault = item.Id == id;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Default resume updated.",
            resume.Id,
            resume.OriginalFileName
        });
    }

    // DELETE: api/resumes/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteResume(int id)
    {
        var resume = await _context.Resumes.FindAsync(id);

        if (resume == null)
            return NotFound("Resume not found.");

        var wasDefault = resume.IsDefault;

        var filePath = Path.Combine(
            UploadDirectory,
            resume.StoredFileName
        );

        _context.Resumes.Remove(resume);

        if (wasDefault)
        {
            var nextResume = await _context.Resumes
                .Where(r => r.Id != id)
                .OrderByDescending(r => r.UploadedAt)
                .FirstOrDefaultAsync();

            if (nextResume != null)
                nextResume.IsDefault = true;
        }

        await _context.SaveChangesAsync();

        if (System.IO.File.Exists(filePath))
            System.IO.File.Delete(filePath);

        return NoContent();
    }



    [HttpPost("{id:int}/extract")]
    public async Task<IActionResult> ExtractResume(int id)
    {
        var resume = await _context.Resumes.FindAsync(id);

        if (resume == null)
            return NotFound("Resume not found.");

        var filePath = Path.Combine(
            UploadDirectory,
            resume.StoredFileName
        );

        if (!System.IO.File.Exists(filePath))
            return NotFound("Resume file not found.");

        try
        {
            var text = ResumeTextExtractor.ExtractText(
                filePath,
                resume.FileExtension.ToLowerInvariant()
            );

            if (string.IsNullOrWhiteSpace(text))
                throw new InvalidOperationException(
                    "No readable text found in this resume."
                );

            var result = ResumeParser.Parse(text);

            resume.ExtractedData = JsonSerializer.Serialize(result);
            resume.ExtractionStatus = "Extracted";
            resume.ExtractionError = null;
            resume.ExtractedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(result);
        }
        catch (Exception ex)
        {
            resume.ExtractionStatus = "Extraction Failed";
            resume.ExtractionError = ex.Message;
            resume.ExtractedData = null;
            resume.ExtractedAt = null;

            await _context.SaveChangesAsync();

            return StatusCode(500, new
            {
                message = "CV extraction failed.",
                detail = ex.Message
            });
        }
    }
}
