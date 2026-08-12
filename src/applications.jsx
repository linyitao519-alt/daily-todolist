import { useMemo, useState } from 'react';
import {
  BriefcaseBusiness, CalendarDays, ChevronDown, ExternalLink, Link,
  Pencil, Plus, Search, Trash2, X
} from 'lucide-react';

export const APPLICATIONS_KEY = 'daily-todo-applications-v1';
export const stages = ['准备投递', '已网申', '笔试', '一面', '二面', 'HR面', 'Offer', '已结束'];
export const channels = ['官网', '内推', 'BOSS直聘', '猎聘', '智联招聘', '其他'];

const stageTone = {
  准备投递: 'neutral', 已网申: 'sage', 笔试: 'amber', 一面: 'blue',
  二面: 'blue', HR面: 'violet', Offer: 'green', 已结束: 'muted'
};

const seedApplications = [
  { id: 101, company: '星河科技', role: '产品经理', channel: '官网', appliedAt: '2026-08-08', stage: '一面', nextAt: '2026-08-15', nextAction: '准备业务面试', link: '', notes: '重点复习项目复盘与指标设计。' },
  { id: 102, company: '远山互联', role: '用户研究', channel: '内推', appliedAt: '2026-08-06', stage: '已网申', nextAt: '2026-08-13', nextAction: '跟进内推人', link: '', notes: '' },
  { id: 103, company: '青禾数据', role: '数据分析', channel: 'BOSS直聘', appliedAt: '2026-08-04', stage: '笔试', nextAt: '2026-08-14', nextAction: '完成在线笔试', link: '', notes: '复习 SQL 窗口函数。' },
  { id: 104, company: '新城智能', role: '产品运营', channel: '官网', appliedAt: '2026-08-02', stage: '二面', nextAt: '2026-08-16', nextAction: '准备二面案例', link: '', notes: '' },
  { id: 105, company: '云帆教育', role: '商业分析', channel: '内推', appliedAt: '2026-07-29', stage: 'HR面', nextAt: '2026-08-18', nextAction: '确认 HR 面时间', link: '', notes: '' },
  { id: 106, company: '星云医疗', role: '数据分析', channel: '官网', appliedAt: '2026-07-26', stage: 'Offer', nextAt: '2026-08-20', nextAction: '回复 Offer', link: '', notes: '等待正式协议。' }
];

export function getInitialApplications() {
  try {
    const saved = JSON.parse(localStorage.getItem(APPLICATIONS_KEY));
    return Array.isArray(saved) ? saved : seedApplications;
  } catch { return seedApplications; }
}

const emptyForm = () => ({
  company: '', role: '', channel: '官网', appliedAt: new Date().toISOString().slice(0, 10),
  stage: '准备投递', nextAt: '', nextAction: '', link: '', notes: ''
});

function ApplicationForm({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || emptyForm());
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const submit = event => {
    event.preventDefault();
    if (!form.company.trim() || !form.role.trim()) return;
    onSave({ ...form, company: form.company.trim(), role: form.role.trim(), id: initial?.id || Date.now() });
  };

  return <div className="drawer-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <aside className="application-drawer" role="dialog" aria-modal="true" aria-labelledby="application-form-title">
      <button className="drawer-close" onClick={onClose} aria-label="关闭记录表单"><X /></button>
      <h2 id="application-form-title">{initial ? '编辑投递记录' : '记录新投递'}</h2>
      <form onSubmit={submit}>
        <label>公司名称 <b>*</b><input autoFocus required value={form.company} onChange={e => update('company', e.target.value)} placeholder="请输入公司名称" /></label>
        <label>岗位名称 <b>*</b><input required value={form.role} onChange={e => update('role', e.target.value)} placeholder="请输入岗位名称" /></label>
        <div className="form-pair">
          <label>投递渠道<select value={form.channel} onChange={e => update('channel', e.target.value)}>{channels.map(channel => <option key={channel}>{channel}</option>)}</select></label>
          <label>投递日期<input type="date" value={form.appliedAt} onChange={e => update('appliedAt', e.target.value)} /></label>
        </div>
        <label>当前进度<select value={form.stage} onChange={e => update('stage', e.target.value)}>{stages.map(stage => <option key={stage}>{stage}</option>)}</select></label>
        <div className="form-pair">
          <label>下一步时间<input type="date" value={form.nextAt} onChange={e => update('nextAt', e.target.value)} /></label>
          <label>下一步行动<input value={form.nextAction} onChange={e => update('nextAction', e.target.value)} placeholder="例如：准备一面" /></label>
        </div>
        <label>招聘链接<div className="input-with-icon"><Link /><input type="url" value={form.link} onChange={e => update('link', e.target.value)} placeholder="https://…" /></div></label>
        <label>备注<textarea value={form.notes} maxLength={300} onChange={e => update('notes', e.target.value)} placeholder="记录岗位要求、面试重点或联系人…" /><small>{form.notes.length}/300</small></label>
        <div className="drawer-actions"><button type="button" onClick={onClose}>取消</button><button type="submit">保存记录</button></div>
      </form>
    </aside>
  </div>;
}

