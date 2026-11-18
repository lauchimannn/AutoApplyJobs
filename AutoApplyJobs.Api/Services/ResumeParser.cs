
using System.Text.RegularExpressions;

namespace AutoApplyJobs.Api.Services;

public class EducationItem
{
    public string Course { get; set; } = "";
    public string Institution { get; set; } = "";
    public string StartDate { get; set; } = "";
    public string EndDate { get; set; } = "";
}

public class WorkExperienceItem
{
    public string JobTitle { get; set; } = "";
    public string Company { get; set; } = "";
    public string StartDate { get; set; } = "";
    public string EndDate { get; set; } = "";
    public string Location { get; set; } = "";
    public List<string> Details { get; set; } = [];
}

public class ResumeExtractionResult
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public List<string> Skills { get; set; } = [];
    public List<EducationItem> Education { get; set; } = [];
    public List<WorkExperienceItem> WorkExperience { get; set; } = [];
}

public static class ResumeParser
{
    private static readonly string[] KnownSkills =
    [
        "C#", ".NET", "ASP.NET Core", "ASP.NET",
        "React", "TypeScript", "JavaScript",
        "Python", "Java", "PHP",
        "SQL", "MySQL", "MariaDB", "SQLite",
        "SQL Server", "REST API", "Entity Framework",
        "Git", "Docker", "Linux", "Azure",
        "HTML", "CSS", "Node.js",
        "Machine Learning", "Artificial Intelligence",
        "MQTT"
    ];

    private static readonly string[] EducationHeadings =
    [
        "education",
        "academic background",
        "qualifications",
        "educational background"
    ];

    private static readonly string[] WorkExperienceHeadings =
    [
        "work experience",
        "professional experience",
        "employment history",
        "career history",
        "experience"
    ];

    private static readonly string[] EndHeadings =
    [
        "education", "academic background", "qualifications",
        "educational background",
        "work experience", "professional experience",
        "employment history", "career history",
        "skills", "technical skills", "personal information",
        "projects", "certifications", "languages",
        "references", "interests"
    ];

    private static readonly Regex DateRangeRegex = new(
        @"(?<start>(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(?:19|20)\d{2}|(?:0?[1-9]|1[0-2])[/.-](?:19|20)\d{2})\s*(?:-|–|—|to|until)\s*(?<end>(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(?:19|20)\d{2}|(?:0?[1-9]|1[0-2])[/.-](?:19|20)\d{2}|(?:Expected\s+)?Present|Expected\s+(?:(?:19|20)\d{2}))",
        RegexOptions.IgnoreCase | RegexOptions.Compiled
    );

    private static readonly Regex InstitutionRegex = new(
        @"\b(university|universities|college|institute|institution|polytechnic|school of|academy)\b",
        RegexOptions.IgnoreCase | RegexOptions.Compiled
    );

    private static readonly Regex WorkDateRangeRegex = new(
        @"(?<start>(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}/\d{4}|\d{4}))\s*(?:-|–|—|to|until)\s*(?<end>(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}/\d{4}|\d{4}|Present|Current))",
        RegexOptions.IgnoreCase | RegexOptions.Compiled
    );

    private static readonly Regex LocationRegex = new(
        @"\b(Hong Kong|Australia|United Kingdom|Singapore|Canada|China)\b",
        RegexOptions.IgnoreCase
    );

    private static readonly Regex JobTitleRegex = new(
        @"\b(Programmer|Developer|Engineer|Teacher|Manager|Analyst|Designer|Consultant|Administrator|Intern|Officer)\b",
        RegexOptions.IgnoreCase
    );

