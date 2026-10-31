export default function TutorialHud({tutorial,onSkip}){
 const s=tutorial.step;if(!s)return null;
 return <section className="tutorial-guide" aria-label="Tutorial" data-testid="tutorial-guide">
  <div className="eyebrow">{tutorial.chapter}</div>
  <div className="tutorial-progress"><span>{s.section}</span><small>{tutorial.completed.length+1} / {tutorial.total}</small></div>
  <h2 aria-live="polite"><kbd>{s.key}</kbd>{s.title}</h2><p>{s.detail}</p>
  <progress aria-label="Progresso do tutorial" max={tutorial.total} value={tutorial.completed.length}/>
  <button onClick={onSkip}>Pular tutorial</button>
 </section>;
}
