const {sql,ensureSchema,requireUser}=require('../lib/auth');
const clean=(v,max)=>String(v??'').trim().slice(0,max);
function validDate(v){const d=new Date(v);return Number.isNaN(d.getTime())?null:d.toISOString()}
module.exports=async(req,res)=>{
 try{
  await ensureSchema();const q=sql();
  if(req.method==='GET'){
   const rows=await q`SELECT id,title,description,location,state_code,starts_at,ends_at,link,created_at
    FROM party_events ORDER BY starts_at ASC`;
   res.setHeader('Cache-Control','public, max-age=0, s-maxage=30, stale-while-revalidate=120');
   return res.json({events:rows});
  }
  if(req.method==='POST'){
   const user=await requireUser(req,res,'manager');if(!user)return;
   const title=clean(req.body?.title,160),description=clean(req.body?.description,5000),
    location=clean(req.body?.location,180),stateCode=clean(req.body?.stateCode,4),
    startsAt=validDate(req.body?.startsAt),endsAt=req.body?.endsAt?validDate(req.body.endsAt):null,
    link=clean(req.body?.link,500);
   if(!title||!location||!startsAt)return res.status(400).json({error:'Titel, Ort und Beginn sind erforderlich.'});
   if(req.body?.endsAt&&!endsAt)return res.status(400).json({error:'Das Enddatum ist ungültig.'});
   const rows=await q`INSERT INTO party_events(title,description,location,state_code,starts_at,ends_at,link,created_by)
    VALUES(${title},${description},${location},${stateCode},${startsAt},${endsAt},${link},${user.id}) RETURNING id`;
   return res.status(201).json({ok:true,id:rows[0].id});
  }
  if(req.method==='DELETE'){
   const user=await requireUser(req,res,'manager');if(!user)return;
   const id=clean(req.query?.id,80);if(!id)return res.status(400).json({error:'ID fehlt.'});
   await q`DELETE FROM party_events WHERE id=${id}`;return res.json({ok:true});
  }
  return res.status(405).json({error:'Methode nicht erlaubt.'});
 }catch(err){console.error(err);return res.status(500).json({error:'Termine konnten nicht verarbeitet werden.'})}
};