'use client';
import { useEffect,useRef,useState,useCallback } from 'react';
import { Game } from '../../game/core/Game.js';
import { loadSettings,saveSettings,DEFAULT_SETTINGS } from '../../game/persistence/settings.js';
import { TEXT as T } from '../../data/pt-BR.js';
import MainMenu from '../menus/MainMenu.js';
import Panel from '../menus/Panel.js';
import Hud from '../hud/Hud.js';
import Symbol from '../ui/Symbol.js';
export default function GameView({autoStart=false,initialPanel=null}) {
  const canvas=useRef(),game=useRef();const [state,setState]=useState({mode:'menu',ready:false});const [settings,setSettings]=useState(DEFAULT_SETTINGS);const [panel,setPanel]=useState(initialPanel);const [error,setError]=useState('');const [starting,setStarting]=useState(false);
  useEffect(()=>{const s=loadSettings();setSettings(s);const g=new Game(canvas.current,s,setState);game.current=g;g.init().then(()=>{if(autoStart&&!g.disposed)setState(g.snapshot());}).catch(e=>{if(!g.disposed){console.error(e);setError(T.noWebgl);}});return()=>g.dispose();},[autoStart]);
  const updateSettings=s=>{if(!s){setPanel('settings');return;}setSettings(s);saveSettings(s);game.current?.setSettings(s);};
  const closePanel=useCallback(()=>{if(panel==='settings'&&state.mode==='paused'){setPanel(null);return;}setPanel(null);if(state.mode==='paused')game.current?.resume();},[panel,state.mode]);
  const start=async()=>{setStarting(true);try{await game.current?.start();}finally{setStarting(false);}};
  const isMenu=state.mode==='menu';const activePanel=panel||(state.mode==='paused'?'pause':null);
  return <main className={'game-shell '+(isMenu?'in-menu':'in-game')}><canvas ref={canvas} aria-label="Mundo 3D do Mar de Cinzas e Titã Rocha Clara"/><div className="vignette"/>
  {!error&&!state.ready&&<div className="loading-overlay"><Symbol size={48}/><span className="spinner"/><h2>{T.loading}</h2><p>{T.loadingDetail}</p></div>}
  {error?<div className="loading-overlay"><p role="alert">{error}</p><button className="primary" onClick={()=>location.reload()}>{T.back}</button></div>:<>
  {isMenu?<><MainMenu ready={state.ready} starting={starting} onStart={start} onPanel={setPanel}/><div className="location-stamp"><span>23° 47′ S &nbsp; 46° 38′ O</span><strong>{T.region}</strong><small>{T.route}</small></div><div className="scene-caption"><span className="status-dot"/>{T.ash}<span>17:42</span></div></>:<Hud state={state} settings={settings} onPause={()=>game.current?.pause()}/>}
  {activePanel&&<Panel type={activePanel} settings={settings} onSettings={updateSettings} onClose={closePanel} onMenu={()=>{setPanel(null);game.current?.menu();}} onRecover={()=>{setPanel(null);game.current?.recover();}}/>}
  </>}</main>;
}
