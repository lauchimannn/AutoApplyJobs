
import { useState } from "react";
import "../styles/Workspace.css";

type JobType = "All Types" | "Full-time" | "Part-time" | "Casual" | "Contract";
type WorkMode = "All Modes" | "On-site" | "Hybrid" | "Remote";

export default function Workspace() {
    const [keyword, setKeyword] = useState("");
    const [location, setLocation] = useState("");
    const [jobType, setJobType] = useState<JobType>("All Types");
    const [workMode, setWorkMode] = useState<WorkMode>("All Modes");
    const [datePosted, setDatePosted] = useState("Any time");
    const [salary, setSalary] = useState("");
    const [sortBy, setSortBy] = useState("Most relevant");
    const [selectedSources, setSelectedSources] = useState<string[]>([
        "SEEK",
        "JobsDB",
        "LinkedIn",
        "Indeed"
    ]);

    const sources = ["SEEK", "JobsDB", "LinkedIn", "Indeed", "CTgoodjobs"];

    const toggleSource = (source: string) => {
        setSelectedSources(current =>
            current.includes(source)
                ? current.filter(item => item !== source)
                : [...current, source]
        );
    };

    const handleSearch = () => {
        // TODO: Connect to backend job search API.
        console.log({
            keyword,
            location,
            jobType,
            workMode,
            datePosted,
            salary,
            sortBy,
            selectedSources
        });
    };

    return (
        <div className="workspace-page">
            <div className="workspace-header">
                <div>
                    <span className="workspace-eyebrow">WORKSPACE / JOB DISCOVERY</span>
                    <h1>Find Jobs</h1>
                    <p>Search and manage opportunities across multiple job platforms.</p>
                </div>
                <div className="workspace-header-actions">
                    <span className="workspace-status">
                        <span className="status-dot" />
                        Search engine ready
                    </span>
                </div>
            </div>

            <section className="job-search-panel">
                <div className="search-panel-heading">
                    <div>
                        <h2>Job Search</h2>
                        <p>Search multiple job sources from one place.</p>
                    </div>
                </div>

                <div className="job-search-fields">
                    <div className="search-field keyword-field">
                        <label>KEYWORDS</label>
                        <div className="search-input-wrap">
                            <span>⌕</span>
                            <input
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSearch()}
                                placeholder="Job title, skills or company..."
                            />
                        </div>
                    </div>

                    <div className="search-field">
                        <label>LOCATION</label>
                        <div className="search-input-wrap">
                            <span>⌖</span>
                            <input
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSearch()}
                                placeholder="City, country or remote"
                            />
                        </div>
                    </div>

                    <button className="job-search-button" onClick={handleSearch}>
                        Search Jobs
                    </button>
                </div>
            </section>

            <div className="workspace-content">
                <aside className="job-filters">
                    <div className="filter-heading">
                        <h3>Filters</h3>
                        <button onClick={() => {
                            setJobType("All Types");
                            setWorkMode("All Modes");
                            setDatePosted("Any time");
                            setSalary("");
                            setSelectedSources(sources);
                        }}>
                            Reset
                        </button>
                    </div>

                    <div className="filter-group">
                        <label>JOB TYPE</label>
                        <select
                            value={jobType}
                            onChange={e => setJobType(e.target.value as JobType)}
                        >
                            <option>All Types</option>
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Casual</option>
                            <option>Contract</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>WORK MODE</label>
                        <select
                            value={workMode}
                            onChange={e => setWorkMode(e.target.value as WorkMode)}
                        >
                            <option>All Modes</option>
                            <option>On-site</option>
                            <option>Hybrid</option>
                            <option>Remote</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>DATE POSTED</label>
                        <select
                            value={datePosted}
                            onChange={e => setDatePosted(e.target.value)}
                        >
                            <option>Any time</option>
                            <option>Last 24 hours</option>
                            <option>Last 3 days</option>
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>MINIMUM SALARY</label>
                        <input
                            type="number"
                            value={salary}
                            onChange={e => setSalary(e.target.value)}
                            placeholder="e.g. 25000"
                        />
                    </div>

                    <div className="filter-group">
                        <label>JOB SOURCES</label>
                        <div className="source-options">
                            {sources.map(source => (
                                <label className="source-option" key={source}>
                                    <input
                                        type="checkbox"
                                        checked={selectedSources.includes(source)}
                                        onChange={() => toggleSource(source)}
                                    />
                                    <span>{source}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                <main className="job-results">
                    <div className="results-toolbar">
                        <div>
                            <h2>Search Results</h2>
                            <p>Connect a job source to start retrieving listings.</p>
                        </div>

                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            aria-label="Sort jobs"
                        >
                            <option>Most relevant</option>
                            <option>Newest first</option>
                            <option>Salary: High to low</option>
                            <option>Salary: Low to high</option>
                            <option>AI match score</option>
                        </select>
                    </div>

                    <div className="job-empty-state">
                        <div className="empty-icon">⌕</div>
                        <h3>No job listings yet</h3>
                        <p>
                            Your unified job search workspace is ready.
                            Connect permitted job sources through the backend
                            to retrieve and display real listings here.
                        </p>
                        <div className="empty-source-list">
                            {sources.map(source => (
                                <span key={source}>{source}</span>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
