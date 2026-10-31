"""Blender 4.3+: CC0 MakeHuman body, original clothing/details and in-place rig.
Run: blender -b --python scripts/preparar-personagens.py
No Mixamo/Fab assets. Source only: MakeHuman data/3dobjs/base.obj (CC0).
"""
import bpy, math, os, json
from mathutils import Vector,Quaternion
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'public/assets/models/aurora-workers');os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
vs=[];uv=[];groups={};group='';faces=[]
for line in open(os.path.join(ROOT,'assets-source/characters/makehuman-base.obj')):
 a=line.split()
 if not a:continue
 if a[0]=='v':vs.append(Vector(tuple(map(float,a[1:4]))))
 elif a[0]=='vt':uv.append(tuple(map(float,a[1:3])))
 elif a[0]=='g':group=a[1]
 elif a[0]=='f':
  f=[tuple(int(q)-1 if q else 0 for q in x.split('/')) for x in a[1:]];groups.setdefault(group,[]).append(f)
body=groups['body'];ids=sorted(set(i[0] for f in body for i in f));mapping={old:i for i,old in enumerate(ids)}
scale=1.78/16.659;floor=-8.168
convert=lambda p:Vector((p.x*scale,-p.z*scale,(p.y-floor)*scale))
center=lambda name:sum((vs[i] for i in set(v[0] for f in groups[name] for v in f)),Vector())/len(set(v[0] for f in groups[name] for v in f))
mesh=bpy.data.meshes.new('Anatomical body and fitted work clothing');mesh.from_pydata([convert(vs[i]) for i in ids],[],[[mapping[v[0]]for v in f]for f in body]);mesh.update()
model=bpy.data.objects.new('Aurora_Worker',mesh);bpy.context.collection.objects.link(model)
uvlayer=mesh.uv_layers.new(name='UVMap')
for p,f in zip(mesh.polygons,body):
 p.use_smooth=True
 for li,v in zip(p.loop_indices,f):uvlayer.data[li].uv=uv[v[1]]
