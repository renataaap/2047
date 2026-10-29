"""Offline adaptation of CC BY source assets. Usage: blender -b --python ... -- plan.json"""
import bpy,bmesh,json,sys,os
from mathutils import Vector

plan=json.load(open(sys.argv[sys.argv.index('--')+1]))
reports=[]
def bounds(objects):
 vs=[o.matrix_world@v.co for o in objects for v in o.data.vertices]
 return Vector([min(v[i]for v in vs)for i in range(3)]),Vector([max(v[i]for v in vs)for i in range(3)])
def reset(source):
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for image in list(bpy.data.images):
  if image.users==0:bpy.data.images.remove(image)
 bpy.ops.import_scene.gltf(filepath=source);bpy.context.view_layer.update()
 objs=[]
 for old in list(bpy.context.scene.objects):
  if old.type!='MESH':continue
  mesh=old.data.copy();mesh.transform(old.matrix_world);obj=bpy.data.objects.new(old.name+'_baked',mesh);bpy.context.collection.objects.link(obj);objs.append(obj)
 for old in list(bpy.context.scene.objects):
  if old not in objs:bpy.data.objects.remove(old,do_unlink=True)
 for image in bpy.data.images:
  if image.type=='IMAGE' and max(image.size)>1024:
   w,h=image.size;f=1024/max(w,h);image.scale(max(1,round(w*f)),max(1,round(h*f)));image.pack()
 return objs
def merge(objects,name):
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=bpy.context.object;o.name=name
 # Joining by material avoids the source truck's 202 separate draw calls.
 return o
def export(objects,dest):
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 os.makedirs(os.path.dirname(dest),exist_ok=True)
 bpy.ops.export_scene.gltf(filepath=dest,export_format='GLB',use_selection=True,export_yup=True,export_materials='EXPORT',export_animations=False,export_cameras=False,export_lights=False)
def warp(y):
 anchors=[(-2.8,-4.2),(-1.203,-2.5),(-.5,-.8),(2.22,4.0)]
 for (a,b),(c,d)in zip(anchors,anchors[1:]):
  if y<=c:return b+(y-a)/(c-a)*(d-b)
 return 4+(y-2.22)*1.2
def old_truck(objects):
 # Source has two axles. The derived Titã has a duplicated rear axle, explicitly credited.
 rear=['defaultMaterial.001_baked','defaultMaterial.005_baked','defaultMaterial.006_baked']
 front=['defaultMaterial.137_baked','defaultMaterial.140_baked','defaultMaterial.143_baked']
 wheel_sources=[o for o in objects if o.name in front+rear]
 if len(wheel_sources)!=6:raise ValueError('Source wheel hierarchy changed; do not invent a rig')
 wheels=[]
 for index,(longitudinal,source_names,source_center)in enumerate([(-2.5,front,(1.197,.055)),(1.45,rear,(-1.203,.088)),(2.9,rear,(-1.203,.088))]):
  for side in [-1,1]:
   parts=[]
   for source in [o for o in wheel_sources if o.name in source_names]:
    mesh=source.data.copy();bm=bmesh.new();bm.from_mesh(mesh)
    bmesh.ops.delete(bm,geom=[f for f in bm.faces if (f.calc_center_median().x*side)<=0],context='FACES')
    bmesh.ops.delete(bm,geom=[v for v in bm.verts if not v.link_faces],context='VERTS');bm.to_mesh(mesh);bm.free()
    if not mesh.polygons:continue
    lo,hi=Vector([min(v.co[i]for v in mesh.vertices)for i in range(3)]),Vector([max(v.co[i]for v in mesh.vertices)for i in range(3)])
    center_x=(lo.x+hi.x)/2
    for v in mesh.vertices:
     x,y,z=v.co;gx=side*1.2+(x-center_x)*1.05;gy=-.62+(z-source_center[1])*1.78;gz=longitudinal-(y-source_center[0])*1.78;v.co=(gx,-gz,gy)
    obj=bpy.data.objects.new('wheel-part',mesh);bpy.context.collection.objects.link(obj);parts.append(obj)
   wheel=merge(parts,'wheel_%s_%s'%(index,'L' if side<0 else 'R'))
   pivot=Vector((side*1.2,-longitudinal,-.62))
   for v in wheel.data.vertices:v.co-=pivot
   wheel.location=pivot;wheels.append(wheel)
 body=[]
 for o in objects:
  if o in wheel_sources:continue
  for v in o.data.vertices:
   x,y,z=v.co;v.co=(x*.98,-warp(-y),z*1.15-.72)
  body.append(o)
 for o in wheel_sources:bpy.data.objects.remove(o,do_unlink=True)
 return [merge(body,'titan_body'),*wheels]

for job in plan['jobs']:
 objects=reset(job['source'])
 if job['id']=='old-garage':
  # Open the two existing side door panels; the original closed doors trap the player.
  doors=[o for o in objects if '2100603818' in o.name]
  for o in doors:objects.remove(o);bpy.data.objects.remove(o,do_unlink=True)
 if job.get('rig')=='old-truck':objects=old_truck(objects)
 else:
  low,high=bounds(objects);size=high-low;scale=job.get('length',max(size.x,size.y))/max(size.x,size.y);offset=Vector(((high.x+low.x)/2,(high.y+low.y)/2,low.z))
  for o in objects:
   for v in o.data.vertices:v.co=(v.co-offset)*scale
  if job.get('triangleLimit'):
   count=sum(sum(len(p.vertices)-2 for p in o.data.polygons)for o in objects)
   if count>job['triangleLimit']:
    for o in objects:
     mod=o.modifiers.new('Browser LOD','DECIMATE');mod.ratio=job['triangleLimit']/count;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
  objects=[merge(objects,job['id'])]
 bpy.context.view_layer.update();lo,hi=bounds(objects);export(objects,job['dest'])
 reports.append({'id':job['id'],'dimensions':[(hi-lo).x,(hi-lo).z,(hi-lo).y],'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons)for o in objects),'source':job['source'],'wheels':[o.name for o in objects if o.name.startswith('wheel_')],'changes':job.get('changes','Units normalized, centered on ground, textures limited to 1K')})
json.dump(reports,open(plan['report'],'w'),indent=2);print('PREPARED_MODELS '+json.dumps(reports))
