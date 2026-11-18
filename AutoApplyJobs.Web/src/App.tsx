
import MyResumes from "./pages/MyResumes";
import Workspace from "./pages/Workspace";
import { useState, type ElementType } from "react";
import {
    LayoutDashboard,
    Search,
    Bookmark,
    BriefcaseBusiness,
    UserRound,
    FileText,
    Bot,
    Settings,
    Bell,
    Play,
    Pause,
    RefreshCw,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    CircleDot,
    MoreHorizontal,
    TrendingUp,
    ChevronRight,
    Globe,
    ScanSearch,
    Send,
    Activity,
    ShieldCheck,
    CircleCheck,
} from "lucide-react";

type QueueStatus = "Ready" | "Needs Review" | "Preparing" | "Submitted";
type ActivityStatus = "Success" | "Info" | "Warning";

interface QueueJob {
    id: number;
    title: string;
    company: string;
    source: string;
    match: number;
    status: QueueStatus;
    salary: string;
}

interface ActivityItem {
    id: number;
    title: string;
    description: string;
    time: string;
    status: ActivityStatus;
}

const navigation = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Find Jobs", icon: Search },
    { label: "Saved Jobs", icon: Bookmark },
    { label: "Applications", icon: BriefcaseBusiness },
    { label: "My Resumes", icon: FileText },
    { label: "Automation", icon: Bot },
    { label: "Settings", icon: Settings },
];

const queueJobs: QueueJob[] = [
    {
        id: 1,
        title: "Senior .NET Developer",
        company: "Technology Group",
        source: "JobsDB",
        match: 96,
        status: "Ready",
        salary: "HK$28K - 35K",
    },
    {
        id: 2,
        title: "Full Stack Developer",
        company: "Digital Solutions",
        source: "Company Website",
        match: 91,
        status: "Needs Review",
        salary: "HK$25K - 32K",
    },
    {
        id: 3,
        title: "Backend Software Engineer",
        company: "CloudTech",
        source: "Indeed",
        match: 87,
        status: "Preparing",
        salary: "Negotiable",
    },
    {
        id: 4,
        title: "C# Software Developer",
        company: "Enterprise Systems",
        source: "CTgoodjobs",
        match: 84,
        status: "Ready",
        salary: "HK$26K - 33K",
    },
];

const initialActivities: ActivityItem[] = [
    {
        id: 1,
        title: "Job matching completed",
        description: "12 jobs matched your profile criteria",
        time: "10 minutes ago",
        status: "Success",
    },
    {
        id: 2,
        title: "New jobs discovered",
        description: "28 job listings collected from configured sources",
        time: "25 minutes ago",
        status: "Info",
    },
    {
        id: 3,
        title: "Application requires review",
        description: "Full Stack Developer · Digital Solutions",
        time: "42 minutes ago",
        status: "Warning",
    },
    {
        id: 4,
        title: "Duplicate listing skipped",
        description: "A previously collected job was detected",
        time: "1 hour ago",
        status: "Info",
    },
];

const sources = [
    { name: "JobsDB", detail: "Job discovery", initials: "J", color: "jobsdb" },
    { name: "LinkedIn", detail: "Job discovery", initials: "in", color: "linkedin" },
    { name: "Indeed", detail: "Job discovery", initials: "i", color: "indeed" },
    { name: "CTgoodjobs", detail: "Job discovery", initials: "C", color: "ctgoodjobs" },
    { name: "Career Pages", detail: "Direct websites", initials: "↗", color: "career" },
];

function StatusBadge({ status }: { status: QueueStatus }) {
    const className = status.toLowerCase().replace(" ", "-");

    const icons = {
        Ready: <CircleCheck size={13} />,
        "Needs Review": <AlertCircle size={13} />,
        Preparing: <Clock size={13} />,
        Submitted: <CheckCircle2 size={13} />,
    };

    return (
        <span className={`status-badge ${className}`}>
            {icons[status]}
            {status}
        </span>
    );
}

function StatCard({
    title,
    value,
    note,
    icon: Icon,
    color,
    trend,
}: {
    title: string;
    value: string;
    note: string;
    icon: ElementType;
    color: string;
    trend?: string;
}) {
    return (
        <div className="stat-card">
            <div className="stat-top">
                <span className="stat-title">{title}</span>
                <div className={`stat-icon ${color}`}>
                    <Icon size={19} />
                </div>
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-change">
                {trend && (
                    <span className="change-positive">
                        <ArrowUpRight size={14} />
                        {trend}
                    </span>
                )}
                <span>{note}</span>
            </div>
        </div>
    );
}