    private static List<WorkExperienceItem> ExtractWorkExperience(string text)
    {
        var result = new List<WorkExperienceItem>();

        if (string.IsNullOrWhiteSpace(text))
            return result;

        var lines = text
            .Split('\n', StringSplitOptions.RemoveEmptyEntries)
            .Select(x => x.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToList();

        var dateIndexes = new List<int>();

        for (int i = 0; i < lines.Count; i++)
        {
            if (WorkDateRangeRegex.IsMatch(lines[i]))
                dateIndexes.Add(i);
        }

        for (int i = 0; i < dateIndexes.Count; i++)
        {
            int dateIndex = dateIndexes[i];
            int startIndex = i == 0 ? 0 : dateIndexes[i - 1] + 1;

            // Include the job title line immediately before the date line.
            int blockStart = Math.Max(startIndex, dateIndex - 1);

            var block = lines
                .Skip(blockStart)
                .Take((i + 1 < dateIndexes.Count
                    ? dateIndexes[i + 1]
                    : lines.Count) - blockStart)
                .ToList();

            var item = ParseWorkExperienceEntry(block);

            if (!string.IsNullOrWhiteSpace(item.JobTitle) ||
                !string.IsNullOrWhiteSpace(item.Company))
            {
                result.Add(item);
            }
        }

        return result;
    }

    private static WorkExperienceItem ParseWorkExperienceEntry(List<string> lines)
    {
        var item = new WorkExperienceItem();

        if (lines.Count == 0)
            return item;

        // Find the line containing the employment dates.
        int dateLineIndex = lines.FindIndex(x => WorkDateRangeRegex.IsMatch(x));

        if (dateLineIndex < 0)
            return item;

        var dateLine = lines[dateLineIndex];
        var dateMatch = WorkDateRangeRegex.Match(dateLine);

        item.StartDate = dateMatch.Groups["start"].Value.Trim();
        item.EndDate = dateMatch.Groups["end"].Value.Trim();

        // Job title is usually the line immediately before the date line.
        if (dateLineIndex > 0)
            item.JobTitle = lines[dateLineIndex - 1];

        // Company and location
        var companyLine = dateLine
            .Remove(dateMatch.Index, dateMatch.Length)
            .Trim();

        companyLine = companyLine.Trim('|', '-', '–', '—', ',', ' ');

        var locationMatch = LocationRegex.Match(companyLine);

        if (locationMatch.Success)
        {
            item.Location = locationMatch.Value;
            companyLine = companyLine.Remove(
                locationMatch.Index,
                locationMatch.Length
            );
        }

        item.Company = companyLine.Trim('|', '-', '–', '—', ',', ' ');

        // Check the next line for location too.
        if (dateLineIndex + 1 < lines.Count)
        {
            var nextLine = lines[dateLineIndex + 1];
            var nextLocation = LocationRegex.Match(nextLine);

            if (nextLocation.Success)
            {
                item.Location = nextLocation.Value;
            }
        }

        // Details
        for (int i = dateLineIndex + 1; i < lines.Count; i++)
        {
            var detail = lines[i].Trim();

            if (LocationRegex.IsMatch(detail) &&
                LocationRegex.Match(detail).Value == item.Location)
                continue;

            if (!string.IsNullOrWhiteSpace(detail))
                item.Details.Add(detail);
        }

        // Remaining lines are the job details.
        for (int i = dateLineIndex + 1; i < lines.Count; i++)
        {
            var detail = lines[i].Trim();

            if (!string.IsNullOrWhiteSpace(detail))
                item.Details.Add(detail);
        }

        return item;
    }


    public static ResumeExtractionResult Parse(string text)
    {
        var result = new ResumeExtractionResult();

        if (string.IsNullOrWhiteSpace(text))
            return result;

        var lines = text
            .Split(['\r', '\n'], StringSplitOptions.RemoveEmptyEntries)
            .Select(line => line.Trim())
            .Where(line => !string.IsNullOrWhiteSpace(line))
            .ToList();

        // Name
        if (lines.Count > 0)
        {
            var firstLine = lines[0];

            if (firstLine.Length <= 80 &&
                !firstLine.Contains('@') &&
                !Regex.IsMatch(firstLine, @"\d{5,}") &&
                !Regex.IsMatch(firstLine,
                    @"\b(resume|curriculum vitae|cv)\b",
                    RegexOptions.IgnoreCase))
            {
                result.FullName = firstLine;
            }
        }

        // Email
        var emailMatch = Regex.Match(
            text,
            @"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}",
            RegexOptions.IgnoreCase
        );

        if (emailMatch.Success)
            result.Email = emailMatch.Value;

        // Phone
        var phoneMatch = Regex.Match(
            text,
            @"(?<!\w)(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}(?!\w)"
        );

        if (phoneMatch.Success)
            result.Phone = phoneMatch.Value.Trim();

        // Skills
        result.Skills = KnownSkills
            .Where(skill => Regex.IsMatch(
                text,
                Regex.Escape(skill),
                RegexOptions.IgnoreCase
            ))
            .ToList();

        // Education
        var educationText = ExtractSection(
            lines,
            EducationHeadings
        );

        result.Education = ExtractEducation(educationText);

        // Work Experience
        var workExperienceText = ExtractSection(lines, WorkExperienceHeadings);
        result.WorkExperience = ExtractWorkExperience(workExperienceText);

        return result;
    }

    private static List<EducationItem> ExtractEducation(
        string educationText)
    {
        var education = new List<EducationItem>();

        if (string.IsNullOrWhiteSpace(educationText))
            return education;

        var lines = educationText
            .Split(['\r', '\n'], StringSplitOptions.RemoveEmptyEntries)
            .Select(line => line.Trim())
            .Where(line => !string.IsNullOrWhiteSpace(line))
            .ToList();

        // Each date range normally identifies one education entry.
        var dateLineIndexes = lines
            .Select((line, index) => new { line, index })
            .Where(x => DateRangeRegex.IsMatch(x.line))
            .Select(x => x.index)
            .ToList();

        for (int i = 0; i < dateLineIndexes.Count; i++)
        {
            int currentIndex = dateLineIndexes[i];

            int previousIndex = i == 0
                ? -1
                : dateLineIndexes[i - 1];

            var entryLines = lines
                .Skip(previousIndex + 1)
                .Take(currentIndex - previousIndex)
                .ToList();

            var entry = ParseEducationEntry(entryLines);

            if (!string.IsNullOrWhiteSpace(entry.Course) ||
                !string.IsNullOrWhiteSpace(entry.Institution))
            {
                education.Add(entry);
            }
        }

        return education;
    }

    private static EducationItem ParseEducationEntry(
        List<string> entryLines)
    {
        var item = new EducationItem();

        var courseCandidates = new List<string>();
        var institutionCandidates = new List<string>();

        foreach (var line in entryLines)
        {
            var dateMatch = DateRangeRegex.Match(line);

            if (dateMatch.Success)
            {
                item.StartDate = dateMatch.Groups["start"].Value.Trim();
                item.EndDate = dateMatch.Groups["end"].Value.Trim();
            }

            // Remove date information before classifying the line.
            var cleanLine = DateRangeRegex.Replace(line, "").Trim();

            cleanLine = cleanLine
                .Trim('|', '-', '–', '—', ',', ';', ':')
                .Trim();

            if (string.IsNullOrWhiteSpace(cleanLine))
                continue;

            // Support layouts using | as a separator.
            var parts = cleanLine
                .Split('|', StringSplitOptions.RemoveEmptyEntries)
                .Select(x => x.Trim())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .ToList();

            foreach (var part in parts)
            {
                if (InstitutionRegex.IsMatch(part))
                {
                    institutionCandidates.Add(part);
                }
                else
                {
                    courseCandidates.Add(part);
                }
            }
        }

        item.Course = courseCandidates.FirstOrDefault() ?? "";
        item.Institution = institutionCandidates.FirstOrDefault() ?? "";

        return item;
    }

    private static string ExtractSection(
        List<string> lines,
        string[] headings)
    {
        var startIndex = lines.FindIndex(line =>
            headings.Any(heading =>
                Regex.IsMatch(
                    line,
                    @"^\s*" + Regex.Escape(heading) + @"\s*:?\s*$",
                    RegexOptions.IgnoreCase
                )
            )
        );

        if (startIndex < 0)
            return "";

        var sectionLines = new List<string>();

        for (int i = startIndex + 1; i < lines.Count; i++)
        {
            bool isNextSection = EndHeadings.Any(heading =>
                Regex.IsMatch(
                    lines[i],
                    @"^\s*" + Regex.Escape(heading) + @"\s*:?\s*$",
                    RegexOptions.IgnoreCase
                )
            );

            if (isNextSection)
                break;

            sectionLines.Add(lines[i]);
        }

        return string.Join(Environment.NewLine, sectionLines);
    }
}