def material(name,color,rough=.85,metal=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=rough;bs.inputs['Metallic'].default_value=metal;return m
mats=[material('skin',(.25,.13,.085)),material('jacket',(.13,.18,.17)),material('trousers',(.075,.09,.105)),material('boots',(.045,.032,.025)),material('hair',(.035,.023,.017)),material('seams',(.2,.19,.14)),material('steel',(.28,.29,.27),.46,.7)]
for m in mats:model.data.materials.append(m)
# The anatomical mesh is covered by workwear materials; cloth surfaces are expanded
# at vertices and use a dedicated UV micro-fabric, with fitted cuffs/pockets/belt below.
for p in mesh.polygons:
 c=sum((vs[ids[i]] for i in p.vertices),Vector())/len(p.vertices)
 p.material_index=0 if c.y>5.8 or abs(c.x)>3.9 else 3 if c.y<-6.8 else 2 if c.y<.4 else 1
# Original woven fabric texture. No external texture/license assumption.
size=256;image=bpy.data.images.new('Original micro weave',width=size,height=size)
pixels=[]
for y in range(size):
 for x in range(size):
  noise=((x*73+y*179+x*y*7)%67)/67;v=.72+.14*noise+(.08 if x%4<2 else 0)+(.035 if y%4<2 else 0);pixels.extend((v,v,v,1))
image.pixels=pixels;image.filepath_raw=os.path.join(OUT,'fabric.png');image.file_format='PNG';image.save()
for m in mats[1:3]:
 nodes=m.node_tree.nodes;links=m.node_tree.links;tex=nodes.new('ShaderNodeTexImage');tex.image=image;mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[1].default_value=m.diffuse_color;links.new(tex.outputs['Color'],mix.inputs[2]);links.new(mix.outputs[0],nodes.get('Principled BSDF').inputs['Base Color'])
# The script retains only body faces; all anatomical helper/proxy geometry is excluded.
for v in mesh.vertices:
 original=vs[ids[v.index]]
 if .4<original.y<5.8 and abs(original.x)<3.9:v.co+=v.normal*.009
 elif -6.8<original.y<.4:v.co+=v.normal*.012
arm=bpy.data.armatures.new('Worker skeleton');rig=bpy.data.objects.new('AuroraRig',arm);bpy.context.collection.objects.link(rig);bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
bones={}
def bone(name,head,tail,parent=None):
 b=arm.edit_bones.new(name);b.head=head;b.tail=tail
 if parent:b.parent=arm.edit_bones[parent]
 bones[name]=(Vector(head),Vector(tail));return b
pelvis=convert(center('joint-pelvis'));neck=convert(center('joint-neck'));head=convert(center('joint-head'))
bone('hips',pelvis,pelvis+Vector((0,0,.13)));bone('spine',pelvis,neck,'hips');bone('head',neck,head+Vector((0,0,.12)),'spine')
for side,sign in [('L',1),('R',-1)]:
 j=lambda s:convert(center(f'joint-{side.lower()}-{s}'))
 bone('arm'+side,j('shoulder'),j('elbow'),'spine');bone('forearm'+side,j('elbow'),j('hand'),'arm'+side);bone('hand'+side,j('hand'),j('hand')+Vector((sign*.10,0,-.045)),'forearm'+side)
 bone('thigh'+side,j('upper-leg'),j('knee'),'hips');bone('shin'+side,j('knee'),j('ankle'),'thigh'+side);bone('foot'+side,j('ankle'),j('ankle')+Vector((0,-.16,-.045)),'shin'+side)
bpy.ops.object.mode_set(mode='OBJECT')
for name in bones:model.vertex_groups.new(name=name)
for v in mesh.vertices:
 raw=vs[ids[v.index]];side='L'if raw.x>=0 else'R'
 names=['head'] if raw.y>5.8 else ['arm'+side,'forearm'+side,'hand'+side]if abs(raw.x)>1.75 and raw.y>1 else ['thigh'+side,'shin'+side,'foot'+side]if raw.y<.5 else['hips','spine']
 distances=[]
 for name in names:
  a,b=bones[name];ab=b-a;t=max(0,min(1,(v.co-a).dot(ab)/ab.length_squared));distances.append((name,1/max(.025,(v.co-(a+t*ab)).length)**4))
 total=sum(d for _,d in distances)
 for name,d in distances:model.vertex_groups[name].add([v.index],d/total,'REPLACE')
mod=model.modifiers.new('Armature','ARMATURE');mod.object=rig;model.parent=rig
# Small original workwear details follow their owning bones.
def detail(name,pos,dim,mat,bone_name,bevel=.012):
 bpy.ops.mesh.primitive_cube_add(size=1,location=pos);o=bpy.context.object;o.name=name;o.dimensions=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mats[mat]);b=o.modifiers.new('Rounded sewn edges','BEVEL');b.width=bevel;b.segments=2;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=b.name)
 vg=o.vertex_groups.new(name=bone_name);vg.add(list(range(len(o.data.vertices))),1,'REPLACE');a=o.modifiers.new('Armature','ARMATURE');a.object=rig;o.parent=rig
 for p in o.data.polygons:p.use_smooth=True
 return o
# Positions in Blender: negative Y is forward.
detail('Belt buckle',(0,-.125,.91),(.06,.025,.045),6,'hips',.005)
for sign in[-1,1]:
 detail('Chest patch pocket',(sign*.115,-.148,1.30),(.11,.025,.12),1,'spine')
 detail('Pocket flap',(sign*.115,-.169,1.35),(.12,.012,.025),5,'spine',.003)
 detail('Cargo side pocket',(sign*.19,-.04,.72),(.065,.14,.13),2,'thigh'+('L'if sign>0 else'R'))
for z in [1.12,1.2,1.28,1.38]:detail('Jacket closure',(0,-.17,z),(.013,.018,.014),6,'spine',.003)
# Hair cap follows the actual scalp, rather than a spherical head placeholder.
hairfaces=[];hairids=set()
for p in mesh.polygons:
 c=sum((vs[ids[i]]for i in p.vertices),Vector())/len(p.vertices)
 if c.y>7.82 or c.y>7.4 and c.z<.25:hairfaces.append(tuple(p.vertices));hairids.update(p.vertices)
