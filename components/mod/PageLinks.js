import { s } from '../../lib/styles'

export function PageLinks() {
  const LINKS = [
  { category:'Support', items:[
    { label:'Intercom', desc:'Shared inbox', url:'https://app.intercom.com/a/inbox/yeoadtsy/inbox/shared/all', color:'#3b82f6' },
    { label:'Crisp',    desc:'Shared inbox', url:'https://app.crisp.chat/website/fe2e4489-7400-4bb6-8237-c8c14400a245/inbox/', color:'#f59e0b' },
  ]},
  { category:'Dashboards', items:[
    { label:'Rustyloot Dashboard', desc:'User management', url:'https://dashboard.terrypoker.pro/dashboard/users', color:'#f59e0b', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/rustyloot.jpg' },
    { label:'Hunt Dashboard',      desc:'User management', url:'https://dashboard.hunt.gg/users',                  color:'#34d399', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/hunt.jpg' },
    { label:'CSDeals Dashboard',   desc:'User management', url:'https://dashboard.cs.deals/',                      color:'#6366f1', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/csdeals.jpg' },
  ]},
  { category:'Discord', items:[
    { label:'RustyLoot Discord', desc:'Main server',    url:'https://discord.com/channels/984386438160343092/984386438747529278',  color:'#5865F2', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/rustyloot.jpg' },
    { label:'Hunt Discord',      desc:'Hunt server',    url:'https://discord.com/channels/1242469866573926400/1274418382942371996', color:'#34d399', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/hunt.jpg' },
    { label:'CSDeals Discord',   desc:'CSDeals server', url:'https://discord.gg/ZdpR52qrM',                                        color:'#6366f1', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/csdeals.jpg' },
  ]},
  { category:'Sites', items:[
    { label:'Rustyloot', desc:'Live chat', url:'https://rustyloot.gg/', color:'#f59e0b', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/rustyloot.jpg' },
    { label:'Hunt.gg',   desc:'Live chat', url:'https://hunt.gg/',      color:'#34d399', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/hunt.jpg' },
    { label:'CSDeals',   desc:'Live chat', url:'https://cs.deals/',     color:'#6366f1', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/csdeals.jpg' },
  ]},
]

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Work Links</h1>
      {LINKS.map(group => (
        <div key={group.category} style={s.card}>
          <div style={s.cardHead}><span style={s.cardTitle}>{group.category}</span></div>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {group.items.map(link => (
              <a key={link.url} href={link.url} target="_blank" rel="noreferrer" style={{display:'flex', alignItems:'center', gap:14, padding:'12px 14px', borderRadius:10, background:'#0f1117', border:'1px solid #1e2433', textDecoration:'none'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#334155'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#1e2433'}>
               <div style={{width:36, height:36, borderRadius:8, overflow:'hidden', flexShrink:0, background:link.color+'22', border:`1px solid ${link.color}44`}}>
  {link.logo
    ? <img src={link.logo} alt={link.label} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
    : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <svg width="16" height="16" fill="none" stroke={link.color} strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </div>
  }
</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.87rem', fontWeight:600, color:'#f1f5f9'}}>{link.label}</div>
                  <div style={{fontSize:'0.75rem', color:'#64748b', marginTop:2}}>{link.desc}</div>
                </div>
                <svg width="14" height="14" fill="none" stroke="#4a5568" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
