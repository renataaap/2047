import { TEXT as T } from '../../data/pt-BR.js';
import Symbol from '../ui/Symbol.js';
import { ACCOUNT_COPY as A } from '../../data/account.js';
export default function MainMenu({ready,onStart,onPanel,starting,hasSaves,onContinue,account}){
 const choices=[{label:starting?T.loading:T.newGame,go:onStart,disabled:!ready||starting},{label:T.continue,go:onContinue,disabled:!hasSaves||!ready||starting},{label:T.load,go:()=>onPanel('saves'),disabled:!hasSaves||!ready||starting}];
 return <section className="main-menu road-menu" aria-label={T.title+': '+T.subtitle}>
  <header className="menu-masthead"><div><Symbol size={26}/><span>{T.project}</span></div><span>{T.silence}</span></header>
  <div className="menu-identity"><span className="menu-edition">UMA VIAGEM PELO QUE RESTOU</span><h1>{T.title}<span>{T.subtitle}</span></h1><p className="tagline">{T.tagline}</p></div>
  <nav className="road-menu-actions" aria-label="Menu principal">{choices.map((choice,i)=><button key={i} aria-label={i===0?`01 ${choice.label}`:choice.label} disabled={choice.disabled} onClick={choice.go}><small>{String(i+1).padStart(2,'0')}</small><span>{choice.label}</span><Symbol name="arrow" size={20}/></button>)}<div className="menu-secondary"><button onClick={()=>onPanel('account')} data-testid="menu-account">{account?`${A.menu} · ${account.username}`:`${A.login} / ${A.register}`}</button><i/><button onClick={()=>onPanel('settings')}>{T.settings}</button><i/><button onClick={()=>onPanel('credits')}>{T.credits}</button></div></nav>
  <div className="menu-truck-caption"><span>TITÃ ROCHA CLARA</span><small>O companheiro de estrada</small></div>
  <footer className="menu-footer"><span className="status-dot"/>{T.single}<span className="build">{T.release}</span></footer>
 </section>;
}