function FollowUps({ applications }) {
  const upcoming = useMemo(() => applications
    .filter(item => item.nextAt && item.stage !== '已结束')
    .toSorted((a, b) => a.nextAt.localeCompare(b.nextAt)).slice(0, 5), [applications]);
  return <aside className="follow-panel">
    <h2>近期跟进</h2>
    <div className="follow-list">
      {upcoming.length ? upcoming.map(item => <div className="follow-item" key={item.id}>
        <time>{new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', weekday: 'short' }).format(new Date(`${item.nextAt}T12:00:00`))}</time>
        <strong>{item.company} · {item.role}</strong>
        <span>{item.nextAction || '查看投递进展'}</span>
      </div>) : <p className="follow-empty">暂时没有待跟进事项</p>}
    </div>
    <blockquote>别只等待，也记得主动跟进。</blockquote>
  </aside>;
}

export default function ApplicationsWorkspace({ applications, setApplications }) {
  const [query, setQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('全部进度');
  const [channelFilter, setChannelFilter] = useState('全部渠道');
  const [editing, setEditing] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return applications.filter(item =>
      (!normalized || `${item.company}${item.role}`.toLowerCase().includes(normalized)) &&
      (stageFilter === '全部进度' || item.stage === stageFilter) &&
      (channelFilter === '全部渠道' || item.channel === channelFilter)
    );
  }, [applications, channelFilter, query, stageFilter]);

  const stats = useMemo(() => ({
    total: applications.length,
    active: applications.filter(item => !['准备投递', 'Offer', '已结束'].includes(item.stage)).length,
    interviews: applications.filter(item => ['一面', '二面', 'HR面'].includes(item.stage)).length,
    offers: applications.filter(item => item.stage === 'Offer').length
  }), [applications]);

  const save = record => {
    setApplications(prev => prev.some(item => item.id === record.id) ? prev.map(item => item.id === record.id ? record : item) : [record, ...prev]);
    setDrawerOpen(false); setEditing(null);
  };
  const edit = item => { setEditing(item); setDrawerOpen(true); };
  const remove = id => setApplications(prev => prev.filter(item => item.id !== id));

  return <>
    <main className="applications-main">
      <header className="applications-header">
        <div><h1>秋招投递</h1><p>把每一次机会，都认真记下来。</p></div>
        <button className="primary-action" onClick={() => { setEditing(null); setDrawerOpen(true); }}><Plus />记录新投递</button>
      </header>
      <div className="application-stats">
        {[['总投递', stats.total], ['进行中', stats.active], ['面试中', stats.interviews], ['已录用', stats.offers]].map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
      </div>
      <div className="application-filters">
        <label className="search-field"><Search/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索公司或岗位" aria-label="搜索公司或岗位" /></label>
        <label><select value={stageFilter} onChange={e => setStageFilter(e.target.value)} aria-label="筛选进度"><option>全部进度</option>{stages.map(stage => <option key={stage}>{stage}</option>)}</select><ChevronDown/></label>
        <label><select value={channelFilter} onChange={e => setChannelFilter(e.target.value)} aria-label="筛选渠道"><option>全部渠道</option>{channels.map(channel => <option key={channel}>{channel}</option>)}</select><ChevronDown/></label>
      </div>
      <div className="applications-table" role="table" aria-label="秋招投递记录">
        <div className="application-row table-head" role="row"><span>公司与岗位</span><span>投递渠道</span><span>投递日期</span><span>当前进度</span><span>下一步</span><span>操作</span></div>
        {visible.length ? visible.map(item => <article className="application-row" role="row" key={item.id}>
          <div className="company-role"><strong>{item.company}</strong><span>{item.role}</span></div>
          <span data-label="投递渠道">{item.channel}</span>
          <time data-label="投递日期">{item.appliedAt || '—'}</time>
          <span data-label="当前进度"><i className={`stage stage-${stageTone[item.stage]}`}>{item.stage}</i></span>
          <div className="next-step" data-label="下一步"><strong>{item.nextAction || '待安排'}</strong><time>{item.nextAt || '—'}</time></div>
          <div className="row-actions">
            {item.link ? <a href={item.link} target="_blank" rel="noreferrer" aria-label={`打开${item.company}招聘链接`}><ExternalLink/></a> : null}
            <button onClick={() => edit(item)} aria-label={`编辑${item.company}`}><Pencil/></button>
            <button onClick={() => remove(item.id)} aria-label={`删除${item.company}`}><Trash2/></button>
          </div>
        </article>) : <div className="application-empty"><BriefcaseBusiness/><strong>没有找到匹配的投递记录</strong><span>换个筛选条件，或记录一次新的投递。</span></div>}
      </div>
    </main>
    <FollowUps applications={applications} />
    {drawerOpen ? <ApplicationForm initial={editing} onClose={() => { setDrawerOpen(false); setEditing(null); }} onSave={save} /> : null}
  </>;
}
