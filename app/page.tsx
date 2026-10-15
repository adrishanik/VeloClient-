
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Command,
  CreditCard,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  Menu,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
  LogOut,
  Trash2,
  Zap,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  industry: string;
  lead_status: string;
  estimated_value: number;
  created_at: string;
  notes?: string;
};

const sampleLeads: Lead[] = [
  {
    id: "demo-1",
    name: "James Wilson",
    email: "james@example.com",
    company: "Wilson Heating",
    industry: "HVAC",
    lead_status: "new",
    estimated_value: 4200,
    created_at: "2026-10-13T10:30:00Z",
  },
  {
    id: "demo-2",
    name: "Sarah Mitchell",
    email: "sarah@example.com",
    company: "Mitchell Roofing",
    industry: "Roofing",
    lead_status: "contacted",
    estimated_value: 7800,
    created_at: "2026-10-12T09:15:00Z",
  },
  {
    id: "demo-3",
    name: "Michael Carter",
    email: "michael@example.com",
    company: "Carter Plumbing",
    industry: "Plumbing",
    lead_status: "qualified",
    estimated_value: 2650,
    created_at: "2026-10-11T14:00:00Z",
  },
  {
    id: "demo-4",
    name: "Emily Brooks",
    email: "emily@example.com",
    company: "Brooks Electrical",
    industry: "Electrical",
    lead_status: "new",
    estimated_value: 1900,
    created_at: "2026-10-10T11:45:00Z",
  },
  {
    id: "demo-5",
    name: "Daniel Foster",
    email: "daniel@example.com",
    company: "Foster Climate",
    industry: "HVAC",
    lead_status: "won",
    estimated_value: 5400,
    created_at: "2026-10-09T08:00:00Z",
  },
];

const plans = [
  {
    name: "Common",
    price: "$199",
    description: "For growing service businesses.",
    features: [
      "Lead management",
      "AI-assisted email drafts",
      "Email follow-up workflow",
      "Basic pipeline analytics",
    ],
  },
  {
    name: "Pro",
    price: "$299",
    description: "For teams managing more opportunities.",
    features: [
      "Everything in Common",
      "Advanced pipeline analytics",
      "Team workflow tools",
      "Expanded email workflow",
    ],
    popular: true,
  },
  {
    name: "Lifetime",
    price: "$1,999",
    description: "A one-time payment option.",
    features: [
      "Email-only product features",
      "Lead management",
      "AI-assisted email drafts",
      "Lifetime access to the included version",
    ],
  },
];

const money = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

function Brand() {
  return (
    <a href="#" className="brand" aria-label="VeloClient home">
      VeloClient<span className="brand-period">.</span>
    </a>
  );
}

