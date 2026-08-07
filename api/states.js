const {sql,ensureSchema,requireUser}=require('../lib/auth');
const clean=(v,max)=>String(v??'').trim().slice(0,max);
module.exports=async(req,res)=>{res.setHeader('Content-Type','application/json; charset=utf-8');
 try{
  await ensureSchema();const q=sql();
  if(req.method==='GET'){
   const rows=await q`SELECT code,name,chairman,deputy,discord,note,updated_at FROM state_chapters ORDER BY name`;
   res.setHeader('Cache-Control','public, max-age=0, s-maxage=30, stale-while-revalidate=120');
   return res.json({states:rows});
  }
  if(req.method==='PATCH'){
   const user=await requireUser(req,res,'manager');if(!user)return;
   const code=clean(req.body?.code,4).toUpperCase(),chairman=clean(req.body?.chairman,160),
    deputy=clean(req.body?.deputy,160),discord=clean(req.body?.discord,240),note=clean(req.body?.note,1200);
   if(!code)return res.status(400).json({error:'Landesverband fehlt.'});
   const rows=await q`UPDATE state_chapters SET chairman=${chairman},deputy=${deputy},discord=${discord},
    note=${note},updated_by=${user.id},updated_at=NOW() WHERE code=${code} RETURNING code`;
   if(!rows.length)return res.status(404).json({error:'Landesverband nicht gefunden.'});
   return res.json({ok:true});
  }
  return res.status(405).json({error:'Methode nicht erlaubt.'});
 }catch(err){console.error(err);return res.status(500).json({error:'Landesverbände konnten nicht verarbeitet werden.'})}
};