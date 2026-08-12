import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Circle, Clock3, BriefcaseBusiness, Menu, Plus,
  Settings, Sun, Trash2, X
} from 'lucide-react';
import './styles.css';
import ApplicationsWorkspace, { APPLICATIONS_KEY, getInitialApplications } from './applications';

const STORAGE_KEY = 'daily-todo-v1';
const sections = ['上午', '下午', '晚上'];
const colors = { 工作: '#4f7894', 学习: '#61875a', 生活: '#b98239', 健康: '#6f8f58' };
const seedTasks = [
  { id: 1, title: '阅读《深度工作》20页', time: '09:00', section: '上午', category: '学习', done: false },
  { id: 2, title: '晨跑 30 分钟', time: '07:30', section: '上午', category: '健康', done: true },
  { id: 3, title: '回复工作邮件', time: '10:30', section: '上午', category: '工作', done: false },
  { id: 4, title: '准备项目周会资料', time: '11:30', section: '上午', category: '工作', done: false },
  { id: 5, title: '产品需求评审会议', time: '14:00', section: '下午', category: '工作', done: false },
  { id: 6, title: '整理上周项目文档', time: '15:30', section: '下午', category: '工作', done: true },
  { id: 7, title: '学习用户研究方法', time: '16:30', section: '下午', category: '学习', done: false },
  { id: 8, title: '晚餐与家人共度时光', time: '19:00', section: '晚上', category: '生活', done: false },
  { id: 9, title: '整理今日待办与笔记', time: '20:30', section: '晚上', category: '生活', done: true },
  { id: 10, title: '冥想 10 分钟', time: '21:30', section: '晚上', category: '健康', done: false }
];

const todayKey = () => new Date().toISOString().slice(0, 10);
const defaultStore = { [todayKey()]: seedTasks };

function formatDate(date) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(date);
}