export default function Home() {
  const [section, setSection] = useState("overview");
  const [user, setUser] = useState<any>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>(sampleLeads);
  const [demo, setDemo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadIndustry, setLeadIndustry] = useState("HVAC");
  const [leadValue, setLeadValue] = useState("2500");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user);
        setDemo(false);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setOrgId(null);
        setDemo(true);
        setLeads(sampleLeads);
      } else {
        setDemo(false);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !supabase) return;

    let cancelled = false;

    async function loadWorkspace() {
      setLoading(true);

      const { data: organizations, error: orgError } = await supabase!
        .from("organizations")
        .select("id,name")
        .eq("owner_id", user.id)
        .limit(1);

      if (cancelled) return;

      if (orgError) {
        setMessage("Could not load your workspace. Check your Supabase SQL setup.");
        setLoading(false);
        return;
      }

      let organizationId = organizations?.[0]?.id;

      if (!organizationId) {
        const { data: organization, error } = await supabase!
          .from("organizations")
          .insert({
            owner_id: user.id,
            name: user.user_metadata?.full_name
              ? `${user.user_metadata.full_name}'s Workspace`
              : "My Workspace",
          })
          .select("id")
          .single();

        if (error || !organization) {
          setMessage("Could not create your workspace. Check your database policies.");
          setLoading(false);
          return;
        }

        organizationId = organization.id;

        const { error: membershipError } = await supabase!
          .from("memberships")
          .insert({
            organization_id: organizationId,
            user_id: user.id,
            role: "owner",
          });

        if (membershipError) {
          setMessage("Workspace created, but membership setup failed. Review Supabase policies.");
          setLoading(false);
          return;
        }
      }

      if (cancelled) return;

      setOrgId(organizationId);

      const { data: records, error } = await supabase!
        .from("leads")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setMessage("Unable to load leads. Please check the Supabase lead policies.");
      } else {
        setLeads((records ?? []) as Lead[]);
      }

      setLoading(false);
    }

    loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const query = search.toLowerCase();
      const matchesSearch =
        lead.name.toLowerCase().includes(query) ||
        lead.company.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" || lead.lead_status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [leads, search, filter]);

  const totalValue = leads
    .filter((lead) => lead.lead_status !== "lost")
    .reduce((sum, lead) => sum + Number(lead.estimated_value || 0), 0);

  const openAuth = (mode: "login" | "signup" = "signup") => {
    setAuthMode(mode);
    setMessage("");
    setAuthOpen(true);
  };

  async function handleAuth(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("Add your Supabase URL and publishable key in Vercel first.");
      return;
    }

    setLoading(true);

    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) {
        setMessage(error.message);
      } else if (data.session) {
        setUser(data.user);
        setDemo(false);
        setAuthOpen(false);
      } else {
        setMessage("Check your inbox to confirm your email, then sign in.");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setUser(data.user);
        setDemo(false);
        setAuthOpen(false);
      }
    }

    setLoading(false);
  }

  async function addLead(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    if (!leadName.trim() || !leadEmail.includes("@")) {
      setMessage("Enter a lead name and valid email address.");
      return;
    }

    if (demo || !supabase || !orgId || !user) {
      const lead: Lead = {
        id: `demo-${Date.now()}`,
        name: leadName.trim(),
        email: leadEmail.trim(),
        company: leadCompany.trim() || "New business",
        industry: leadIndustry,
        lead_status: "new",
        estimated_value: Number(leadValue) || 0,
        created_at: new Date().toISOString(),
      };

      setLeads((old) => [lead, ...old]);
      setAddOpen(false);
      setLeadName("");
      setLeadEmail("");
      setLeadCompany("");
      setLeadValue("2500");
      setMessage("Added to the demo workspace. Sign in to save real leads.");
      return;
    }

    const { data, error } = await supabase
      .from("leads")
      .insert({
        organization_id: orgId,
        name: leadName.trim(),
        email: leadEmail.trim(),
        company: leadCompany.trim(),
        industry: leadIndustry,
        estimated_value: Number(leadValue) || 0,
        lead_status: "new",
      })
      .select("*")
      .single();

    if (error) {
      setMessage(error.message);
    } else if (data) {
      setLeads((old) => [data as Lead, ...old]);
      setAddOpen(false);
      setLeadName("");
      setLeadEmail("");
      setLeadCompany("");
      setLeadValue("2500");
      setMessage("Lead saved to your workspace.");
    }
  }

  async function updateStatus(lead: Lead, status: string) {
    if (demo || !supabase) {
      setLeads((old) =>
        old.map((item) =>
          item.id === lead.id ? { ...item, lead_status: status } : item
        )
      );
      return;
    }

    const { error } = await supabase
      .from("leads")
      .update({ lead_status: status, updated_at: new Date().toISOString() })
      .eq("id", lead.id)
      .eq("organization_id", orgId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setLeads((old) =>
      old.map((item) =>
        item.id === lead.id ? { ...item, lead_status: status } : item
      )
    );
  }

  async function deleteLead(lead: Lead) {
    if (!window.confirm(`Delete the lead for ${lead.name}?`)) return;

    if (!demo && supabase && orgId) {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", lead.id)
        .eq("organization_id", orgId);

      if (error) {
        setMessage(error.message);
        return;
      }
    }

    setLeads((old) => old.filter((item) => item.id !== lead.id));
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setOrgId(null);
    setDemo(true);
    setLeads(sampleLeads);
    setSection("overview");
  }

  function goToDashboard() {
    setSection("overview");
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main>
      <header className="topbar">
        <div className="nav-inner">
          <Brand />

          <nav className={mobileMenu ? "nav-links nav-open" : "nav-links"}>
            <a href="#platform" onClick={() => setMobileMenu(false)}>Platform</a>
            <a href="#industries" onClick={() => setMobileMenu(false)}>Industries</a>
            <a href="#pricing" onClick={() => setMobileMenu(false)}>Pricing</a>
            <a href="#workspace" onClick={() => setMobileMenu(false)}>Live demo</a>
          </nav>

          <div className="nav-actions">
            {user ? (
              <button className="button button-dark button-small" onClick={goToDashboard}>
                Open workspace <ArrowRight size={15} />
              </button>
            ) : (
              <>
                <button className="nav-login" onClick={() => openAuth("login")}>Log in</button>
                <button className="button button-dark button-small" onClick={() => openAuth("signup")}>
                  Get started <ArrowRight size={15} />
                </button>
              </>
            )}
          </div>

          <button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="eyebrow hero-eyebrow">
            <span className="eyebrow-dot" />
            A better way to follow up
          </div>

          <h1>
            Good leads deserve
            <br />
            <span>a second look.</span>
          </h1>

          <p className="hero-description">
            Turn missed follow-ups into organized opportunities.
            One considered workspace for your leads, your emails,
            and the business you are building.
          </p>

          <div className="hero-buttons">
            <button className="button button-light" onClick={() => openAuth("signup")}>
              Start your workspace <ArrowRight size={17} />
            </button>
            <button className="button button-outline-light" onClick={goToDashboard}>
              Explore the live demo
            </button>
          </div>

          <div className="hero-assurance">
            <span><Check size={14} /> Email-only workflows</span>
            <span><Check size={14} /> No card needed for the demo</span>
          </div>
        </div>

        <div className="hero-preview">
          <div className="preview-window">
            <div className="preview-top">
              <div className="window-dots"><i /><i /><i /></div>
              <span>YOUR BUSINESS OVERVIEW</span>
              <span className="preview-live"><span /> Live demo</span>
            </div>
            <div className="preview-body">
              <div className="preview-side">
                <div className="preview-mark"><Command size={16} /></div>
                <div className="preview-side-active"><LayoutDashboard size={16} /></div>
                <Users size={16} />
                <Mail size={16} />
                <BarChart3 size={16} />
                <Settings size={16} />
              </div>
              <div className="preview-main">
                <div className="preview-heading">
                  <div><small>MONDAY, OCTOBER 12</small><h3>Good morning.</h3></div>
                  <span className="preview-avatar">VC</span>
                </div>
                <div className="preview-stats">
                  <div><span>Open opportunities</span><strong>24</strong><small className="positive">↑ 12% this month</small></div>
                  <div><span>Follow-ups due</span><strong>08</strong><small>Need your attention</small></div>
                  <div><span>Pipeline value</span><strong>$42.8k</strong><small className="positive">Across active leads</small></div>
                </div>
                <div className="preview-table-head"><strong>Recent opportunities</strong><span>View all →</span></div>
                {[
                  ["JW", "James Wilson", "Wilson Heating", "$4,200", "New lead"],
                  ["SM", "Sarah Mitchell", "Mitchell Roofing", "$7,800", "Follow-up"],
                  ["MC", "Michael Carter", "Carter Plumbing", "$2,650", "Qualified"],
                ].map((item) => (
                  <div className="preview-row" key={item[1]}>
                    <span className="preview-initials">{item[0]}</span>
                    <span className="preview-person"><strong>{item[1]}</strong><small>{item[2]}</small></span>
                    <strong className="preview-value">{item[3]}</strong>
                    <span className="preview-status">{item[4]}</span>
                  </div>
                ))}
                <div className="preview-note"><Sparkles size={15} /><span><strong>A little more follow-through.</strong> Your next opportunity is one thoughtful email away.</span></div>
              </div>
            </div>
          </div>
          <div className="floating-note">
            <span className="floating-icon"><Mail size={17} /></span>
            <span><strong>Your next follow-up</strong><small>Ready for your review</small></span>
            <CheckCircle2 size={19} className="floating-check" />
          </div>
        </div>
        <div className="hero-bottom"><span>BUILT FOR THE DETAILS THAT MOVE BUSINESS FORWARD</span><span>LEADS · EMAIL · CLARITY</span></div>
      </section>

      <section className="trust-strip">
        <span>FOR BUSINESSES THAT RUN ON RELATIONSHIPS</span>
        <div><span>HVAC</span><i /><span>ROOFING</span><i /><span>PLUMBING</span><i /><span>ELECTRICAL</span></div>
      </section>

      <section className="section platform-section" id="platform">
        <div className="section-intro">
          <div className="eyebrow"><span className="eyebrow-dot" /> THE VELOCLIENT APPROACH</div>
          <h2>Less chasing.<br /><span>More clarity.</span></h2>
          <p>Good follow-up should not depend on remembering every conversation. Put your opportunities in one place and decide what deserves attention next.</p>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <span className="feature-number">01 / ORGANIZE</span>
            <span className="feature-icon"><Target /></span>
            <h3>Know where every lead stands.</h3>
            <p>Keep names, contact details, estimated value, and next steps together in a clear pipeline.</p>
            <span className="feature-foot">A clearer view of the work <ArrowUpRight size={16} /></span>
          </article>
          <article className="feature-card feature-featured">
            <span className="feature-number">02 / FOLLOW UP</span>
            <span className="feature-icon"><Mail /></span>
            <h3>Write better follow-up emails.</h3>
            <p>Use AI-assisted drafts as a starting point. Review the message and decide when it is ready to send.</p>
            <span className="feature-foot">Your voice stays yours <ArrowUpRight size={16} /></span>
          </article>
          <article className="feature-card">
            <span className="feature-number">03 / UNDERSTAND</span>
            <span className="feature-icon"><BarChart3 /></span>
            <h3>See the bigger picture.</h3>
            <p>Review your pipeline, spot stale opportunities, and make your next action more deliberate.</p>
            <span className="feature-foot">Decisions with context <ArrowUpRight size={16} /></span>
          </article>
        </div>
      </section>

      <section className="industry-section" id="industries">
        <div className="industry-inner">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot" /> MADE FOR SERVICE BUSINESSES</div>
            <h2>Built around the<br />work you already do.</h2>
            <p>VeloClient is designed for teams whose next project often starts with an estimate, a question, or a customer who needs to hear back.</p>
            <button className="button button-dark" onClick={() => openAuth("signup")}>Build your workspace <ArrowRight size={16} /></button>
          </div>
          <div c