function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
    const [automationEnabled, setAutomationEnabled] = useState(false);
    const [activeTab, setActiveTab] = useState("All");
    const [activities] = useState(initialActivities);

    const filteredJobs =
        activeTab === "All"
            ? queueJobs
            : queueJobs.filter((job) => job.status === activeTab);

    return (
        <main className="dashboard-content">
            <section className="welcome-section">
                <div>
                    <div className="eyebrow">AUTOMATION CONTROL CENTER</div>
                    <h1>Job Search Command Center</h1>
                    <p>
                        Discover opportunities, match your profile and automate
                        applications from one place.
                    </p>
                </div>

                <div className="header-actions">
                    <button className="secondary-button">
                        <RefreshCw size={15} />
                        Refresh Data
                    </button>
                    <button className="primary-button">
                        <ScanSearch size={16} />
                        Find New Jobs
                    </button>
                </div>
            </section>

            <section className={`automation-banner ${automationEnabled ? "is-running" : ""}`}>
                <div className="automation-banner-left">
                    <div className="automation-main-icon">
                        <Bot size={27} />
                    </div>
                    <div>
                        <div className="automation-title-row">
                            <h2>Auto Apply Engine</h2>
                            <span className={`engine-status ${automationEnabled ? "running" : ""}`}>
                                <span></span>
                                {automationEnabled ? "Enabled · Demo Mode" : "Paused"}
                            </span>
                        </div>
                        <p>
                            {automationEnabled
                                ? "Demo mode is enabled. No real websites are being accessed."
                                : "Enable the engine to preview your automated job-search workflow."}
                        </p>
                    </div>
                </div>

                <button
                    className={`engine-toggle ${automationEnabled ? "enabled" : ""}`}
                    onClick={() => setAutomationEnabled((value) => !value)}
                >
                    {automationEnabled ? <Pause size={16} /> : <Play size={16} />}
                    {automationEnabled ? "Pause Engine" : "Enable Engine"}
                </button>
            </section>

            <section className="stats-grid">
                <StatCard
                    title="Jobs Discovered"
                    value="128"
                    trend="+18%"
                    note="Today"
                    icon={Search}
                    color="green"
                />
                <StatCard
                    title="Matched Jobs"
                    value="36"
                    trend="+12%"
                    note="Above 75% match"
                    icon={TrendingUp}
                    color="purple"
                />
                <StatCard
                    title="Ready to Apply"
                    value="18"
                    note="Prepared applications"
                    icon={FileText}
                    color="blue"
                />
                <StatCard
                    title="Successfully Applied"
                    value="12"
                    trend="+4"
                    note="Verified submissions"
                    icon={Send}
                    color="orange"
                />
            </section>

            <section className="main-grid">
                <div className="panel queue-panel">
                    <div className="panel-header">
                        <div>
                            <h2>Application Queue</h2>
                            <p>Jobs selected for your next applications</p>
                        </div>
                        <button className="text-button">
                            View all <ChevronRight size={15} />
                        </button>
                    </div>

                    <div className="queue-tabs">
                        {["All", "Ready", "Needs Review", "Preparing"].map((tab) => (
                            <button
                                key={tab}
                                className={activeTab === tab ? "queue-tab active" : "queue-tab"}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="queue-list">
                        {filteredJobs.map((job) => (
                            <div className="queue-item" key={job.id}>
                                <div className="queue-company-icon">
                                    <BriefcaseBusiness size={19} />
                                </div>

                                <div className="queue-job-info">
                                    <h3>{job.title}</h3>
                                    <p>{job.company}</p>
                                    <div className="queue-meta">
                                        <span><Globe size={12} />{job.source}</span>
                                        <strong>{job.salary}</strong>
                                    </div>
                                </div>

                                <div className="queue-match">
                                    <strong>{job.match}%</strong>
                                    <span>Match</span>
                                </div>

                                <StatusBadge status={job.status} />
                                <button className="icon-button">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        ))}
                        {filteredJobs.length === 0 && (
                            <div className="empty-state">No jobs in this category.</div>
                        )}
                    </div>
                </div>

                <div className="panel pipeline-panel">
                    <div className="panel-header">
                        <div>
                            <h2>Automation Pipeline</h2>
                            <p>From discovery to submission</p>
                        </div>
                        <Activity size={18} className="muted-icon" />
                    </div>

                    <div className="pipeline-list">
                        <div className="pipeline-step completed">
                            <div className="pipeline-step-icon"><Search size={16} /></div>
                            <div className="pipeline-step-info">
                                <strong>Job Discovery</strong>
                                <span>128 jobs collected</span>
                            </div>
                            <CheckCircle2 size={16} />
                        </div>

                        <div className="pipeline-connector"></div>

                        <div className="pipeline-step completed">
                            <div className="pipeline-step-icon"><TrendingUp size={16} /></div>
                            <div className="pipeline-step-info">
                                <strong>AI Matching</strong>
                                <span>36 suitable jobs found</span>
                            </div>
                            <CheckCircle2 size={16} />
                        </div>

                        <div className="pipeline-connector"></div>

                        <div className="pipeline-step active">
                            <div className="pipeline-step-icon"><FileText size={16} /></div>
                            <div className="pipeline-step-info">
                                <strong>Application Preparation</strong>
                                <span>18 applications prepared</span>
                            </div>
                            <CircleDot size={16} />
                        </div>

                        <div className="pipeline-connector"></div>

                        <div className="pipeline-step pending">
                            <div className="pipeline-step-icon"><Send size={16} /></div>
                            <div className="pipeline-step-info">
                                <strong>Automatic Submission</strong>
                                <span>Waiting for eligible websites</span>
                            </div>
                            <Clock size={16} />
                        </div>
                    </div>

                    <div className="pipeline-note">
                        <ShieldCheck size={15} />
                        <span>Only supported and permitted application flows will be automated.</span>
                    </div>
                </div>
            </section>

            <section className="panel sources-panel">
                <div className="panel-header">
                    <div>
                        <h2>Job Discovery Sources</h2>
                        <p>Manage where AutoApplyJobs looks for opportunities</p>
                    </div>
                    <button className="text-button">
                        Manage Sources <ChevronRight size={15} />
                    </button>
                </div>

                <div className="sources-grid">
                    {sources.map((source) => (
                        <div className="source-card" key={source.name}>
                            <div className={`source-logo ${source.color}`}>
                                {source.initials}
                            </div>
                            <div className="source-info">
                                <strong>{source.name}</strong>
                                <span>{source.detail}</span>
                            </div>
                            <span className="source-indicator" title="Demo configuration"></span>
                        </div>
                    ))}
                </div>
                <div className="source-disclaimer">
                    <AlertCircle size={14} />
                    Source connections are not configured yet. These are planned integrations.
                </div>
            </section>

            <section className="bottom-grid">
                <div className="panel activity-panel">
                    <div className="panel-header">
                        <div>
                            <h2>Recent Activity</h2>
                            <p>Latest automation events</p>
                        </div>
                        <button className="text-button">
                            Activity Log <ChevronRight size={15} />
                        </button>
                    </div>

                    <div className="activity-list">
                        {activities.map((item) => (
                            <div className="activity-item" key={item.id}>
                                <div className={`activity-icon ${item.status.toLowerCase()}`}>
                                    {item.status === "Success" && <CheckCircle2 size={15} />}
                                    {item.status === "Info" && <CircleDot size={15} />}
                                    {item.status === "Warning" && <AlertCircle size={15} />}
                                </div>
                                <div className="activity-info">
                                    <strong>{item.title}</strong>
                                    <span>{item.description}</span>
                                </div>
                                <time>{item.time}</time>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="panel profile-panel">
                    <div className="panel-header">
                        <div>
                            <h2>Resume Management</h2>
                            <p>CVs used by your application engine</p>
                        </div>
                        <UserRound size={18} className="muted-icon" />
                    </div>

                    <div className="profile-completion">
                        <div>
                            <strong>Profile Completion</strong>
                            <span>75%</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: "75%" }}></div>
                        </div>
                    </div>

                    <div className="profile-checklist">
                        <div><CheckCircle2 size={15} /> Default Resume</div>
                        <div><CheckCircle2 size={15} /> Resume Library</div>
                        <div className="incomplete"><AlertCircle size={15} /> CV Information Extraction</div>
                        <div className="incomplete"><AlertCircle size={15} /> Application Data Verification</div>
                    </div>

                    <button
                        className="secondary-button full-width"
                        onClick={() => onNavigate("My Resumes")}
                    >
                        Manage My Resumes <ArrowUpRight size={15} />
                    </button>
                </div>
            </section>

            <footer className="dashboard-footer">
                <span>AutoApplyJobs <span className="footer-version">v1.0.0</span></span>
                <span>Local Automated Job Application Manager</span>
            </footer>
        </main>
    );
}

function App() {
    const [activeNavigation, setActiveNavigation] = useState("Dashboard");

    return (
        <div className="app-shell">
            <header className="topbar">
                <div className="brand">
                    <div className="brand-icon">
                        <BriefcaseBusiness size={20} />
                    </div>
                    <span>AutoApply<span className="brand-highlight">Jobs</span></span>
                </div>

                <nav className="top-navigation">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.label}
                                className={`nav-item ${activeNavigation === item.label ? "active" : ""}`}
                                onClick={() => setActiveNavigation(item.label)}
                            >
                                <Icon size={16} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="topbar-actions">
                    <button className="icon-button notification-button">
                        <Bell size={19} />
                        <span className="notification-dot"></span>
                    </button>
                    <div className="user-profile">
                        <div className="user-avatar">CL</div>
                        <div className="user-details">
                            <strong>My Account</strong>
                            <span>Personal Workspace</span>
                        </div>
                    </div>
                </div>
            </header>

            {activeNavigation === "Dashboard" ? (
                <Dashboard onNavigate={setActiveNavigation} />
            ) : activeNavigation === "Find Jobs" ? (
                <Workspace />
            ) : activeNavigation === "My Resumes" ? (
                <MyResumes />
            ) : (
                <main className="dashboard-content placeholder-page">
                    <div className="eyebrow">WORKSPACE</div>
                    <h1>{activeNavigation}</h1>
                    <p>This module will be implemented in the next development phase.</p>
                    <button
                        className="secondary-button"
                        onClick={() => setActiveNavigation("Dashboard")}
                    >
                        <LayoutDashboard size={15} />
                        Back to Dashboard
                    </button>
                </main>
            )}
        </div>
    );
}

export default App;
