import {describe,it,expect} from 'vitest';
import {footprintPoints,footprintHeight,restingPose} from '../../src/game/world/staticModelPlacement.js';

// 0.15: barris e carros perto da garagem do Dante flutuavam (até 44 cm num canto do sedã).
// A pose de repouso não pode deixar centro nem canto acima do chão.
const SIZE={width:2.6,length:4.8};
const plane=(a,b,c)=>(x,z)=>a*x+b*z+c;
const bumpy=(x,z)=>.3*Math.sin(x*.7)+.25*Math.cos(z*.5);
// Altura da base do modelo inclinado em cada ponto da pegada (aproximação de ângulo pequeno).
const baseAt=(pose,x,z,yaw,pts)=>pts.map(([px,pz])=>{const dx=px-x,dz=pz-z,c=Math.cos(yaw),s=Math.sin(yaw),lx=dx*c-dz*s,lz=dx*s+dz*c;return pose.y+Math.tan(pose.roll)*lx-Math.tan(pose.pitch)*lz;});

describe('assentamento de modelos estáticos',()=>{
 it('pegada girada tem centro e quatro cantos à distância certa',()=>{
  const pts=footprintPoints(10,-5,.7,SIZE.width,SIZE.length),half=Math.hypot(SIZE.width/2,SIZE.length/2);
  expect(pts[0]).toEqual([10,-5]);for(const [x,z] of pts.slice(1))expect(Math.hypot(x-10,z+5)).toBeCloseTo(half,6);
 });
 it('footprintHeight usa o ponto mais baixo',()=>{
  expect(footprintHeight(plane(.1,0,2),0,0,0,SIZE.width,SIZE.length)).toBeCloseTo(2-.1*SIZE.width/2,6);
 });
 it('chão plano: sem inclinação e base no chão',()=>{
  const p=restingPose(()=>1.5,3,4,.4,SIZE.width,SIZE.length);
  expect(p.y).toBeCloseTo(1.5,6);expect(p.pitch).toBeCloseTo(0,6);expect(p.roll).toBeCloseTo(0,6);
 });
 for(const yaw of [0,.32,-.6,1.2])it(`rampa (yaw ${yaw}): acompanha o plano sem folga`,()=>{
  const g=plane(.08,-.05,-1.3),x=4,z=-7,p=restingPose(g,x,z,yaw,SIZE.width,SIZE.length);
  expect(p.y).toBeCloseTo(g(x,z),4);
  const pts=footprintPoints(x,z,yaw,SIZE.width,SIZE.length),base=baseAt(p,x,z,yaw,pts);
  pts.forEach(([px,pz],i)=>expect(base[i]).toBeCloseTo(g(px,pz),2));
 });
 it('chão irregular: nenhum ponto da pegada fica acima do chão',()=>{
  for(const yaw of [0,.32,-.6,1.2]){const x=1.3,z=2.2,p=restingPose(bumpy,x,z,yaw,SIZE.width,SIZE.length),pts=footprintPoints(x,z,yaw,SIZE.width,SIZE.length),base=baseAt(p,x,z,yaw,pts);
   pts.forEach(([px,pz],i)=>expect(base[i]-bumpy(px,pz)).toBeLessThanOrEqual(1e-9));}
 });
 it('construção fica reta e no ponto mais baixo',()=>{
  const g=plane(.1,.02,.4),p=restingPose(g,0,0,0,7.8,12.3,{tilt:false});
  expect(p.pitch).toBe(0);expect(p.roll).toBe(0);expect(p.y).toBeCloseTo(footprintHeight(g,0,0,0,7.8,12.3),9);
 });
 it('inclinação limitada em encosta extrema',()=>{
  const p=restingPose(plane(3,0,0),0,0,0,SIZE.width,SIZE.length,{maxTilt:.35});
  expect(Math.abs(p.roll)).toBeLessThanOrEqual(.35);
 });
});
