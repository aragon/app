// Hash delivered files (raw DesignSync get_file / claude-design read_file captures) against the payload manifest.
const fs=require("fs"),c=require("crypto");
const M=new Map(JSON.parse(fs.readFileSync(process.env.MANIFEST)).payload.upload.files.map(f=>[f.path,f]));
const R=process.argv[2];const out=[];
const rec=(p,b,mode,extra={})=>{const h=c.createHash("sha256").update(b).digest("hex");const e=M.get(p);out.push({path:p,mode,bytes:b.length,sha256:h,manifestBytes:e.bytes,manifestSha256:e.sha256,match:h===e.sha256&&b.length===e.bytes,...extra})};
for(const f of fs.readdirSync(R+"/raw")){if(!f.startsWith("get_file."))continue;const o=JSON.parse(fs.readFileSync(R+"/raw/"+f,"utf8"));
 if(o.truncated||o.isBase64)throw new Error(f+" truncated/base64");rec(o.path,Buffer.from(o.content,"utf8"),"DesignSync get_file",{raw:"raw/"+f})}
const win=f=>{const s=fs.readFileSync(R+"/raw/"+f,"utf8");const head=s.slice(0,s.indexOf("\n"));return{etag:/etag="([^"]+)"/.exec(head)[1],lines:/lines="([^"]+)"/.exec(head)[1],body:s.slice(s.indexOf("\n")+1,s.lastIndexOf("\n</untrusted-project-content>")).replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")}};
const w=fs.readdirSync(R+"/raw").filter(f=>f.startsWith("read_file.source-index")).sort().map(f=>({f,...win(f)}));
if(w.length!==2||w[0].etag!==w[1].etag)throw new Error("source-index windows missing or etag differs");
rec("guidelines/context/source-index.md",Buffer.from(w[0].body+w[1].body,"utf8"),`claude-design read_file, 2 windows (${w[0].lines}, ${w[1].lines}), same etag ${w[0].etag}; entity-decoded + concatenated (exceeds 256 KiB get_file cap)`,{raw:w.map(x=>"raw/"+x.f)});
out.sort((a,b)=>a.path.localeCompare(b.path));fs.writeFileSync(R+"/get_file-verification.json",JSON.stringify(out,null,2)+"\n");
for(const o of out)console.log(o.match?"MATCH":"MISMATCH",o.path,o.bytes,o.sha256);console.log("count",out.length,"allMatch",out.every(o=>o.match));
