import { useState, useEffect, useRef } from "react";
import { useAuth, AuthProvider } from "@/hooks/useAuth";

const NEXGO_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgMTAwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZzEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRjBEMDgwIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojQzlBODRDIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzhBNjgyMCIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZzIiIHgxPSIwJSIgeTE9IjEwMCUiIHgyPSIxMDAlIiB5Mj0iMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOUE3QTJFIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0U4Qzk3QSIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPCEtLSBTcGVlZCBsaW5lcyAtLT4KICA8cmVjdCB4PSI4IiB5PSIzNiIgd2lkdGg9IjI2IiBoZWlnaHQ9IjUiIHJ4PSIyLjUiIGZpbGw9InVybCgjZzEpIiBvcGFjaXR5PSIwLjkiLz4KICA8cmVjdCB4PSI0IiB5PSI0OCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjQiIHJ4PSIyIiBmaWxsPSJ1cmwoI2cxKSIgb3BhY2l0eT0iMC42Ii8+CiAgPCEtLSBPdXRlciBjaGV2cm9uIC0tPgogIDxwYXRoIGQ9Ik0zOCAxNSBMNjggNTAgTDM4IDg1IEw1MiA4NSBMODIgNTAgTDUyIDE1IFoiIGZpbGw9InVybCgjZzEpIi8+CiAgPCEtLSBJbm5lciBjaGV2cm9uIChsaWdodGVyLCBjcmVhdGVzIGRlcHRoKSAtLT4KICA8cGF0aCBkPSJNNTQgMjIgTDc4IDUwIEw1NCA3OCBMNjIgNzggTDg4IDUwIEw2MiAyMiBaIiBmaWxsPSJ1cmwoI2cyKSIgb3BhY2l0eT0iMC43NSIvPgogIDwhLS0gTmV4R28gdGV4dCAtLT4KICA8dGV4dCB4PSI5OCIgeT0iNjkiIGZvbnQtZmFtaWx5PSJBcmlhbCBCbGFjaywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI1MCIgZm9udC13ZWlnaHQ9IjkwMCIgZmlsbD0idXJsKCNnMSkiIGxldHRlci1zcGFjaW5nPSItMC41Ij5OZXhHbzwvdGV4dD4KPC9zdmc+";

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

// ─── Mock Data ────────────────────────────────────────────────────────────────
const RESTAURANTS = [
  {id:1,name:"The Golden Spoon",cuisine:"Nigerian",rating:4.8,time:"20-30 min",img:"🍲",tag:"Popular",price:"₦1,200–₦3,500"},
  {id:2,name:"Campus Bites",cuisine:"Continental",rating:4.5,time:"15-25 min",img:"🍔",tag:"Fast",price:"₦800–₦2,000"},
  {id:3,name:"Noodle Haven",cuisine:"Asian",rating:4.7,time:"25-35 min",img:"🍜",tag:"Trending",price:"₦1,500–₦4,000"},
  {id:4,name:"Suya Stop",cuisine:"Local",rating:4.9,time:"10-20 min",img:"🔥",tag:"Best Seller",price:"₦500–₦1,800"},
];
const MENU_ITEMS = [
  {id:1,name:"Jollof Rice Special",price:1500,img:"🍚",desc:"Smoky party jollof with chicken"},
  {id:2,name:"Puff Puff x6",price:400,img:"🫓",desc:"Crispy golden puff puff"},
  {id:3,name:"Suya Wrap",price:1200,img:"🌯",desc:"Spicy beef suya in flatbread"},
  {id:4,name:"Chapman",price:600,img:"🍹",desc:"Classic campus Chapman drink"},
  {id:5,name:"Peppered Chicken",price:2000,img:"🍗",desc:"Half chicken, Nkwobi style"},
];
const ROUTES = [
  {id:1,from:"Main Gate",to:"Faculty of Engineering",price:150,seats:14,next:"5 min"},
  {id:2,from:"Hostel D",to:"SUB",price:100,seats:8,next:"12 min"},
  {id:3,from:"Admin Block",to:"Sports Complex",price:120,seats:6,next:"3 min"},
];
const ORDERS = [
  {id:"#NX001",item:"Jollof Rice Special",status:"Delivered",amount:1500,date:"Today, 2:30pm"},
  {id:"#NX002",item:"Suya Wrap x2",status:"In Transit",amount:2400,date:"Today, 4:15pm"},
  {id:"#NX003",item:"Chapman",status:"Preparing",amount:600,date:"Today, 5:00pm"},
];
const VENDOR_ORDERS = [
  {id:"#NX003",items:"Chapman x1",student:"Chioma A.",status:"Pending",amount:600,time:"2 min ago"},
  {id:"#NX004",items:"Jollof Rice x2, Chicken x1",student:"Emeka B.",status:"Preparing",amount:5000,time:"8 min ago"},
  {id:"#NX005",items:"Puff Puff x6",student:"Adaeze C.",status:"Ready",amount:2400,time:"15 min ago"},
];
const RIDER_DELIVERIES = [
  {id:"#NX003",pickup:"The Golden Spoon",dropoff:"Hostel B, Room 12",amount:150,student:"Chioma A.",status:"Active"},
  {id:"#DP02",pickup:"ICT Centre",dropoff:"Hostel A, Room 8",amount:250,student:"Emeka B.",status:"Pending"},
];
const ADMIN_USERS = [
  {n:"Chioma Adaeze",r:"Student",d:"Today",s:"Active",email:"chioma@uni.edu.ng"},
  {n:"Emeka Obi",r:"Rider",d:"Today",s:"Active",email:"emeka@uni.edu.ng"},
  {n:"Fatima Sule",r:"Vendor",d:"Yesterday",s:"Active",email:"fatima@uni.edu.ng"},
  {n:"David Eze",r:"Student",d:"2 days ago",s:"Suspended",email:"david@uni.edu.ng"},
  {n:"Amara Nwosu",r:"Student",d:"3 days ago",s:"Active",email:"amara@uni.edu.ng"},
  {n:"Bola Tinubu",r:"Rider",d:"4 days ago",s:"Active",email:"bola@uni.edu.ng"},
];

