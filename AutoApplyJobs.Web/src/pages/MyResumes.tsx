
import { useEffect, useState, type ChangeEvent } from "react";
import "../styles/MyResumes.css";
import axios from "axios";
import {
    FileUp,
    File as FileIcon,
    FileText,
    Trash2,
    Star,
    Eye,
    ScanSearch,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";

const API_URL = "http://localhost:5250/api/resumes";

interface ResumeItem {
    id: number;
    originalFileName: string;
    fileExtension: string;
    fileSize: number;
    isDefault: boolean;
    uploadedAt: string;
    extractionStatus: "Pending" | "Processing" | "Extracted" | "Extraction Failed";
    extractedData: string | null;
    extractionError: string | null;
    extractedAt: string | null;
}

interface EducationItem {
    Course: string;
    Institution: string;
    StartDate: string;
    EndDate: string;
}

interface WorkExperienceItem {
    JobTitle: string;
    Company: string;
    StartDate: string;
    EndDate: string;
    Location: string;
    Details: string[];
}

interface ExtractedResumeData {
    FullName: string;
    Email: string;
    Phone: string;
    Skills: string[];
    Education: EducationItem[];
    WorkExperience: WorkExperienceItem[];
}

function normalizeEducation(value: unknown): EducationItem[] {
    if (Array.isArray(value)) {
        return value.map((item: Partial<EducationItem>) => ({
            Course: item.Course ?? "",
            Institution: item.Institution ?? "",
            StartDate: item.StartDate ?? "",
            EndDate: item.EndDate ?? ""
        }));
    }

    if (typeof value === "string" && value.trim()) {
        return [{
            Course: value.trim(),
            Institution: "",
            StartDate: "",
            EndDate: ""
        }];
    }

    return [];
}

function normalizeWorkExperience(value: unknown): WorkExperienceItem[] {
    if (Array.isArray(value)) {
        return value.map((item: Partial<WorkExperienceItem>) => ({
            JobTitle: item.JobTitle ?? "",
            Company: item.Company ?? "",
            StartDate: item.StartDate ?? "",
            EndDate: item.EndDate ?? "",
            Location: item.Location ?? "",
            Details: item.Details ?? []
        }));
    }

    return [];
}

function MyResumes() {
    const [resumes, setResumes] = useState<ResumeItem[]>([]);
    const [uploadError, setUploadError] = useState("");
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [actionId, setActionId] = useState<number | null>(null);
    const [selectedResumeId, setSelectedResumeId] =
        useState<number | null>(null);
    const selectedResume = resumes.find(
        (resume) => resume.id === selectedResumeId
    );
    const [extractedForm, setExtractedForm] =
        useState<ExtractedResumeData>({
            FullName: "",
            Email: "",
            Phone: "",
            Skills: [],
            Education: [],
            WorkExperience: []
        });

    // Load resumes from Backend
    const loadResumes = async () => {
        try {
            setLoading(true);

            const response = await axios.get(API_URL);

            setResumes(response.data);

            setUploadError("");
        } catch (error) {
            console.error("Failed to load resumes:", error);
            setUploadError("Unable to load resumes. Please check your API connection.");
        } finally {
            setLoading(false);
        }
    };

    const updateWorkExperience = (
        index: number,
        field: keyof WorkExperienceItem,
        value: string
    ) => {
        setExtractedForm(prev => ({
            ...prev,
            WorkExperience: prev.WorkExperience.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const updateWorkExperienceDetails = (
        index: number,
        value: string
    ) => {
        setExtractedForm(prev => ({
            ...prev,
            WorkExperience: prev.WorkExperience.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        Details: value.split("\n")
                    }
                    : item
            )
        }));
    };

    const addWorkExperience = () => {
        setExtractedForm(prev => ({
            ...prev,
            WorkExperience: [
                ...prev.WorkExperience,
                {
                    JobTitle: "",
                    Company: "",
                    StartDate: "",
                    EndDate: "",
                    Location: "",
                    Details: []
                }
            ]
        }));
    };

    const removeWorkExperience = (index: number) => {
        setExtractedForm(prev => ({
            ...prev,
            WorkExperience: prev.WorkExperience.filter((_, i) => i !== index)
        }));
    };

    const updateEducation = (
        index: number,
        field: keyof EducationItem,
        value: string
    ) => {
        setExtractedForm(prev => ({
            ...prev,
            Education: prev.Education.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const addEducation = () => {
        setExtractedForm(prev => ({
            ...prev,
            Education: [
                ...prev.Education,
                {
                    Course: "",
                    Institution: "",
                    StartDate: "",
                    EndDate: ""
                }
            ]
        }));
    };

    const removeEducation = (index: number) => {
        setExtractedForm(prev => ({
            ...prev,
            Education: prev.Education.filter((_, i) => i !== index)
        }));
    };

    useEffect(() => {
        void loadResumes();
    }, []);

    // Upload resume
    const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const extension = file.name.split(".").pop()?.toLowerCase();

        if (!["pdf", "doc", "docx", "html", "htm"].includes(extension ?? "")) {
            setUploadError("Only PDF, DOC, DOCX and HTML files are supported.");
            event.target.value = "";
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setUploadError("File size must be 10 MB or below.");
            event.target.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);
            setUploadError("");

            await axios.post(API_URL, formData);

            await loadResumes();
        } catch (error) {
            console.error("Upload failed:", error);

            if (axios.isAxiosError(error)) {
                setUploadError(
                    typeof error.response?.data === "string"
                        ? error.response.data
                        : "Upload failed. Please check your API connection."
                );
            } else {
                setUploadError("An unexpected error occurred during upload.");
            }
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    // Set default resume
    const setDefault = async (id: number) => {
        try {
            setActionId(id);
            setUploadError("");

            await axios.put(`${API_URL}/${id}/default`);

            await loadResumes();
        } catch (error) {
            console.error("Failed to set default:", error);
            setUploadError("Failed to update default resume.");
        } finally {
            setActionId(null);
        }
    };

    // Delete resume
    const deleteResume = async (id: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this resume?"
        );

        if (!confirmed) return;

        try {
            setActionId(id);
            setUploadError("");

            await axios.delete(`${API_URL}/${id}`);

            await loadResumes();
        } catch (error) {
            console.error("Failed to delete resume:", error);
            setUploadError("Failed to delete resume.");
        } finally {
            setActionId(null);
        }
    };

    // Preview resume
    const previewResume = (id: number) => {
        window.open(
            `${API_URL}/${id}/file`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    return (
        <main className="dashboard-content resumes-page">
            <section className="welcome-section">
                <div>
                    <div className="eyebrow">DOCUMENT MANAGEMENT</div>
                    <h1>My Resumes</h1>
                    <p>Manage your CVs for different job applications.</p>
                </div>

                <label className={`primary-button upload-button ${uploading ? "disabled" : ""}`}>
                    <FileUp size={16} />
                    {uploading ? "Uploading..." : "Upload Resume"}
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.html,.htm"
                        onChange={handleUpload}
                        disabled={uploading}
                        hidden
                    />
                </label>
            </section>

            <section className="resume-summary">
                <div className="resume-summary-icon">
                    <FileText size={22} />
                </div>
                <div>
                    <strong>{resumes.length} Resumes</strong>
                    <span>PDF, DOC, DOCX, HTML and HTM · Maximum 10 MB per file</span>
                </div>
            </section>

            {uploadError && (
                <div className="resume-error">
                    <AlertCircle size={15} />
                    {uploadError}
                </div>
            )}

            <section className="panel resume-panel">
                <div className="panel-header">
                    <div>
                        <h2>Resume Library</h2>
                        <p>Your uploaded resumes and extraction status</p>
                    </div>
                </div>

                {loading ? (
                    <div className="resume-empty">
                        <span>Loading resumes...</span>
                    </div>
                ) : resumes.length > 0 ? (
                    <div className="resume-list">
                        {resumes.map((resume) => (
                            <div className="resume-item" key={resume.id}>
                                <div className="resume-file-icon">
                                    <FileIcon size={22} />
                                </div>

                                <div className="resume-info">
                                    <div className="resume-name-row">
                                        <strong>{resume.originalFileName}</strong>

                                        {resume.isDefault && (
                                            <span className="default-badge">
                                                <Star size={11} />
                                                Default
                                            </span>
                                        )}
                                    </div>

                                    <div className="resume-meta">
                                        <span>{resume.fileExtension.replace(".", "").toUpperCase()}</span>
                                        <span>
                                            {(resume.fileSize / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                        <span>
                                            {new Date(resume.uploadedAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className={`extraction-status ${resume.extractionStatus === "Extracted"
                                            ? "extracted"
                                            : "needs-extraction"
                                        }`}>
                                        {resume.extractionStatus === "Extracted"
                                            ? <CheckCircle2 size={13} />
                                            : <AlertCircle size={13} />}
                                        {resume.extractionStatus}
                                    </div>

                                    {resume.extractionError && (
                                        <div className="resume-error">
                                            {resume.extractionError}
                                        </div>
                                    )}
                                </div>

                                <div className="resume-actions">
                                    <button
                                        className="icon-button"
                                        title="Preview Resume"
                                        onClick={() => previewResume(resume.id)}
                                    >
                                        <Eye size={17} />
                                    </button>

                                    <button
                                        className="resume-action-button"
                                        disabled={!resume.extractedData}
                                        onClick={() => {
                                            try {
                                                const data = JSON.parse(resume.extractedData ?? "{}");

                                                setExtractedForm({
                                                    FullName: data.FullName ?? "",
                                                    Email: data.Email ?? "",
                                                    Phone: data.Phone ?? "",
                                                    Skills: data.Skills ?? [],
                                                    Education: normalizeEducation(data.Education),
                                                    WorkExperience: normalizeWorkExperience(data.WorkExperience)
                                                });

                                                setSelectedResumeId(resume.id);
                                            } catch {
                                                setUploadError("Unable to read extracted CV data.");
                                            }
                                        }}
                                    >
                                        View Extracted Data
                                    </button>

                                    {!resume.isDefault && (
                                        <button
                                            className="resume-action-button"
                                            disabled={actionId === resume.id}
                                            onClick={() => setDefault(resume.id)}
                                        >
                                            Set Default
                                        </button>
                                    )}

                                    <button
                                        className="icon-button delete-button"
                                        title="Delete Resume"
                                        disabled={actionId === resume.id}
                                        onClick={() => deleteResume(resume.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="resume-empty">
                        <FileUp size={30} />
                        <strong>No resumes uploaded</strong>
                        <span>Upload your CV to get started.</span>
                    </div>
                )}
            </section>

            <section className="panel extraction-panel">
                <div className="extraction-heading">
                    <div className="resume-summary-icon">
                        <ScanSearch size={20} />
                    </div>
                    <div>
                        <h2>CV Information Extraction</h2>
                        <p>Turn your resume into reusable application information.</p>
                    </div>
                </div>

                <div className="extraction-steps">
                    <div>
                        <span className="step-number">01</span>
                        <strong>Upload CV</strong>
                        <p>PDF or DOCX</p>
                    </div>
                    <div>
                        <span className="step-number">02</span>
                        <strong>Extract Information</strong>
                        <p>Experience, skills and education</p>
                    </div>
                    <div>
                        <span className="step-number">03</span>
                        <strong>Review & Verify</strong>
                        <p>Confirm before applying</p>
                    </div>
                </div>

                <div className="extraction-notice">
                    <AlertCircle size={14} />
                    CV information extraction is not connected yet.
                </div>
            </section>

            {selectedResume && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Extracted CV Information</h2>

                            <button
                                className="icon-button"
                                onClick={() => setSelectedResumeId(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <h3>{selectedResume.originalFileName}</h3>

                        <div className="extracted-form">

                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={extractedForm.FullName}
                                    onChange={(e) => setExtractedForm({
                                        ...extractedForm,
                                        FullName: e.target.value
                                    })}
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={extractedForm.Email}
                                        onChange={(e) => setExtractedForm({
                                            ...extractedForm,
                                            Email: e.target.value
                                        })}
                                        placeholder="Email address"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        value={extractedForm.Phone}
                                        onChange={(e) => setExtractedForm({
                                            ...extractedForm,
                                            Phone: e.target.value
                                        })}
                                        placeholder="Phone number"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Skills (One per line)</label>
                                <textarea
                                    rows={6}
                                    value={extractedForm.Skills.join("\n")}
                                    onChange={(e) => setExtractedForm({
                                        ...extractedForm,
                                        Skills: e.target.value.split("\n")
                                    })}
                                    placeholder="Enter skills..."
                                />
                            </div>


                            <div className="form-group">
                                <div className="resume-name-row">
                                    <label>Education</label>
                                    <button
                                        type="button"
                                        className="resume-action-button"
                                        onClick={addEducation}
                                    >
                                        + Add Education
                                    </button>
                                </div>

                                {extractedForm.Education.map((education, index) => (
                                    <div className="education-entry" key={index}>
                                        <div className="resume-name-row">
                                            <strong>Education #{index + 1}</strong>
                                            <button
                                                type="button"
                                                className="icon-button delete-button"
                                                onClick={() => removeEducation(index)}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>

                                        {([
                                            ["Course", "Course"],
                                            ["Institution", "Institution"],
                                            ["StartDate", "Start Date"],
                                            ["EndDate", "End Date"]
                                        ] as const).map(([field, label]) => (
                                            <div className="form-group" key={field}>
                                                <label>{label}</label>
                                                <input
                                                    type="text"
                                                    value={education[field]}
                                                    onChange={e =>
                                                        updateEducation(index, field, e.target.value)
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className="form-group">
                                <label>Work Experience</label>

                                {extractedForm.WorkExperience.map((experience, index) => (
                                    <div className="education-entry" key={index}>
                                        <h4>Experience {index + 1}</h4>

                                        <input
                                            value={experience.JobTitle}
                                            placeholder="Job Title"
                                            onChange={e => updateWorkExperience(index, "JobTitle", e.target.value)}
                                        />

                                        <input
                                            value={experience.Company}
                                            placeholder="Company"
                                            onChange={e => updateWorkExperience(index, "Company", e.target.value)}
                                        />

                                        <input
                                            value={experience.StartDate}
                                            placeholder="Start Date"
                                            onChange={e => updateWorkExperience(index, "StartDate", e.target.value)}
                                        />

                                        <input
                                            value={experience.EndDate}
                                            placeholder="End Date"
                                            onChange={e => updateWorkExperience(index, "EndDate", e.target.value)}
                                        />

                                        <input
                                            value={experience.Location}
                                            placeholder="Location"
                                            onChange={e => updateWorkExperience(index, "Location", e.target.value)}
                                        />

                                        <label>Details</label>
                                        <textarea
                                            value={experience.Details.join("\n")}
                                            placeholder="Enter job responsibilities and achievements..."
                                            rows={6}
                                            onChange={e =>
                                                updateWorkExperienceDetails(index, e.target.value)
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="btn-remove-experience"
                                            onClick={() => removeWorkExperience(index)}
                                        >
                                            Remove Experience
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="btn-add-experience"
                                    onClick={addWorkExperience}
                                >
                                    + Add Experience
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default MyResumes;
