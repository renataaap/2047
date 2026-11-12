async function request(path,options={}){const response=await fetch(path,{...options,headers:{'Content-Type':'application/json',...options.headers},cache:'no-store'});const data=await response.json();if(!response.ok){const e=new Error(data.error?.message||'Falha na API');e.status=response.status;throw e;}return data;}
export class SaveClient {
 constructor(){this.slot=null;this.version=0;this.pending=false;}
 async list(){return (await request('/api/saves')).saves;}
 async load(slot){const saved=await request(`/api/saves/${slot}`);this.slot=slot;this.version=saved.version;return saved.data;}
 async save(data,slot=this.slot||'1'){if(this.pending)throw new Error('Salvamento em andamento');this.pending=true;try{const entries=await this.list();const entry=entries.find(e=>e.slot===slot);if(entry&&this.slot!==slot)throw new Error('Carregue este slot antes de substituir seu conteúdo.');const saved=entry?await this.put(slot,data):await request('/api/saves',{method:'POST',body:JSON.stringify({slot,data})});this.slot=slot;this.version=saved.version;return saved;}finally{this.pending=false;}}
 // A 409 means the server holds another revision. If it is exactly this data
 // (an earlier PUT succeeded but its response was lost), adopt its revision;
 // otherwise refuse to overwrite progress saved by another tab or session.
 async put(slot,data){try{return await request(`/api/saves/${slot}`,{method:'PUT',body:JSON.stringify({version:this.version,data})});}catch(e){if(e.status!==409)throw e;const current=await request(`/api/saves/${slot}`);if(JSON.stringify(current.data)===JSON.stringify(data))return current;const conflict=new Error(`O slot ${slot} foi alterado em outra aba ou sessão. Recarregue o slot para continuar sem perder esse progresso.`);conflict.status=409;throw conflict;}}
 async delete(slot){await request(`/api/saves/${slot}`,{method:'DELETE'});if(slot===this.slot){this.slot=null;this.version=0;}}
}
