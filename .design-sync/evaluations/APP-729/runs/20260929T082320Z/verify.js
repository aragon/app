const fs=require("fs"),c=require("crypto");const M=new Map(JSON.parse(fs.readFileSync(process.env.MANIFEST)).payload.upload.files.map(f=>[f.path,f]));
const R=process.argv[2];const out=[];
const rec=(p,b,mode)=>{const h=c.createHash("sha256").update(b).digest("hex");const e=M.get(p);out.push({path:p,mode,bytes:b.length,sha256:h,manifestSha256:e.sha256,match:h===e.sha256&&b.length===e.bytes})};
for(const f of fs.readdirSync(R+"/raw")){const s=fs.readFileSync(R+"/raw/"+f,"utf8");
 if(f.startsWith("get_file.")){const o=JSON.parse(s);if(o.truncated||o.isBase64)throw new Error(f+" truncated");rec(o.path,Buffer.from(o.content,"utf8"),"DesignSync get_file")}}
const body=f=>{const s=fs.readFileSync(R+"/raw/"+f,"utf8");return s.slice(s.indexOf("\n")+1,s.lastIndexOf("\n</untrusted-project-content>")).replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")};
const w=fs.readdirSync(R+"/raw").filter(f=>f.startsWith("read_file.source-index")).sort();
if(w.length===2)rec("guidelines/context/source-index.md",Buffer.from(body(w[0])+body(w[1]),"utf8"),"claude-design read_file, 2 windows (1-600, 601-1171), same etag; entity-decoded + concatenated (exceeds 256 KiB get_file cap)");
out.sort((a,b)=>a.path.localeCompare(b.path));fs.writeFileSync(R+"/get_file-verification.json",JSON.stringify(out,null,2)+"\n");for(const o of out)console.log(o.match?"MATCH":"MISMATCH",o.path,o.bytes,o.sha256.slice(0,16));
