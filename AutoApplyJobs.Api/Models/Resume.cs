
namespace AutoApplyJobs.Api.Models;

public class Resume
{
    public int Id { get; set; }

    public string OriginalFileName { get; set; } = string.Empty;

    public string StoredFileName { get; set; } = string.Empty;

    public string FileExtension { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public bool IsDefault { get; set; }

    public DateTime UploadedAt { get; set; }

    // CV Extraction
    public string ExtractionStatus { get; set; } = "Pending";

    public string? ExtractedData { get; set; }

    public string? ExtractionError { get; set; }

    public DateTime? ExtractedAt { get; set; }
}
