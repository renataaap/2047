'use client';
import { useEffect,useRef,useState,useCallback } from 'react';
import { Game } from '../../game/core/Game.js';
import { loadSettings,saveSettings,DEFAULT_SETTINGS } from '../../game/persistence/settings.js';
import { TEXT as T } from '../../data/pt-BR.js';
import ContractsPanel from '../gameplay/ContractsPanel.js';
import GaragePanel from '../gameplay/GaragePanel.js';
import MainMenu from '../menus/MainMenu.js';
import Panel from '../menus/Panel.js';
import Hud from '../hud/Hud.js';
import Symbol from '../ui/Symbol.js';
import MissionPanel from '../gameplay/MissionPanel.js';
export default function GameView({autoStart=false,initialPanel=null}) {
  const canvas=useRef(),game=useRef();const [state,setState]=useState({mode:'menu',ready:false});const [settings,setSettings]=useState(DEFAULT_SETTINGS);const [panel,setPanel]=useState(initialPanel);const [error,setError]=useState('');const [starting,setStarting]=useState(false),[transitioning,setTransitioning]=useState(false);const [slots,setSlots]=useState([]);
  useEffect(()=>{const s=loadSettings();setSettings(s);const g=new Game(canvas.current,s,setState);game.current=g;g.init().then(async()=>{if(g.disposed)return;setSlots(g.initialSaves||[]);if(autoStart&&!g.disposed)setState(g.snapshot());}).catch(e=>{if(!g.disposed){console.error(e);setError(T.noWebgl);}});return()=>g.dispose();},[autoStart]);
  const updateSettings=s=>{if(!s){setPanel('settings');return;}setSettings(s);saveSettings(s);game.current?.setSettings(s);};
  const closePanel=useCallback(()=>{if(panel==='settings'&&state.mode==='paused'){setPanel(null);return;}setPanel(null);if(state.mode==='paused')game.current?.resume();},[panel,state.mode]);
  const travel=async fn=>{setStarting(true);setTransitioning(true);try{await new Promise(r=>setTimeout(r,240));await fn();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}finally{setTransitioning(false);setStarting(false);}};
  const start=()=>travel(()=>game.current?.start());
  const isMenu=state.mode==='menu';const activePanel=panel||(state.mode==='paused'?state.overlay||'pause':null);
  return <main className={'game-shell '+(isMenu?'in-menu':'in-game')}><canvas ref={canvas} aria-label={T.viewport}/><div className="vignette"/>{state.accessSequence>0&&<div key={state.accessSequence} aria-hidden="true" className="cab-access-transition"><span>{state.accessKind==='enter'?(state.vehicleName||'TITÃ ROCHA CLARA'):'DANTE ROCHA NEGRA'}</span></div>}
  {!error&&(!state.ready||state.mode==='loading')&&<div className="loading-overlay"><Symbol size={48}/><span className="spinner"/><h2>{T.loading}</h2><p>{T.loadingDetail}</p></div>}
  {error?<div className="loading-overlay"><p role="alert">{error}</p><button className="primary" onClick={()=>location.reload()}>{T.back}</button></div>:<>
  {isMenu?<><MainMenu ready={state.ready} starting={starting} onStart={start} onPanel={setPanel} hasSaves={slots.length>0} onContinue={async()=>{try{const latest=[...slots].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))[0];if(latest)await travel(()=>game.current.load(latest.slot));}catch{setPanel('saves');}}}/><div className="location-stamp"><span>{T.latitude} &nbsp; {T.longitude}</span><strong>{T.region}</strong><small>{T.route}</small></div><div className="scene-caption"><span className="status-dot"/>{T.ash}<span>{T.worldTime}</span></div></>:state.garage?.active||['cinematic','loading'].includes(state.mode)?null:<Hud state={state} settings={settings} onSkipTutorial={()=>game.current?.skipTutorial()} onPause={()=>game.current?.pause()} onInteract={()=>game.current?.interact(state.interaction?.key)} onPanel={kind=>game.current?.openPanel(kind)}/>}
  {state.mode==='cinematic'&&state.cutscene&&state.cutscene.id!=='restoration'&&<section className="cutscene-presentation" aria-label="Cena">{state.cutscene.caption&&<p className="cutscene-caption" role="status" aria-live="polite"><b>{state.cutscene.caption.speaker}</b>{state.cutscene.caption.text}</p>}<button autoFocus onClick={()=>{game.current?.cutscenes.skip();game.current?.emit();}}>Pular cena <kbd>Esc</kbd></button></section>}
  {state.mode==='cinematic'&&(!state.cutscene||state.cutscene.id==='restoration')&&<section className="restoration-presentation" aria-label="Restauração da região"><div><span>REDE AURORA · NÚCLEO ANCORADO</span><h2>A terra responde</h2><p>A primeira água encontra o solo. A recuperação continua durante a jornada.</p></div><button autoFocus onClick={()=>{game.current?.restoration.cinematic.finish(true);game.current?.emit();}}>Pular apresentação <kbd>Esc</kbd></button></section>}
  {activePanel==='contracts'?<ContractsPanel state={state} game={game.current}/>:activePanel==='garage'?<GaragePanel state={state} game={game.current}/>:activePanel&&(['settings','credits','pause'].includes(activePanel)?<Panel type={activePanel} settings={settings} onSettings={updateSettings} onClose={closePanel} onMenu={()=>{setPanel(null);game.current?.menu();}} onRecover={()=>{setPanel(null);game.current?.recover();}} onTutorial={()=>{if(state.tutorial?.status==='active')game.current.skipTutorial();else game.current.repeatTutorial();closePanel();}} tutorialStatus={state.tutorial?.status} onSave={()=>setPanel('saves')}/>:<MissionPanel type={activePanel} state={state} game={game.current} fromMenu={isMenu} onClose={closePanel} onLoaded={()=>{setPanel(null);game.current.saves.list().then(setSlots).catch(()=>{});}}/>)}
  </>}<div aria-hidden="true" className={'travel-transition '+(transitioning?'active':'')}/></main>;
}
