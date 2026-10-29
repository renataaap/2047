import bpy,sys,json,os
from mathutils import Vector
source=sys.argv[sys.argv.index('--')+1];dest=sys.argv[sys.argv.index('--')+2]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);bpy.ops.import_scene.gltf(filepath=source)
# Each model retains its own licensed textures and UVs. No generic terrain material.
for image in bpy.data.images:
 if image.type=='IMAGE' and image.size[0]>1024:
  w,h=image.size;f=1024/max(w,h);image.scale(max(1,round(w*f)),max(1,round(h*f)));image.pack()
report=[]
for name,outname,length in [('Object_5','wreck-sedan',4.8),('Object_7','wreck-hatchback',4.5),('Object_10','wreck-utility',4.9)]:
 orig=bpy.data.objects[name];mesh=orig.data.copy()
 for v in mesh.vertices:v.co=orig.matrix_world@v.co
 coords=[v.co.copy()for v in mesh.vertices];low=Vector(tuple(min(v[i]for v in coords)for i in range(3)));high=Vector(tuple(max(v[i]for v in coords)for i in range(3)));factor=length/max(high.x-low.x,high.y-low.y)
 offset=Vector(((high.x+low.x)/2,(high.y+low.y)/2,low.z))
 for v in mesh.vertices:v.co=(v.co-offset)*factor
 obj=bpy.data.objects.new(outname,mesh);bpy.context.collection.objects.link(obj)
 bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
 os.makedirs(dest,exist_ok=True);file=os.path.join(dest,outname+'.glb')
 bpy.ops.export_scene.gltf(filepath=file,export_format='GLB',use_selection=True,export_yup=True,export_materials='EXPORT',export_animations=False,export_cameras=False,export_lights=False)
 report.append({'id':outname,'file':file,'triangles':sum(len(p.vertices)-2 for p in mesh.polygons),'dimensions':list((high-low)*factor)})
 bpy.data.objects.remove(obj,do_unlink=True)
with open(os.path.join(dest,'preparation.json'),'w')as f:json.dump(report,f,indent=2)
print('PREPARED',json.dumps(report))
