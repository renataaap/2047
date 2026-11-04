"""Read-only model inspection in Blender. Does not change source GLBs."""
import bpy,bmesh,json,os
from mathutils import Vector
root=os.getcwd();reports=[]
for id in ['dump-truck','semi-1960','semi-baked','tatra-815']:
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 bpy.ops.import_scene.gltf(filepath=root+'/public/assets/models/trucks/'+id+'/model.glb')
 parts=[]
 for o in list(bpy.context.scene.objects):
  if o.type!='MESH':continue
  bm=bmesh.new();bm.from_mesh(o.data);bm.transform(o.matrix_world)
  bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00003)
  unseen=set(bm.verts)
  while unseen:
   first=unseen.pop();stack=[first];component=[first]
   while stack:
    v=stack.pop()
    for edge in v.link_edges:
     n=edge.other_vert(v)
     if n in unseen:unseen.remove(n);stack.append(n);component.append(n)
   vs=[Vector((v.co.x,v.co.z,-v.co.y)) for v in component]
   lo=[min(v[i] for v in vs)for i in range(3)];hi=[max(v[i] for v in vs)for i in range(3)]
   if len(vs)>12:parts.append({'vertices':len(vs),'min':lo,'max':hi,'center':[(lo[i]+hi[i])/2 for i in range(3)],'size':[hi[i]-lo[i] for i in range(3)]})
  bm.free()
 reports.append({'id':id,'materials':[m.name for m in bpy.data.materials if m.users],'parts':sorted(parts,key=lambda p:p['vertices'],reverse=True)})
os.makedirs('evidence/garage-0.10.0',exist_ok=True)
json.dump(reports,open('evidence/garage-0.10.0/model-audit.json','w'),indent=2)
print('AUDIT_DONE '+str([(r['id'],len(r['parts']))for r in reports]))
