import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import NEXGO_LOGO from "@/assets/nexgo-logo.png";

const G = {
  gold:"#C9A84C",goldLight:"#E8C97A",goldDark:"#9A7A2E",
  goldGlow:"rgba(201,168,76,0.15)",goldBorder:"rgba(201,168,76,0.3)",
  black:"#0A0A0A",b2:"#111111",b3:"#1A1A1A",b4:"#242424",b5:"#2E2E2E",
  white:"#F5F0E8",whiteDim:"rgba(245,240,232,0.55)",
  danger:"#E05555",success:"#4CAF7A",
};

const injectStyles = () => {
  if (document.getElementById("nexgo-styles")) return;
  const s = document.createElement("style");
  s.id = "nexgo-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html,body,#root{height:100%;background:#0A0A0A;color:#F5F0E8;font-family:'DM Sans',sans-serif;}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#9A7A2E;border-radius:2px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes shimmer{0%,100%{opacity:.6}50%{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes glow{0%,100%{text-shadow:0 0 20px rgba(201,168,76,0.3)}50%{text-shadow:0 0 60px rgba(201,168,76,0.9)}}
    @keyframes popUp{from{opacity:0;transform:translateX(-50%) translateY(24px) scale(0.94)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
    @keyframes slideIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
    input,textarea,select{outline:none;font-family:inherit;}
    button{cursor:pointer;font-family:inherit;border:none;}
    .hover-gold:hover{border-color:rgba(201,168,76,0.4)!important;background:rgba(201,168,76,0.06)!important;}
    .hover-lift:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.4)!important;}
  `;
  document.head.appendChild(s);
};

// ─── Style helpers ────────────────────────────────────────────────────────────
const btn = (v="gold",ex={}) => ({
  display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,
  padding:"12px 24px",borderRadius:10,fontWeight:600,fontSize:14,
  letterSpacing:".03em",cursor:"pointer",border:"none",transition:"all .2s",
  ...(v==="gold"?{background:`linear-gradient(135deg,${G.gold},${G.goldDark})`,color:G.black}:
     v==="outline"?{background:"transparent",border:`1.5px solid ${G.gold}`,color:G.gold}:
     {background:G.b4,color:G.white}),
  ...ex,
});
const card = (ex={}) => ({background:G.b3,border:`1px solid ${G.b5}`,borderRadius:16,padding:20,...ex});
const inp  = (ex={}) => ({width:"100%",padding:"13px 16px",background:G.b4,border:`1.5px solid ${G.b5}`,borderRadius:10,color:G.white,fontSize:14,...ex});

// ─── Toast system ─────────────────────────────────────────────────────────────
let _toastSetter: any = null;
const toast = (msg: string, type="info") => _toastSetter && _toastSetter((p: any)=>[...p,{id:Date.now(),msg,type}]);

function ToastContainer() {
  const [toasts, setToasts] = useState<any[]>([]);
  useEffect(()=>{ _toastSetter=setToasts; return ()=>{ _toastSetter=null; }; },[]);
  useEffect(()=>{
    if(!toasts.length) return;
    const t = setTimeout(()=>setToasts(p=>p.slice(1)),3000);
    return ()=>clearTimeout(t);
  },[toasts]);
  if(!toasts.length) return null;
  const colors: any = {success:G.success,error:G.danger,info:G.gold};
  const icons: any  = {success:"✅",error:"❌",info:"ℹ️"};
  return (
    <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:9999,display:"flex",flexDirection:"column",gap:8,width:"calc(100% - 32px)",maxWidth:500,pointerEvents:"none"}}>
      {toasts.map((t: any)=>(
        <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,background:G.b3,border:`1px solid ${colors[t.type]}50`,borderLeft:`3px solid ${colors[t.type]}`,borderRadius:10,padding:"12px 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.6)",animation:"slideIn .3s ease",fontSize:14,color:G.white,fontWeight:500}}>
          <span>{icons[t.type]}</span><span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
const STitle = ({children}: any) => <div style={{fontFamily:"'Cormorant Garamond'",fontSize:20,fontWeight:700,color:G.white}}>{children}</div>;
const PHeader = ({title,sub,icon}: any) => (
  <div style={{display:"flex",alignItems:"center",gap:10}}>
    <span style={{fontSize:26}}>{icon}</span>
    <div>
      <div style={{fontFamily:"'Cormorant Garamond'",fontSize:26,fontWeight:700,color:G.white,lineHeight:1.1}}>{title}</div>
      <div style={{color:G.whiteDim,fontSize:12}}>{sub}</div>
    </div>
  </div>
);
const Lbl = ({children}: any) => <div style={{fontSize:11,fontWeight:600,color:G.whiteDim,letterSpacing:".06em",textTransform:"uppercase"}}>{children}</div>;
const Chip = ({children}: any) => <div style={{background:G.goldGlow,border:`1px solid ${G.goldDark}`,color:G.gold,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6}}>{children}</div>;
const Badge = ({status}: any) => {
  const c: any=({Delivered:G.success,Done:G.success,Active:G.gold,"In Transit":G.gold,Preparing:"#E8A030",Pending:G.whiteDim,Ready:G.goldLight,Open:G.success,Suspended:G.danger,Confirmed:G.success})[status]||G.whiteDim;
  return <div style={{background:`${c}22`,color:c,fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:6,display:"inline-block",whiteSpace:"nowrap"}}>{status}</div>;
};
const Spinner = ({size=16,color=G.black}: any) => <span style={{display:"inline-block",width:size,height:size,border:`2px solid ${color}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>;

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({role,tab,setTab,cartCount}: any) {
  const [showMore,setShowMore] = useState(false);
  const cfg: any = {
    student:{
      left:[{id:"home",icon:"⊞",label:"Home"},{id:"chow",icon:"🍽️",label:"NexChow"}],
      right:[{id:"wallet",icon:"💳",label:"Wallet"},{id:"profile",icon:"👤",label:"Profile"}],
      more:[{id:"dispatch",icon:"📦",label:"Dispatch"},{id:"trip",icon:"🚌",label:"NexTrip"},{id:"chat",icon:"💬",label:"Support"}],
    },
    vendor:{
      left:[{id:"dashboard",icon:"📊",label:"Dashboard"},{id:"orders",icon:"📦",label:"Orders"}],
      right:[{id:"menu",icon:"🍽️",label:"Menu"},{id:"profile",icon:"👤",label:"Profile"}],
      more:[{id:"earnings",icon:"💳",label:"Earnings"},{id:"chat",icon:"💬",label:"Support"}],
    },
    rider:{
      left:[{id:"rdashboard",icon:"📊",label:"Dashboard"},{id:"deliveries",icon:"🏍️",label:"Active"}],
      right:[{id:"earnings",icon:"💳",label:"Earnings"},{id:"profile",icon:"👤",label:"Profile"}],
      more:[{id:"chat",icon:"💬",label:"Support"}],
    },
    admin:{
      left:[{id:"adashboard",icon:"📊",label:"Dashboard"},{id:"users",icon:"👥",label:"Users"}],
      right:[{id:"analytics",icon:"📈",label:"Analytics"},{id:"profile",icon:"👤",label:"Profile"}],
      more:[],
    },
  }[role]||{left:[],right:[],more:[]};

  const NavBtn = ({t}: any) => (
    <button onClick={()=>{setTab(t.id);setShowMore(false);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 2px",background:"transparent",border:"none",cursor:"pointer",position:"relative"}}>
      <div style={{fontSize:20,filter:t.id===tab?`drop-shadow(0 0 6px ${G.gold})`:"none",transition:"filter .2s"}}>{t.icon}</div>
      {t.id==="chow"&&cartCount>0&&<div style={{position:"absolute",top:2,right:"14%",width:16,height:16,borderRadius:"50%",background:G.gold,color:G.black,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{cartCount}</div>}
      <div style={{fontSize:10,fontWeight:600,color:t.id===tab?G.gold:G.whiteDim,transition:"color .2s"}}>{t.label}</div>
      {t.id===tab&&<div style={{position:"absolute",bottom:-14,left:"50%",transform:"translateX(-50%)",width:18,height:2,background:G.gold,borderRadius:1}}/>}
    </button>
  );

  return (
    <>
      {showMore&&<div onClick={()=>setShowMore(false)} style={{position:"fixed",inset:0,zIndex:98,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)"}}/>}
      {showMore&&cfg.more.length>0&&(
        <div style={{position:"fixed",bottom:82,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:500,background:G.b3,border:`1px solid ${G.goldBorder}`,borderRadius:20,zIndex:99,padding:"18px 14px 14px",boxShadow:"0 -8px 40px rgba(0,0,0,0.8)",animation:"popUp .28s cubic-bezier(0.34,1.56,0.64,1)"}}>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.14em",color:G.whiteDim,textAlign:"center",marginBottom:14}}>More Services</div>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(cfg.more.length,3)},1fr)`,gap:10}}>
            {cfg.more.map((t: any)=>(
              <button key={t.id} onClick={()=>{setTab(t.id);setShowMore(false);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7,background:t.id===tab?"rgba(201,168,76,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${t.id===tab?"rgba(201,168,76,0.4)":"rgba(255,255,255,0.06)"}`,borderRadius:14,padding:"14px 8px",cursor:"pointer",transition:"all .2s"}}>
                <div style={{fontSize:26}}>{t.icon}</div>
                <div style={{fontSize:10,fontWeight:600,color:t.id===tab?G.gold:G.whiteDim,textAlign:"center",letterSpacing:"0.04em",textTransform:"uppercase"}}>{t.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:G.b2,borderTop:`1px solid rgba(201,168,76,0.2)`,display:"flex",alignItems:"center",padding:"8px 4px 14px",zIndex:100}}>
        {cfg.left.map((t: any)=><NavBtn key={t.id} t={t}/>)}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",marginTop:-24}} onClick={()=>setShowMore((p: boolean)=>!p)}>
          <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${G.goldDark},${G.gold},${G.goldLight})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 -4px 20px rgba(201,168,76,0.5),0 4px 16px rgba(0,0,0,0.6)`,border:`3px solid ${G.b2}`,transition:"transform .28s cubic-bezier(0.34,1.56,0.64,1)",transform:showMore?"rotate(45deg) scale(1.08)":"rotate(0deg) scale(1)"}}>
            <img src={NEXGO_LOGO} alt="" style={{width:32,height:32,objectFit:"contain"}}/>
          </div>
          <div style={{fontSize:9,fontWeight:700,color:G.gold,letterSpacing:"0.1em",textTransform:"uppercase",marginTop:4}}>{showMore?"Close":"Menu"}</div>
        </div>
        {cfg.right.map((t: any)=><NavBtn key={t.id} t={t}/>)}
      </div>
    </>
  );
}

// ─── Splash ───────────────────────────────────────────────────────────────────
function Splash({onDone}: any) {
  const [progress,setProgress] = useState(0);
  const [phase,setPhase] = useState(0);
  useEffect(()=>{
    const t=setInterval(()=>setProgress((p: number)=>{if(p>=100){clearInterval(t);setTimeout(onDone,400);return 100;}return p+1.2;}),22);
    return ()=>clearInterval(t);
  },[]);
  useEffect(()=>{
    const t1=setTimeout(()=>setPhase(1),300);
    const t2=setTimeout(()=>setPhase(2),800);
    const t3=setTimeout(()=>setPhase(3),1300);
    return ()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  },[]);
  return (
    <div style={{height:"100vh",background:`radial-gradient(ellipse at 50% 40%, #1a1510 0%, ${G.black} 70%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:40,overflow:"hidden",position:"relative"}}>
      {/* Ambient glow orbs */}
      <div style={{position:"absolute",width:700,height:700,borderRadius:"50%",background:`radial-gradient(circle,rgba(201,168,76,0.12) 0%,transparent 55%)`,top:"-25%",right:"-15%",pointerEvents:"none",animation:"shimmer 4s ease infinite"}}/>
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:`radial-gradient(circle,rgba(201,168,76,0.06) 0%,transparent 60%)`,bottom:"-10%",left:"-10%",pointerEvents:"none",animation:"shimmer 5s ease 1s infinite"}}/>
      {/* Horizontal gold line accent */}
      <div style={{position:"absolute",top:"18%",left:"50%",transform:"translateX(-50%)",width:180,height:1,background:`linear-gradient(90deg,transparent,${G.gold}40,transparent)`,opacity:phase>=1?1:0,transition:"opacity 1s ease"}}/>

      {/* Logo */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20,opacity:phase>=1?1:0,transform:phase>=1?"translateY(0) scale(1)":"translateY(30px) scale(0.9)",transition:"all .8s cubic-bezier(0.16,1,0.3,1)"}}>
        <img src={NEXGO_LOGO} alt="NexGo" style={{width:260,objectFit:"contain",filter:"drop-shadow(0 0 40px rgba(201,168,76,0.4)) drop-shadow(0 0 80px rgba(201,168,76,0.15))"}}/>
      </div>

      {/* Tagline */}
      <div style={{opacity:phase>=2?1:0,transform:phase>=2?"translateY(0)":"translateY(16px)",transition:"all .6s cubic-bezier(0.16,1,0.3,1) .1s",textAlign:"center"}}>
        <div style={{color:G.whiteDim,fontSize:13,letterSpacing:"5px",textTransform:"uppercase",fontWeight:300}}>Campus Super App</div>
        <div style={{display:"flex",gap:20,justifyContent:"center",marginTop:18}}>
          {[{ic:"🍽️",l:"Food"},{ic:"📦",l:"Dispatch"},{ic:"🚌",l:"Rides"}].map((s,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,opacity:phase>=3?1:0,transform:phase>=3?"translateY(0)":"translateY(12px)",transition:`all .5s cubic-bezier(0.16,1,0.3,1) ${i*0.15}s`}}>
              <div style={{width:48,height:48,borderRadius:14,background:`rgba(201,168,76,0.08)`,border:`1px solid rgba(201,168,76,0.15)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{s.ic}</div>
              <div style={{fontSize:10,color:G.whiteDim,letterSpacing:".08em",fontWeight:500}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{width:200,opacity:phase>=2?1:0,transition:"opacity .5s ease .3s"}}>
        <div style={{height:2,background:`rgba(201,168,76,0.15)`,borderRadius:1,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${G.goldDark},${G.gold},${G.goldLight})`,borderRadius:1,transition:"width .03s linear",boxShadow:`0 0 12px ${G.gold}60`}}/>
        </div>
      </div>

      {/* Bottom line accent */}
      <div style={{position:"absolute",bottom:"18%",left:"50%",transform:"translateX(-50%)",width:120,height:1,background:`linear-gradient(90deg,transparent,${G.gold}30,transparent)`,opacity:phase>=2?1:0,transition:"opacity 1s ease .5s"}}/>
    </div>
  );
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function Auth() {
  const { signIn, signUp } = useAuth();
  const [step,setStep] = useState("login");
  const [role,setRole] = useState("student");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [name,setName] = useState("");
  const [loading,setLoading] = useState(false);
  const [errorMsg,setErrorMsg] = useState("");

  const RolePicker = ({roles}: any) => (
    <div style={{display:"grid",gridTemplateColumns:`repeat(${roles.length},1fr)`,gap:8}}>
      {roles.map(({r,ic}: any)=>(
        <button key={r} onClick={()=>setRole(r)} style={{padding:"10px 8px",borderRadius:8,fontSize:12,fontWeight:600,border:`1.5px solid ${role===r?G.gold:G.b5}`,background:role===r?G.goldGlow:G.b4,color:role===r?G.gold:G.whiteDim,cursor:"pointer",textTransform:"capitalize",transition:"all .2s"}}>{ic} {r}</button>
      ))}
    </div>
  );

  const handleLogin = async () => {
    if (!email || !password) { setErrorMsg("Please fill in all fields"); return; }
    setLoading(true); setErrorMsg("");
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { setErrorMsg(error.message); return; }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) { setErrorMsg("Please fill in all fields"); return; }
    setLoading(true); setErrorMsg("");
    const { error } = await signUp(email, password, name, role);
    setLoading(false);
    if (error) { setErrorMsg(error.message); return; }
    toast("Check your email to confirm your account!", "success");
    setStep("login");
  };

  const handleForgotPassword = async () => {
    if (!email) { setErrorMsg("Enter your email first"); return; }
    setLoading(true); setErrorMsg("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { setErrorMsg(error.message); return; }
    toast("Check your email for a password reset link!", "success");
    setStep("login");
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:G.black,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:`radial-gradient(circle,${G.goldGlow} 0%,transparent 70%)`,top:-150,right:-150,pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:300,height:300,borderRadius:"50%",background:`radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)`,bottom:-100,left:-100,pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:420,animation:"fadeUp .5s ease"}}>
        <div style={{textAlign:"center",marginBottom:36,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
          <img src={NEXGO_LOGO} alt="NexGo" style={{width:200,objectFit:"contain",filter:"drop-shadow(0 0 20px rgba(201,168,76,0.4))"}}/>
          <div style={{color:G.whiteDim,fontSize:13,marginTop:2}}>
            {step==="login"?"Welcome back, campus legend":step==="forgot"?"Reset your password":"Join the campus revolution"}
          </div>
        </div>
        <div style={card({border:`1px solid ${G.b5}`,padding:24})}>
          {errorMsg && <div style={{background:`${G.danger}22`,border:`1px solid ${G.danger}`,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13,color:G.danger}}>{errorMsg}</div>}
          {step==="login"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Lbl>Email</Lbl>
              <input style={inp()} placeholder="you@university.edu.ng" type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
              <Lbl>Password</Lbl>
              <input style={inp()} placeholder="••••••••" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
              <button style={{...btn("gold"),width:"100%",padding:"14px",marginTop:6}} onClick={handleLogin} disabled={loading}>
                {loading?<Spinner/>:"Sign In →"}
              </button>
              <div style={{textAlign:"center",fontSize:13,color:G.whiteDim}}>
                <span onClick={()=>{setStep("forgot");setErrorMsg("");}} style={{color:G.gold,cursor:"pointer",fontWeight:600}}>Forgot password?</span>
              </div>
              <div style={{textAlign:"center",fontSize:13,color:G.whiteDim}}>No account? <span onClick={()=>{setStep("register");setErrorMsg("");}} style={{color:G.gold,cursor:"pointer",fontWeight:600}}>Sign up</span></div>
            </div>
          )}
          {step==="forgot"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Lbl>Email</Lbl>
              <input style={inp()} placeholder="you@university.edu.ng" type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
              <button style={{...btn("gold"),width:"100%",padding:"14px",marginTop:6}} onClick={handleForgotPassword} disabled={loading}>
                {loading?<Spinner/>:"Send Reset Link →"}
              </button>
              <div style={{textAlign:"center",fontSize:13,color:G.whiteDim}}>
                Remember? <span onClick={()=>{setStep("login");setErrorMsg("");}} style={{color:G.gold,cursor:"pointer",fontWeight:600}}>Sign in</span>
              </div>
            </div>
          )}
          {step==="register"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Lbl>Full Name</Lbl>
              <input style={inp()} placeholder="Chioma Adaeze" value={name} onChange={e=>setName(e.target.value)}/>
              <Lbl>Email</Lbl>
              <input style={inp()} placeholder="you@university.edu.ng" type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
              <Lbl>Password</Lbl>
              <input style={inp()} placeholder="••••••••" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
              <Lbl>Register as</Lbl>
              <RolePicker roles={[{r:"student",ic:"🎓"},{r:"vendor",ic:"🍽️"},{r:"rider",ic:"🏍️"}]}/>
              <button style={{...btn("gold"),width:"100%",padding:"14px"}} onClick={handleRegister} disabled={loading}>
                {loading?<Spinner/>:"Create Account →"}
              </button>
              <div style={{textAlign:"center",fontSize:13,color:G.whiteDim}}>Have account? <span onClick={()=>{setStep("login");setErrorMsg("");}} style={{color:G.gold,cursor:"pointer",fontWeight:600}}>Sign in</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Student: Home ────────────────────────────────────────────────────────────
function StudentHome({wallet,setTab,profile}: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("id, order_number, total_amount, status, created_at, restaurant_id, restaurants(name)").eq("student_id", user.id).order("created_at", {ascending:false}).limit(5)
      .then(({data}) => { if(data) setOrders(data); });
  }, [user]);

  const firstName = profile?.full_name?.split(" ")[0] || "Student";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:24,animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{color:G.whiteDim,fontSize:13}}>{greeting},</div>
          <div style={{fontFamily:"'Cormorant Garamond'",fontSize:34,fontWeight:700,color:G.white,lineHeight:1.1}}>{firstName} 👋</div>
        </div>
        <div onClick={()=>setTab("wallet")} style={{background:G.b3,border:`1px solid ${G.b5}`,borderRadius:12,padding:"10px 16px",textAlign:"right",cursor:"pointer"}}>
          <div style={{fontSize:10,color:G.whiteDim,letterSpacing:".05em"}}>WALLET</div>
          <div style={{fontSize:16,fontWeight:700,color:G.gold,fontFamily:"'DM Mono'"}}>₦{wallet.toLocaleString()}</div>
        </div>
      </div>
      <div onClick={()=>setTab("chow")} style={{background:`linear-gradient(135deg,${G.goldDark},${G.gold})`,borderRadius:20,padding:"26px 22px",position:"relative",overflow:"hidden",cursor:"pointer"}}>
        <div style={{position:"absolute",right:-30,top:-30,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.08)"}}/>
        <div style={{fontSize:11,fontWeight:700,color:G.black,opacity:0.7,letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>🎉 Today Only</div>
        <div style={{fontSize:22,fontWeight:700,color:G.black,marginBottom:6}}>Free delivery on NexChow!</div>
        <div style={{fontSize:13,color:G.black,opacity:0.7}}>Order any meal, zero delivery fee</div>
      </div>
      <div>
        <STitle>Quick Actions</STitle>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginTop:12}}>
          {[{icon:"🍽️",label:"NexChow",sub:"Food & drinks",tab:"chow"},{icon:"📦",label:"Dispatch",sub:"Send packages",tab:"dispatch"},{icon:"🚌",label:"NexTrip",sub:"Campus rides",tab:"trip"}].map((a: any)=>(
            <div key={a.label} onClick={()=>setTab(a.tab)} className="hover-gold" style={{...card({textAlign:"center",cursor:"pointer",padding:16,transition:"all .2s"})}}>
              <div style={{fontSize:30,marginBottom:6}}>{a.icon}</div>
              <div style={{fontWeight:700,fontSize:13,color:G.white}}>{a.label}</div>
              <div style={{fontSize:11,color:G.whiteDim,marginTop:3}}>{a.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <STitle>Recent Orders</STitle>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {orders.length===0 && <div style={{...card(),textAlign:"center",color:G.whiteDim,fontSize:14}}>No orders yet. Try NexChow!</div>}
          {orders.map((o: any)=>(
            <div key={o.id} style={card({display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"})}>
              <div>
                <div style={{fontWeight:600,fontSize:14,color:G.white}}>{(o.restaurants as any)?.name || "Order"}</div>
                <div style={{fontSize:12,color:G.whiteDim,marginTop:2}}>{o.order_number} · {new Date(o.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontWeight:700,color:G.gold,fontFamily:"'DM Mono'",fontSize:13}}>₦{o.total_amount?.toLocaleString()}</div>
                <Badge status={o.status}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Student: NexChow ─────────────────────────────────────────────────────────
function NexChow({onSelect,cart,onCheckout}: any) {
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("All");
  const [restaurants, setRestaurants] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("restaurants").select("*").eq("is_open", true).order("rating", {ascending:false})
      .then(({data}) => { if(data) setRestaurants(data); });
  }, []);

  const total=cart.reduce((a: number,c: any)=>a+c.price*c.qty,0);
  const qty=cart.reduce((a: number,c: any)=>a+c.qty,0);
  const cuisines = ["All", ...new Set(restaurants.map((r: any) => r.cuisine))];
  const list=restaurants.filter((r: any)=>{
    const ms=r.name.toLowerCase().includes(search.toLowerCase());
    const mf=filter==="All"||r.cuisine===filter;
    return ms&&mf;
  });
  return (
    <div style={{padding:"24px 16px",animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <PHeader title="NexChow" sub="Order food on campus" icon="🍽️"/>
      <input style={{...inp({marginTop:16,marginBottom:14})}} placeholder="🔍  Search restaurants…" value={search} onChange={e=>setSearch(e.target.value)}/>
      <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
        {cuisines.map((c: any)=>(
          <button key={c} onClick={()=>setFilter(c)} style={{whiteSpace:"nowrap",padding:"8px 16px",borderRadius:20,fontSize:12,fontWeight:600,background:filter===c?G.goldGlow:G.b4,color:filter===c?G.gold:G.whiteDim,border:`1px solid ${filter===c?G.gold:G.b5}`,cursor:"pointer",transition:"all .2s"}}>{c}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14,paddingBottom:qty>0?80:0}}>
        {list.map((r: any)=>(
          <div key={r.id} onClick={()=>onSelect(r)} className="hover-gold" style={{...card({cursor:"pointer",display:"flex",gap:14,alignItems:"center",transition:"all .2s"})}}>
            <div style={{width:66,height:66,borderRadius:14,background:G.b4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,flexShrink:0}}>{r.image}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontWeight:700,color:G.white,fontSize:15}}>{r.name}</div>
                {r.tag && <Chip>{r.tag}</Chip>}
              </div>
              <div style={{fontSize:12,color:G.whiteDim,marginTop:3}}>{r.cuisine} · {r.price_range||""}</div>
              <div style={{display:"flex",gap:12,marginTop:6,fontSize:12,color:G.whiteDim}}>
                <span>⭐ {r.rating}</span><span>🕐 {r.delivery_time}</span>
              </div>
            </div>
          </div>
        ))}
        {list.length===0 && <div style={{...card(),textAlign:"center",color:G.whiteDim}}>No restaurants found</div>}
      </div>
      {qty>0&&(
        <div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:500,zIndex:90}}>
          <button onClick={onCheckout} style={{...btn("gold",{width:"100%",padding:"16px",borderRadius:14,fontSize:15,justifyContent:"space-between",boxShadow:`0 8px 24px rgba(201,168,76,0.35)`,gap:0})}}>
            <span>🛒 {qty} item{qty!==1?"s":""}</span>
            <span>Cart · ₦{total.toLocaleString()}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Student: Restaurant Detail ───────────────────────────────────────────────
function RestaurantDetail({r,cart,setCart,onBack,onCheckout}: any) {
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("menu_items").select("*").eq("restaurant_id", r.id).eq("available", true)
      .then(({data}) => { if(data) setMenuItems(data); });
  }, [r.id]);

  const add=(item: any)=>setCart((p: any)=>{const ex=p.find((c: any)=>c.id===item.id);return ex?p.map((c: any)=>c.id===item.id?{...c,qty:c.qty+1}:c):[...p,{...item,qty:1}];});
  const dec=(item: any)=>setCart((p: any)=>p.map((c: any)=>c.id===item.id?{...c,qty:Math.max(0,c.qty-1)}:c).filter((c: any)=>c.qty>0));
  const qtyOf=(id: string)=>cart.find((c: any)=>c.id===id)?.qty||0;
  const total=cart.reduce((a: number,c: any)=>a+c.price*c.qty,0);
  return (
    <div style={{padding:"24px 16px",animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <button onClick={onBack} style={{...btn("ghost",{padding:"8px 16px",fontSize:13,marginBottom:16})}}>← Back</button>
      <div style={{...card({display:"flex",gap:16,alignItems:"center",marginBottom:20,background:G.b4})}}>
        <div style={{fontSize:52}}>{r.image}</div>
        <div>
          <div style={{fontFamily:"'Cormorant Garamond'",fontSize:24,fontWeight:700,color:G.white}}>{r.name}</div>
          <div style={{fontSize:13,color:G.whiteDim}}>{r.cuisine}</div>
          <div style={{display:"flex",gap:12,marginTop:6,fontSize:13,color:G.gold}}>
            <span>⭐ {r.rating}</span><span>🕐 {r.delivery_time}</span>
          </div>
        </div>
      </div>
      <STitle>Menu</STitle>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:12,paddingBottom:total>0?80:0}}>
        {menuItems.map((item: any)=>(
          <div key={item.id} style={card({display:"flex",justifyContent:"space-between",alignItems:"center"})}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:32}}>{item.image}</span>
              <div>
                <div style={{fontWeight:600,color:G.white,fontSize:14}}>{item.name}</div>
                <div style={{fontSize:12,color:G.whiteDim}}>{item.description}</div>
                <div style={{color:G.gold,fontWeight:700,fontSize:13,marginTop:4,fontFamily:"'DM Mono'"}}>₦{item.price.toLocaleString()}</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {qtyOf(item.id)>0&&(<>
                <button onClick={()=>dec(item)} style={{width:28,height:28,borderRadius:"50%",background:G.b5,color:G.white,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",border:"none",cursor:"pointer"}}>−</button>
                <span style={{color:G.gold,fontWeight:700,minWidth:16,textAlign:"center"}}>{qtyOf(item.id)}</span>
              </>)}
              <button onClick={()=>{add(item);toast(`Added ${item.name}`,"success");}} style={{width:28,height:28,borderRadius:"50%",background:G.gold,color:G.black,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",border:"none",cursor:"pointer",fontWeight:700}}>+</button>
            </div>
          </div>
        ))}
        {menuItems.length===0 && <div style={{...card(),textAlign:"center",color:G.whiteDim}}>No menu items available</div>}
      </div>
      {total>0&&(
        <div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:500,zIndex:90}}>
          <button onClick={onCheckout} style={{...btn("gold",{width:"100%",padding:"16px",borderRadius:14,fontSize:15,boxShadow:`0 8px 24px rgba(201,168,76,0.35)`})}}>
            Checkout · ₦{total.toLocaleString()} →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Student: Checkout ────────────────────────────────────────────────────────
function Checkout({cart,setCart,wallet,onBack,onDone,restaurantId}: any) {
  const { user, refreshWallet } = useAuth();
  const [pay,setPay] = useState("wallet");
  const [loading,setLoading] = useState(false);
  const [done,setDone] = useState(false);
  const [address,setAddress] = useState("Hostel B, Room 12");
  const sub=cart.reduce((a: number,c: any)=>a+c.price*c.qty,0);
  const fee=150; const total=sub+fee;

  const place=async()=>{
    if (!user) return;
    setLoading(true);
    if(pay==="wallet" && wallet<total){toast("Insufficient wallet balance","error");setLoading(false);return;}

    const orderNum = "NX-" + Date.now().toString(36).toUpperCase();
    const { data: order, error } = await supabase.from("orders").insert({
      order_number: orderNum,
      student_id: user.id,
      restaurant_id: restaurantId,
      total_amount: total,
      delivery_fee: fee,
      delivery_address: address,
      payment_method: pay,
      status: "Pending",
    }).select().single();

    if (error) { toast("Failed to place order: " + error.message, "error"); setLoading(false); return; }

    // Insert order items
    const items = cart.map((c: any) => ({
      order_id: order.id,
      menu_item_id: c.id,
      name: c.name,
      price: c.price,
      quantity: c.qty,
    }));
    await supabase.from("order_items").insert(items);

    // Deduct wallet if wallet pay
    if (pay === "wallet") {
      const { data: w } = await supabase.from("wallets").select("id, balance").eq("user_id", user.id).maybeSingle();
      if (w) {
        await supabase.from("wallets").update({ balance: w.balance - total }).eq("id", w.id);
        await supabase.from("wallet_transactions").insert({
          wallet_id: w.id, user_id: user.id, amount: -total, label: `NexChow ${orderNum}`, icon: "🍽️"
        });
        refreshWallet();
      }
    }

    setLoading(false);setDone(true);setCart([]);
    setTimeout(onDone,2500);
  };

  if(done) return (
    <div style={{minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:24}}>
      <div style={{fontSize:80,animation:"fadeUp .4s ease"}}>🎉</div>
      <div style={{fontFamily:"'Cormorant Garamond'",fontSize:36,fontWeight:700,color:G.gold,textAlign:"center"}}>Order Placed!</div>
      <div style={{color:G.whiteDim,textAlign:"center",fontSize:14,maxWidth:260}}>Your food is being prepared. Estimated delivery: 25 minutes.</div>
    </div>
  );
  return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:18,animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <button onClick={onBack} style={{...btn("ghost",{width:"fit-content",padding:"8px 16px",fontSize:13})}}>← Back</button>
      <PHeader title="Checkout" sub="Review your order" icon="🛒"/>
      <div style={card()}>
        <STitle>Order Summary</STitle>
        <div style={{marginTop:12}}>
          {cart.map((item: any)=>(
            <div key={item.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${G.b5}`}}>
              <span style={{color:G.white,fontSize:14}}>{item.name} x{item.qty}</span>
              <span style={{color:G.gold,fontFamily:"'DM Mono'",fontSize:14}}>₦{(item.price*item.qty).toLocaleString()}</span>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${G.b5}`}}>
            <span style={{color:G.whiteDim,fontSize:13}}>Delivery fee</span>
            <span style={{color:G.whiteDim,fontFamily:"'DM Mono'",fontSize:13}}>₦{fee}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:12}}>
            <span style={{fontWeight:700,color:G.white}}>Total</span>
            <span style={{fontWeight:700,color:G.gold,fontFamily:"'DM Mono'",fontSize:18}}>₦{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div style={card()}>
        <STitle>Delivery Address</STitle>
        <input style={{...inp({marginTop:12})}} value={address} onChange={e=>setAddress(e.target.value)}/>
      </div>
      <div style={card()}>
        <STitle>Payment</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:12}}>
          {[{id:"wallet",label:"NexGo Wallet",sub:`Balance: ₦${wallet.toLocaleString()}`,icon:"💳"},{id:"transfer",label:"Bank Transfer",sub:"Pay via bank app",icon:"🏦"}].map((m: any)=>(
            <div key={m.id} onClick={()=>setPay(m.id)} style={{padding:14,borderRadius:10,border:`2px solid ${pay===m.id?G.gold:G.b5}`,background:pay===m.id?G.goldGlow:G.b4,cursor:"pointer",display:"flex",gap:12,alignItems:"center",transition:"all .2s"}}>
              <span style={{fontSize:24}}>{m.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,color:G.white,fontSize:14}}>{m.label}</div>
                <div style={{fontSize:12,color:G.whiteDim}}>{m.sub}</div>
              </div>
              {pay===m.id&&<span style={{color:G.gold,fontSize:20}}>✓</span>}
            </div>
          ))}
        </div>
      </div>
      <button onClick={place} disabled={loading} style={{...btn("gold",{width:"100%",padding:"16px",borderRadius:14,fontSize:15,opacity:loading?.7:1})}}>
        {loading?<><Spinner/> Placing…</>:`Place Order · ₦${total.toLocaleString()}`}
      </button>
    </div>
  );
}

// ─── Student: NexDispatch ─────────────────────────────────────────────────────
function NexDispatch() {
  const { user } = useAuth();
  const [view,setView] = useState("send");
  const [loading,setLoading] = useState(false);
  const [requested,setRequested] = useState(false);
  const [dispatchId, setDispatchId] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pkgDesc, setPkgDesc] = useState("");
  const [dispatches, setDispatches] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("dispatches").select("*").eq("student_id", user.id).order("created_at", {ascending:false}).limit(10)
      .then(({data}) => { if(data) setDispatches(data); });
  }, [user, requested]);

  const doRequest=async()=>{
    if (!user || !pickup || !dropoff) { toast("Fill in pickup and dropoff locations","error"); return; }
    setLoading(true);
    const num = "DP-" + Math.floor(Math.random()*9000+1000);
    const { error } = await supabase.from("dispatches").insert({
      dispatch_number: num, student_id: user.id, pickup_location: pickup, dropoff_location: dropoff, package_description: pkgDesc,
    });
    setLoading(false);
    if (error) { toast(error.message, "error"); return; }
    setDispatchId(num); setRequested(true);
    toast("Rider requested!","success");
  };

  if(requested) return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:400,gap:16,animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto"}}>
      <div style={{fontSize:72}}>🏍️</div>
      <div style={{fontFamily:"'Cormorant Garamond'",fontSize:30,fontWeight:700,color:G.gold}}>Rider on the way!</div>
      <div style={{color:G.whiteDim,textAlign:"center",fontSize:14}}>Your package will be picked up in ~8 minutes.</div>
      <div style={{background:`${G.success}22`,border:`1px solid ${G.success}`,borderRadius:14,padding:"16px 24px",textAlign:"center"}}>
        <div style={{fontSize:11,color:G.whiteDim,letterSpacing:".06em",textTransform:"uppercase",marginBottom:4}}>Tracking ID</div>
        <div style={{fontFamily:"'DM Mono'",fontSize:20,fontWeight:700,color:G.gold}}>#{dispatchId}</div>
      </div>
      <button onClick={()=>{setRequested(false);setPickup("");setDropoff("");setPkgDesc("");}} style={{...btn("outline")}}>Send Another</button>
    </div>
  );
  return (
    <div style={{padding:"24px 16px",animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <PHeader title="NexDispatch" sub="Send campus packages" icon="📦"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:20}}>
        {[{id:"send",icon:"📤",label:"Send Package",sub:"Request pickup"},{id:"track",icon:"📍",label:"Track Package",sub:"Live updates"}].map((v: any)=>(
          <button key={v.id} onClick={()=>setView(v.id)} style={{...card({cursor:"pointer",textAlign:"center",border:`1.5px solid ${view===v.id?G.gold:G.b5}`,background:view===v.id?G.goldGlow:G.b3,transition:"all .2s"}),width:"100%"}}>
            <div style={{fontSize:32,marginBottom:8}}>{v.icon}</div>
            <div style={{fontWeight:700,color:G.white}}>{v.label}</div>
            <div style={{fontSize:12,color:G.whiteDim,marginTop:4}}>{v.sub}</div>
          </button>
        ))}
      </div>
      {view==="send"&&(
        <div style={{marginTop:24,display:"flex",flexDirection:"column",gap:14}}>
          <Lbl>Pickup Location</Lbl><input style={inp()} placeholder="e.g. Library, Block A" value={pickup} onChange={e=>setPickup(e.target.value)}/>
          <Lbl>Delivery Location</Lbl><input style={inp()} placeholder="e.g. Hostel B, Room 12" value={dropoff} onChange={e=>setDropoff(e.target.value)}/>
          <Lbl>Package Description</Lbl><input style={inp()} placeholder="e.g. Textbooks x2" value={pkgDesc} onChange={e=>setPkgDesc(e.target.value)}/>
          <div style={{...card({background:G.goldGlow,border:`1px solid ${G.goldDark}`})}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{color:G.whiteDim,fontSize:14}}>Estimated Fee</span>
              <span style={{color:G.gold,fontWeight:700,fontFamily:"'DM Mono'"}}>₦250</span>
            </div>
          </div>
          <button onClick={doRequest} disabled={loading} style={{...btn("gold",{width:"100%",padding:"14px",opacity:loading?.7:1})}}>
            {loading?<><Spinner/> Requesting…</>:"Request Rider →"}
          </button>
        </div>
      )}
      {view==="track"&&(
        <div style={{marginTop:24,display:"flex",flexDirection:"column",gap:14}}>
          {dispatches.length===0 && <div style={{...card(),textAlign:"center",color:G.whiteDim}}>No dispatches yet</div>}
          {dispatches.map((d: any)=>(
            <div key={d.id} style={card({display:"flex",justifyContent:"space-between",alignItems:"center"})}>
              <div>
                <div style={{fontWeight:600,color:G.white,fontSize:14}}>{d.package_description || "Package"}</div>
                <div style={{fontSize:12,color:G.whiteDim,marginTop:2}}>{d.pickup_location} → {d.dropoff_location}</div>
                <div style={{fontSize:12,color:G.gold,fontFamily:"'DM Mono'",marginTop:4}}>₦{d.fee}</div>
              </div>
              <Badge status={d.status}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Student: NexTrip ─────────────────────────────────────────────────────────
function NexTrip({wallet}: any) {
  const { user, refreshWallet } = useAuth();
  const [routes, setRoutes] = useState<any[]>([]);
  const [sel,setSel] = useState<any>(null);
  const [booked,setBooked] = useState(false);
  const [loading,setLoading] = useState(false);

  useEffect(() => {
    supabase.from("trip_routes").select("*").eq("active", true).then(({data}) => { if(data) setRoutes(data); });
  }, []);

  const doBook=async()=>{
    if (!user || !sel) return;
    setLoading(true);
    if(wallet<sel.price){toast("Insufficient wallet balance","error");setLoading(false);return;}

    const code = "NX-" + Math.random().toString(36).substr(2,6).toUpperCase();
    const { error } = await supabase.from("trip_bookings").insert({
      route_id: sel.id, student_id: user.id, boarding_code: code,
    });
    if (error) { toast(error.message, "error"); setLoading(false); return; }

    // Deduct wallet
    const { data: w } = await supabase.from("wallets").select("id, balance").eq("user_id", user.id).maybeSingle();
    if (w) {
      await supabase.from("wallets").update({ balance: w.balance - sel.price }).eq("id", w.id);
      await supabase.from("wallet_transactions").insert({
        wallet_id: w.id, user_id: user.id, amount: -sel.price, label: `NexTrip ${sel.from_location} → ${sel.to_location}`, icon: "🚌"
      });
      refreshWallet();
    }

    setLoading(false);setBooked(true);
    toast("Seat booked!","success");
  };

  if(booked&&sel) return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:400,gap:16,animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto"}}>
      <div style={{fontSize:72}}>🚌</div>
      <div style={{fontFamily:"'Cormorant Garamond'",fontSize:30,color:G.gold,fontWeight:700}}>Seat Reserved!</div>
      <div style={{color:G.whiteDim,textAlign:"center",fontSize:14}}>Your seat on <strong style={{color:G.white}}>{sel.from_location} → {sel.to_location}</strong> is confirmed.</div>
      <button onClick={()=>{setBooked(false);setSel(null);}} style={{...btn("outline")}}>Book Another</button>
    </div>
  );
  return (
    <div style={{padding:"24px 16px",animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <PHeader title="NexTrip" sub="Campus shuttle booking" icon="🚌"/>
      <div style={{display:"flex",flexDirection:"column",gap:14,marginTop:20}}>
        {routes.map((r: any)=>(
          <div key={r.id} onClick={()=>setSel(r)} style={{...card({cursor:"pointer",border:`1.5px solid ${sel?.id===r.id?G.gold:G.b5}`,background:sel?.id===r.id?G.goldGlow:G.b3,transition:"all .2s"})}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontWeight:700,color:G.white,fontSize:15}}>{r.from_location}</div>
                <div style={{color:G.gold,fontSize:22,margin:"4px 0"}}>↓</div>
                <div style={{fontWeight:700,color:G.white,fontSize:15}}>{r.to_location}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:G.gold,fontWeight:700,fontFamily:"'DM Mono'",fontSize:18}}>₦{r.price}</div>
                <div style={{fontSize:12,color:G.whiteDim,marginTop:4}}>🚌 {r.seats_available} seats left</div>
                <div style={{fontSize:12,color:G.success,marginTop:2}}>Next: {r.next_departure}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {sel&&<button onClick={doBook} disabled={loading} style={{...btn("gold",{width:"100%",padding:"15px",borderRadius:14,fontSize:15,marginTop:20,opacity:loading?.7:1})}}>
        {loading?<Spinner/> :`Book Seat · ₦${sel.price} →`}
      </button>}
    </div>
  );
}

// ─── Student: Wallet ──────────────────────────────────────────────────────────
function WalletScreen({wallet}: any) {
  const { user, profile, refreshWallet } = useAuth();
  const [amt,setAmt] = useState("");
  const [txns,setTxns] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("wallet_transactions").select("*").eq("user_id", user.id).order("created_at", {ascending:false}).limit(20)
      .then(({data}) => { if(data) setTxns(data); });
  }, [user, wallet]);

  const fund=async()=>{
    if (!user) return;
    const v=parseInt(amt);
    if(isNaN(v)||v<=0){toast("Enter a valid amount","error");return;}
    const { data: w } = await supabase.from("wallets").select("id, balance").eq("user_id", user.id).maybeSingle();
    if (!w) { toast("Wallet not found", "error"); return; }
    await supabase.from("wallets").update({ balance: w.balance + v }).eq("id", w.id);
    await supabase.from("wallet_transactions").insert({
      wallet_id: w.id, user_id: user.id, amount: v, label: "Wallet Top-up", icon: "💳"
    });
    refreshWallet();
    setAmt("");
    toast(`₦${v.toLocaleString()} added!`,"success");
  };

  return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <PHeader title="NexWallet" sub="Your campus money" icon="💳"/>
      <div style={{background:`linear-gradient(135deg,${G.goldDark},${G.gold})`,borderRadius:22,padding:"32px 24px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-30,top:-30,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.1)"}}/>
        <div style={{fontSize:12,color:G.black,opacity:.7,letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>Total Balance</div>
        <div style={{fontFamily:"'Cormorant Garamond'",fontSize:52,fontWeight:700,color:G.black,lineHeight:1}}>₦{wallet.toLocaleString()}</div>
        <div style={{fontSize:13,color:G.black,opacity:.6,marginTop:8}}>{profile?.full_name}</div>
      </div>
      <div style={card()}>
        <STitle>Fund Wallet</STitle>
        <div style={{display:"flex",gap:8,marginTop:12,marginBottom:12,flexWrap:"wrap"}}>
          {[500,1000,2000,5000].map((v: number)=>(
            <button key={v} onClick={()=>setAmt(String(v))} style={{padding:"8px 14px",borderRadius:20,fontSize:13,fontWeight:600,background:amt===String(v)?G.goldGlow:G.b4,border:`1px solid ${amt===String(v)?G.gold:G.b5}`,color:amt===String(v)?G.gold:G.whiteDim,cursor:"pointer",transition:"all .2s"}}>₦{v.toLocaleString()}</button>
          ))}
        </div>
        <input style={{...inp({marginBottom:12})}} type="number" placeholder="Enter amount…" value={amt} onChange={e=>setAmt(e.target.value)}/>
        <button onClick={fund} style={{...btn("gold",{width:"100%",padding:"13px"})}}>Fund Wallet →</button>
      </div>
      <div>
        <STitle>Transactions</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:12}}>
          {txns.length===0 && <div style={{...card(),textAlign:"center",color:G.whiteDim}}>No transactions yet</div>}
          {txns.map((tx: any)=>(
            <div key={tx.id} style={card({display:"flex",justifyContent:"space-between",alignItems:"center"})}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:G.b4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{tx.icon}</div>
                <div>
                  <div style={{fontWeight:600,fontSize:13,color:G.white}}>{tx.label}</div>
                  <div style={{fontSize:11,color:G.whiteDim}}>{new Date(tx.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{fontWeight:700,fontFamily:"'DM Mono'",fontSize:14,color:tx.amount>0?G.success:G.danger}}>{tx.amount>0?"+":""}₦{Math.abs(tx.amount).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Screen (shared) ──────────────────────────────────────────────────
function ProfileScreen({onLogout}: any) {
  const { profile, role } = useAuth();
  return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <div style={{textAlign:"center",paddingTop:10}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${G.goldDark},${G.gold})`,margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,fontWeight:700,color:G.black}}>{profile?.full_name?.[0]||"?"}</div>
        <div style={{fontFamily:"'Cormorant Garamond'",fontSize:28,fontWeight:700,color:G.white}}>{profile?.full_name}</div>
        <div style={{color:G.gold,fontSize:12,marginTop:4,fontFamily:"'DM Mono'",textTransform:"capitalize"}}>{role}</div>
      </div>
      <div style={card()}>
        {[{icon:"👤",label:"Edit Profile"},{icon:"🔔",label:"Notifications"},{icon:"🔒",label:"Security & Privacy"},{icon:"❓",label:"Help & Support"}].map((item: any,i: number,arr: any[])=>(
          <div key={item.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:i<arr.length-1?`1px solid ${G.b5}`:"none",cursor:"pointer"}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:20}}>{item.icon}</span>
              <span style={{color:G.white,fontWeight:500,fontSize:14}}>{item.label}</span>
            </div>
            <span style={{color:G.whiteDim}}>›</span>
          </div>
        ))}
      </div>
      <button onClick={onLogout} style={{...btn("ghost",{width:"100%",padding:"14px",color:G.danger,border:`1px solid ${G.danger}40`})}}>Sign Out</button>
    </div>
  );
}

// ─── Chat Screen ──────────────────────────────────────────────────────────────
function ChatScreen() {
  const [msgs,setMsgs] = useState([
    {id:1,from:"bot",text:"Hello! 👋 How can I help you today?",time:"Just now"},
  ]);
  const [input,setInput] = useState("");
  const bottomRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  const send=()=>{
    if(!input.trim())return;
    setMsgs((p: any)=>[...p,{id:Date.now(),from:"user",text:input,time:"Now"}]);
    setInput("");
    setTimeout(()=>{setMsgs((p: any)=>[...p,{id:Date.now()+1,from:"bot",text:"Thanks for reaching out! Our team will get back to you shortly. 🙏",time:"Now"}]);},1000);
  };
  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 80px)",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <div style={{padding:"16px",borderBottom:`1px solid ${G.b4}`,display:"flex",gap:12,alignItems:"center",flexShrink:0}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${G.goldDark},${G.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>💬</div>
        <div>
          <div style={{fontWeight:600,fontSize:15}}>NexGo Support</div>
          <div style={{fontSize:11,color:G.gold,display:"flex",alignItems:"center",gap:5}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:G.gold,display:"inline-block",animation:"pulse 2s ease infinite"}}/>Online
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:12}}>
        {msgs.map((m: any)=>(
          <div key={m.id} style={{display:"flex",flexDirection:"column",alignItems:m.from==="user"?"flex-end":"flex-start",maxWidth:"80%",alignSelf:m.from==="user"?"flex-end":"flex-start"}}>
            <div style={{padding:"10px 14px",borderRadius:m.from==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:m.from==="user"?G.gold:G.b4,color:m.from==="user"?G.black:G.white,fontSize:14,lineHeight:1.5,fontWeight:m.from==="user"?500:400}}>{m.text}</div>
            <div style={{fontSize:10,color:G.whiteDim,marginTop:4,padding:"0 4px"}}>{m.time}</div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"12px 16px",borderTop:`1px solid ${G.b4}`,display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Type a message..." style={{flex:1,background:G.b4,border:`1px solid ${G.b5}`,borderRadius:22,padding:"11px 16px",color:G.white,fontSize:14,outline:"none"}}/>
        <button onClick={send} style={{width:42,height:42,borderRadius:"50%",background:G.gold,border:"none",color:G.black,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>➤</button>
      </div>
    </div>
  );
}

// ─── Vendor App ───────────────────────────────────────────────────────────────
function VendorApp({tab,onLogout}: any) {
  const { user, profile } = useAuth();
  const [orders,setOrders] = useState<any[]>([]);
  const [menuItems,setMenuItems] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isOpen,setIsOpen] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Fetch vendor's restaurant
    supabase.from("restaurants").select("*").eq("owner_id", user.id).limit(1).maybeSingle()
      .then(({data}) => { if(data) { setRestaurant(data); setIsOpen(data.is_open); } });
  }, [user]);

  useEffect(() => {
    if (!restaurant) return;
    supabase.from("orders").select("*, order_items(*)").eq("restaurant_id", restaurant.id).order("created_at", {ascending:false}).limit(20)
      .then(({data}) => { if(data) setOrders(data); });
    supabase.from("menu_items").select("*").eq("restaurant_id", restaurant.id)
      .then(({data}) => { if(data) setMenuItems(data); });
  }, [restaurant]);

  const toggleOpen = async () => {
    if (!restaurant) return;
    const newState = !isOpen;
    await supabase.from("restaurants").update({ is_open: newState }).eq("id", restaurant.id);
    setIsOpen(newState);
  };

  const nextStatus = async (id: string, current: string) => {
    const next = current === "Pending" ? "Preparing" : current === "Preparing" ? "Ready" : "Done";
    await supabase.from("orders").update({ status: next }).eq("id", id);
    setOrders(p => p.map(o => o.id === id ? {...o, status: next} : o));
  };

  const restName = restaurant?.name || profile?.full_name || "Vendor";

  if(tab==="orders") return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <PHeader title="Orders" sub="Manage incoming orders" icon="📦"/>
      {orders.length===0 && <div style={{...card(),textAlign:"center",color:G.whiteDim}}>No orders yet</div>}
      {orders.map((o: any)=>(
        <div key={o.id} style={card()}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontWeight:700,color:G.white}}>{o.order_number}</span><Badge status={o.status}/>
          </div>
          <div style={{fontSize:13,color:G.whiteDim,marginBottom:3}}>{o.order_items?.map((i: any)=>`${i.name} x${i.quantity}`).join(", ")}</div>
          <div style={{fontSize:13,color:G.whiteDim,marginBottom:12}}>{new Date(o.created_at).toLocaleString()}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:G.gold,fontFamily:"'DM Mono'",fontWeight:700}}>₦{o.total_amount?.toLocaleString()}</span>
            {o.status!=="Done"&&o.status!=="Delivered"&&<button onClick={()=>nextStatus(o.id, o.status)} style={{...btn("gold",{padding:"8px 16px",fontSize:12})}}>
              {o.status==="Pending"?"Start Prep":o.status==="Preparing"?"Mark Ready":"Complete"}
            </button>}
          </div>
        </div>
      ))}
    </div>
  );

  if(tab==="menu") return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <PHeader title="Menu" sub="Manage your items" icon="🍽️"/>
      </div>
      {menuItems.length===0 && <div style={{...card(),textAlign:"center",color:G.whiteDim}}>No menu items yet</div>}
      {menuItems.map((item: any)=>(
        <div key={item.id} style={card({display:"flex",justifyContent:"space-between",alignItems:"center"})}>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <span style={{fontSize:28}}>{item.image}</span>
            <div>
              <div style={{fontWeight:600,color:G.white,fontSize:14}}>{item.name}</div>
              <div style={{fontSize:12,color:G.whiteDim}}>{item.description}</div>
              <div style={{color:G.gold,fontFamily:"'DM Mono'",fontSize:13,marginTop:3}}>₦{item.price.toLocaleString()}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if(tab==="profile") return <ProfileScreen onLogout={onLogout}/>;

  // Vendor Dashboard (default)
  return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{color:G.whiteDim,fontSize:13}}>Welcome back,</div>
          <div style={{fontFamily:"'Cormorant Garamond'",fontSize:30,fontWeight:700,color:G.white}}>{restName} 🍲</div>
        </div>
        <div onClick={toggleOpen} style={{background:isOpen?`${G.success}22`:G.b4,border:`1px solid ${isOpen?G.success:G.b5}`,borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700,color:isOpen?G.success:G.whiteDim,cursor:"pointer",transition:"all .3s"}}>
          {isOpen?"🟢 Open":"⚫ Closed"}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[
          {l:"Today's Orders",v:String(orders.filter(o=>new Date(o.created_at).toDateString()===new Date().toDateString()).length),ic:"📦",c:G.gold},
          {l:"Pending",v:String(orders.filter(o=>o.status==="Pending").length),ic:"⏳",c:G.danger},
          {l:"Menu Items",v:String(menuItems.length),ic:"🍽️",c:G.goldLight},
          {l:"Avg Rating",v:restaurant?.rating ? `${restaurant.rating} ⭐` : "N/A",ic:"⭐",c:G.success},
        ].map((s: any)=>(
          <div key={s.l} style={card()}>
            <div style={{fontSize:24,marginBottom:6}}>{s.ic}</div>
            <div style={{fontFamily:"'DM Mono'",fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div>
            <div style={{fontSize:12,color:G.whiteDim,marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={card()}>
        <STitle>Recent Orders</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:12}}>
          {orders.slice(0,3).map((o: any)=>(
            <div key={o.id} style={{padding:14,background:G.b4,borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:600,color:G.white,fontSize:14}}>{o.order_items?.map((i: any)=>i.name).join(", ") || o.order_number}</div>
                <div style={{fontSize:12,color:G.whiteDim}}>{new Date(o.created_at).toLocaleString()}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <Badge status={o.status}/>
                <div style={{color:G.gold,fontFamily:"'DM Mono'",fontSize:13,marginTop:4}}>₦{o.total_amount?.toLocaleString()}</div>
              </div>
            </div>
          ))}
          {orders.length===0 && <div style={{textAlign:"center",color:G.whiteDim,fontSize:13,padding:20}}>No orders yet</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Rider App ────────────────────────────────────────────────────────────────
function RiderApp({tab,onLogout}: any) {
  const { user } = useAuth();
  const [online,setOnline] = useState(true);
  const [deliveries,setDeliveries] = useState<any[]>([]);
  const [dispatches,setDispatches] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    // Rider's assigned orders
    supabase.from("orders").select("*, restaurants(name)").eq("rider_id", user.id).order("created_at", {ascending:false}).limit(20)
      .then(({data}) => { if(data) setDeliveries(data); });
    // Rider's assigned dispatches
    supabase.from("dispatches").select("*").eq("rider_id", user.id).order("created_at", {ascending:false}).limit(20)
      .then(({data}) => { if(data) setDispatches(data); });
  }, [user]);

  const updateOrder = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setDeliveries(p => p.map(d => d.id === id ? {...d, status} : d));
  };
  const updateDispatch = async (id: string, status: string) => {
    await supabase.from("dispatches").update({ status }).eq("id", id);
    setDispatches(p => p.map(d => d.id === id ? {...d, status} : d));
  };

  if(tab==="profile") return <ProfileScreen onLogout={onLogout}/>;
  if(tab==="chat") return <ChatScreen/>;

  if(tab==="earnings") return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <PHeader title="Earnings" sub="Your delivery income" icon="💰"/>
      <div style={{background:`linear-gradient(135deg,${G.goldDark},${G.gold})`,borderRadius:20,padding:"28px 24px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{fontSize:12,color:G.black,opacity:.7,letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>Deliveries</div>
        <div style={{fontFamily:"'Cormorant Garamond'",fontSize:48,fontWeight:700,color:G.black}}>{deliveries.length + dispatches.length}</div>
        <div style={{fontSize:13,color:G.black,opacity:.6,marginTop:6}}>total assignments</div>
      </div>
    </div>
  );

  // Rider Dashboard
  return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{color:G.whiteDim,fontSize:13}}>Rider Dashboard</div>
          <div style={{fontFamily:"'Cormorant Garamond'",fontSize:30,fontWeight:700,color:G.white}}>🏍️</div>
        </div>
        <div onClick={()=>setOnline(o=>!o)} style={{background:online?`${G.success}22`:G.b4,border:`1.5px solid ${online?G.success:G.b5}`,borderRadius:20,padding:"8px 16px",cursor:"pointer",fontSize:12,fontWeight:700,color:online?G.success:G.whiteDim,transition:"all .3s"}}>
          {online?"🟢 Online":"⚫ Offline"}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[{v:String(deliveries.length),l:"Orders"},{v:String(dispatches.length),l:"Dispatches"}].map((s: any)=>(
          <div key={s.l} style={card({textAlign:"center"})}>
            <div style={{fontFamily:"'DM Mono'",fontSize:18,fontWeight:700,color:G.gold}}>{s.v}</div>
            <div style={{fontSize:11,color:G.whiteDim,marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>
      <STitle>Active Orders</STitle>
      {deliveries.filter(d=>d.status!=="Delivered"&&d.status!=="Done").map((d: any)=>(
        <div key={d.id} style={card({border:`1.5px solid ${G.gold}`})}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
            <span style={{fontWeight:700,color:G.white}}>{d.order_number}</span><Badge status={d.status}/>
          </div>
          <div style={{fontSize:13,color:G.whiteDim,marginBottom:4}}>🏪 {(d.restaurants as any)?.name}</div>
          {d.delivery_address && <div style={{fontSize:13,color:G.whiteDim}}>🏠 {d.delivery_address}</div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
            <span style={{color:G.gold,fontFamily:"'DM Mono'",fontWeight:700}}>₦{d.delivery_fee}</span>
            <button onClick={()=>updateOrder(d.id, d.status==="Pending"?"In Transit":"Delivered")} style={{...btn("gold",{padding:"8px 16px",fontSize:13})}}>
              {d.status==="Pending"?"Pick Up":d.status==="In Transit"?"Deliver":"Next"}
            </button>
          </div>
        </div>
      ))}
      <STitle>Dispatch Pickups</STitle>
      {dispatches.filter(d=>d.status!=="Delivered"&&d.status!=="Done").map((d: any)=>(
        <div key={d.id} style={card()}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontWeight:700,color:G.white}}>{d.dispatch_number}</span><Badge status={d.status}/>
          </div>
          <div style={{fontSize:13,color:G.whiteDim}}>📍 {d.pickup_location} → {d.dropoff_location}</div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
            <span style={{color:G.gold,fontFamily:"'DM Mono'"}}>₦{d.fee}</span>
            <button onClick={()=>updateDispatch(d.id, d.status==="Pending"?"In Transit":"Delivered")} style={{...btn("gold",{padding:"8px 16px",fontSize:12})}}>
              {d.status==="Pending"?"Accept":"Complete"}
            </button>
          </div>
        </div>
      ))}
      {deliveries.length===0 && dispatches.length===0 && <div style={{...card(),textAlign:"center",color:G.whiteDim}}>No active deliveries</div>}
    </div>
  );
}

// ─── Admin App ────────────────────────────────────────────────────────────────
function AdminApp({tab,onLogout}: any) {
  const [users,setUsers] = useState<any[]>([]);
  const [search,setSearch] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);

  useEffect(() => {
    // Admin fetches all profiles + roles
    supabase.from("profiles").select("id, full_name, created_at, avatar_url").order("created_at", {ascending:false})
      .then(async ({data: profiles}) => {
        if (!profiles) return;
        // Fetch roles for each user
        const enriched = await Promise.all(profiles.map(async (p: any) => {
          const { data: roleData } = await supabase.rpc("get_user_role", { _user_id: p.id });
          return { ...p, role: roleData || "student" };
        }));
        setUsers(enriched);
      });
    supabase.from("orders").select("id, order_number, total_amount, status, created_at").order("created_at", {ascending:false}).limit(50)
      .then(({data}) => { if(data) setOrders(data); });
    supabase.from("restaurants").select("*").then(({data}) => { if(data) setRestaurants(data); });
  }, []);

  if(tab==="users") return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <PHeader title="Users" sub="Manage all users" icon="👥"/>
      <input style={inp()} placeholder="🔍  Search users…" value={search} onChange={e=>setSearch(e.target.value)}/>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {users.filter((u: any)=>u.full_name?.toLowerCase().includes(search.toLowerCase())||u.role?.toLowerCase().includes(search.toLowerCase())).map((u: any)=>(
          <div key={u.id} style={card()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${G.goldDark},${G.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:G.black}}>{u.full_name?.[0]||"?"}</div>
                <div>
                  <div style={{fontWeight:600,color:G.white,fontSize:14}}>{u.full_name}</div>
                  <div style={{fontSize:11,color:G.whiteDim,textTransform:"capitalize"}}>{u.role} · Joined {new Date(u.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if(tab==="analytics") return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <PHeader title="Analytics" sub="Platform insights" icon="📈"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[{l:"Total Users",v:String(users.length),ic:"👥"},{l:"Total Orders",v:String(orders.length),ic:"📦"},{l:"Restaurants",v:String(restaurants.length),ic:"🍽️"},{l:"Revenue",v:`₦${orders.reduce((a: number,o: any)=>a+(o.total_amount||0),0).toLocaleString()}`,ic:"💰"}].map((s: any)=>(
          <div key={s.l} style={card()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:12,color:G.whiteDim,marginBottom:6}}>{s.l}</div>
                <div style={{fontFamily:"'DM Mono'",fontSize:22,fontWeight:700,color:G.gold}}>{s.v}</div>
              </div>
              <span style={{fontSize:24}}>{s.ic}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if(tab==="profile") return <ProfileScreen onLogout={onLogout}/>;

  // Admin Dashboard
  return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <PHeader title="Admin Panel" sub="NexGo operations overview" icon="⚙️"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[{label:"Total Users",value:String(users.length),icon:"👥"},{label:"Orders",value:String(orders.length),icon:"📦"},{label:"Restaurants",value:String(restaurants.length),icon:"🍽️"},{label:"Revenue",value:`₦${orders.reduce((a: number,o: any)=>a+(o.total_amount||0),0).toLocaleString()}`,icon:"💰"}].map((s: any)=>(
          <div key={s.label} style={card()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:12,color:G.whiteDim,marginBottom:6}}>{s.label}</div>
                <div style={{fontFamily:"'DM Mono'",fontSize:22,fontWeight:700,color:G.gold}}>{s.value}</div>
              </div>
              <span style={{fontSize:24}}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={card()}>
        <STitle>Recent Users</STitle>
        {users.slice(0,5).map((u: any,i: number,arr: any[])=>(
          <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:i<arr.length-1?`1px solid ${G.b5}`:"none"}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${G.goldDark},${G.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:G.black}}>{u.full_name?.[0]||"?"}</div>
              <div>
                <div style={{fontWeight:600,color:G.white,fontSize:14}}>{u.full_name}</div>
                <div style={{fontSize:11,color:G.whiteDim,textTransform:"capitalize"}}>{u.role} · {new Date(u.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App (inner, uses auth context) ──────────────────────────────────────
function NexGoInner() {
  useEffect(()=>{ injectStyles(); },[]);
  const { user, profile, role: authRole, walletBalance, loading: authLoading, signOut } = useAuth();
  const [screen,setScreen] = useState("splash");
  const [cart,setCart] = useState<any[]>([]);
  const [tab,setTab] = useState("home");
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);

  useEffect(() => {
    if (authLoading) return;
    if (user && authRole) {
      setTab({student:"home",vendor:"dashboard",rider:"rdashboard",admin:"adashboard"}[authRole] || "home");
      setScreen("app");
    } else if (!user && screen === "app") {
      setScreen("auth");
    }
  }, [user, authRole, authLoading]);

  const handleLogout = async () => {
    await signOut();
    setScreen("auth");
    setTab("home");
    setCart([]);
  };

  const role = authRole || "student";

  const StudentContent=()=>{
    const [restaurant,setRestaurant] = useState<any>(null);
    const [atCheckout,setAtCheckout] = useState(false);
    if(tab==="chow"){
      if(atCheckout && restaurant) return <Checkout cart={cart} setCart={setCart} wallet={walletBalance} onBack={()=>setAtCheckout(false)} onDone={()=>{setAtCheckout(false);setTab("home");}} restaurantId={restaurant.id}/>;
      if(restaurant) return <RestaurantDetail r={restaurant} cart={cart} setCart={setCart} onBack={()=>setRestaurant(null)} onCheckout={()=>setAtCheckout(true)}/>;
      return <NexChow onSelect={setRestaurant} cart={cart} onCheckout={()=>setAtCheckout(true)}/>;
    }
    if(tab==="dispatch") return <NexDispatch/>;
    if(tab==="trip")     return <NexTrip wallet={walletBalance}/>;
    if(tab==="wallet")   return <WalletScreen wallet={walletBalance}/>;
    if(tab==="profile")  return <ProfileScreen onLogout={handleLogout}/>;
    if(tab==="chat")     return <ChatScreen/>;
    return <StudentHome wallet={walletBalance} setTab={setTab} profile={profile}/>;
  };

  const AppContent = (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:G.black,position:"relative"}}>
      <ToastContainer/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
        {role==="student"&&<StudentContent/>}
        {role==="vendor" &&<VendorApp tab={tab} onLogout={handleLogout}/>}
        {role==="rider"  &&<RiderApp tab={tab} onLogout={handleLogout}/>}
        {role==="admin"  &&<AdminApp tab={tab} onLogout={handleLogout}/>}
      </div>
      <BottomNav role={role} tab={tab} setTab={setTab} cartCount={cart.reduce((a: number,c: any)=>a+c.qty,0)}/>
    </div>
  );

  if(screen==="splash"){
    return <Splash onDone={()=>setScreen(user ? "app" : "auth")}/>;
  }

  if(screen==="auth"){
    if (authLoading) {
      return <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:G.black}}>
        <Spinner size={32} color={G.gold}/>
      </div>;
    }
    return <Auth/>;
  }

  return AppContent;
}

// ─── Wrapped export ───────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <NexGoInner />
    </AuthProvider>
  );
}
