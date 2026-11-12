'use client';
import {useEffect,useState} from 'react';
import Symbol from '../ui/Symbol.js';
import {TEXT as T} from '../../data/pt-BR.js';
import {ACCOUNT_COPY as A} from '../../data/account.js';

// 0.15 — painel de conta (entrar, criar conta, sair). Jogar sem conta continua possível.
// onChanged é chamado depois de entrar/sair para recarregar a lista de saves.
/** @param {{account:{username:string}|null,onClose:Function,onChanged:Function}} props */
export default function AccountPanel({account,onClose,onChanged}){
 const [mode,setMode]=useState('login'),[username,setUsername]=useState(''),[password,setPassword]=useState('');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{const k=e=>{if(e.key==='Escape'&&!busy)onClose();};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[busy,onClose]);
 async function send(path,body){
  setBusy(true);setMessage('');
  try{const r=await fetch(`/api/auth/${path}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body||{})});const j=await r.json().catch(()=>({}));
   if(!r.ok){setMessage(j.error?.message||A.failure);return;}
   setPassword('');
   if(path==='logout')setMessage(A.signedOut);
   else if(path==='register')setMessage(j.saves?A.registeredWith(j.saves):A.registered);
   else setMessage(j.moved?.length?A.signedInMoved(j.moved,j.kept):j.kept?.length?A.signedInKept(j.kept):A.signedIn);
   await onChanged(j.account||null);
  }catch{setMessage(A.failure);}finally{setBusy(false);}
 }
 const submit=e=>{e.preventDefault();send(mode==='login'?'login':'register',{username,password});};
 return <div className="panel-backdrop field-interface technical-backdrop"><section className="panel account-panel" role="dialog" aria-modal="true" aria-labelledby="account-title">
  <div className="panel-heading"><Symbol size={26}/><span>{T.panelBrand}</span><button className="close" onClick={onClose} aria-label={T.back} disabled={busy}>×</button></div>
  <h2 id="account-title">{A.title}</h2>
  {account?<>
   <p className="account-status">{A.signedAs} <strong data-testid="account-name">{account.username}</strong></p>
   <p className="panel-note">{A.signedNote}</p>
   <button className="primary" onClick={()=>send('logout')} disabled={busy}>{A.logout}</button>
  </>:<>
   <p className="panel-note">{A.anonymousNote}</p>
   <div className="account-tabs" role="tablist" aria-label={A.title}>
    {['login','register'].map(m=><button key={m} role="tab" aria-selected={mode===m} className={mode===m?'active':''} onClick={()=>{setMode(m);setMessage('');}} disabled={busy}>{m==='login'?A.login:A.register}</button>)}
   </div>
   <form className="account-form" onSubmit={submit}>
    <label>{A.username}<input name="username" autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} minLength={A.rules.usernameMin} maxLength={A.rules.usernameMax} required disabled={busy}/></label>
    <label>{A.password}<input name="password" type="password" autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} minLength={A.rules.passwordMin} maxLength={A.rules.passwordMax} required disabled={busy}/></label>
    {mode==='register'&&<small className="account-hint">{A.hint}</small>}
    <button className="primary" type="submit" disabled={busy}>{busy?A.wait:mode==='login'?A.login:A.register}</button>
   </form>
  </>}
  {message&&<p className="account-message" role="status" aria-live="polite">{message}</p>}
 </section></div>;
}
