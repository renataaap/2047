import {GARAGE,VEHICLES,SKINS,vehicleStats,vehicleTuning} from './catalog.js';
import {ensureFleet,captureFleet,garageAccess,purchase,selectVehicle,quote,available,validPaint,validInterior,newVehicle} from './fleet.js';
import {createAssembly,disposeAssembly} from './VehicleAssembly.js';
import {GarageCamera} from './GarageCamera.js';
const clone=v=>structuredClone(v);
export class GarageController{
 constructor(game){this.game=game;this.camera=new GarageCamera(game);this.message='';this.category='garage';this.generation=0;}
 get record(){const g=this.game;ensureFleet(g.campaign,g.state);return g.campaign.fleet.vehicles[g.campaign.fleet.active];}
 access(){const g=this.game;return garageAccess(g.current,g.state);}
 open(){
  const g=this.game,gate=this.access();if(!gate.ok){g.state.notice=gate.message;g.emit();return false;}
  if(g.context()==='walking'&&Math.hypot(g.player.body.translation().x-GARAGE.desk.x,g.player.body.translation().z-GARAGE.desk.z)>6){g.state.notice='Procure a bancada de serviços dentro da garagem.';g.emit();return false;}
  captureFleet(g.campaign,g.state);this.active=true;this.camera.first=true;this.camera.setView('front');if(g.campaign.fleet.garage)Object.assign(this.camera,g.campaign.fleet.garage);this.message='Arraste no cenário para girar · roda do mouse para aproximar';this.category='garage';this.resetDraft();g.openPanel('garage');g.input.setContext('garage');g.emit();return true;
 }
 resetDraft(){this.paintDraft=clone(this.record.paint);this.interiorDraft=clone(this.record.interior);this.accessoryPreview=null;}
 clearPreview(){this.generation++;if(this.preview){disposeAssembly(this.preview,this.game);this.preview=null;}if(this.game.truck)this.game.truck.root.visible=true;this.previewId=null;}
 savePreferences(){if(this.active){const {distance,angle,elevation,view}=this.camera;this.game.campaign.fleet.garage={distance,angle,elevation,view};}}
 close(){if(this.busy)return false;this.savePreferences();this.clearPreview();this.active=false;this.game.appearance.apply(this.record);this.resetDraft();this.camera.first=true;return true;}
 setCategory(id){if(this.busy)return;this.clearPreview();this.game.appearance.apply(this.record);this.resetDraft();this.category=id;this.message='';this.camera.setView(id==='interior'?'interior':'front');this.game.emit();}
 previewPaint(patch){if(this.busy)return;const next={...this.paintDraft,...patch};if(!validPaint(next))return;this.paintDraft=next;this.game.appearance.apply({...this.record,paint:next});this.game.emit();}
 chooseSkin(id){if(!Object.hasOwn(SKINS,id))return;const s=SKINS[id];this.previewPaint({skin:id,main:s.main,secondary:s.secondary,finish:s.finish,wear:s.wear});}
 previewInterior(patch){if(this.busy)return;const next={...this.interiorDraft,...patch};if(!validInterior(next))return;this.interiorDraft=next;this.game.appearance.apply({...this.record,interior:next});this.game.emit();}
 previewAccessory(id){if(this.busy)return;this.accessoryPreview=id;const current=this.record.accessories;this.game.appearance.apply({...this.record,accessories:current.includes(id)?current.filter(k=>k!==id):[...current,id]});this.message='Prévia do acessório, sem cobrança. Confirme para equipar.';this.game.emit();}
 cancel(){if(this.busy)return;this.clearPreview();this.game.appearance.apply(this.record);this.resetDraft();this.message='Prévia cancelada. Nenhum recurso cobrado.';this.game.emit();}
 async previewVehicle(id){
  if(this.busy||!Object.hasOwn(VEHICLES,id))return;this.clearPreview();this.previewId=id;if(id===this.game.activeVehicleId){this.game.emit();return;}
  const gen=++this.generation;this.busy=true;this.message='Preparando modelo 3D…';this.game.emit();
  try{const record=this.game.campaign.fleet.vehicles[id]||newVehicle(id);
   const bundle=await createAssembly(this.game,id,record);if(gen!==this.generation||!this.active){disposeAssembly(bundle,this.game);return;}
   bundle.truck.root.position.copy(this.game.truck.root.position);bundle.truck.root.quaternion.copy(this.game.truck.root.quaternion);this.game.rendering.scene.add(bundle.truck.root);this.game.truck.root.visible=false;this.preview=bundle;this.camera.first=true;this.message='Prévia do modelo real. Ative somente um veículo próprio.';
  }catch(e){this.message=e.message;this.previewId=null;}finally{this.busy=false;this.game.emit();}
 }
 async transact(kind,id){
  if(this.busy||!this.active)return false;const g=this.game;if(!this.access().ok)return false;
  if(!g.saves.slot){this.message='Carregue uma partida ou libere um slot de salvamento antes de comprar.';g.emit();return false;}
  this.busy=true;const backup=clone(g.campaign),state={fuel:g.state.fuel,temperature:g.state.temperature};let exchange;
  try{
   if(kind==='select'){
    if(selectVehicle(g.campaign,g.state,id))exchange=await g.exchangeVehicle(id);
   }else purchase(g.campaign,g.state,kind,id,kind==='paint'?this.paintDraft:kind==='interior'?this.interiorDraft:undefined);
   g.configureActiveVehicle();captureFleet(g.campaign,g.state);
   if(!await g.save())throw Error('Falha ao salvar: serviço desfeito. Nenhuma compra foi confirmada.');
   exchange?.finalize();this.clearPreview();this.resetDraft();this.message=kind==='select'?'Veículo ativo. A Semente foi preservada; estoques e diesel continuam individuais.':'Serviço confirmado e salvo.';
   g.ambientAudio?.cue('repair',g.current);return true;
  }catch(e){exchange?.rollback();Object.assign(g.campaign,backup);Object.assign(g.state,state);g.configureActiveVehicle();this.resetDraft();this.message=e.message;return false;}
  finally{this.busy=false;g.emit();}
 }
 update(dt){
  if(!this.active)return;const g=this.game,b=this.preview,truck=b?.truck||g.truck;
  if(b){const control={wheelSuspensionLength:()=>.52,wheelSteering:()=>0,wheelRotation:()=>0};b.visual.update(control,this.camera.view==='interior');b.truck.animate(control,dt,0,false,false,{},g.settings);b.appearance.update(false);}
  this.camera.update(dt,truck);
 }
 snapshot(){const g=this.game;if(!g.ready&&!this.active)return null;const record=this.record;
  let paintCost={},interiorCost={};try{paintCost=quote(g.campaign,'paint',null,this.paintDraft||record.paint);interiorCost=quote(g.campaign,'interior',null,this.interiorDraft||record.interior);}catch{}
  return {active:!!this.active,busy:!!this.busy,message:this.message,category:this.category,view:this.camera.view,access:this.access(),activeId:g.campaign.fleet.active,previewId:this.previewId,accessoryPreview:this.accessoryPreview,record:clone(record),paintDraft:clone(this.paintDraft||record.paint),interiorDraft:clone(this.interiorDraft||record.interior),paintCost,interiorCost,resources:available(g.campaign),vehicles:Object.keys(g.campaign.fleet.vehicles),stats:vehicleStats(g.campaign.fleet.active,record.upgrades)};
 }
 dispose(){this.clearPreview();}
}
