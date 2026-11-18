
using DocumentFormat.OpenXml.Packaging;
using UglyToad.PdfPig;
using HtmlAgilityPack;

namespace AutoApplyJobs.Api.Services;

public static class ResumeTextExtractor
{
    public static string ExtractText(string filePath, string extension)
    {
        extension = extension.ToLowerInvariant();

        if (extension == ".pdf")
        {
            using var pdf = PdfDocument.Open(filePath);

            return string.Join(
                Environment.NewLine,
                pdf.GetPages().Select(page => page.Text)
            );
        }

        if (extension == ".docx")
        {
            using var document = WordprocessingDocument.Open(filePath, false);

            return document.MainDocumentPart?
                .Document?
                .Body?
                .InnerText ?? string.Empty;
        }

        if (extension == ".html" || extension == ".htm")
        {
            var html = new HtmlDocument();
            html.Load(filePath);

            // Remove non-content elements
            var unwantedNodes = html.DocumentNode.SelectNodes(
                "//script|//style|//noscript|//svg"
            );

            if (unwantedNodes != null)
            {
                foreach (var node in unwantedNodes)
                    node.Remove();
            }

            return HtmlEntity.DeEntitize(
                html.DocumentNode.InnerText
            ).Trim();
        }

        throw new NotSupportedException(
            "Only PDF, DOCX and HTML files are supported."
        );
    }
}