// ─── Toast system ─────────────────────────────────────────────────────────────
let _toastSetter = null;
const toast = (msg, type="info") => _toastSetter && _toastSetter(p=>[...p,{id:Date.now(),msg,type}]);

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(()=>{ _toastSetter=setToasts; return ()=>{ _toastSetter=null; }; },[]);
  useEffect(()=>{
    if(!toasts.length) return;
    const t = setTimeout(()=>setToasts(p=>p.slice(1)),3000);
    return ()=>clearTimeout(t);
  },[toasts]);
  if(!toasts.length) return null;
  const colors = {success:G.success,error:G.danger,info:G.gold};
  const icons  = {success:"✅",error:"❌",info:"ℹ️"};
  return (
    <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:9999,display:"flex",flexDirection:"column",gap:8,width:"calc(100% - 32px)",maxWidth:448,pointerEvents:"none"}}>
      {toasts.map(t=>(
        <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,background:G.b3,border:`1px solid ${colors[t.type]}50`,borderLeft:`3px solid ${colors[t.type]}`,borderRadius:10,padding:"12px 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.6)",animation:"slideIn .3s ease",fontSize:14,color:G.white,fontWeight:500}}>
          <span>{icons[t.type]}</span><span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
const STitle = ({children}) => <div style={{fontFamily:"'Cormorant Garamond'",fontSize:20,fontWeight:700,color:G.white}}>{children}</div>;
const PHeader = ({title,sub,icon}) => (
  <div style={{display:"flex",alignItems:"center",gap:10}}>
    <span style={{fontSize:26}}>{icon}</span>
    <div>
      <div style={{fontFamily:"'Cormorant Garamond'",fontSize:26,fontWeight:700,color:G.white,lineHeight:1.1}}>{title}</div>
      <div style={{color:G.whiteDim,fontSize:12}}>{sub}</div>
    </div>
  </div>
);
const Lbl = ({children}) => <div style={{fontSize:11,fontWeight:600,color:G.whiteDim,letterSpacing:".06em",textTransform:"uppercase"}}>{children}</div>;
const Chip = ({children}) => <div style={{background:G.goldGlow,border:`1px solid ${G.goldDark}`,color:G.gold,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6}}>{children}</div>;
const Badge = ({status}) => {
  const c=({Delivered:G.success,Done:G.success,Active:G.gold,"In Transit":G.gold,Preparing:"#E8A030",Pending:G.whiteDim,Ready:G.goldLight,Open:G.success,Suspended:G.danger,Confirmed:G.success})[status]||G.whiteDim;
  return <div style={{background:`${c}22`,color:c,fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:6,display:"inline-block",whiteSpace:"nowrap"}}>{status}</div>;
};
const Spinner = ({size=16,color=G.black}) => <span style={{display:"inline-block",width:size,height:size,border:`2px solid ${color}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>;

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({role,tab,setTab,cartCount}) {
  const [showMore,setShowMore] = useState(false);
  const cfg = {
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

  const NavBtn = ({t}) => (
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
        <div style={{position:"fixed",bottom:82,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:448,background:G.b3,border:`1px solid ${G.goldBorder}`,borderRadius:20,zIndex:99,padding:"18px 14px 14px",boxShadow:"0 -8px 40px rgba(0,0,0,0.8)",animation:"popUp .28s cubic-bezier(0.34,1.56,0.64,1)"}}>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.14em",color:G.whiteDim,textAlign:"center",marginBottom:14}}>More Services</div>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(cfg.more.length,3)},1fr)`,gap:10}}>
            {cfg.more.map(t=>(
              <button key={t.id} onClick={()=>{setTab(t.id);setShowMore(false);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7,background:t.id===tab?"rgba(201,168,76,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${t.id===tab?"rgba(201,168,76,0.4)":"rgba(255,255,255,0.06)"}`,borderRadius:14,padding:"14px 8px",cursor:"pointer",transition:"all .2s"}}>
                <div style={{fontSize:26}}>{t.icon}</div>
                <div style={{fontSize:10,fontWeight:600,color:t.id===tab?G.gold:G.whiteDim,textAlign:"center",letterSpacing:"0.04em",textTransform:"uppercase"}}>{t.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:G.b2,borderTop:`1px solid rgba(201,168,76,0.2)`,display:"flex",alignItems:"center",padding:"8px 4px 14px",zIndex:100}}>
        {cfg.left.map(t=><NavBtn key={t.id} t={t}/>)}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",marginTop:-24}} onClick={()=>setShowMore(p=>!p)}>
          <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${G.goldDark},${G.gold},${G.goldLight})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 -4px 20px rgba(201,168,76,0.5),0 4px 16px rgba(0,0,0,0.6)`,border:`3px solid ${G.b2}`,transition:"transform .28s cubic-bezier(0.34,1.56,0.64,1)",transform:showMore?"rotate(45deg) scale(1.08)":"rotate(0deg) scale(1)"}}>
            <img src={NEXGO_LOGO} alt="" style={{width:50,height:28,objectFit:"contain",filter:"brightness(0) invert(0.15)"}}/>
          </div>
          <div style={{fontSize:9,fontWeight:700,color:G.gold,letterSpacing:"0.1em",textTransform:"uppercase",marginTop:4}}>{showMore?"Close":"Menu"}</div>
        </div>
        {cfg.right.map(t=><NavBtn key={t.id} t={t}/>)}
      </div>
    </>
  );
}

// ─── Splash ───────────────────────────────────────────────────────────────────
function Splash({onDone}) {
  const [progress,setProgress] = useState(0);
  useEffect(()=>{
    const t=setInterval(()=>setProgress(p=>{if(p>=100){clearInterval(t);setTimeout(onDone,300);return 100;}return p+1.5;}),25);
    return ()=>clearInterval(t);
  },[]);
  return (
    <div style={{height:"100vh",background:G.black,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:48,overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle,${G.goldGlow} 0%,transparent 65%)`,top:-200,right:-200,pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:`radial-gradient(circle,rgba(201,168,76,0.08) 0%,transparent 65%)`,bottom:-100,left:-100,pointerEvents:"none"}}/>
      <div style={{textAlign:"center",animation:"glow 3s ease infinite",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
        <img src={NEXGO_LOGO} alt="NexGo" style={{width:220,objectFit:"contain",filter:"drop-shadow(0 0 24px rgba(201,168,76,0.5))"}}/>
        <div style={{color:G.whiteDim,fontSize:12,letterSpacing:"6px",textTransform:"uppercase",marginTop:4}}>Campus Super App</div>
      </div>
      <div style={{display:"flex",gap:16}}>
        {["🍽️","📦","🚌"].map((ic,i)=>(
          <div key={i} style={{width:52,height:52,borderRadius:"50%",background:G.b3,border:`1.5px solid ${G.b5}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,animation:`shimmer 2s ease ${i*0.4}s infinite`}}>{ic}</div>
        ))}
      </div>
      <div style={{width:220}}>
        <div style={{height:2,background:G.b4,borderRadius:1,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${G.goldDark},${G.gold})`,borderRadius:1,transition:"width .03s linear"}}/>
        </div>
        <div style={{textAlign:"center",marginTop:10,fontSize:11,color:G.whiteDim,fontFamily:"'DM Mono'"}}>{Math.round(progress)}%</div>
      </div>
    </div>
  );
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function Auth({onLogin}) {
  const { signIn, signUp } = useAuth();
  const [step,setStep] = useState("login");
  const [role,setRole] = useState("student");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [name,setName] = useState("");
  const [loading,setLoading] = useState(false);
  const [errorMsg,setErrorMsg] = useState("");

  const RolePicker = ({roles}) => (
    <div style={{display:"grid",gridTemplateColumns:`repeat(${roles.length},1fr)`,gap:8}}>
      {roles.map(({r,ic})=>(
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
    // onLogin will be triggered by auth state change
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

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:G.black,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:`radial-gradient(circle,${G.goldGlow} 0%,transparent 70%)`,top:-150,right:-150,pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:300,height:300,borderRadius:"50%",background:`radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)`,bottom:-100,left:-100,pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:420,animation:"fadeUp .5s ease"}}>
        <div style={{textAlign:"center",marginBottom:36,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
          <img src={NEXGO_LOGO} alt="NexGo" style={{width:180,objectFit:"contain",filter:"drop-shadow(0 0 16px rgba(201,168,76,0.4))"}}/>
          <div style={{color:G.whiteDim,fontSize:13,marginTop:2}}>
            {step==="login"?"Welcome back, campus legend":"Join the campus revolution"}
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
              <div style={{textAlign:"center",fontSize:13,color:G.whiteDim}}>No account? <span onClick={()=>{setStep("register");setErrorMsg("");}} style={{color:G.gold,cursor:"pointer",fontWeight:600}}>Sign up</span></div>
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
function StudentHome({wallet,setTab}) {
  return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:24,animation:"fadeUp .4s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{color:G.whiteDim,fontSize:13}}>Good afternoon,</div>
          <div style={{fontFamily:"'Cormorant Garamond'",fontSize:34,fontWeight:700,color:G.white,lineHeight:1.1}}>Chioma 👋</div>
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
          {[{icon:"🍽️",label:"NexChow",sub:"Food & drinks",tab:"chow"},{icon:"📦",label:"Dispatch",sub:"Send packages",tab:"dispatch"},{icon:"🚌",label:"NexTrip",sub:"Campus rides",tab:"trip"}].map(a=>(
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
          <span style={{fontSize:12,color:G.gold,cursor:"pointer"}}>See all</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {ORDERS.map(o=>(
            <div key={o.id} style={card({display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"})}>
              <div>
                <div style={{fontWeight:600,fontSize:14,color:G.white}}>{o.item}</div>
                <div style={{fontSize:12,color:G.whiteDim,marginTop:2}}>{o.id} · {o.date}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontWeight:700,color:G.gold,fontFamily:"'DM Mono'",fontSize:13}}>₦{o.amount.toLocaleString()}</div>
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
function NexChow({onSelect,cart,onCheckout}) {
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("All");
  const total=cart.reduce((a,c)=>a+c.price*c.qty,0);
  const qty=cart.reduce((a,c)=>a+c.qty,0);
  const list=RESTAURANTS.filter(r=>{
    const ms=r.name.toLowerCase().includes(search.toLowerCase());
    const mf=filter==="All"||r.cuisine===filter;
    return ms&&mf;
  });
  return (
    <div style={{padding:"24px 16px",animation:"fadeUp .4s ease"}}>
      <PHeader title="NexChow" sub="Order food on campus" icon="🍽️"/>
      <input style={{...inp({marginTop:16,marginBottom:14})}} placeholder="🔍  Search restaurants…" value={search} onChange={e=>setSearch(e.target.value)}/>
      <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
        {["All","Nigerian","Continental","Asian","Local"].map(c=>(
          <button key={c} onClick={()=>setFilter(c)} style={{whiteSpace:"nowrap",padding:"8px 16px",borderRadius:20,fontSize:12,fontWeight:600,background:filter===c?G.goldGlow:G.b4,color:filter===c?G.gold:G.whiteDim,border:`1px solid ${filter===c?G.gold:G.b5}`,cursor:"pointer",transition:"all .2s"}}>{c}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14,paddingBottom:qty>0?80:0}}>
        {list.map(r=>(
          <div key={r.id} onClick={()=>onSelect(r)} className="hover-gold" style={{...card({cursor:"pointer",display:"flex",gap:14,alignItems:"center",transition:"all .2s"})}}>
            <div style={{width:66,height:66,borderRadius:14,background:G.b4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,flexShrink:0}}>{r.img}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontWeight:700,color:G.white,fontSize:15}}>{r.name}</div>
                <Chip>{r.tag}</Chip>
              </div>
              <div style={{fontSize:12,color:G.whiteDim,marginTop:3}}>{r.cuisine} · {r.price}</div>
              <div style={{display:"flex",gap:12,marginTop:6,fontSize:12,color:G.whiteDim}}>
                <span>⭐ {r.rating}</span><span>🕐 {r.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {qty>0&&(
        <div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:448,zIndex:90}}>
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
function RestaurantDetail({r,cart,setCart,onBack,onCheckout}) {
  const add=(item)=>setCart(p=>{const ex=p.find(c=>c.id===item.id);return ex?p.map(c=>c.id===item.id?{...c,qty:c.qty+1}:c):[...p,{...item,qty:1}];});
  const dec=(item)=>setCart(p=>p.map(c=>c.id===item.id?{...c,qty:Math.max(0,c.qty-1)}:c).filter(c=>c.qty>0));
  const qty=(id)=>cart.find(c=>c.id===id)?.qty||0;
  const total=cart.reduce((a,c)=>a+c.price*c.qty,0);
  return (
    <div style={{padding:"24px 16px",animation:"fadeUp .4s ease"}}>
      <button onClick={onBack} style={{...btn("ghost",{padding:"8px 16px",fontSize:13,marginBottom:16})}}>← Back</button>
      <div style={{...card({display:"flex",gap:16,alignItems:"center",marginBottom:20,background:G.b4})}}>
        <div style={{fontSize:52}}>{r.img}</div>
        <div>
          <div style={{fontFamily:"'Cormorant Garamond'",fontSize:24,fontWeight:700,color:G.white}}>{r.name}</div>
          <div style={{fontSize:13,color:G.whiteDim}}>{r.cuisine}</div>
          <div style={{display:"flex",gap:12,marginTop:6,fontSize:13,color:G.gold}}>
            <span>⭐ {r.rating}</span><span>🕐 {r.time}</span>
          </div>
        </div>
      </div>
      <STitle>Menu</STitle>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:12,paddingBottom:total>0?80:0}}>
        {MENU_ITEMS.map(item=>(
          <div key={item.id} style={card({display:"flex",justifyContent:"space-between",alignItems:"center"})}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:32}}>{item.img}</span>
              <div>
                <div style={{fontWeight:600,color:G.white,fontSize:14}}>{item.name}</div>
                <div style={{fontSize:12,color:G.whiteDim}}>{item.desc}</div>
                <div style={{color:G.gold,fontWeight:700,fontSize:13,marginTop:4,fontFamily:"'DM Mono'"}}>₦{item.price.toLocaleString()}</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {qty(item.id)>0&&(<>
                <button onClick={()=>dec(item)} style={{width:28,height:28,borderRadius:"50%",background:G.b5,color:G.white,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",border:"none",cursor:"pointer"}}>−</button>
                <span style={{color:G.gold,fontWeight:700,minWidth:16,textAlign:"center"}}>{qty(item.id)}</span>
              </>)}
              <button onClick={()=>{add(item);toast(`Added ${item.name}`,"success");}} style={{width:28,height:28,borderRadius:"50%",background:G.gold,color:G.black,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",border:"none",cursor:"pointer",fontWeight:700}}>+</button>
            </div>
          </div>
        ))}
      </div>
      {total>0&&(
        <div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:448,zIndex:90}}>
          <button onClick={onCheckout} style={{...btn("gold",{width:"100%",padding:"16px",borderRadius:14,fontSize:15,boxShadow:`0 8px 24px rgba(201,168,76,0.35)`})}}>
            Checkout · ₦{total.toLocaleString()} →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Student: Checkout ────────────────────────────────────────────────────────
function Checkout({cart,setCart,wallet,setWallet,onBack,onDone}) {
  const [pay,setPay] = useState("wallet");
  const [loading,setLoading] = useState(false);
  const [done,setDone] = useState(false);
  const sub=cart.reduce((a,c)=>a+c.price*c.qty,0);
  const fee=150; const total=sub+fee;
  const place=async()=>{
    setLoading(true);
    await new Promise(r=>setTimeout(r,1800));
    if(pay==="wallet"){
      if(wallet<total){toast("Insufficient wallet balance","error");setLoading(false);return;}
      setWallet(w=>w-total);
    }
    setLoading(false);setDone(true);setCart([]);
    setTimeout(onDone,2500);
  };
  if(done) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:24}}>
      <div style={{fontSize:80,animation:"fadeUp .4s ease"}}>🎉</div>
      <div style={{fontFamily:"'Cormorant Garamond'",fontSize:36,fontWeight:700,color:G.gold,textAlign:"center"}}>Order Placed!</div>
      <div style={{color:G.whiteDim,textAlign:"center",fontSize:14,maxWidth:260}}>Your food is being prepared. Estimated delivery: 25 minutes.</div>
    </div>
  );
  return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:18,animation:"fadeUp .4s ease"}}>
      <button onClick={onBack} style={{...btn("ghost",{width:"fit-content",padding:"8px 16px",fontSize:13})}}>← Back</button>
      <PHeader title="Checkout" sub="Review your order" icon="🛒"/>
      <div style={card()}>
        <STitle>Order Summary</STitle>
        <div style={{marginTop:12}}>
          {cart.map(item=>(
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
        <input style={{...inp({marginTop:12})}} defaultValue="Hostel B, Room 12"/>
      </div>
      <div style={card()}>
        <STitle>Payment</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:12}}>
          {[{id:"wallet",label:"NexGo Wallet",sub:`Balance: ₦${wallet.toLocaleString()}`,icon:"💳"},{id:"transfer",label:"Bank Transfer",sub:"Pay via bank app",icon:"🏦"}].map(m=>(
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
  const [view,setView] = useState("send");
  const [loading,setLoading] = useState(false);
  const [requested,setRequested] = useState(false);
  const doRequest=async()=>{setLoading(true);await new Promise(r=>setTimeout(r,1200));setLoading(false);setRequested(true);toast("Rider requested!","success");};
  if(requested) return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:400,gap:16,animation:"fadeUp .4s ease"}}>
      <div style={{fontSize:72}}>🏍️</div>
      <div style={{fontFamily:"'Cormorant Garamond'",fontSize:30,fontWeight:700,color:G.gold}}>Rider on the way!</div>
      <div style={{color:G.whiteDim,textAlign:"center",fontSize:14}}>Your package will be picked up in ~8 minutes.</div>
      <div style={{background:`${G.success}22`,border:`1px solid ${G.success}`,borderRadius:14,padding:"16px 24px",textAlign:"center"}}>
        <div style={{fontSize:11,color:G.whiteDim,letterSpacing:".06em",textTransform:"uppercase",marginBottom:4}}>Tracking ID</div>
        <div style={{fontFamily:"'DM Mono'",fontSize:20,fontWeight:700,color:G.gold}}>#DP-{Math.floor(Math.random()*9000+1000)}</div>
      </div>
      <div style={{width:"100%",height:4,background:G.b5,borderRadius:2,overflow:"hidden",marginTop:8}}>
        <div style={{width:"30%",height:"100%",background:`linear-gradient(90deg,${G.goldDark},${G.gold})`,borderRadius:2}}/>
      </div>
      <div style={{fontSize:12,color:G.gold}}>30% of route completed</div>
      <button onClick={()=>setRequested(false)} style={{...btn("outline")}}>Send Another</button>
    </div>
  );
  return (
    <div style={{padding:"24px 16px",animation:"fadeUp .4s ease"}}>
      <PHeader title="NexDispatch" sub="Send campus packages" icon="📦"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:20}}>
        {[{id:"send",icon:"📤",label:"Send Package",sub:"Request pickup"},{id:"track",icon:"📍",label:"Track Package",sub:"Live updates"}].map(v=>(
          <button key={v.id} onClick={()=>setView(v.id)} style={{...card({cursor:"pointer",textAlign:"center",border:`1.5px solid ${view===v.id?G.gold:G.b5}`,background:view===v.id?G.goldGlow:G.b3,transition:"all .2s"}),width:"100%"}}>
            <div style={{fontSize:32,marginBottom:8}}>{v.icon}</div>
            <div style={{fontWeight:700,color:G.white}}>{v.label}</div>
            <div style={{fontSize:12,color:G.whiteDim,marginTop:4}}>{v.sub}</div>
          </button>
        ))}
      </div>
      {view==="send"&&(
        <div style={{marginTop:24,display:"flex",flexDirection:"column",gap:14}}>
          <Lbl>Pickup Location</Lbl><input style={inp()} placeholder="e.g. Library, Block A"/>
          <Lbl>Delivery Location</Lbl><input style={inp()} placeholder="e.g. Hostel B, Room 12"/>
          <Lbl>Package Description</Lbl><input style={inp()} placeholder="e.g. Textbooks x2"/>
          <div style={{...card({background:G.goldGlow,border:`1px solid ${G.goldDark}`})}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{color:G.whiteDim,fontSize:14}}>Estimated Fee</span>
              <span style={{color:G.gold,fontWeight:700,fontFamily:"'DM Mono'"}}>₦250</span>
            </div>
            <div style={{fontSize:12,color:G.whiteDim,marginTop:6}}>Rider arrives in ~8 minutes</div>
          </div>
          <button onClick={doRequest} disabled={loading} style={{...btn("gold",{width:"100%",padding:"14px",opacity:loading?.7:1})}}>
            {loading?<><Spinner/> Requesting…</>:"Request Rider →"}
          </button>
        </div>
      )}
      {view==="track"&&(
        <div style={{marginTop:24,display:"flex",flexDirection:"column",gap:14}}>
          {[{id:"#DP01",item:"Textbooks (x3)",status:"Delivered",fee:300,from:"Library",to:"Hostel B"},{id:"#DP02",item:"Laptop bag",status:"In Transit",fee:250,from:"ICT Centre",to:"Hostel A"}].map(d=>(
            <div key={d.id} style={card({display:"flex",justifyContent:"space-between",alignItems:"center"})}>
              <div>
                <div style={{fontWeight:600,color:G.white,fontSize:14}}>{d.item}</div>
                <div style={{fontSize:12,color:G.whiteDim,marginTop:2}}>{d.from} → {d.to}</div>
                <div style={{fontSize:12,color:G.gold,fontFamily:"'DM Mono'",marginTop:4}}>₦{d.fee}</div>
              </div>
              <Badge status={d.status}/>
            </div>
          ))}
          <div style={{...card({textAlign:"center",padding:28})}}>
            <div style={{fontSize:40,marginBottom:10}}>🏍️</div>
            <div style={{fontWeight:700,color:G.white,marginBottom:6}}>Active Delivery</div>
            <div style={{color:G.whiteDim,fontSize:13,marginBottom:14}}>Rider: Emeka O. · ETA 5 min</div>
            <div style={{height:4,background:G.b5,borderRadius:2,overflow:"hidden",marginBottom:8}}>
              <div style={{width:"65%",height:"100%",background:`linear-gradient(90deg,${G.goldDark},${G.gold})`,borderRadius:2}}/>
            </div>
            <div style={{fontSize:12,color:G.gold}}>65% of route completed</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Student: NexTrip ─────────────────────────────────────────────────────────
function NexTrip({wallet,setWallet}) {
  const [sel,setSel] = useState(null);
  const [booked,setBooked] = useState(false);
  const [loading,setLoading] = useState(false);
  const doBook=async()=>{
    setLoading(true);
    await new Promise(r=>setTimeout(r,1000));
    if(wallet<sel.price){toast("Insufficient wallet balance","error");setLoading(false);return;}
    setWallet(w=>w-sel.price);
    setLoading(false);setBooked(true);
    toast("Seat booked!","success");
  };
  if(booked&&sel) return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:400,gap:16,animation:"fadeUp .4s ease"}}>
      <div style={{fontSize:72}}>🚌</div>
      <div style={{fontFamily:"'Cormorant Garamond'",fontSize:30,color:G.gold,fontWeight:700}}>Seat Reserved!</div>
      <div style={{color:G.whiteDim,textAlign:"center",fontSize:14}}>Your seat on <strong style={{color:G.white}}>{sel.from} → {sel.to}</strong> is confirmed.</div>
      <div style={{background:G.goldGlow,border:`1px solid ${G.goldBorder}`,borderRadius:14,padding:"16px 24px",textAlign:"center"}}>
        <div style={{fontSize:11,color:G.whiteDim,letterSpacing:".06em",textTransform:"uppercase",marginBottom:4}}>Boarding Code</div>
        <div style={{fontFamily:"'DM Mono'",fontSize:24,fontWeight:700,color:G.gold}}>NX-{Math.random().toString(36).substr(2,6).toUpperCase()}</div>
      </div>
      <button onClick={()=>{setBooked(false);setSel(null);}} style={{...btn("outline")}}>Book Another</button>
    </div>
  );
  return (
    <div style={{padding:"24px 16px",animation:"fadeUp .4s ease"}}>
      <PHeader title="NexTrip" sub="Campus shuttle booking" icon="🚌"/>
      <div style={{display:"flex",flexDirection:"column",gap:14,marginTop:20}}>
        {ROUTES.map(r=>(
          <div key={r.id} onClick={()=>setSel(r)} style={{...card({cursor:"pointer",border:`1.5px solid ${sel?.id===r.id?G.gold:G.b5}`,background:sel?.id===r.id?G.goldGlow:G.b3,transition:"all .2s"})}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontWeight:700,color:G.white,fontSize:15}}>{r.from}</div>
                <div style={{color:G.gold,fontSize:22,margin:"4px 0"}}>↓</div>
                <div style={{fontWeight:700,color:G.white,fontSize:15}}>{r.to}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:G.gold,fontWeight:700,fontFamily:"'DM Mono'",fontSize:18}}>₦{r.price}</div>
                <div style={{fontSize:12,color:G.whiteDim,marginTop:4}}>🚌 {r.seats} seats left</div>
                <div style={{fontSize:12,color:G.success,marginTop:2}}>Next: {r.next}</div>
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
function WalletScreen({wallet,setWallet}) {
  const [amt,setAmt] = useState("");
  const [txns,setTxns] = useState([
    {l:"NexChow #NX002",a:-2400,t:"Today, 4:15pm",ic:"🍽️"},
    {l:"Wallet Top-up",a:5000,t:"Today, 3:00pm",ic:"💳"},
    {l:"NexTrip Booking",a:-150,t:"Yesterday",ic:"🚌"},
    {l:"NexDispatch #DP01",a:-300,t:"2 days ago",ic:"📦"},
  ]);
  const fund=()=>{
    const v=parseInt(amt);
    if(!isNaN(v)&&v>0){
      setWallet(w=>w+v);
      setTxns(p=>[{l:"Wallet Top-up",a:v,t:"Just now",ic:"💳"},...p]);
      setAmt("");
      toast(`₦${v.toLocaleString()} added!`,"success");
    } else {toast("Enter a valid amount","error");}
  };
  return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>
      <PHeader title="NexWallet" sub="Your campus money" icon="💳"/>
      <div style={{background:`linear-gradient(135deg,${G.goldDark},${G.gold})`,borderRadius:22,padding:"32px 24px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-30,top:-30,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.1)"}}/>
        <div style={{position:"absolute",left:-20,bottom:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.06)"}}/>
        <div style={{fontSize:12,color:G.black,opacity:.7,letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>Total Balance</div>
        <div style={{fontFamily:"'Cormorant Garamond'",fontSize:52,fontWeight:700,color:G.black,lineHeight:1}}>₦{wallet.toLocaleString()}</div>
        <div style={{fontSize:13,color:G.black,opacity:.6,marginTop:8}}>Chioma Adaeze · NX-8823</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        {[{ic:"➕",l:"Top Up"},{ic:"📤",l:"Send"},{ic:"📥",l:"Withdraw"}].map(a=>(
          <button key={a.l} className="hover-gold" style={{...card({textAlign:"center",cursor:"pointer",padding:16,transition:"all .2s"}),width:"100%",background:G.b3}}>
            <div style={{fontSize:22,marginBottom:6}}>{a.ic}</div>
            <div style={{fontSize:12,fontWeight:600,color:G.whiteDim}}>{a.l}</div>
          </button>
        ))}
      </div>
      <div style={card()}>
        <STitle>Fund Wallet</STitle>
        <div style={{display:"flex",gap:8,marginTop:12,marginBottom:12,flexWrap:"wrap"}}>
          {[500,1000,2000,5000].map(v=>(
            <button key={v} onClick={()=>setAmt(String(v))} style={{padding:"8px 14px",borderRadius:20,fontSize:13,fontWeight:600,background:amt===String(v)?G.goldGlow:G.b4,border:`1px solid ${amt===String(v)?G.gold:G.b5}`,color:amt===String(v)?G.gold:G.whiteDim,cursor:"pointer",transition:"all .2s"}}>₦{v.toLocaleString()}</button>
          ))}
        </div>
        <input style={{...inp({marginBottom:12})}} type="number" placeholder="Enter amount…" value={amt} onChange={e=>setAmt(e.target.value)}/>
        <button onClick={fund} style={{...btn("gold",{width:"100%",padding:"13px"})}}>Fund Wallet →</button>
      </div>
      <div>
        <STitle>Transactions</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:12}}>
          {txns.map((tx,i)=>(
            <div key={i} style={card({display:"flex",justifyContent:"space-between",alignItems:"center"})}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:G.b4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{tx.ic}</div>
                <div>
                  <div style={{fontWeight:600,fontSize:13,color:G.white}}>{tx.l}</div>
                  <div style={{fontSize:11,color:G.whiteDim}}>{tx.t}</div>
                </div>
              </div>
              <div style={{fontWeight:700,fontFamily:"'DM Mono'",fontSize:14,color:tx.a>0?G.success:G.danger}}>{tx.a>0?"+":""}₦{Math.abs(tx.a).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Student: Profile ─────────────────────────────────────────────────────────
function ProfileScreen({onLogout}) {
  return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>
      <div style={{textAlign:"center",paddingTop:10}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${G.goldDark},${G.gold})`,margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,fontWeight:700,color:G.black}}>C</div>
        <div style={{fontFamily:"'Cormorant Garamond'",fontSize:28,fontWeight:700,color:G.white}}>Chioma Adaeze</div>
        <div style={{color:G.whiteDim,fontSize:13,marginTop:2}}>chioma@university.edu.ng</div>
        <div style={{color:G.gold,fontSize:12,marginTop:4,fontFamily:"'DM Mono'"}}>Student · NX-8823</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        {[{l:"Orders",v:"47"},{l:"Trips",v:"23"},{l:"Dispatches",v:"12"}].map(s=>(
          <div key={s.l} style={card({textAlign:"center"})}>
            <div style={{fontFamily:"'Cormorant Garamond'",fontSize:30,fontWeight:700,color:G.gold}}>{s.v}</div>
            <div style={{fontSize:12,color:G.whiteDim}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={card()}>
        {[{icon:"👤",label:"Edit Profile"},{icon:"🔔",label:"Notifications"},{icon:"🔒",label:"Security & Privacy"},{icon:"❓",label:"Help & Support"},{icon:"📋",label:"Terms & Conditions"}].map((item,i,arr)=>(
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

// ─── Student: Chat ────────────────────────────────────────────────────────────
function ChatScreen() {
  const [msgs,setMsgs] = useState([
    {id:1,from:"support",text:"Hello! 👋 How can we help you today?",time:"10:02 AM"},
    {id:2,from:"user",text:"I want to know the status of my order #1234",time:"10:03 AM"},
    {id:3,from:"support",text:"Your order is on the way! Rider ETA: 5 minutes 🏍️",time:"10:04 AM"},
  ]);
  const [input,setInput] = useState("");
  const bottomRef = useRef(null);
  useEffect(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),[msgs]);
  const send=()=>{
    if(!input.trim()) return;
    const now=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    setMsgs(p=>[...p,{id:Date.now(),from:"user",text:input,time:now}]);
    const txt=input; setInput("");
    setTimeout(()=>setMsgs(p=>[...p,{id:Date.now()+1,from:"support",text:"Thanks! Our team will respond shortly 🙏",time:now}]),1200);
  };
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",animation:"fadeUp .4s ease"}}>
      <div style={{padding:"16px",borderBottom:`1px solid ${G.b4}`,display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${G.goldDark},${G.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>💬</div>
        <div>
          <div style={{fontWeight:600,fontSize:15}}>NexGo Support</div>
          <div style={{fontSize:11,color:G.gold,display:"flex",alignItems:"center",gap:5}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:G.gold,display:"inline-block",animation:"pulse 2s ease infinite"}}/>Online
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:12}}>
        {msgs.map(m=>(
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
function VendorApp({tab,onLogout}) {
  const [orders,setOrders] = useState(VENDOR_ORDERS);
  const [isOpen,setIsOpen] = useState(true);
  const next=(id)=>setOrders(p=>p.map(o=>o.id===id?{...o,status:o.status==="Pending"?"Preparing":o.status==="Preparing"?"Ready":"Done"}:o));

  if(tab==="orders") return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .4s ease"}}>
      <PHeader title="Orders" sub="Manage incoming orders" icon="📦"/>
      {orders.map(o=>(
        <div key={o.id} style={card()}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontWeight:700,color:G.white}}>{o.id}</span><Badge status={o.status}/>
          </div>
          <div style={{fontSize:13,color:G.whiteDim,marginBottom:3}}>{o.items}</div>
          <div style={{fontSize:13,color:G.whiteDim,marginBottom:12}}>👤 {o.student} · {o.time}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:G.gold,fontFamily:"'DM Mono'",fontWeight:700}}>₦{o.amount.toLocaleString()}</span>
            {o.status!=="Done"&&<button onClick={()=>next(o.id)} style={{...btn("gold",{padding:"8px 16px",fontSize:12})}}>
              {o.status==="Pending"?"Start Prep":o.status==="Preparing"?"Mark Ready":"Complete"}
            </button>}
          </div>
        </div>
      ))}
    </div>
  );

  if(tab==="menu") return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .4s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <PHeader title="Menu" sub="Manage your items" icon="🍽️"/>
        <button style={{...btn("gold",{padding:"8px 16px",fontSize:13})}}>+ Add</button>
      </div>
      {MENU_ITEMS.map(item=>(
        <div key={item.id} style={card({display:"flex",justifyContent:"space-between",alignItems:"center"})}>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <span style={{fontSize:28}}>{item.img}</span>
            <div>
              <div style={{fontWeight:600,color:G.white,fontSize:14}}>{item.name}</div>
              <div style={{fontSize:12,color:G.whiteDim}}>{item.desc}</div>
              <div style={{color:G.gold,fontFamily:"'DM Mono'",fontSize:13,marginTop:3}}>₦{item.price.toLocaleString()}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button style={{...btn("ghost",{padding:"6px 12px",fontSize:12})}}>Edit</button>
            <button style={{...btn("ghost",{padding:"6px 12px",fontSize:12,color:G.danger})}}>Del</button>
          </div>
        </div>
      ))}
    </div>
  );

  if(tab==="earnings") return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>
      <PHeader title="Earnings" sub="Your revenue breakdown" icon="💰"/>
      <div style={{background:`linear-gradient(135deg,${G.goldDark},${G.gold})`,borderRadius:20,padding:"28px 24px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-20,top:-20,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.1)"}}/>
        <div style={{fontSize:12,color:G.black,opacity:.7,letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>Total This Month</div>
        <div style={{fontFamily:"'Cormorant Garamond'",fontSize:48,fontWeight:700,color:G.black}}>₦142,500</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[{l:"This Week",v:"₦36,500",c:G.gold},{l:"Pending Payout",v:"₦12,200",c:G.success},{l:"Total Orders",v:"284",c:G.goldLight},{l:"Avg Order",v:"₦2,100",c:G.whiteDim}].map(s=>(
          <div key={s.l} style={card()}>
            <div style={{fontFamily:"'DM Mono'",fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div>
            <div style={{fontSize:12,color:G.whiteDim,marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if(tab==="profile") return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>
      <div style={{textAlign:"center",paddingTop:10}}>
        <div style={{width:80,height:80,borderRadius:16,background:`linear-gradient(135deg,${G.goldDark},${G.gold})`,margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>🍲</div>
        <div style={{fontFamily:"'Cormorant Garamond'",fontSize:28,fontWeight:700,color:G.white}}>The Golden Spoon</div>
        <div style={{color:G.whiteDim,fontSize:13,marginTop:2}}>golden.spoon@nexgo.ng</div>
        <div style={{color:G.gold,fontSize:12,marginTop:4,fontFamily:"'DM Mono'"}}>Vendor · VND-2201</div>
      </div>
      <div style={card()}>
        {["Restaurant Info","Payment Settings","Operating Hours","Notifications","Help"].map((item,i,arr)=>(
          <div key={item} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:i<arr.length-1?`1px solid ${G.b5}`:"none",cursor:"pointer"}}>
            <span style={{color:G.white,fontWeight:500,fontSize:14}}>{item}</span>
            <span style={{color:G.whiteDim}}>›</span>
          </div>
        ))}
      </div>
      <button onClick={onLogout} style={{...btn("ghost",{width:"100%",padding:"14px",color:G.danger,border:`1px solid ${G.danger}40`})}}>Sign Out</button>
    </div>
  );

  // Vendor Dashboard (default)
  return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{color:G.whiteDim,fontSize:13}}>Welcome back,</div>
          <div style={{fontFamily:"'Cormorant Garamond'",fontSize:30,fontWeight:700,color:G.white}}>The Golden Spoon 🍲</div>
        </div>
        <div onClick={()=>setIsOpen(o=>!o)} style={{background:isOpen?`${G.success}22`:G.b4,border:`1px solid ${isOpen?G.success:G.b5}`,borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700,color:isOpen?G.success:G.whiteDim,cursor:"pointer",transition:"all .3s"}}>
          {isOpen?"🟢 Open":"⚫ Closed"}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[{l:"Today's Orders",v:"24",ic:"📦",c:G.gold},{l:"Revenue (₦)",v:"36,500",ic:"💰",c:G.success},{l:"Pending",v:"3",ic:"⏳",c:G.danger},{l:"Avg Rating",v:"4.8 ⭐",ic:"⭐",c:G.goldLight}].map(s=>(
          <div key={s.l} style={card()}>
            <div style={{fontSize:24,marginBottom:6}}>{s.ic}</div>
            <div style={{fontFamily:"'DM Mono'",fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div>
            <div style={{fontSize:12,color:G.whiteDim,marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={card()}>
        <STitle>Live Orders</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:12}}>
          {VENDOR_ORDERS.slice(0,2).map(o=>(
            <div key={o.id} style={{padding:14,background:G.b4,borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:600,color:G.white,fontSize:14}}>{o.items}</div>
                <div style={{fontSize:12,color:G.whiteDim}}>{o.student} · {o.time}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <Badge status={o.status}/>
                <div style={{color:G.gold,fontFamily:"'DM Mono'",fontSize:13,marginTop:4}}>₦{o.amount.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Rider App ────────────────────────────────────────────────────────────────
function RiderApp({tab,onLogout}) {
  const [online,setOnline] = useState(true);
  const [deliveries,setDeliveries] = useState(RIDER_DELIVERIES);
  const accept=(id)=>setDeliveries(p=>p.map(d=>d.id===id?{...d,status:"Active"}:d));
  const complete=(id)=>setDeliveries(p=>p.map(d=>d.id===id?{...d,status:"Done"}:d));

  if(tab==="earnings") return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>
      <PHeader title="Earnings" sub="Your delivery income" icon="💰"/>
      <div style={{background:`linear-gradient(135deg,${G.goldDark},${G.gold})`,borderRadius:20,padding:"28px 24px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-20,top:-20,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.1)"}}/>
        <div style={{fontSize:12,color:G.black,opacity:.7,letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>Total This Week</div>
        <div style={{fontFamily:"'Cormorant Garamond'",fontSize:48,fontWeight:700,color:G.black}}>₦4,200</div>
        <div style={{fontSize:13,color:G.black,opacity:.6,marginTop:6}}>12 deliveries completed</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[{l:"Today",v:"₦650",c:G.gold},{l:"This Month",v:"₦18,400",c:G.success},{l:"NexChow",v:"8",c:G.goldLight},{l:"NexDispatch",v:"4",c:G.whiteDim}].map(s=>(
          <div key={s.l} style={card()}>
            <div style={{fontFamily:"'DM Mono'",fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div>
            <div style={{fontSize:12,color:G.whiteDim,marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if(tab==="profile") return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>
      <div style={{textAlign:"center",paddingTop:10}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${G.goldDark},${G.gold})`,margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,fontWeight:700,color:G.black}}>E</div>
        <div style={{fontFamily:"'Cormorant Garamond'",fontSize:28,fontWeight:700,color:G.white}}>Emeka Obi</div>
        <div style={{color:G.whiteDim,fontSize:13,marginTop:2}}>emeka@university.edu.ng</div>
        <div style={{color:G.gold,fontSize:12,marginTop:4,fontFamily:"'DM Mono'"}}>Rider · RDR-0047</div>
      </div>
      <div style={card()}>
        {["Vehicle Info","Bank Account","Availability Schedule","Notifications","Help"].map((item,i,arr)=>(
          <div key={item} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:i<arr.length-1?`1px solid ${G.b5}`:"none",cursor:"pointer"}}>
            <span style={{color:G.white,fontWeight:500,fontSize:14}}>{item}</span>
            <span style={{color:G.whiteDim}}>›</span>
          </div>
        ))}
      </div>
      <button onClick={onLogout} style={{...btn("ghost",{width:"100%",padding:"14px",color:G.danger,border:`1px solid ${G.danger}40`})}}>Sign Out</button>
    </div>
  );

  // Rider Dashboard (rdashboard + deliveries)
  return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{color:G.whiteDim,fontSize:13}}>Rider Dashboard</div>
          <div style={{fontFamily:"'Cormorant Garamond'",fontSize:30,fontWeight:700,color:G.white}}>Emeka O. 🏍️</div>
        </div>
        <div onClick={()=>setOnline(o=>!o)} style={{background:online?`${G.success}22`:G.b4,border:`1.5px solid ${online?G.success:G.b5}`,borderRadius:20,padding:"8px 16px",cursor:"pointer",fontSize:12,fontWeight:700,color:online?G.success:G.whiteDim,transition:"all .3s"}}>
          {online?"🟢 Online":"⚫ Offline"}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        {[{v:"12",l:"Deliveries"},{v:"₦4,200",l:"Earnings"},{v:"4.9 ⭐",l:"Rating"}].map(s=>(
          <div key={s.l} style={card({textAlign:"center"})}>
            <div style={{fontFamily:"'DM Mono'",fontSize:18,fontWeight:700,color:G.gold}}>{s.v}</div>
            <div style={{fontSize:11,color:G.whiteDim,marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>
      <STitle>Active Deliveries</STitle>
      {deliveries.filter(d=>d.status!=="Done").map(d=>(
        <div key={d.id} style={card({border:`1.5px solid ${d.status==="Active"?G.gold:G.b5}`})}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
            <span style={{fontWeight:700,color:G.white}}>{d.id}</span><Badge status={d.status}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:12}}>
            <div style={{fontSize:13,color:G.whiteDim}}>📍 Pickup: <span style={{color:G.white}}>{d.pickup}</span></div>
            <div style={{fontSize:13,color:G.whiteDim}}>🏠 Drop: <span style={{color:G.white}}>{d.dropoff}</span></div>
            <div style={{fontSize:13,color:G.whiteDim}}>👤 Customer: <span style={{color:G.white}}>{d.student}</span></div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:G.gold,fontFamily:"'DM Mono'",fontWeight:700,fontSize:16}}>+₦{d.amount}</span>
            {d.status==="Pending"&&<button onClick={()=>accept(d.id)} style={{...btn("gold",{padding:"8px 16px",fontSize:13})}}>Accept</button>}
            {d.status==="Active"&&<button onClick={()=>complete(d.id)} style={{...btn("gold",{padding:"8px 16px",fontSize:13})}}>Complete ✓</button>}
          </div>
        </div>
      ))}
      {deliveries.filter(d=>d.status==="Done").map(d=>(
        <div key={d.id} style={card({opacity:.45,display:"flex",justifyContent:"space-between"})}>
          <span style={{color:G.white,fontSize:13}}>{d.id} · Done</span><Badge status="Done"/>
        </div>
      ))}
    </div>
  );
}

// ─── Admin App ────────────────────────────────────────────────────────────────
function AdminApp({tab,onLogout}) {
  const [users,setUsers] = useState(ADMIN_USERS);
  const [search,setSearch] = useState("");
  const toggle=(name)=>setUsers(p=>p.map(u=>u.n===name?{...u,s:u.s==="Active"?"Suspended":"Active"}:u));

  if(tab==="users") return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .4s ease"}}>
      <PHeader title="Users" sub="Manage all users" icon="👥"/>
      <input style={inp()} placeholder="🔍  Search users…" value={search} onChange={e=>setSearch(e.target.value)}/>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {users.filter(u=>u.n.toLowerCase().includes(search.toLowerCase())||u.r.toLowerCase().includes(search.toLowerCase())).map(u=>(
          <div key={u.n} style={card()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${G.goldDark},${G.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:G.black}}>{u.n[0]}</div>
                <div>
                  <div style={{fontWeight:600,color:G.white,fontSize:14}}>{u.n}</div>
                  <div style={{fontSize:11,color:G.whiteDim}}>{u.email}</div>
                  <div style={{fontSize:11,color:G.whiteDim,marginTop:1}}>{u.r} · Joined {u.d}</div>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                <Badge status={u.s}/>
                <button onClick={()=>toggle(u.n)} style={{...btn(u.s==="Active"?"ghost":"gold",{padding:"5px 10px",fontSize:11,color:u.s==="Active"?G.danger:G.black})}}>
                  {u.s==="Active"?"Suspend":"Activate"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if(tab==="analytics") return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>
      <PHeader title="Analytics" sub="Platform performance" icon="📈"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[{l:"Total Revenue",v:"₦3.8M",delta:"+18%",c:G.gold,ic:"💰"},{l:"NexChow GMV",v:"₦2.5M",delta:"+22%",c:G.success,ic:"🍽️"},{l:"Dispatch Volume",v:"1,240",delta:"+15%",c:G.goldLight,ic:"📦"},{l:"Trip Bookings",v:"4,820",delta:"+31%",c:G.whiteDim,ic:"🚌"}].map(s=>(
          <div key={s.l} style={card()}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div style={{fontSize:24}}>{s.ic}</div>
              <div style={{fontSize:11,color:G.success,fontWeight:700}}>{s.delta}</div>
            </div>
            <div style={{fontFamily:"'DM Mono'",fontSize:20,fontWeight:700,color:s.c,marginTop:8}}>{s.v}</div>
            <div style={{fontSize:12,color:G.whiteDim,marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={card()}>
        <STitle>Weekly Activity</STitle>
        <div style={{marginTop:16,display:"flex",alignItems:"flex-end",gap:8,height:100}}>
          {[40,65,55,80,90,70,85].map((h,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <div style={{width:"100%",height:`${h}%`,background:i===6?`linear-gradient(180deg,${G.gold},${G.goldDark})`:`${G.gold}44`,borderRadius:"4px 4px 0 0"}}/>
              <div style={{fontSize:10,color:G.whiteDim}}>{"MTWTFSS"[i]}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={card()}>
        <STitle>Revenue Breakdown</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:14,marginTop:16}}>
          {[{l:"NexChow",p:65,c:G.gold},{l:"NexDispatch",p:20,c:G.goldLight},{l:"NexTrip",p:15,c:G.goldDark}].map(a=>(
            <div key={a.l}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13}}>
                <span style={{color:G.whiteDim}}>{a.l}</span>
                <span style={{color:a.c,fontWeight:700}}>{a.p}%</span>
              </div>
              <div style={{height:6,background:G.b5,borderRadius:3,overflow:"hidden"}}>
                <div style={{width:`${a.p}%`,height:"100%",background:a.c,borderRadius:3}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if(tab==="profile") return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>
      <div style={{textAlign:"center",paddingTop:10}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,#1A1A2E,#16213E)`,border:`2px solid ${G.gold}`,margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>⚙️</div>
        <div style={{fontFamily:"'Cormorant Garamond'",fontSize:28,fontWeight:700,color:G.white}}>Super Admin</div>
        <div style={{color:G.whiteDim,fontSize:13,marginTop:2}}>admin@nexgo.ng</div>
        <div style={{color:G.gold,fontSize:12,marginTop:4,fontFamily:"'DM Mono'"}}>Administrator · ADM-0001</div>
      </div>
      <div style={card()}>
        {["Platform Settings","Service Config","Fee Management","Security","System Logs"].map((item,i,arr)=>(
          <div key={item} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:i<arr.length-1?`1px solid ${G.b5}`:"none",cursor:"pointer"}}>
            <span style={{color:G.white,fontWeight:500,fontSize:14}}>{item}</span>
            <span style={{color:G.whiteDim}}>›</span>
          </div>
        ))}
      </div>
      <button onClick={onLogout} style={{...btn("ghost",{width:"100%",padding:"14px",color:G.danger,border:`1px solid ${G.danger}40`})}}>Sign Out</button>
    </div>
  );

  // Admin Dashboard
  return (
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>
      <PHeader title="Admin Panel" sub="NexGo operations overview" icon="⚙️"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[{label:"Total Users",value:"4,218",delta:"+12%",icon:"👥"},{label:"Orders Today",value:"847",delta:"+23%",icon:"📦"},{label:"Revenue",value:"₦1.2M",delta:"+8%",icon:"💰"},{label:"Active Riders",value:"34",delta:"+5",icon:"🏍️"}].map(s=>(
          <div key={s.label} style={card()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:12,color:G.whiteDim,marginBottom:6}}>{s.label}</div>
                <div style={{fontFamily:"'DM Mono'",fontSize:22,fontWeight:700,color:G.gold}}>{s.value}</div>
              </div>
              <span style={{fontSize:24}}>{s.icon}</span>
            </div>
            <div style={{fontSize:12,color:G.success,marginTop:8}}>{s.delta} this week</div>
          </div>
        ))}
      </div>
      <div style={card()}>
        <STitle>Recent Users</STitle>
        {ADMIN_USERS.slice(0,4).map((u,i,arr)=>(
          <div key={u.n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:i<arr.length-1?`1px solid ${G.b5}`:"none"}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${G.goldDark},${G.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:G.black}}>{u.n[0]}</div>
              <div>
                <div style={{fontWeight:600,color:G.white,fontSize:14}}>{u.n}</div>
                <div style={{fontSize:11,color:G.whiteDim}}>{u.r} · {u.d}</div>
              </div>
            </div>
            <Badge status={u.s}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Desktop Wrapper ──────────────────────────────────────────────────────────
function DesktopWrapper({children}) {
  return (
    <div style={{minHeight:"100vh",background:G.black,display:"flex",alignItems:"stretch",position:"relative",overflow:"hidden"}}>
      {/* Background glow */}
      <div style={{position:"fixed",width:800,height:800,borderRadius:"50%",background:`radial-gradient(circle,rgba(201,168,76,0.06) 0%,transparent 65%)`,top:"50%",left:"25%",transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>

      {/* Left promo panel */}
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px 40px 60px 60px",position:"relative",zIndex:1,minWidth:0}}>
        <img src={NEXGO_LOGO} alt="NexGo" style={{width:200,objectFit:"contain",filter:"drop-shadow(0 0 20px rgba(201,168,76,0.4))",marginBottom:32}}/>
        <div style={{fontFamily:"'Cormorant Garamond'",fontSize:52,fontWeight:700,color:G.white,lineHeight:1.1,marginBottom:16}}>
          The Campus<br/><span style={{color:G.gold}}>Super App</span>
        </div>
        <div style={{fontSize:16,color:G.whiteDim,lineHeight:1.7,marginBottom:40,maxWidth:420}}>
          Order food, send packages, book campus rides — all in one place. Built for Nigerian university students.
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:48}}>
          {[{icon:"🍽️",title:"NexChow",desc:"Order from campus restaurants in minutes"},{icon:"📦",title:"NexDispatch",desc:"Send & receive packages across campus"},{icon:"🚌",title:"NexTrip",desc:"Book campus bus & keke rides instantly"}].map(f=>(
            <div key={f.title} style={{display:"flex",gap:14,alignItems:"center"}}>
              <div style={{width:44,height:44,borderRadius:12,background:G.goldGlow,border:`1px solid ${G.goldBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{f.icon}</div>
              <div>
                <div style={{fontWeight:700,color:G.white,fontSize:15}}>{f.title}</div>
                <div style={{fontSize:13,color:G.whiteDim}}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:12}}>
          <div style={{background:G.b3,border:`1px solid ${G.b5}`,borderRadius:10,padding:"10px 18px",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
            <span style={{fontSize:20}}>🍎</span>
            <div>
              <div style={{fontSize:9,color:G.whiteDim,letterSpacing:".05em",textTransform:"uppercase"}}>Coming soon</div>
              <div style={{fontSize:13,fontWeight:700,color:G.white}}>App Store</div>
            </div>
          </div>
          <div style={{background:G.b3,border:`1px solid ${G.b5}`,borderRadius:10,padding:"10px 18px",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
            <span style={{fontSize:20}}>🤖</span>
            <div>
              <div style={{fontSize:9,color:G.whiteDim,letterSpacing:".05em",textTransform:"uppercase"}}>Coming soon</div>
              <div style={{fontSize:13,fontWeight:700,color:G.white}}>Google Play</div>
            </div>
          </div>
        </div>
        <div style={{marginTop:"auto",paddingTop:40,fontSize:12,color:G.whiteDim}}>
          © 2025 NexGo · Built for campus life 🎓
        </div>
      </div>

      {/* Right: Phone frame */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 60px 40px 20px",flexShrink:0,position:"relative",zIndex:1}}>
        {/* Phone outer frame */}
        <div style={{position:"relative",width:390,height:820,borderRadius:44,background:"#0D0D0D",border:`2px solid #2A2A2A`,boxShadow:"0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px #1A1A1A, inset 0 0 0 1px #333, 0 0 60px rgba(201,168,76,0.08)",overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {/* Notch */}
          <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:120,height:34,background:"#0D0D0D",borderRadius:"0 0 20px 20px",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:"#1A1A1A",border:"1px solid #2A2A2A"}}/>
            <div style={{width:60,height:6,borderRadius:3,background:"#1A1A1A"}}/>
          </div>
          {/* Screen */}
          <div style={{flex:1,overflow:"hidden",borderRadius:42,marginTop:0}}>
            {children}
          </div>
          {/* Home indicator */}
          <div style={{position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",width:120,height:4,background:"#333",borderRadius:2}}/>
        </div>
        {/* Side button details */}
        <div style={{position:"absolute",right:52,top:"30%",width:3,height:60,background:"#2A2A2A",borderRadius:2}}/>
        <div style={{position:"absolute",left:52,top:"28%",width:3,height:40,background:"#2A2A2A",borderRadius:2}}/>
        <div style={{position:"absolute",left:52,top:"36%",width:3,height:40,background:"#2A2A2A",borderRadius:2}}/>
        <div style={{position:"absolute",left:52,top:"44%",width:3,height:70,background:"#2A2A2A",borderRadius:2}}/>
      </div>
    </div>
  );
}

// ─── Main App (inner, uses auth context) ──────────────────────────────────────
function NexGoInner() {
  useEffect(()=>{ injectStyles(); },[]);
  const { user, profile, role: authRole, walletBalance, loading: authLoading, signOut, refreshWallet } = useAuth();
  const [screen,setScreen] = useState("splash");
  const [cart,setCart] = useState([]);
  const [wallet,setWallet] = useState(0);
  const [tab,setTab] = useState("home");
  const [isDesktop,setIsDesktop] = useState(window.innerWidth>=900);

  // Sync wallet from auth context
  useEffect(() => { setWallet(walletBalance); }, [walletBalance]);

  useEffect(()=>{
    const handler=()=>setIsDesktop(window.innerWidth>=900);
    window.addEventListener("resize",handler);
    return ()=>window.removeEventListener("resize",handler);
  },[]);

  // When auth state changes, update screen
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
    const [restaurant,setRestaurant] = useState(null);
    const [atCheckout,setAtCheckout] = useState(false);
    if(tab==="chow"){
      if(atCheckout) return <Checkout cart={cart} setCart={setCart} wallet={wallet} setWallet={setWallet} onBack={()=>setAtCheckout(false)} onDone={()=>{setAtCheckout(false);setTab("home");}}/>;
      if(restaurant) return <RestaurantDetail r={restaurant} cart={cart} setCart={setCart} onBack={()=>setRestaurant(null)} onCheckout={()=>setAtCheckout(true)}/>;
      return <NexChow onSelect={setRestaurant} cart={cart} onCheckout={()=>setAtCheckout(true)}/>;
    }
    if(tab==="dispatch") return <NexDispatch/>;
    if(tab==="trip")     return <NexTrip wallet={wallet} setWallet={setWallet}/>;
    if(tab==="wallet")   return <WalletScreen wallet={wallet} setWallet={setWallet}/>;
    if(tab==="profile")  return <ProfileScreen onLogout={handleLogout}/>;
    if(tab==="chat")     return <ChatScreen/>;
    return <StudentHome wallet={wallet} setTab={setTab}/>;
  };

  const AppContent = (
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:G.black,position:"relative"}}>
      <ToastContainer/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
        {role==="student"&&<StudentContent/>}
        {role==="vendor" &&<VendorApp tab={tab} onLogout={handleLogout}/>}
        {role==="rider"  &&<RiderApp tab={tab} onLogout={handleLogout}/>}
        {role==="admin"  &&<AdminApp tab={tab} onLogout={handleLogout}/>}
      </div>
      <BottomNav role={role} tab={tab} setTab={setTab} cartCount={cart.reduce((a,c)=>a+c.qty,0)}/>
    </div>
  );

  if(screen==="splash"){
    const content = <Splash onDone={()=>setScreen(user ? "app" : "auth")}/>;
    return isDesktop ? <DesktopWrapper>{content}</DesktopWrapper> : content;
  }

  if(screen==="auth"){
    if (authLoading) {
      return <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:G.black}}>
        <Spinner size={32} color={G.gold}/>
      </div>;
    }
    const content = <Auth onLogin={()=>{}}/>;
    return isDesktop ? <DesktopWrapper>{content}</DesktopWrapper> : content;
  }

  return isDesktop
    ? <DesktopWrapper>{AppContent}</DesktopWrapper>
    : <div style={{height:"100%",maxWidth:480,margin:"0 auto"}}>{AppContent}</div>;
}

// ─── Wrapped export ───────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <NexGoInner />
    </AuthProvider>
  );
}
