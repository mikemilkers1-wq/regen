const {sql,ensureSchema,requireUser}=require('../lib/auth');
function clean(v,max){return String(v??'').trim().slice(0,max)}
function validImages(value){if(!Array.isArray(value)||value.length>5)return null;let total=0;const out=[];for(const raw of value){const image=String(raw||'');if(!(image.startsWith('data:image/jpeg;base64,')||image.startsWith('data:image/png;base64,')||image.startsWith('data:image/webp;base64,')||image.startsWith('https://')))return null;total+=image.length;if(image.length>950000||total>3800000)return null;out.push(image)}return out}
module.exports=async(req,res)=>{res.setHeader('Content-Type','application/json; charset=utf-8');try{await ensureSchema();const q=sql();if(req.method==='GET'){
const history=String(req.query?.history||'')==='1';
if(history){
 const rows=await q`SELECT a.id,a.title,a.body,a.images,a.active,a.created_at,e.display_name AS author
 FROM campaign_announcements a LEFT JOIN campaign_employees e ON e.id=a.created_by
 ORDER BY a.created_at DESC LIMIT 100`;
 res.setHeader('Cache-Control','public, max-age=0, s-maxage=30, stale-while-revalidate=120');
 return res.json({announcements:rows,announcement:rows.find(r=>r.active)||rows[0]||null});
}
const rows=await q`SELECT id,title,body,images,created_at FROM campaign_announcements WHERE active=TRUE ORDER BY created_at DESC LIMIT 1`;
res.setHeader('Cache-Control','public, max-age=0, s-maxage=30, stale-while-revalidate=120');
return res.json({announcement:rows[0]||null})
}if(req.method==='POST'){const user=await requireUser(req,res,'manager');if(!user)return;const title=clean(req.body?.title,140),body=clean(req.body?.body,5000),images=validImages(req.body?.images??[]);if(!title||!body||images===null)return res.status(400).json({error:'Bitte geben Sie eine Überschrift, einen Text und höchstens fünf gültige Bilder an.'});const json=JSON.stringify(images);const rows=await q`INSERT INTO campaign_announcements (title,body,images,active,created_by) VALUES (${title},${body},CAST(${json} AS JSONB),TRUE,${user.id}) RETURNING id`;await q`UPDATE campaign_announcements SET active=FALSE WHERE id<>${rows[0].id} AND active=TRUE`;return res.status(201).json({ok:true,id:rows[0].id})}return res.status(405).json({error:'Methode nicht erlaubt.'})}catch(err){console.error(err);return res.status(500).json({error:'Die Bekanntmachung konnte nicht verarbeitet werden.'})}};