hairids=sorted(hairids);hmap={i:j for j,i in enumerate(hairids)};hm=bpy.data.meshes.new('Hair cap');hm.from_pydata([mesh.vertices[i].co+mesh.vertices[i].normal*.008 for i in hairids],[],[[hmap[i]for i in f]for f in hairfaces]);hair=bpy.data.objects.new('Hair',hm);bpy.context.collection.objects.link(hair);hair.data.materials.append(mats[4]);vg=hair.vertex_groups.new(name='head');vg.add(list(range(len(hm.vertices))),1,'REPLACE');mod=hair.modifiers.new('Armature','ARMATURE');mod.object=rig;hair.parent=rig
for p in hm.polygons:p.use_smooth=True
# Anatomically located eyes, with small dark irises. Original eye meshes.
for side in ['l','r']:
 c=convert(center('joint-'+side+'-eye'))
 for label,offset,radius,mat in [('Eye',0,.012,material('eye sclera',(.39,.36,.29),.5)),('Iris',-.011,.006,material('iris',(.045,.031,.018),.4))]:
  bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,radius=radius,location=c+Vector((0,offset,0)));o=bpy.context.object;o.name=label+side;o.data.materials.append(mat);vg=o.vertex_groups.new(name='head');vg.add(list(range(len(o.data.vertices))),1,'REPLACE');mod=o.modifiers.new('Armature','ARMATURE');mod.object=rig;o.parent=rig
# Merge workwear details into one skinned mesh, preserving named weights/materials.
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
 if o.type=='MESH':o.select_set(True)
bpy.context.view_layer.objects.active=model;bpy.ops.object.join()
# Export sampling stays in-place; body position is always the Rapier controller's job.
rig.animation_data_create();bpy.context.scene.render.fps=24
rest={}
for name in bones:
 pb=rig.pose.bones[name];pb.rotation_mode='QUATERNION';rot=Quaternion((0,1,0),math.radians(39 if name=='armL' else -39 if name=='armR' else 0));basis=arm.bones[name].matrix_local.to_quaternion();rest[name]=basis.inverted()@rot@basis
for clip,length,amplitude in [('Idle',72,.025),('Walk',24,.5),('Run',18,.85),('Interact',36,0),('Repair',48,0),('Enter',30,0),('Exit',30,0)]:
 action=bpy.data.actions.new(clip);rig.animation_data.action=action
 for frame in range(0,length+1,3):
  t=frame/length*math.tau
  for name in bones:
   pb=rig.pose.bones[name];angle=0
   if name.startswith(('thigh','arm')):angle=math.sin(t+(math.pi if name.endswith('R') else 0))*amplitude*(-.8 if name.startswith('arm') else 1)
   if name.startswith('shin'):angle=max(0,-math.sin(t+(math.pi if name.endswith('R') else 0)))*amplitude*.9
   if clip in ['Interact','Repair'] and name.startswith('arm'):angle=-.7+math.sin(t*2)*.08
   if clip in ['Enter','Exit'] and name=='armL':angle=-.6*math.sin(frame/length*math.pi)
   basis=arm.bones[name].matrix_local.to_quaternion();pb.rotation_quaternion=(basis.inverted()@Quaternion((1,0,0),angle)@basis)@rest[name];pb.keyframe_insert('rotation_quaternion',frame=frame+1,group=name)
  rig.pose.bones['hips'].location=(0,0,abs(math.sin(t))*amplitude*.035);rig.pose.bones['hips'].keyframe_insert('location',frame=frame+1,group='hips')
 track=rig.animation_data.nla_tracks.new();track.name=clip;track.strips.new(clip,1,action);rig.animation_data.action=None
bpy.context.scene.frame_set(1)
rig.animation_data.action=None
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'worker.glb'),export_format='GLB',export_animations=True,export_animation_mode='NLA_TRACKS',export_skins=True,export_yup=True,export_copyright='Base mesh: MakeHuman Community, CC0 1.0. Clothing, rig and animation adaptations: 2047 Rede Aurora, CC0 1.0.',export_extras=True)
json.dump({'source':'https://github.com/makehumancommunity/makehuman/blob/master/makehuman/data/3dobjs/base.obj','license':'CC0-1.0','originalBodyFaces':len(body),'animations':['Idle','Walk','Run','Interact','Repair','Enter','Exit'],'inPlace':True,'notes':'Adapted anatomical mesh with original fitted workwear. Interim art; no photogrammetry/photorealistic character texture claimed.'},open(os.path.join(OUT,'preparation.json'),'w'),indent=2)
print('WORKER_READY')
