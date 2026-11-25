import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, BookOpen, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock3, ExternalLink, FlaskConical, LayoutDashboard, MessageSquare, Play, RotateCcw, Search, ShieldCheck, Sparkles, ThumbsDown, ThumbsUp, X, XCircle, Zap } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cases, feedback } from './data';
import { evaluateCase, loadRuns, passRate, runEvaluation, seedRuns, STORAGE_KEY } from './evaluation';
import './styles.css';

const iconSize = 17;
const nav = [ { id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'tests', label: 'Test cases', icon: FlaskConical }, { id: 'feedback', label: 'Feedback', icon: MessageSquare } ];
const dateLabel = date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const percent = (part, total) => total ? Math.round(part / total * 100) : 0;

function App() {
  const [page, setPage] = useState('overview');
  const [runs, setRuns] = useState(loadRuns);
  const [period, setPeriod] = useState('30');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');
  const latest = runs[runs.length - 1];
  const previous = runs[runs.length - 2];
  const passed = latest?.results.filter(result => result.passed).length || 0;
  const failed = (latest?.results.length || 0) - passed;
  const positive = feedback.filter(item => item.sentiment === 'positive').length;
  const delta = passRate(latest) - passRate(previous);
  const chartData = useMemo(() => {
    const cutoff = Date.now() - Number(period) * 86400000;
    return runs.filter(run => new Date(run.date).getTime() >= cutoff).map(run => ({ date: dateLabel(run.date), rate: passRate(run), run: run.id }));
  }, [runs, period]);
  const filteredCases = cases.filter(item => {
    const result = latest?.results.find(row => row.id === item.id);
    return `${item.name} ${item.category} ${item.id}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'All' || (filter === 'Passed' ? result?.passed : !result?.passed));
  });
  const visibleFeedback = feedback.filter(item => filter === 'All' || item.sentiment === filter.toLowerCase());

  function saveRuns(next) {
    setRuns(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { setNotice('Run completed, but browser storage is unavailable.'); }
  }
  function runSuite() {
    const run = runEvaluation();
    setNotice('Evaluation complete. Sample responses were checked locally.');
    saveRuns([...runs, run]);
  }
  function changePage(next) { setPage(next); setSearch(''); setFilter('All'); setNotice(''); }
  function resetDemo() { saveRuns(seedRuns); setNotice('Demo run history restored.'); }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Activity size={21} strokeWidth={2.5}/></div><div><strong>AgentEval</strong><span>Evaluation workspace</span></div></div>
      <div className="side-label">WORKSPACE</div>
      <nav aria-label="Main navigation">{nav.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => changePage(id)}><Icon size={iconSize}/><span>{label}</span>{id === 'feedback' && <span className="nav-count">{feedback.length}</span>}</button>)}</nav>
      <div className="side-divider"/><div className="side-label">PROJECT</div>
      <a className="project-link" href="https://github.com/RhugvedWaydande/AuraDesk" target="_blank" rel="noreferrer"><div className="project-icon">A</div><div><strong>AuraDesk</strong><small>Customer support agent</small></div><ExternalLink size={14}/></a>
      <div className="sidebar-bottom"><div className="demo-card"><div className="demo-icon"><Sparkles size={16}/></div><strong>Exploring the demo?</strong><p>Sample data is ready to explore. No API key needed.</p><a href="https://github.com/RhugvedWaydande/agent-eval-dashboard" target="_blank" rel="noreferrer">View project <ArrowRight size={14}/></a></div><div className="side-foot"><span className="avatar">R</span><div><strong>Evaluation workspace</strong><small>Demo environment</small></div><ChevronDown size={15}/></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14}/><strong>{nav.find(item => item.id === page)?.label}</strong></div><div className="top-actions"><span className="demo-pill"><span/> Demo mode</span><a href="https://github.com/RhugvedWaydande/agent-eval-dashboard" target="_blank" rel="noreferrer" aria-label="View documentation"><CircleHelp size={19}/></a><span className="avatar top-avatar">R</span></div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> AGENT QUALITY, AT A GLANCE</div><h1>{page === 'overview' ? 'Evaluation overview' : page === 'tests' ? 'Test cases' : 'User feedback'}</h1><p>{page === 'overview' ? 'A clear view of how your agent is performing.' : page === 'tests' ? 'Explore the checks behind your agent’s evaluation.' : 'See what users are saying about their experience.'}</p></div><button className="primary-button" onClick={runSuite}><Play size={15} fill="currentColor"/> Run evaluation</button></div>
        {notice && <div className="notice" role="status"><CheckCircle2 size={16}/>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={15}/></button></div>}
        <div className="demo-banner"><Sparkles size={16}/><span><strong>You’re viewing demo data.</strong> Runs check sample responses locally; feedback is illustrative, not live AuraDesk data.</span><button onClick={resetDemo}>Reset demo <RotateCcw size={13}/></button></div>
        {page === 'overview' && <>
          <div className="section-title-row"><div><h2>Performance snapshot</h2><p>How your agent is doing across the latest evaluation.</p></div><span className="live-label"><span/> LATEST RUN</span></div>
          <div className="metric-grid">
            <Metric icon={CheckCircle2} tone="purple" label="Pass rate" value={`${passRate(latest)}%`} note={`${delta >= 0 ? '+' : ''}${delta} pts`} sub="vs. previous run" up={delta >= 0}/>
            <Metric icon={FlaskConical} tone="blue" label="Test cases" value={latest?.results.length || 0} note={`${passed} passed`} sub={`${failed} failed`} />
            <Metric icon={ThumbsUp} tone="green" label="Positive feedback" value={`${percent(positive, feedback.length)}%`} note={`${positive} positive`} sub={`of ${feedback.length} responses`} />
            <Metric icon={Clock3} tone="orange" label="Avg. response time" value={`${(cases.reduce((sum, item) => sum + item.duration, 0) / cases.length).toFixed(1)}s`} note="Sample" sub="fixture timings" />
          </div>
          <div className="dashboard-grid"><section className="card chart-card"><div className="card-heading"><div><h2>Pass rate over time</h2><p>Track evaluation results across runs</p></div><label className="select-wrap"><span className="sr-only">Trend time range</span><select value={period} onChange={e => setPeriod(e.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select><ChevronDown size={14}/></label></div><div className="chart-summary"><strong>{passRate(latest)}%</strong><span className={`change ${delta < 0 ? 'negative' : ''}`}>{delta >= 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {delta >= 0 ? '+' : ''}{delta} pts</span><span>vs. previous run</span></div><div className="chart-container">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 15, right: 8, left: -25, bottom: 0 }}><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7864e8" stopOpacity={0.20}/><stop offset="100%" stopColor="#7864e8" stopOpacity={0.01}/></linearGradient></defs><CartesianGrid stroke="#edf0f5" vertical={false}/><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9aa1b2', fontSize: 11 }} dy={10}/><YAxis domain={[0, 100]} ticks={[0,25,50,75,100]} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} tick={{ fill: '#9aa1b2', fontSize: 11 }}/><Tooltip formatter={v => [`${v}%`, 'Pass rate']} contentStyle={{ border: '1px solid #eaecf2', borderRadius: 10, fontSize: 12 }}/><Area type="monotone" dataKey="rate" stroke="#7761e8" strokeWidth={2.5} fill="url(#chartFill)" dot={{ r: 3, fill: '#7761e8', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 5 }}/></AreaChart></ResponsiveContainer> : <div className="empty">No runs in this period.</div>}</div><div className="chart-foot"><span><i/> Pass rate</span><span>{chartData.length} runs in selected period</span></div></section>
          <section className="card breakdown-card"><div className="card-heading"><div><h2>Evaluation breakdown</h2><p>Results from your latest run</p></div><button className="icon-button" onClick={() => changePage('tests')} aria-label="View test cases"><ArrowRight size={17}/></button></div><div className="donut-wrap"><div className="donut" style={{background: `conic-gradient(#7865e9 0 ${passRate(latest)}%, #f0a17a ${passRate(latest)}% 100%)`}}><div><strong>{latest?.results.length || 0}</strong><span>test cases</span></div></div></div><div className="breakdown-legend"><div><span><i className="legend-dot purple-dot"/> Passed</span><strong>{passed} <small>({percent(passed, latest?.results.length)}%)</small></strong></div><div><span><i className="legend-dot orange-dot"/> Failed</span><strong>{failed} <small>({percent(failed, latest?.results.length)}%)</small></strong></div></div></section></div>
          <div className="lower-grid"><section className="card table-card"><div className="card-heading"><div><h2>Recent test cases</h2><p>A closer look at your latest results</p></div><button className="text-link" onClick={() => changePage('tests')}>View all <ArrowRight size={14}/></button></div><CaseTable items={cases.slice(0, 4)} latest={latest} onSelect={setSelected}/></section><section className="card feedback-card"><div className="card-heading"><div><h2>Recent feedback</h2><p>Sample feedback from users</p></div><button className="text-link" onClick={() => changePage('feedback')}>View all <ArrowRight size={14}/></button></div><FeedbackList items={feedback.slice(0, 3)}/></section></div>
        </>}
        {page === 'tests' && <section className="card full-card"><div className="card-heading"><div><h2>Evaluation suite</h2><p>{cases.length} sample cases · Latest run {latest ? dateLabel(latest.date) : '—'}</p></div><div className="controls"><label className="search"><Search size={15}/><span className="sr-only">Search test cases</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search test cases"/></label><label className="select-wrap"><span className="sr-only">Filter test cases</span><select value={filter} onChange={e => setFilter(e.target.value)}><option>All</option><option>Passed</option><option>Failed</option></select><ChevronDown size={14}/></label></div></div><CaseTable items={filteredCases} latest={latest} onSelect={setSelected}/>{!filteredCases.length && <div className="empty">No test cases match your filters.</div>}</section>}
        {page === 'feedback' && <><div className="feedback-stats"><div><ThumbsUp size={18}/><strong>{positive}</strong><span>Positive responses</span></div><div><ThumbsDown size={18}/><strong>{feedback.length - positive}</strong><span>Negative responses</span></div><div><MessageSquare size={18}/><strong>{feedback.length}</strong><span>Total responses</span></div></div><section className="card full-card"><div className="card-heading"><div><h2>Feedback inbox</h2><p>Illustrative examples inspired by AuraDesk’s feedback flow</p></div><label className="select-wrap"><span className="sr-only">Filter feedback</span><select value={filter} onChange={e => setFilter(e.target.value)}><option>All</option><option>Positive</option><option>Negative</option></select><ChevronDown size={14}/></label></div><FeedbackList items={visibleFeedback}/>{!visibleFeedback.length && <div className="empty">No feedback matches this filter.</div>}</section></>}
        <footer><span>Built for better agent experiences.</span><span>AgentEval <span className="footer-dot">·</span> Demo workspace</span></footer>
      </div>
    </main>
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="detail-title" onClick={e => e.stopPropagation()}><div className="modal-head"><div><span className="case-id">{selected.id} · {selected.category}</span><h2 id="detail-title">{selected.name}</h2></div><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close details"><X size={19}/></button></div><div className="detail-block"><h3>TEST PROMPT</h3><p>{selected.prompt}</p></div><div className="detail-block"><h3>SAMPLE AGENT RESPONSE</h3><p>{selected.response}</p></div><div className="detail-block"><h3>PHRASE CHECKS</h3>{evaluateCase(selected).checks.map(check => <div className="check-row" key={check.phrase}>{check.passed ? <CheckCircle2 size={16} className="green-text"/> : <XCircle size={16} className="red-text"/>}<span>Contains “{check.phrase}”</span><strong>{check.passed ? 'Passed' : 'Failed'}</strong></div>)}</div><p className="modal-note">Checks shown here evaluate the current sample response. Historical demo runs are illustrative.</p></section></div>}
  </div>;
}
function Metric({ icon: Icon, tone, label, value, note, sub, up }) { return <div className="card metric"><div className="metric-top"><span className={`metric-icon ${tone}`}><Icon size={18}/></span><span className="metric-more">···</span></div><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><div className="metric-bottom"><span className={up === undefined ? 'metric-note' : `change ${up ? '' : 'negative'}`}>{up !== undefined && (up ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>)}{note}</span><span>{sub}</span></div></div>; }
function CaseTable({ items, latest, onSelect }) { return <div className="table-scroll"><table><thead><tr><th>TEST CASE</th><th>CATEGORY</th><th>STATUS</th><th></th></tr></thead><tbody>{items.map(item => { const result = latest?.results.find(row => row.id === item.id); return <tr key={item.id} onClick={() => onSelect(item)}><td><button className="case-button" onClick={() => onSelect(item)}><span className="case-symbol"><FlaskConical size={15}/></span><span><strong>{item.name}</strong><small>{item.id}</small></span></button></td><td><span className="category">{item.category}</span></td><td><span className={`status ${result?.passed ? 'passed' : 'failed'}`}>{result?.passed ? <Check size={12}/> : <X size={12}/>} {result?.passed ? 'Passed' : 'Failed'}</span></td><td><ChevronRight size={15} className="row-arrow"/></td></tr>; })}</tbody></table></div>; }
function FeedbackList({ items }) { return <div className="feedback-list">{items.map(item => <div className="feedback-item" key={item.id}><span className={`feedback-icon ${item.sentiment}`}>{item.sentiment === 'positive' ? <ThumbsUp size={15}/> : <ThumbsDown size={15}/>}</span><div className="feedback-copy"><div><strong>{item.topic}</strong><span>{item.date}</span></div><p>“{item.comment}”</p><small>{item.id} · {item.sentiment === 'positive' ? 'Positive' : 'Negative'}</small></div></div>)}</div>; }

createRoot(document.getElementById('root')).render(<App/>);
