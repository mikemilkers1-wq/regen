const PDFDocument=require('pdfkit');
const {sql,ensureSchema}=require('../lib/db');

module.exports=async(req,res)=>{
  if(req.method!=='GET')return res.status(405).json({error:'Methode nicht erlaubt.'});
  try{
    await ensureSchema();
    const q=sql();
    const rows=await q`SELECT title,body,created_at FROM campaign_announcements WHERE active=TRUE ORDER BY created_at DESC LIMIT 1`;
    const announcement=rows[0]||{title:'Aktuelle Bekanntmachung',body:'Derzeit liegt keine Bekanntmachung vor.',created_at:new Date()};
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition','attachment; filename="BUNDNIS_Aktuelle_Bekanntmachung.pdf"');
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=30');
    const doc=new PDFDocument({size:'A4',margins:{top:54,bottom:58,left:58,right:58},info:{Title:`BÜNDNIS – ${announcement.title}`,Author:'Pressestelle des Republikanischen Bündnisses'}});
    doc.pipe(res);
    doc.rect(0,0,doc.page.width,15).fill('#df202b');
    doc.fillColor('#202738').font('Helvetica-Bold').fontSize(10).text('REPUBLIKANISCHES BÜNDNIS · PRESSESTELLE',{characterSpacing:1.2});
    doc.moveDown(1.5).font('Helvetica-Bold').fontSize(25).text(announcement.title,{lineGap:2});
    doc.moveDown(.7).fillColor('#df202b').font('Helvetica-Bold').fontSize(10).text('AKTUELLE BEKANNTMACHUNG');
    doc.moveDown(.5).fillColor('#596171').font('Helvetica').fontSize(9).text(new Intl.DateTimeFormat('de-DE',{dateStyle:'long',timeZone:'Europe/Berlin'}).format(new Date(announcement.created_at)));
    doc.moveDown(1.5).fillColor('#303644').font('Helvetica').fontSize(11).text(announcement.body,{lineGap:6,align:'left'});
    doc.moveDown(2).fillColor('#202738').font('Helvetica-Bold').fontSize(11).text('Feste Verweise');
    doc.fillColor('#303644').font('Helvetica').fontSize(9.5).text('Regierungs- und Parteiprogramm: https://regen-alpha.vercel.app/priorities.html',{link:'https://regen-alpha.vercel.app/priorities.html',underline:true});
    doc.text('Die Erneuerung unterstützen: https://regen-alpha.vercel.app/join.html',{link:'https://regen-alpha.vercel.app/join.html',underline:true});
    doc.moveDown(2).fillColor('#596171').fontSize(8).text('Pressestelle · Bundesgeschäftsstelle Berlin · https://discord.gg/SwScJprsw6');
    doc.rect(0,doc.page.height-15,doc.page.width,15).fill('#df202b');
    doc.end();
  }catch(err){console.error(err);if(!res.headersSent)return res.status(500).json({error:'PDF konnte nicht erstellt werden.'});res.end();}
};
