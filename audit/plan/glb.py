import json, struct, math

def load_glb(path):
    buf=open(path,'rb').read()
    assert struct.unpack('<I',buf[0:4])[0]==0x46546C67
    jlen=struct.unpack('<I',buf[12:16])[0]
    js=json.loads(buf[20:20+jlen])
    bin_off=20+jlen+8
    return js, buf, bin_off

def node_mats(js):
    # returns list of world matrices per node (4x4 lists)
    import copy
    mats=[None]*len(js.get('nodes',[]))
    def mat_from_node(n):
        if 'matrix' in n:
            m=n['matrix']; return [m[0:4],m[4:8],m[8:12],m[12:16]]
        t=n.get('translation',[0,0,0]); r=n.get('rotation',[0,0,0,1]); s=n.get('scale',[1,1,1])
        x,y,z,w=r
        R=[[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],
           [2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],
           [2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]]
        M=[[R[0][0]*s[0],R[0][1]*s[1],R[0][2]*s[2],t[0]],
           [R[1][0]*s[0],R[1][1]*s[1],R[1][2]*s[2],t[1]],
           [R[2][0]*s[0],R[2][1]*s[1],R[2][2]*s[2],t[2]],
           [0,0,0,1]]
        return M
    def mul(A,B):
        return [[sum(A[i][k]*B[k][j] for k in range(4)) for j in range(4)] for i in range(4)]
    def walk(i,parent):
        M=mat_from_node(js['nodes'][i])
        W=mul(parent,M) if parent else M
        mats[i]=W
        for c in js['nodes'][i].get('children',[]): walk(c,W)
    for s in js.get('scenes',[{}])[0].get('nodes',[]): walk(s,None)
    return mats

def accessor_data(js,buf,bin_off,ai):
    acc=js['accessors'][ai]; bv=js['bufferViews'][acc['bufferView']]
    off=bin_off+bv.get('byteOffset',0)+acc.get('byteOffset',0)
    comp={5120:'b',5121:'B',5122:'h',5123:'H',5125:'I',5126:'f'}[acc['componentType']]
    ncomp={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[acc['type']]
    stride=bv.get('byteStride')
    fmt='<'+comp*ncomp
    sz=struct.calcsize(fmt)
    out=[]
    for i in range(acc['count']):
        o=off+(i*stride if stride else i*sz)
        out.append(struct.unpack_from(fmt,buf,o))
    return out

def node_triangles(path, name):
    js,buf,bo=load_glb(path)
    mats=node_mats(js)
    tris=[]
    for ni,n in enumerate(js.get('nodes',[])):
        if n.get('name')!=name: continue
        M=mats[ni]
        mesh=js['meshes'][n['mesh']]
        for prim in mesh['primitives']:
            pos=accessor_data(js,buf,bo,prim['attributes']['POSITION'])
            idx=accessor_data(js,buf,bo,prim['indices']) if 'indices' in prim else [(i,) for i in range(len(pos))]
            idx=[i[0] for i in idx]
            for k in range(0,len(idx)-2,3):
                tri=[]
                for vi in idx[k:k+3]:
                    p=pos[vi]
                    wp=[M[0][0]*p[0]+M[0][1]*p[1]+M[0][2]*p[2]+M[0][3],
                        M[1][0]*p[0]+M[1][1]*p[1]+M[1][2]*p[2]+M[1][3],
                        M[2][0]*p[0]+M[2][1]*p[1]+M[2][2]*p[2]+M[2][3]]
                    tri.append(wp)
                tris.append(tri)
    return tris

def local_bbox(path, exclude_names=()):
    js,buf,bo=load_glb(path)
    mats=node_mats(js)
    mn=[1e9]*3; mx=[-1e9]*3; ntri=0
    for ni,n in enumerate(js.get('nodes',[])):
        if 'mesh' not in n: continue
        if n.get('name') in exclude_names: continue
        M=mats[ni]
        mesh=js['meshes'][n['mesh']]
        for prim in mesh['primitives']:
            pos=accessor_data(js,buf,bo,prim['attributes']['POSITION'])
            for p in pos:
                wp=[M[0][0]*p[0]+M[0][1]*p[1]+M[0][2]*p[2]+M[0][3],
                    M[1][0]*p[0]+M[1][1]*p[1]+M[1][2]*p[2]+M[1][3],
                    M[2][0]*p[0]+M[2][1]*p[1]+M[2][2]*p[2]+M[2][3]]
                for k in range(3):
                    mn[k]=min(mn[k],wp[k]); mx[k]=max(mx[k],wp[k])
            ntri+= len(pos)//3
    return mn,mx
