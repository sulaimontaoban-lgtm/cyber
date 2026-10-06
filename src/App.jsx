import { useEffect, useRef, useState } from 'react'
import { api, backendOnline, getToken, setToken } from './api.js'
import { seedDemo, demoClass } from './demo.js'

const PLATS = ["Facebook","GitHub","YouTube","Discord","TikTok","Instagram","LinkedIn"]
const MENU = [["home","Home"],["tasks","Project Task"],["post","Post Project"],["lists","Project List"],["logs","Project Log"],["class","Class"]]
const GO = [["classlog","Class Log"],["users","User List"],["account","Account"],["auth","Sign in"]]
const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening" }
const Ic = (paths) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths}</svg>
)
const ICONS = {
  home: Ic(<><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/></>),
  tasks: Ic(<><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 10h8M8 14h5"/></>),
  post: Ic(<><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></>),
  lists: Ic(<><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>),
  logs: Ic(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>),
  class: Ic(<><path d="m12 4 10 5-10 5L2 9z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/><path d="M22 9v5"/></>),
  classlog: Ic(<><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/></>),
  users: Ic(<><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.8-5 6.5-5s5.5 1.5 6.5 5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 15.2c2.3.3 4.3 1.7 5.5 4.3"/></>),
  account: Ic(<><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5"/></>),
  auth: Ic(<><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.4"/></>),
}

const age = (ts) => { const h = Math.max(1, Math.round((Date.now()-ts)/36e5)); return h<24 ? h+"h ago" : Math.round(h/24)+"d ago" }
const embed = (u) => { if(!u) return ""; if(u.includes("embed")) return u; const m=u.match(/v=([\w-]+)/); return m ? "https://www.youtube.com/embed/"+m[1] : u }

export default function App(){
  const [page,setPage] = useState("home")
  const [up,setUp] = useState(false)
  const [toast,setToast] = useState("")
  const [feed,setFeed] = useState([])
  const [projects,setProjects] = useState([])
  const [logs,setLogs] = useState([])
  const [users,setUsers] = useState([])
  const [me,setMe] = useState(null)
  const [cls,setCls] = useState("cyber")
  const [classPosts,setClassPosts] = useState([])
  const [examOn,setExamOn] = useState(false)
  const [zoom,setZoom] = useState("")
  const [navOpen,setNavOpen] = useState(false)
  const [sideMin,setSideMin] = useState(false)
  const go = (id) => { setPage(id); setNavOpen(false) }
  const toggleNav = () => setNavOpen(o => { if (!o && window.innerWidth < 900) setSideMin(false); return !o })
  const edgeToggle = () => {
    if (window.innerWidth < 900) setNavOpen(false)
    else setSideMin(m => !m)
  }
  const activeN = projects.filter(p => p.status !== "Completed").length
  const linked = Object.entries(me?.handles || {}).flatMap(([plat, arr]) => (arr || []).map(a => ({ plat, h: a.h })) )
  // auth
  const [phone,setPhone] = useState("")
  const [demoCode,setDemoCode] = useState("")
  const [code,setCode] = useState("")
  const [handles,setHandles] = useState({})
  // post
  const [desc,setDesc] = useState("")
  const [plinks,setPlinks] = useState([{url:"",plat:"TikTok"}])
  // ui
  const [drawer,setDrawer] = useState(null)
  const [menu,setMenu] = useState(null)
  const [usearch,setUSearch] = useState("")
  const [profile,setProfile] = useState(null)
  const [logId,setLogId] = useState("")
  const [logOut,setLogOut] = useState(null)
  // admin class form
  const [aTarget,setATarget] = useState("cyber")
  const [aText,setAText] = useState("")
  const [aVideo,setAVideo] = useState("")
  const [aIsExam,setAIsExam] = useState(false)
  const [aHint,setAHint] = useState("")
  // exam modal
  const [exam,setExam] = useState(null)
  const [secs,setSecs] = useState(3600)
  const [exUrl,setExUrl] = useState("")
  const [exType,setExType] = useState("video")
  const timer = useRef(null)
  const say = (m) => { setToast(m); setTimeout(()=>setToast(""),2200) }
  // Frontend-only demo mode (no backend): local state mirrors the API.
  const [demoMode,setDemoMode] = useState(false)
  const touchFeed = (t) => setFeed(f => [{ t, when: Date.now() }, ...f].slice(0, 10))
  const touchLog = (t) => setLogs(l => [{ t, when: Date.now() }, ...l])
  const loadDemo = () => {
    const s = seedDemo()
    setFeed(s.feed); setProjects(s.projects.map(p => ({ ...p }))); setLogs(s.logs)
    setUsers(s.users.map(u => ({ ...u }))); setClassPosts(demoClass(cls)); setExamOn(s.examOn)
    setMe({ ...s.me, handles: JSON.parse(JSON.stringify(s.me.handles)) })
    setHandles(JSON.parse(JSON.stringify(s.me.handles)))
    setDemoMode(true)
  }

  async function refresh(c=cls){
    try{
      const [f,p,l,cp,u] = await Promise.all([api.feed(),api.projects(),api.logs(),api.classPosts(c),api.users("")])
      setFeed(f.items); setProjects(p.projects); setLogs(l.logs); setClassPosts(cp.posts); setExamOn(cp.examOn); setUsers(u.users)
      if(getToken()){ try{ const m=await api.me(); setMe(m.user) }catch{} }
    }catch{}
  }
  useEffect(()=>{ backendOnline().then(ok=>{ setUp(ok); if(ok) refresh(); else loadDemo() }) },[])
  useEffect(()=>{ if(up) refresh(cls); else if(demoMode) setClassPosts(demoClass(cls)) },[cls,page]) // eslint-disable-line
  useEffect(()=>()=>clearInterval(timer.current),[])

  const startExam = (post) => {
    setExam(post); setSecs(3600)
    clearInterval(timer.current)
    timer.current = setInterval(()=>setSecs(s=>{ if(s<=1){ clearInterval(timer.current); return 0 } return s-1 }),1000)
  }
  const submitExam = async () => {
    if (demoMode) {
      seedDemo().subs.unshift({ id: "sub_" + Date.now(), examId: exam.id, userId: me?.phone || "demo", fileUrl: exUrl, fileType: exType, when: Date.now() })
      touchLog(`Exam ${exam.id} submitted by ${me?.phone || "demo"} → demo store`); touchFeed(`${me?.phone || "demo"} submitted exam`)
      say("Submitted ✓ (demo)"); setExam(null); clearInterval(timer.current); return
    }
    try{ const r=await api.examSubmit(exam.id, exUrl, exType); say(r.submission.github?"Pushed to GitHub ✓":"Submitted ✓ (local)"); setExam(null); clearInterval(timer.current); refresh() }
    catch(e){ say(e.message) }
  }

  const doCopy = async (p) => {
    if (demoMode) {
      if (!me) { say("Sign in first"); return }
      let counted = false
      setProjects(ps => ps.map(x => {
        if (x.id !== p.id) return x
        if ((x.copies || []).includes(me.phone)) return x
        counted = true; return { ...x, copies: [...(x.copies || []), me.phone] }
      }))
      await navigator.clipboard.writeText(p.links[0].url).catch(()=>{})
      if (counted) { touchFeed(`${me.phone} copied ${p.links[0].plat} link`); touchLog(`${p.id} copied by ${me.phone}`) }
      say(counted ? "Link copied +1" : "Already counted (1 max)"); return
    }
    try{ const r=await api.copy(p.id); await navigator.clipboard.writeText(r.url).catch(()=>{}); say(r.counted?"Link copied +1":"Already counted (1 max)"); refresh() }
    catch(e){ say(e.message) }
  }
  const doDone = async (p) => {
    if (demoMode) {
      setProjects(ps => ps.map(x => x.id === p.id ? { ...x, status: "Completed" } : x))
      touchLog(`${me?.phone || "demo"} reported ${p.id} done → moved to next`); touchFeed(`${me?.phone || "demo"} completed ${p.links[0].plat} project`)
      say("Marked complete → next project"); return
    }
    try{ await api.done(p.id); say("Marked complete → next project"); refresh() }catch(e){ say(e.message) }
  }
  const doShare = async (p) => {
    if (demoMode) { setProjects(ps => ps.map(x => x.id === p.id ? { ...x, shares: (x.shares || 0) + 1 } : x)); say("Shared ✓"); return }
    try{ await api.shareProject(p.id); say("Shared ✓"); refresh() }catch(e){ say(e.message) }
  }
  const doReport = async (p) => {
    const t=prompt("Describe the issue:"); if(t===null) return
    if (demoMode) { touchLog(`Issue on ${p.id} by ${me?.phone || "demo"}: ${t.slice(0,200)}`); say("Issue reported"); return }
    try{ await api.report(p.id,t); say("Issue reported") }catch(e){ say(e.message) }
  }

  const requestOtp = async () => {
    if (demoMode) { setDemoCode("123456"); say("Demo mode: use 123456"); return }
    try{ const r=await api.requestOtp(phone); setDemoCode(r.demoCode); say("OTP sent (demo code shown)") }catch(e){ say(e.message) }
  }
  const verifyOtp = async () => {
    if (demoMode) {
      if (code !== "123456") { say("Wrong code — use 123456"); return }
      const s = seedDemo()
      let u = s.users.find(x => x.phone === phone)
      if (!u) { u = { phone, handles: {}, banned: false, posts: 0, postsLeft: 4, isAdmin: false }; s.users.push(u) }
      setUsers(s.users.map(x => ({ ...x }))); setMe({ ...u }); setHandles(JSON.parse(JSON.stringify(u.handles || {})))
      say("Signed in ✓ (demo)"); setPage("account"); return
    }
    try{ const r=await api.verifyOtp(phone,code); setToken(r.token); setMe(r.user); say("Signed in ✓"); setPage("account"); refresh() }
    catch(e){ say(e.message) }
  }
  const addHandle = (plat,val,personal) => {
    setHandles(h=>{ const arr=[...(h[plat]||[])]; 
      if(personal && arr.some(a=>a.personal)) { say("Only 1 Personal per platform"); return h }
      return {...h,[plat]:[...arr,{h:val,personal}]} })
  }
  const saveHandles = async () => {
    if (demoMode) {
      for (const k of Object.keys(handles)) {
        if ((handles[k] || []).filter(a => a.personal).length > 1) { say("Only 1 Personal per platform (" + k + ")"); return }
      }
      const s = seedDemo()
      setMe(m => ({ ...m, handles })); setUsers(us => us.map(u => u.phone === me.phone ? { ...u, handles } : u))
      const su = s.users.find(x => x.phone === me.phone); if (su) su.handles = handles
      touchFeed(`${me.phone} linked socials`); say("Socials linked ✓ (demo)"); return
    }
    try{ const r=await api.saveSocials(handles); setMe(r.user); say("Socials linked ✓") }catch(e){ say(e.message) }
  }

  const submitPost = async () => {
    if (demoMode) {
      if (!me) { say("Sign in first"); return }
      if (me.postsLeft <= 0) { say("Limit: 4 posts per month"); return }
      if (!desc.trim()) { say("Description required"); return }
      if (!plinks.length || !plinks[0].url.startsWith("http")) { say("Add at least 1 exact http(s) link"); return }
      const p = { id: "p_" + Date.now(), owner: me.phone, desc: desc.trim(), links: plinks.slice(0, 4), copies: [], copiesN: 0, shares: 0, status: "Active", created: Date.now(), totalCopies: 0 }
      setProjects(ps => [{ ...p }, ...ps]); setMe(m => ({ ...m, postsLeft: m.postsLeft - 1 }))
      touchFeed(`${me.phone} posted a ${plinks[0].plat} project`)
      setDesc(""); setPlinks([{ url: "", plat: "TikTok" }]); say("Project posted ✓ (demo)"); setPage("tasks"); return
    }
    try{ await api.postProject(desc,plinks); setDesc(""); setPlinks([{url:"",plat:"TikTok"}]); say("Project posted ✓"); setPage("tasks"); refresh() }
    catch(e){ say(e.message) }
  }
  const submitClass = async () => {
    if (demoMode) {
      if (!aText.trim()) { say("Text required"); return }
      seedDemo().classPosts.unshift({ id: "c_" + Date.now(), cls: aTarget, author: "Admin", text: aText.trim(), video: aVideo.trim(), likes: 0, shares: 0, comments: [], isExam: aIsExam, hint: aHint.trim(), created: Date.now() })
      setCls(aTarget); setClassPosts(demoClass(aTarget)); setAText(""); setAVideo(""); setAHint(""); say("Class post published (demo)"); return
    }
    try{ await api.adminPost(aTarget,aText,aVideo,aIsExam,aHint); setAText(""); setAVideo(""); setAHint(""); say("Class post published"); refresh(aTarget); setCls(aTarget) }
    catch(e){ say(e.message) }
  }

  const switchCls = (c) => { setZoom(c); setCls(c); if(demoMode) setClassPosts(demoClass(c)); setTimeout(()=>setZoom(""),380) }
  // demo-mode local versions of the remaining server actions
  const demoLike = (id) => { const p = seedDemo().classPosts.find(x => x.id === id); if (p) p.likes++; setClassPosts(demoClass(cls)) }
  const demoShareC = (id) => { const p = seedDemo().classPosts.find(x => x.id === id); if (p) p.shares = (p.shares || 0) + 1; setClassPosts(demoClass(cls)); say("Shared ✓ (demo)") }
  const demoComment = (id, t) => { if (!t.trim()) return; const p = seedDemo().classPosts.find(x => x.id === id); if (p) p.comments.push(`${me?.phone || "demo"}: ${t.trim()}`); setClassPosts(demoClass(cls)) }
  const demoExamToggle = () => { const s = seedDemo(); s.examOn = !s.examOn; setExamOn(s.examOn); say("Exam " + (s.examOn ? "ON" : "OFF") + " (demo)") }
  const demoPullLog = () => {
    const s = seedDemo()
    const items = s.subs.filter(x => x.userId === logId)
    const copies = s.projects.reduce((n, p) => n + ((p.copies || []).includes(logId) ? 1 : 0), 0)
    setLogOut({ source: "demo", items, stats: { submissions: items.length, uniqueCopies: copies } })
  }
  const demoBan = (ph) => { const u = seedDemo().users.find(x => x.phone === ph); if (u) u.banned = !u.banned; setUsers(seedDemo().users.map(x => ({ ...x }))); say("Ban toggled (demo)") }
  const demoDel = (id) => { const s = seedDemo(); s.projects = s.projects.filter(x => x.id !== id); setProjects(s.projects.map(p => ({ ...p }))); say("Deleted (demo)") }
  const demoSearch = (v) => { setUSearch(v); setUsers(seedDemo().users.filter(u => u.phone.includes(v)).map(x => ({ ...x }))) }

  return (<>
    {toast && <div className="toast">{toast}</div>}
    <aside className={`sidenav ${navOpen?"open":""} ${sideMin?"min":""}`}>
      <div className="traffic"><i className="t r" /><i className="t y" /><i className="t g" /></div>
      <div className="profile">
        <span className="avatar">{me ? me.phone.slice(-2) : "?"}</span>
        <span className="pmeta"><i>{greet()} 👋</i><b>{me ? me.phone : "Guest"}</b></span>
      </div>
      <div className="menulabel"><span>Menu: <b>{MENU.length}</b></span></div>
      {MENU.map(([id, label]) => (
        <button key={id} title={label} className={`sideitem ${page === id ? "on" : ""}`} onClick={() => go(id)}>
          <span className="sideicon">{ICONS[id]}</span><span className="sidelbl">{label}</span>
          {id === "tasks" && activeN > 0 && <span className="countbadge">{activeN}</span>}
          {id === "class" && examOn && <span className="examdot" title="Exam live" />}
        </button>))}
      <div className="menulabel"><span>Linked: <b>{linked.length}</b></span></div>
      <div className="servicecard">
        {linked.slice(0, 4).map((l, i) => (
          <div key={i} className="servicerow" title={`${l.plat}: ${l.h}`}>
            <span className="svcicon">{l.plat[0]}</span><span className="sidelbl">{l.plat} · {l.h}</span>
          </div>))}
        {!linked.length && <div className="muted svcempty">No accounts yet</div>}
        <button className="servicerow add" onClick={() => go("account")} title="Link new account">
          <span className="svcicon plus">+</span><span className="sidelbl">Link new account</span>
        </button>
      </div>
      <div className="menulabel"><span>Go: <b>{GO.length}</b></span></div>
      <div className="settingstrip">
        {GO.map(([id, label]) => (
          <button key={id} title={label} className={`seticon ${page === id ? "on" : ""}`} onClick={() => go(id)}>{ICONS[id]}</button>))}
      </div>
      <div className="createcard">
        <button className="plusbtn" onClick={() => go("post")} aria-label="Post new project">+</button>
        <b>Post new project</b><i>{me ? `${me.postsLeft} left this month` : "Max 4/month"}</i>
      </div>
    </aside>
    <button className="edgetoggle" onClick={edgeToggle} aria-label={sideMin ? "Expand sidebar" : "Collapse sidebar"}>{sideMin ? "›" : "‹"}</button>
    {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}
    <div className="topbar"><div className="row" style={{flexWrap:"nowrap"}}><button className="hamb" onClick={toggleNav} aria-label="Menu">☰</button><div className="brand">CYBER <span>restart</span></div></div><div className="muted">{demoMode?"🟡 demo":up?"🟢 API":"🔴 offline"}{me?` · ${me.phone}`:""}{me?.isAdmin?" · ADMIN":""}</div></div>
    <div className="wrap">
      {page==="home" && <div>
        <div className="glass card"><h2>Recent Activity <span className="badge">max 10 · looping</span></h2>
          {(feed.length?feed:[]).slice(0,10).map((a,i)=><div key={i} className="muted">• {a.t} — {age(a.when)}</div>)}
          {!feed.length && <div className="muted">No activity yet.</div>}
        </div>
        <div className="glass card"><h3 className="neon">What is CYBER restart?</h3><p className="muted">Sign up with phone + OTP, link socials, post projects (4/month), copy links, report done, learn in Class pages, take exams, track everything in GitHub-backed class logs.</p></div>
      </div>}

      {page==="tasks" && <div>
        <h2>Project Task</h2>
        {projects.filter(p=>p.status!=="Completed").map(p=>(
          <div key={p.id} className="glass card">
            <div className="grid3">
              <div><button className="pillbtn" onClick={()=>doCopy(p)}><span className="dot" />Copy Link</button>
                <div className="muted" style={{marginTop:6}}>{p.totalCopies ?? (p.copiesN||0)+(p.copies?.length||0)} Copies</div></div>
              <div className="muted">{age(p.created)}</div>
              <div style={{textAlign:"right"}}>
                <a className="linktruncate" href={p.links[0]?.url} target="_blank" rel="noreferrer">{p.links[0]?.url}</a>
                <span className="badge">{p.links[0]?.plat}</span>
                <div className="menu"><button className="ghost" onClick={()=>setMenu(menu===p.id?null:p.id)}>⋮</button>
                {menu===p.id && <ul>
                  <li><button onClick={()=>{setDrawer(p);setMenu(null)}}>View Details</button></li>
                  <li><button onClick={()=>doDone(p)}>Report Done</button></li>
                  <li><button onClick={()=>doShare(p)}>Share</button></li>
                  <li><button onClick={()=>doReport(p)}>Report Issue</button></li>
                  {me?.isAdmin && <li><button onClick={async()=>{ if(demoMode){ demoDel(p.id); setMenu(null); return } await api.delProject(p.id); say("Deleted"); refresh() }}>Delete (admin)</button></li>}
                </ul>}</div>
              </div>
            </div>
            {p.links.slice(1).map((l,i)=><div key={i} className="muted"><a className="linktruncate" href={l.url} target="_blank" rel="noreferrer">{l.url}</a> <span className="badge">{l.plat}</span></div>)}
            <div className="muted">Status: {p.status} · Owner: {p.owner} · Shares: {p.shares||0}</div>
          </div>))}
      </div>}

      {page==="post" && <div className="glass card">
        <h2>Post Project</h2><p className="muted">Max 4 posts/month {me?`· left: ${me.postsLeft}`:"· sign in first"} · up to 4 links/post · exact platform required</p>
        <textarea rows="4" placeholder="Description + instructions" value={desc} onChange={e=>setDesc(e.target.value)} />
        {plinks.map((l,i)=><div key={i} className="row"><input placeholder="https://…" value={l.url} onChange={e=>setPlinks(pl=>pl.map((x,j)=>j===i?{...x,url:e.target.value}:x))} />
          <select value={l.plat} onChange={e=>setPlinks(pl=>pl.map((x,j)=>j===i?{...x,plat:e.target.value}:x))}>{PLATS.map(p=><option key={p}>{p}</option>)}</select>
          <button className="ghost" onClick={()=>setPlinks(pl=>pl.filter((_,j)=>j!==i))}>✕</button></div>)}
        {plinks.length<4 && <button className="ghost" onClick={()=>setPlinks(p=>[...p,{url:"",plat:"TikTok"}])}>+ add link (max 4)</button>}
        <div style={{height:8}} /><button className="primary" onClick={submitPost}>Publish project</button>
      </div>}

      {page==="lists" && <ListTable projects={projects} refresh={refresh} />}
      {page==="logs" && <div className="glass card"><h2>Project Log</h2>{logs.map((l,i)=><div key={i} className="muted">• {l.t} — {age(l.when)}</div>)}</div>}

      {page==="class" && <div>
        <button className={`classToggle cyber ${zoom==="cyber"?"zoom":""}`} onClick={()=>switchCls("cyber")}>Cybersecurity</button>
        <button className={`classToggle prog ${zoom==="prog"?"zoom":""}`} onClick={()=>switchCls("prog")}>Programmers</button>
        {examOn && classPosts.filter(p=>p.isExam).map(p=>(
          <button key={p.id} className="examstrip" onClick={()=>startExam(p)}>Exam; once clicked one hour timer start to complete your exam 👍 — {p.text.slice(0,60)}</button>))}
        {classPosts.filter(p=>!p.isExam || !examOn).map(p=>(
          <div key={p.id} className="glass card">
            <div className="row"><b>{p.author}</b><span className="muted">{age(p.created||Date.now())}</span>{p.isExam&&<span className="badge">EXAM</span>}<span className="badge">{cls}</span></div>
            <p>{p.text}</p>
            {p.video && <iframe className="fbvideo" src={embed(p.video)} title="video" allowFullScreen />}
            <div className="row"><button className="ghost" onClick={async()=>{ if(demoMode){ demoLike(p.id); return } await api.likeClass(p.id); refresh() }}>Like ({p.likes})</button>
              {!p.isExam && <button className="ghost" onClick={async()=>{ if(demoMode){ demoShareC(p.id); return } await api.shareClass(p.id); say("Shared"); refresh() }}>Share ({p.shares||0})</button>}
              {p.isExam && <button className="ghost" onClick={()=>startExam(p)}>Start exam</button>}</div>
            <div className="muted">{p.comments.map((c,i)=><div key={i}>• {c}</div>)}</div>
            <CommentBox onSend={async(t)=>{ if(demoMode){ demoComment(p.id,t); return } await api.commentClass(p.id,t); refresh() }} />
          </div>))}
        {me?.isAdmin && <div className="glass card"><h3>Admin — post to class</h3>
          <div className="row"><button className={`ghost ${aTarget==="cyber"?"on":""}`} onClick={()=>setATarget("cyber")}>Cybersecurity</button>
          <button className={`ghost ${aTarget==="prog"?"on":""}`} onClick={()=>setATarget("prog")}>Programmers</button></div>
          <textarea rows="3" placeholder="Post text" value={aText} onChange={e=>setAText(e.target.value)} />
          <input placeholder="Video link (optional)" value={aVideo} onChange={e=>setAVideo(e.target.value)} />
          <label className="muted"><input type="checkbox" style={{width:"auto"}} checked={aIsExam} onChange={e=>setAIsExam(e.target.checked)} /> Exam post (shows Hint, no share)</label>
          {aIsExam && <input placeholder="Hint (exam only)" value={aHint} onChange={e=>setAHint(e.target.value)} />}
          <div className="row"><button className="primary" onClick={submitClass}>Publish</button>
          <button className="ghost" onClick={async()=>{ if(demoMode){ demoExamToggle(); return } const r=await api.examToggle(); setExamOn(r.examOn); say("Exam "+(r.examOn?"ON":"OFF")) }}>Exam: {examOn?"ON":"OFF"}</button></div>
        </div>}
      </div>}

      {page==="classlog" && <div className="glass card"><h2>Class Log{demoMode ? " (demo store)" : " (GitHub)"}</h2>
        <p className="muted">Enter a User ID (phone).{demoMode ? " Demo mode: reads local demo submissions." : " Nothing is saved on the server — pulled from GitHub."}</p>
        <div className="row"><input placeholder="e.g. +2348011111111" value={logId} onChange={e=>setLogId(e.target.value)} /><button className="ghost" onClick={async()=>{ if(demoMode){ demoPullLog(); return } try{setLogOut(await api.classLog(logId))}catch(e){say(e.message)}}}>Pull</button></div>
        {logOut && <pre className="muted" style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(logOut,null,2)}</pre>}
      </div>}

      {page==="users" && <div className="glass card"><h2>User List</h2>
        <input placeholder="Search by phone ID" value={usearch} onChange={async e=>{ if(demoMode){ demoSearch(e.target.value); return } setUSearch(e.target.value); try{setUsers((await api.users(e.target.value)).users)}catch{}}} />
        {users.map(u=><div key={u.phone} className="row"><button className="ghost" onClick={async()=>{ if(demoMode){ const f=seedDemo().users.find(x=>x.phone===u.phone); setProfile(f?{...f}:null); return } try{setProfile((await api.userOne(u.phone)).user)}catch(e){say(e.message)}}}>{u.phone}</button><span className="muted">{u.isAdmin?"ADMIN":""}{u.banned?" · BANNED":""} posts left: {u.postsLeft}</span>
          {me?.isAdmin && <button className="ghost" onClick={async()=>{ if(demoMode){ demoBan(u.phone); return } await api.ban(u.phone); refresh(); say("Ban toggled") }}>Ban</button>}</div>)}
        {profile && <div className="glass card"><h3>{profile.phone}</h3><pre className="muted" style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(profile.handles,null,2)}</pre><button className="ghost" onClick={()=>setProfile(null)}>Close</button></div>}
      </div>}

      {page==="account" && <div className="glass card"><h2>User Account</h2>
        {!me && <p className="muted">Not signed in. Go to Sign in.</p>}
        {me && <><p>ID (phone): <b>{me.phone}</b> · Posts left this month: <b className="neon">{me.postsLeft}</b></p>
          <h4>Linked socials <span className="muted">(1 Personal / platform, others unlimited)</span></h4>
          <pre className="muted" style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(me.handles,null,2)}</pre>
          <SocialEditor handles={handles} setHandles={setHandles} addHandle={addHandle} save={saveHandles} />
          <div style={{height:8}} /><button className="ghost" onClick={()=>{setToken("");setMe(null);say("Signed out")}}>Sign out</button></>}
      </div>}

      {page==="auth" && <div className="glass card"><h2>Sign up — Phone + OTP</h2>
        <input placeholder="+2348…" value={phone} onChange={e=>setPhone(e.target.value)} />
        <button className="primary" onClick={requestOtp}>Send OTP</button>
        {demoCode && <p className="neon">Demo code: {demoCode} (hidden once SMS wired)</p>}
        <input placeholder="6-digit OTP" value={code} onChange={e=>setCode(e.target.value)} />
        <button className="primary" onClick={verifyOtp}>Verify & create account</button>
      </div>}
    </div>
    <div style={{height:8}} />
    {drawer && <div className="modal" onClick={()=>setDrawer(null)}><div className="sheet" onClick={e=>e.stopPropagation()}>
      <h3>Project details</h3><p>{drawer.desc}</p>{drawer.links.map((l,i)=><div key={i}><a href={l.url} target="_blank" rel="noreferrer">{l.url}</a> <span className="badge">{l.plat}</span></div>)}
      <div style={{height:10}} /><button className="primary" onClick={()=>setDrawer(null)}>Close</button></div></div>}
    {exam && <div className="modal"><div className="sheet">
      <h3>Exam — {Math.floor(secs/60)}:{String(secs%60).padStart(2,"0")} left</h3>
      <p>{exam.text}</p>{exam.video && <iframe className="fbvideo" src={embed(exam.video)} title="exam" allowFullScreen />}
      {exam.hint && <p className="neon">Hint: {exam.hint}</p>}
      <select value={exType} onChange={e=>setExType(e.target.value)}><option value="video">Video</option><option value="pdf">PDF</option><option value="screenshot">Screenshot</option></select>
      <input placeholder="Paste video/PDF/screenshot URL" value={exUrl} onChange={e=>setExUrl(e.target.value)} />
      <div className="row"><button className="primary" onClick={submitExam}>Submit (pushes to GitHub with your ID)</button>
      <button className="ghost" onClick={()=>{setExam(null);clearInterval(timer.current)}}>Cancel</button></div>
    </div></div>}
  </>)
}

function ListTable({ projects, refresh }){
  const [f,setF] = useState("")
  const list = f?projects.filter(p=>p.status===f):projects
  return <div className="glass card"><h2>Project List</h2>
    <div className="row">{["","Active","Pending","Completed"].map(s=><button key={s} className="ghost" onClick={()=>setF(s)}>{s||"All"}</button>)}</div>
    <div className="tablewrap"><table><thead><tr><th>ID</th><th>Platform</th><th>Status</th><th>Copies</th><th>Age</th></tr></thead>
    <tbody>{list.map(p=><tr key={p.id}><td>{p.id}</td><td>{p.links[0]?.plat}</td><td>{p.status}</td><td>{p.totalCopies??p.copiesN}</td><td>{age(p.created)}</td></tr>)}</tbody></table></div></div>
}
function CommentBox({ onSend }){
  const [t,setT] = useState("")
  return <div className="row"><input placeholder="Write a comment…" value={t} onChange={e=>setT(e.target.value)} /><button className="ghost" onClick={()=>{onSend(t);setT("")}}>Post</button></div>
}
function SocialEditor({ handles, addHandle, save }){
  const [plat,setPlat] = useState("TikTok"); const [val,setVal] = useState(""); const [pers,setPers] = useState(true)
  return <div><div className="row"><select value={plat} onChange={e=>setPlat(e.target.value)}>{PLATS.map(p=><option key={p}>{p}</option>)}</select>
    <input placeholder="@handle or url" value={val} onChange={e=>setVal(e.target.value)} /></div>
    <label className="muted"><input type="checkbox" style={{width:"auto"}} checked={pers} onChange={e=>setPers(e.target.checked)} /> Personal account</label>
    <div className="row"><button className="ghost" onClick={()=>{addHandle(plat,val,pers);setVal("")}}>Add</button><button className="primary" onClick={save}>Save socials</button></div>
    <pre className="muted" style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(handles,null,2)}</pre></div>
}
