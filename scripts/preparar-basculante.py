"""Derive an articulated six-wheel rig from ElectroNick's licensed local mesh.
The original GLB remains unchanged. Blender axes are converted to the game's -Z.
"""
import bpy,bmesh,json,os
from mathutils import Vector
root=os.getcwd();bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=root+'/public/assets/models/trucks/dump-truck/model.glb')
objects=[o for o in bpy.context.scene.objects if o.type=='MESH'];groups={};parts=0;wheel_counts=[0]*6
centers=[Vector((s*.906,.547,z))for z in [-2.409,.817,2.329]for s in [-1,1]]
def world(v):return Vector((-(v.x-.061),v.z-1.1,v.y))
def material(original,role):
 name='Basculante_'+original.name+'_'+role
 m=bpy.data.materials.get(name)
 if not m:
  m=original.copy();m.name=name;m['role']=role
  if role not in ['glass','lens']:
   m.surface_render_method='DITHERED'
   bsdf=m.node_tree.nodes.get('Principled BSDF')
   if bsdf:
    for link in list(bsdf.inputs['Alpha'].links):m.node_tree.links.remove(link)
    bsdf.inputs['Alpha'].default_value=1
 return m
for o in objects:
 bm=bmesh.new();bm.from_mesh(o.data);bm.transform(o.matrix_world)
 bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00003)
 label=bm.faces.layers.int.new('part');unseen=set(bm.verts);tags={}
 while unseen:
  first=unseen.pop();stack=[first];vs=[first]
  while stack:
   v=stack.pop()
   for e in v.link_edges:
    n=e.other_vert(v)
    if n in unseen:unseen.remove(n);stack.append(n);vs.append(n)
  converted=[world(v.co) for v in vs];wheel=None
  for i,c in enumerate(centers):
   c=Vector((c.x,c.y-1.1,c.z))
   if all(abs(v.x-c.x)<.39 and ((v.y-c.y)**2+(v.z-c.z)**2)<.575**2 for v in converted):wheel=i;break
  for v in vs:tags[v]=wheel
 for f in bm.faces:
  wheel=tags[f.verts[0]];p=world(f.calc_center_median())
  f[label]=wheel+1 if wheel is not None else 7 if p.z< -1.3 and p.y>-.12 else 0
  if wheel is not None:wheel_counts[wheel]+=1
 for v in bm.verts:v.co=world(v.co)
 # In Blender coordinates for Y-up glTF export: (x,-z,y).
 for v in bm.verts:v.co=Vector((v.co.x,-v.co.z,v.co.y))
 for group in sorted(set(f[label]for f in bm.faces)):
  part=bm.copy();tag=part.faces.layers.int['part'];bmesh.ops.delete(part,geom=[f for f in part.faces if f[tag]!=group],context='FACES')
  bmesh.ops.delete(part,geom=[v for v in part.verts if not v.link_faces],context='VERTS')
  mesh=bpy.data.meshes.new('derived');part.to_mesh(mesh);part.free()
  for original in o.data.materials:
   role='rubber' if 1<=group<=6 else 'lens' if 'glass' in original.name.lower() else 'paint' if ('_A_'in original.name or '_B_'in original.name) else 'metal'
   mesh.materials.append(material(original,role))
  obj=bpy.data.objects.new('part',mesh);bpy.context.collection.objects.link(obj);groups.setdefault(group,[]).append(obj)
 bm.free()
for o in objects:bpy.data.objects.remove(o,do_unlink=True)
result=[]
for group,objs in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in objs:o.select_set(True)
 bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();o=bpy.context.object
 if 1<=group<=6:
  i=group-1;c=centers[i];pivot=Vector((c.x,-c.z,c.y-1.1))
  for v in o.data.vertices:v.co-=pivot
  o.location=pivot;o.name='dump_wheel_'+str(i)
 else:o.name='dump_cab' if group==7 else 'dump_chassis'
 result.append(o)
if any(n<100 for n in wheel_counts):raise ValueError('Wheel extraction incomplete: '+str(wheel_counts))
for o in result:o.select_set(True)
dest=root+'/public/assets/models/trucks/dump-truck/drivable.glb'
bpy.ops.export_scene.gltf(filepath=dest,export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_cameras=False,export_lights=False)
roles={m.name:m['role']for o in result for m in o.data.materials}
report={'id':'dump-truck','url':'/assets/models/trucks/dump-truck/drivable.glb','wheelPoints':[{'x':c.x,'y':c.y-1.1+.52,'z':c.z}for c in centers],
 'wheels':[{'node':'dump_wheel_'+str(i),'spinAxis':'x','spinSign':-1}for i in range(6)],'materialRoles':roles,'cockpitHiddenNodes':['dump_cab'],'wheelFaceCounts':wheel_counts,
 'changes':'Local CC BY source retained. Rotated to -Z, recentered, six original tire/hub assemblies separated and pivoted; body/cab split for modular cockpit; opaque structural materials.'}
json.dump(report,open('evidence/garage-0.10.0/dump-rig.json','w'),indent=2);print('RIG_DONE '+str(wheel_counts))