function App() {
  const [store, setStore] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultStore; }
    catch { return defaultStore; }
  });
  const [applications, setApplications] = useState(getInitialApplications);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState('今天');
  const [draft, setDraft] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newMeta, setNewMeta] = useState({ time: '09:00', section: '上午', category: '工作' });
  const inputRef = useRef(null);
  const key = selectedDate.toISOString().slice(0, 10);
  const dayTasks = store[key] || [];
  const tasks = filter === '已完成' ? dayTasks.filter(t => t.done) : dayTasks;
  const done = dayTasks.filter(t => t.done).length;
  const percent = dayTasks.length ? Math.round(done / dayTasks.length * 100) : 0;

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(store)), [store]);
  useEffect(() => localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications)), [applications]);
  useEffect(() => { if (showAdd) inputRef.current?.focus(); }, [showAdd]);

  const week = useMemo(() => {
    const base = new Date(selectedDate);
    const mondayDelta = (base.getDay() + 6) % 7;
    base.setDate(base.getDate() - mondayDelta);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base); d.setDate(base.getDate() + i); return d;
    });
  }, [selectedDate]);

  const updateTasks = fn => setStore(prev => ({ ...prev, [key]: fn(prev[key] || []) }));
  const addTask = e => {
    e?.preventDefault();
    if (!draft.trim()) return;
    updateTasks(ts => [...ts, { id: Date.now(), title: draft.trim(), done: false, ...newMeta }]);
    setDraft(''); setShowAdd(false);
  };
  const toggle = id => updateTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = id => updateTasks(ts => ts.filter(t => t.id !== id));
  const moveDay = amount => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() + amount); return n; });

  return <div className="app-shell">
    <button className="mobile-menu" aria-label="打开菜单" onClick={() => setMobileNav(true)}><Menu /></button>
    <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
      <button className="close-nav" onClick={() => setMobileNav(false)}><X /></button>
      <div className="brand"><span>今日清单</span><Sun size={19}/></div>
      <nav>
        {[['今天', Sun], ['计划', CalendarDays], ['已完成', CheckCircle2], ['秋招投递', BriefcaseBusiness]].map(([name, Icon]) =>
          <button key={name} className={filter === name ? 'active' : ''} onClick={() => { setFilter(name); setMobileNav(false); }}><Icon/><span>{name}</span></button>
        )}
      </nav>
      {filter !== '秋招投递' ? <div className="week-progress">
        <h3>本周进度</h3>
        <p>{formatDate(week[0]).replace(/星期.*/, '')} – {formatDate(week[6]).replace(/星期.*/, '')}</p>
        <div className="week-row">
          {week.map((d, i) => <button key={i} onClick={() => setSelectedDate(d)} className={d.toDateString() === selectedDate.toDateString() ? 'current' : ''}>
            <span>{'一二三四五六日'[i]}</span><i className={i < 2 ? 'filled' : ''}>{i < 2 ? <Check size={12}/> : ''}</i><small>{d.getDate()}</small>
          </button>)}
        </div>
        <blockquote>稳步前行，每天一点点 <Sun size={15}/></blockquote>
      </div> : <div className="recruit-note"><h3>秋招小记</h3><p>记录投递，也记录每一次成长。</p><BriefcaseBusiness/></div>}
      <button className="settings"><Settings/>设置</button>
    </aside>

    {filter === '秋招投递' ? <ApplicationsWorkspace applications={applications} setApplications={setApplications} /> : <><main>
      <header className="date-header">
        <div className="date-nav"><button onClick={() => moveDay(-1)}><ChevronLeft/></button><p>{formatDate(selectedDate)}</p><button onClick={() => moveDay(1)}><ChevronRight/></button></div>
        <h1>{filter === '已完成' ? '完成得很好，继续保持。' : '早上好，今天想完成什么？'} <Sun/></h1>
      </header>

      <form className={`quick-add ${showAdd ? 'expanded' : ''}`} onSubmit={addTask}>
        <button type="button" className="plus" onClick={() => setShowAdd(true)}><Plus/></button>
        <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)} onFocus={() => setShowAdd(true)} placeholder="添加一个新任务…" aria-label="新任务名称" />
        {showAdd && <div className="add-options">
          <input type="time" value={newMeta.time} onChange={e => setNewMeta({...newMeta, time:e.target.value})}/>
          <select value={newMeta.section} onChange={e => setNewMeta({...newMeta, section:e.target.value})}>{sections.map(s=><option key={s}>{s}</option>)}</select>
          <select value={newMeta.category} onChange={e => setNewMeta({...newMeta, category:e.target.value})}>{Object.keys(colors).map(s=><option key={s}>{s}</option>)}</select>
          <button type="submit" className="submit-task">添加</button>
        </div>}
      </form>

      <div className="task-list">
        {sections.map(section => {
          const items = tasks.filter(t => t.section === section);
          const sectionDone = items.filter(t => t.done).length;
          return <section key={section}>
            <div className="section-title"><h2>{section} {section === '上午' ? <Sun/> : section === '晚上' ? <span className="moon">☾</span> : <span className="sprout">✣</span>}</h2><span>{sectionDone}/{items.length}</span></div>
            {items.length ? items.map(task => <article className={`task ${task.done ? 'done' : ''}`} key={task.id}>
              <button className="check" onClick={() => toggle(task.id)} aria-label={task.done ? '标记为未完成' : '完成任务'}>{task.done ? <Check/> : <Circle/>}</button>
              <span className="task-title">{task.title}</span>
              <span className="time"><Clock3/>{task.time}</span>
              <span className="category" style={{color: colors[task.category]}}><i style={{background: colors[task.category]}}/>{task.category}</span>
              <button className="delete" onClick={() => remove(task.id)} aria-label="删除任务"><Trash2/></button>
            </article>) : <div className="empty">这一时段还没有安排</div>}
          </section>
        })}
      </div>
    </main>

    <aside className="focus-panel">
      <h2>今日进度</h2>
      <div className="progress-ring" style={{'--progress': `${percent * 3.6}deg`}}><div><strong>{percent}%</strong><span>已完成</span><b>{done} / {dayTasks.length}</b></div></div>
      <p className="encourage">{percent === 100 ? '今天的计划全部完成！' : percent >= 50 ? '继续保持，专注当下！' : '从最小的一步开始吧。'}</p>
      <div className="quote"><h3>今日寄语</h3><blockquote>“<span>专注当下，<br/>一件一件来。</span></blockquote><div className="plant">⌇ ❧</div><div className="cup">♨</div></div>
    </aside></>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
