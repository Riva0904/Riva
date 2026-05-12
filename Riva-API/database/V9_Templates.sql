-- V9: Add 10 modern animated templates (3 Wedding, 3 Holy Communion, 4 Birthday)
-- Admin user ID = 1 (adjust if needed)

DECLARE @AdminId INT = (SELECT TOP 1 Id FROM Users WHERE Role = 'Admin');
IF @AdminId IS NULL SET @AdminId = 1;

DECLARE @WeddingId INT   = (SELECT CategoryId FROM Categories WHERE Name LIKE '%arriage%' OR Name LIKE '%edding%');
DECLARE @CommunionId INT = (SELECT CategoryId FROM Categories WHERE Name LIKE '%ommunion%');
DECLARE @BirthdayId INT  = (SELECT CategoryId FROM Categories WHERE Name LIKE '%irthday%');

-- ── WEDDING 1: Elegant Rose ──────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Templates WHERE Name = 'Elegant Rose Wedding')
INSERT INTO Templates (Name, CategoryId, IsPaid, Price, TemplateHtml, TemplateCss, TemplateJs, SchemaJson, CreatedBy, CreatedDate)
VALUES (N'Elegant Rose Wedding', @WeddingId, 0, NULL, N'
<div class="wr-card">
  <div class="wr-petals">
    <span class="petal p1">🌹</span><span class="petal p2">🌹</span>
    <span class="petal p3">🌸</span><span class="petal p4">🌸</span>
  </div>
  <div class="wr-inner">
    <p class="wr-pre">Together with their families</p>
    <h1 class="wr-names">{{groomName}} &amp; {{brideName}}</h1>
    <div class="wr-divider">💍</div>
    <p class="wr-invite">joyfully invite you to celebrate their wedding</p>
    <div class="wr-details">
      <div class="wr-row">📅 <strong>{{date}}</strong></div>
      <div class="wr-row">🕐 <strong>{{time}}</strong></div>
      <div class="wr-row">📍 <strong>{{venue}}</strong></div>
    </div>
    <p class="wr-msg">{{message}}</p>
  </div>
</div>', N'
@keyframes floatPetal { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-18px) rotate(15deg)} }
@keyframes fadeIn { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
.wr-card{background:linear-gradient(160deg,#fff5f5,#fff0f6);border:2px solid #fecdd3;border-radius:24px;padding:40px 32px;text-align:center;font-family:Georgia,serif;max-width:480px;margin:0 auto;position:relative;overflow:hidden;box-shadow:0 16px 48px rgba(244,63,94,.12)}
.wr-petals{position:absolute;inset:0;pointer-events:none}
.petal{position:absolute;font-size:1.5rem;animation:floatPetal 4s ease-in-out infinite}
.p1{top:8%;left:5%;animation-delay:0s}.p2{top:12%;right:6%;animation-delay:1s}.p3{bottom:10%;left:8%;animation-delay:2s}.p4{bottom:8%;right:5%;animation-delay:1.5s}
.wr-inner{animation:fadeIn .8s ease both;position:relative;z-index:1}
.wr-pre{color:#9f1239;font-size:.85rem;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px}
.wr-names{font-size:2.2rem;font-weight:700;color:#881337;margin:0 0 12px;line-height:1.2}
.wr-divider{font-size:1.5rem;margin:14px 0;color:#e11d48}
.wr-invite{color:#be123c;font-style:italic;font-size:.95rem;margin-bottom:20px}
.wr-details{background:rgba(255,228,230,.5);border-radius:12px;padding:16px;margin:16px 0}
.wr-row{color:#9f1239;font-size:.9rem;padding:5px 0}
.wr-msg{color:#be123c;font-style:italic;font-size:.9rem;margin-top:16px}', N'', N'[{"key":"groomName","label":"Groom Name","type":"text","required":true},{"key":"brideName","label":"Bride Name","type":"text","required":true},{"key":"date","label":"Wedding Date","type":"date","required":true},{"key":"time","label":"Ceremony Time","type":"text","required":true,"placeholder":"6:00 PM"},{"key":"venue","label":"Venue","type":"text","required":true},{"key":"message","label":"Personal Message","type":"textarea","required":false}]',
@AdminId, GETUTCDATE());

-- ── WEDDING 2: Golden Dusk ──────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Templates WHERE Name = 'Golden Dusk Wedding')
INSERT INTO Templates (Name, CategoryId, IsPaid, Price, TemplateHtml, TemplateCss, TemplateJs, SchemaJson, CreatedBy, CreatedDate)
VALUES (N'Golden Dusk Wedding', @WeddingId, 1, 199, N'
<div class="gd-wrap">
  <div class="gd-stars" id="gdStars"></div>
  <div class="gd-content">
    <div class="gd-crown">👑</div>
    <p class="gd-sub">THE WEDDING OF</p>
    <h1 class="gd-names">{{groomName}}</h1>
    <p class="gd-and">&amp;</p>
    <h1 class="gd-names">{{brideName}}</h1>
    <div class="gd-line"></div>
    <p class="gd-date">{{date}} at {{time}}</p>
    <p class="gd-venue">{{venue}}</p>
    <p class="gd-msg">{{message}}</p>
  </div>
</div>', N'
@keyframes twinkle{0%,100%{opacity:.2}50%{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
.gd-wrap{background:linear-gradient(160deg,#1c0a00,#3d1f00,#1c0a00);border-radius:24px;padding:40px 28px;text-align:center;font-family:"Georgia",serif;max-width:480px;margin:0 auto;position:relative;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.6)}
.gd-stars{position:absolute;inset:0;pointer-events:none}
.gd-content{position:relative;z-index:1;animation:slideUp .9s ease both}
.gd-crown{font-size:2.5rem;margin-bottom:12px;display:block}
.gd-sub{color:#d4a84b;letter-spacing:.25em;font-size:.75rem;text-transform:uppercase;margin-bottom:16px}
.gd-names{font-size:2rem;font-weight:700;color:#f5d77e;margin:4px 0;text-shadow:0 2px 12px rgba(212,168,75,.5)}
.gd-and{color:#d4a84b;font-size:1.4rem;font-style:italic;margin:4px 0}
.gd-line{width:60px;height:2px;background:linear-gradient(90deg,transparent,#d4a84b,transparent);margin:18px auto}
.gd-date{color:#f5d77e;font-size:.95rem;margin:10px 0}
.gd-venue{color:#d4a84b;font-size:.9rem;margin:6px 0}
.gd-msg{color:rgba(245,215,126,.7);font-size:.85rem;font-style:italic;margin-top:14px}', N'
(function(){var c=document.getElementById("gdStars");if(!c)return;for(var i=0;i<50;i++){var s=document.createElement("span");s.style.cssText="position:absolute;width:2px;height:2px;background:#d4a84b;border-radius:50%;top:"+Math.random()*100+"%%;left:"+Math.random()*100+"%%;animation:twinkle "+(1.5+Math.random()*2)+"s infinite;animation-delay:"+Math.random()*2+"s";c.appendChild(s)}})()',
N'[{"key":"groomName","label":"Groom Name","type":"text","required":true},{"key":"brideName","label":"Bride Name","type":"text","required":true},{"key":"date","label":"Wedding Date","type":"date","required":true},{"key":"time","label":"Time","type":"text","required":true,"placeholder":"7:00 PM"},{"key":"venue","label":"Venue","type":"text","required":true},{"key":"message","label":"Message","type":"textarea","required":false}]',
@AdminId, GETUTCDATE());

-- ── WEDDING 3: Garden Bloom ──────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Templates WHERE Name = 'Garden Bloom Wedding')
INSERT INTO Templates (Name, CategoryId, IsPaid, Price, TemplateHtml, TemplateCss, TemplateJs, SchemaJson, CreatedBy, CreatedDate)
VALUES (N'Garden Bloom Wedding', @WeddingId, 0, NULL, N'
<div class="gb-card">
  <div class="gb-top">🌿🌼🌿</div>
  <div class="gb-body">
    <p class="gb-pre">You are warmly invited</p>
    <h1 class="gb-names">{{groomName}} &amp; {{brideName}}</h1>
    <p class="gb-are">are getting married!</p>
    <div class="gb-row">🗓 {{date}}</div>
    <div class="gb-row">⏰ {{time}}</div>
    <div class="gb-row">🏡 {{venue}}</div>
    <p class="gb-msg">{{message}}</p>
  </div>
  <div class="gb-bottom">🌸🌿🌸</div>
</div>', N'
@keyframes bloom{0%{transform:scale(0.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
.gb-card{background:#f0fdf4;border:2px solid #86efac;border-radius:28px;padding:0;max-width:460px;margin:0 auto;overflow:hidden;box-shadow:0 12px 40px rgba(22,163,74,.12);font-family:"Georgia",serif}
.gb-top,.gb-bottom{background:linear-gradient(135deg,#166534,#15803d);text-align:center;padding:14px;font-size:1.4rem;letter-spacing:8px}
.gb-body{padding:28px 28px 20px;text-align:center;animation:bloom .8s cubic-bezier(.34,1.56,.64,1) both}
.gb-pre{color:#15803d;font-size:.85rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px}
.gb-names{font-size:1.9rem;font-weight:700;color:#14532d;margin:0 0 8px}
.gb-are{color:#16a34a;font-style:italic;margin-bottom:18px}
.gb-row{background:rgba(22,163,74,.08);border-radius:8px;padding:8px 12px;margin:6px 0;color:#166534;font-size:.9rem}
.gb-msg{color:#15803d;font-style:italic;font-size:.88rem;margin-top:14px}', N'',
N'[{"key":"groomName","label":"Groom Name","type":"text","required":true},{"key":"brideName","label":"Bride Name","type":"text","required":true},{"key":"date","label":"Date","type":"date","required":true},{"key":"time","label":"Time","type":"text","required":true},{"key":"venue","label":"Venue","type":"text","required":true},{"key":"message","label":"Message","type":"textarea","required":false}]',
@AdminId, GETUTCDATE());

-- ── HOLY COMMUNION 1: Heavenly Light ────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Templates WHERE Name = 'Heavenly Light Communion')
INSERT INTO Templates (Name, CategoryId, IsPaid, Price, TemplateHtml, TemplateCss, TemplateJs, SchemaJson, CreatedBy, CreatedDate)
VALUES (N'Heavenly Light Communion', @CommunionId, 0, NULL, N'
<div class="hl-card">
  <div class="hl-rays" id="hlRays"></div>
  <div class="hl-content">
    <div class="hl-cross">✝️</div>
    <p class="hl-title">First Holy Communion</p>
    <h1 class="hl-name">{{childName}}</h1>
    <p class="hl-verse">"I am the bread of life."<br/><em>— John 6:35</em></p>
    <div class="hl-details">
      <p>📅 {{date}}</p>
      <p>⛪ {{church}}</p>
      <p>🕐 {{time}}</p>
    </div>
    <p class="hl-msg">{{message}}</p>
  </div>
</div>', N'
@keyframes rays{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
.hl-card{background:linear-gradient(160deg,#fefce8,#fef9c3,#fff);border:2px solid #fde68a;border-radius:24px;padding:40px 28px;text-align:center;font-family:"Georgia",serif;max-width:460px;margin:0 auto;position:relative;overflow:hidden;box-shadow:0 12px 40px rgba(234,179,8,.15)}
.hl-rays{position:absolute;inset:-50%;width:200%;height:200%;background:conic-gradient(transparent 0deg 10deg,rgba(253,230,138,.3) 10deg 20deg,transparent 20deg);animation:rays 20s linear infinite;pointer-events:none}
.hl-content{position:relative;z-index:1;animation:fadeUp .8s ease both}
.hl-cross{font-size:2.8rem;display:block;margin-bottom:10px}
.hl-title{color:#92400e;letter-spacing:.12em;font-size:.8rem;text-transform:uppercase;margin-bottom:14px}
.hl-name{font-size:2.2rem;font-weight:700;color:#78350f;margin:0 0 16px}
.hl-verse{color:#92400e;font-style:italic;font-size:.9rem;margin-bottom:20px;line-height:1.6}
.hl-details p{color:#78350f;font-size:.9rem;margin:6px 0}
.hl-msg{color:#92400e;font-style:italic;font-size:.88rem;margin-top:16px}', N'',
N'[{"key":"childName","label":"Child Name","type":"text","required":true},{"key":"date","label":"Date","type":"date","required":true},{"key":"church","label":"Church Name","type":"text","required":true},{"key":"time","label":"Time","type":"text","required":true},{"key":"message","label":"Personal Message","type":"textarea","required":false}]',
@AdminId, GETUTCDATE());

-- ── HOLY COMMUNION 2: Sacred Blue ───────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Templates WHERE Name = 'Sacred Blue Communion')
INSERT INTO Templates (Name, CategoryId, IsPaid, Price, TemplateHtml, TemplateCss, TemplateJs, SchemaJson, CreatedBy, CreatedDate)
VALUES (N'Sacred Blue Communion', @CommunionId, 1, 199, N'
<div class="sb-card">
  <div class="sb-header">
    <span class="sb-dove">🕊️</span>
    <h2 class="sb-title">First Holy Communion</h2>
  </div>
  <div class="sb-body">
    <h1 class="sb-name">{{childName}}</h1>
    <p class="sb-sub">Receives the Body of Christ for the first time</p>
    <div class="sb-detail"><span>📅</span><span>{{date}}</span></div>
    <div class="sb-detail"><span>⛪</span><span>{{church}}</span></div>
    <div class="sb-detail"><span>🕐</span><span>{{time}}</span></div>
    <p class="sb-verse">{{message}}</p>
  </div>
</div>', N'
@keyframes doveFly{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-10px) rotate(5deg)}}
@keyframes appear{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}
.sb-card{background:linear-gradient(160deg,#eff6ff,#dbeafe);border:2px solid #93c5fd;border-radius:24px;overflow:hidden;max-width:460px;margin:0 auto;font-family:"Georgia",serif;box-shadow:0 12px 40px rgba(59,130,246,.14)}
.sb-header{background:linear-gradient(135deg,#1d4ed8,#2563eb);padding:28px 20px;text-align:center}
.sb-dove{font-size:2.4rem;display:block;animation:doveFly 3s ease-in-out infinite}
.sb-title{color:white;font-size:.85rem;letter-spacing:.18em;text-transform:uppercase;margin-top:8px}
.sb-body{padding:28px;text-align:center;animation:appear .7s ease both}
.sb-name{font-size:2rem;font-weight:700;color:#1d4ed8;margin:0 0 10px}
.sb-sub{color:#3b82f6;font-style:italic;font-size:.88rem;margin-bottom:20px}
.sb-detail{display:flex;align-items:center;gap:10px;background:rgba(59,130,246,.08);border-radius:10px;padding:9px 14px;margin:6px 0;color:#1e40af;font-size:.9rem}
.sb-verse{color:#3b82f6;font-style:italic;font-size:.88rem;margin-top:16px}', N'',
N'[{"key":"childName","label":"Child Name","type":"text","required":true},{"key":"date","label":"Date","type":"date","required":true},{"key":"church","label":"Church","type":"text","required":true},{"key":"time","label":"Time","type":"text","required":true},{"key":"message","label":"Message","type":"textarea","required":false}]',
@AdminId, GETUTCDATE());

-- ── HOLY COMMUNION 3: Garden White ──────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Templates WHERE Name = 'Garden White Communion')
INSERT INTO Templates (Name, CategoryId, IsPaid, Price, TemplateHtml, TemplateCss, TemplateJs, SchemaJson, CreatedBy, CreatedDate)
VALUES (N'Garden White Communion', @CommunionId, 0, NULL, N'
<div class="gw-card">
  <div class="gw-flowers">🌸 🌼 🌸</div>
  <div class="gw-body">
    <div class="gw-cross">✝</div>
    <p class="gw-label">First Holy Communion</p>
    <h1 class="gw-name">{{childName}}</h1>
    <p class="gw-verse">"Come to me, all who are weary."</p>
    <div class="gw-info">
      <span>📅 {{date}}</span>
      <span>⛪ {{church}}</span>
    </div>
    <p class="gw-time">🕐 {{time}}</p>
    <p class="gw-msg">{{message}}</p>
  </div>
  <div class="gw-flowers">🌼 🌸 🌼</div>
</div>', N'
@keyframes glow{0%,100%{text-shadow:0 0 10px rgba(167,139,250,.4)}50%{text-shadow:0 0 24px rgba(167,139,250,.8)}}
@keyframes rise{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
.gw-card{background:linear-gradient(160deg,#faf5ff,#f5f3ff);border:2px solid #ddd6fe;border-radius:24px;text-align:center;font-family:"Georgia",serif;max-width:460px;margin:0 auto;overflow:hidden;box-shadow:0 12px 40px rgba(139,92,246,.1)}
.gw-flowers{background:linear-gradient(135deg,#7c3aed,#a855f7);padding:14px;font-size:1.4rem;letter-spacing:10px}
.gw-body{padding:28px;animation:rise .8s ease both}
.gw-cross{font-size:2.5rem;color:#7c3aed;animation:glow 2.5s ease-in-out infinite;margin-bottom:10px}
.gw-label{color:#7c3aed;font-size:.8rem;letter-spacing:.15em;text-transform:uppercase;margin-bottom:12px}
.gw-name{font-size:2.1rem;font-weight:700;color:#5b21b6;margin:0 0 12px}
.gw-verse{color:#7c3aed;font-style:italic;font-size:.88rem;margin-bottom:18px}
.gw-info{display:flex;justify-content:center;gap:20px;flex-wrap:wrap}
.gw-info span{color:#6d28d9;background:rgba(139,92,246,.1);border-radius:8px;padding:6px 12px;font-size:.88rem}
.gw-time{color:#7c3aed;font-size:.9rem;margin:10px 0}
.gw-msg{color:#6d28d9;font-style:italic;font-size:.88rem;margin-top:12px}', N'',
N'[{"key":"childName","label":"Child Name","type":"text","required":true},{"key":"date","label":"Date","type":"date","required":true},{"key":"church","label":"Church","type":"text","required":true},{"key":"time","label":"Time","type":"text","required":true},{"key":"message","label":"Message","type":"textarea","required":false}]',
@AdminId, GETUTCDATE());

-- ── BIRTHDAY 1: Neon Party ───────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Templates WHERE Name = 'Neon Party Birthday')
INSERT INTO Templates (Name, CategoryId, IsPaid, Price, TemplateHtml, TemplateCss, TemplateJs, SchemaJson, CreatedBy, CreatedDate)
VALUES (N'Neon Party Birthday', @BirthdayId, 1, 199, N'
<div class="np-card">
  <div class="np-confetti" id="npConf"></div>
  <div class="np-content">
    <div class="np-emoji">🎉</div>
    <h1 class="np-title">BIRTHDAY BASH!</h1>
    <p class="np-name">{{name}} turns {{age}}!</p>
    <div class="np-details">
      <p>📅 {{date}}</p>
      <p>⏰ {{time}}</p>
      <p>📍 {{venue}}</p>
    </div>
    <p class="np-msg">{{message}}</p>
    <div class="np-cta">🎊 See you there! 🎊</div>
  </div>
</div>', N'
@keyframes npBounce{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
@keyframes npGlow{0%,100%{box-shadow:0 0 20px #f0abfc,0 0 40px #e879f9}50%{box-shadow:0 0 40px #f0abfc,0 0 80px #e879f9}}
@keyframes npFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes npSlide{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}
.np-card{background:linear-gradient(135deg,#0f0f1a,#1a0f2e);border:2px solid #a855f7;border-radius:24px;padding:36px 28px;text-align:center;font-family:"Arial Black",sans-serif;max-width:460px;margin:0 auto;position:relative;overflow:hidden;animation:npGlow 3s ease-in-out infinite}
.np-confetti{position:absolute;inset:0;pointer-events:none;z-index:0}
.np-content{position:relative;z-index:1;animation:npSlide .7s ease both}
.np-emoji{font-size:3rem;animation:npBounce 1.2s infinite;display:block}
.np-title{font-size:2rem;font-weight:900;background:linear-gradient(90deg,#f0abfc,#e879f9,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:8px 0}
.np-name{color:#e879f9;font-size:1.1rem;margin-bottom:20px}
.np-details p{color:#d8b4fe;font-size:.9rem;margin:6px 0}
.np-msg{color:#c084fc;font-style:italic;font-size:.88rem;margin:14px 0}
.np-cta{background:linear-gradient(135deg,#a855f7,#ec4899);color:white;border-radius:999px;padding:10px 24px;font-weight:900;font-size:.9rem;display:inline-block;margin-top:12px;animation:npFloat 2s ease-in-out infinite}', N'
(function(){var c=document.getElementById("npConf");if(!c)return;var colors=["#f0abfc","#e879f9","#c084fc","#ec4899","#fbbf24"];for(var i=0;i<40;i++){var d=document.createElement("div");var color=colors[Math.floor(Math.random()*colors.length)];d.style.cssText="position:absolute;width:"+(4+Math.random()*6)+"px;height:"+(4+Math.random()*6)+"px;background:"+color+";border-radius:50%;top:"+(Math.random()*100)+"%%;left:"+(Math.random()*100)+"%%;opacity:"+(0.3+Math.random()*0.7)+";animation:npFloat "+(2+Math.random()*3)+"s infinite;animation-delay:"+Math.random()*2+"s";c.appendChild(d)}})()',
N'[{"key":"name","label":"Birthday Person Name","type":"text","required":true},{"key":"age","label":"Age","type":"text","required":true},{"key":"date","label":"Date","type":"date","required":true},{"key":"time","label":"Time","type":"text","required":true},{"key":"venue","label":"Venue","type":"text","required":true},{"key":"message","label":"Message","type":"textarea","required":false}]',
@AdminId, GETUTCDATE());

-- ── BIRTHDAY 2: Pastel Dream ─────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Templates WHERE Name = 'Pastel Dream Birthday')
INSERT INTO Templates (Name, CategoryId, IsPaid, Price, TemplateHtml, TemplateCss, TemplateJs, SchemaJson, CreatedBy, CreatedDate)
VALUES (N'Pastel Dream Birthday', @BirthdayId, 0, NULL, N'
<div class="pd-card">
  <div class="pd-top">
    <span class="pd-bal">🎈</span>
    <h1 class="pd-big">{{age}}</h1>
    <span class="pd-bal">🎈</span>
  </div>
  <div class="pd-body">
    <p class="pd-sub">Celebrating</p>
    <h2 class="pd-name">{{name}}</h2>
    <div class="pd-info">
      <div class="pd-chip">📅 {{date}}</div>
      <div class="pd-chip">⏰ {{time}}</div>
      <div class="pd-chip">📍 {{venue}}</div>
    </div>
    <p class="pd-msg">{{message}}</p>
  </div>
</div>', N'
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@keyframes pop{from{opacity:0;transform:scale(.5)}80%{transform:scale(1.1)}to{opacity:1;transform:none}}
.pd-card{background:linear-gradient(160deg,#fff1f2,#fce7f3,#eff6ff);border:2px solid #fbcfe8;border-radius:28px;overflow:hidden;max-width:460px;margin:0 auto;font-family:Arial,sans-serif;box-shadow:0 12px 40px rgba(236,72,153,.12)}
.pd-top{background:linear-gradient(135deg,#f9a8d4,#c084fc);padding:28px;text-align:center;display:flex;align-items:center;justify-content:center;gap:16px}
.pd-bal{font-size:2rem;animation:float 2.5s ease-in-out infinite}
.pd-bal:last-child{animation-delay:.8s}
.pd-big{font-size:3.5rem;font-weight:900;color:white;margin:0;text-shadow:0 4px 12px rgba(0,0,0,.15)}
.pd-body{padding:28px;text-align:center;animation:pop .7s cubic-bezier(.34,1.56,.64,1) both}
.pd-sub{color:#ec4899;font-size:.85rem;text-transform:uppercase;letter-spacing:.12em;margin-bottom:8px}
.pd-name{font-size:1.9rem;font-weight:700;color:#be185d;margin:0 0 18px}
.pd-info{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
.pd-chip{background:rgba(236,72,153,.1);border:1px solid #fbcfe8;border-radius:10px;padding:9px 14px;color:#be185d;font-size:.88rem}
.pd-msg{color:#ec4899;font-style:italic;font-size:.88rem}', N'',
N'[{"key":"name","label":"Name","type":"text","required":true},{"key":"age","label":"Age","type":"text","required":true},{"key":"date","label":"Date","type":"date","required":true},{"key":"time","label":"Time","type":"text","required":true},{"key":"venue","label":"Venue","type":"text","required":true},{"key":"message","label":"Message","type":"textarea","required":false}]',
@AdminId, GETUTCDATE());

-- ── BIRTHDAY 3: Starry Night ─────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Templates WHERE Name = 'Starry Night Birthday')
INSERT INTO Templates (Name, CategoryId, IsPaid, Price, TemplateHtml, TemplateCss, TemplateJs, SchemaJson, CreatedBy, CreatedDate)
VALUES (N'Starry Night Birthday', @BirthdayId, 1, 199, N'
<div class="sn-card">
  <div class="sn-stars" id="snStars"></div>
  <div class="sn-content">
    <div class="sn-moon">🌙</div>
    <h1 class="sn-title">Happy Birthday</h1>
    <h2 class="sn-name">{{name}}</h2>
    <p class="sn-age">Turning ✨ {{age}} ✨</p>
    <div class="sn-info">
      <p>📅 {{date}}</p>
      <p>⏰ {{time}}</p>
      <p>📍 {{venue}}</p>
    </div>
    <p class="sn-msg">{{message}}</p>
  </div>
</div>', N'
@keyframes moonGlow{0%,100%{filter:drop-shadow(0 0 8px #fde68a)}50%{filter:drop-shadow(0 0 24px #fde68a)}}
@keyframes starTwinkle{0%,100%{opacity:.15}50%{opacity:1}}
@keyframes rise{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
.sn-card{background:linear-gradient(160deg,#020617,#0f172a,#1e1b4b);border:1px solid #312e81;border-radius:24px;padding:36px 28px;text-align:center;font-family:"Georgia",serif;max-width:460px;margin:0 auto;position:relative;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.6)}
.sn-stars{position:absolute;inset:0;pointer-events:none}
.sn-content{position:relative;z-index:1;animation:rise .9s ease both}
.sn-moon{font-size:3rem;display:block;animation:moonGlow 3s ease-in-out infinite}
.sn-title{font-size:1.5rem;font-weight:700;color:#e0e7ff;margin:10px 0 4px;letter-spacing:.1em}
.sn-name{font-size:2.2rem;font-weight:900;background:linear-gradient(90deg,#fde68a,#f9a8d4,#a5f3fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:0 0 8px}
.sn-age{color:#a5b4fc;font-size:1rem;margin-bottom:20px}
.sn-info p{color:#c7d2fe;font-size:.9rem;margin:7px 0}
.sn-msg{color:#a5b4fc;font-style:italic;font-size:.88rem;margin-top:14px}', N'
(function(){var c=document.getElementById("snStars");if(!c)return;for(var i=0;i<60;i++){var s=document.createElement("span");s.style.cssText="position:absolute;width:2px;height:2px;background:white;border-radius:50%;top:"+Math.random()*100+"%%;left:"+Math.random()*100+"%%;animation:starTwinkle "+(1+Math.random()*3)+"s infinite;animation-delay:"+Math.random()*3+"s";c.appendChild(s)}})()',
N'[{"key":"name","label":"Name","type":"text","required":true},{"key":"age","label":"Age","type":"text","required":true},{"key":"date","label":"Date","type":"date","required":true},{"key":"time","label":"Time","type":"text","required":true},{"key":"venue","label":"Venue","type":"text","required":true},{"key":"message","label":"Message","type":"textarea","required":false}]',
@AdminId, GETUTCDATE());

-- ── BIRTHDAY 4: Tropical Fiesta ───────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Templates WHERE Name = 'Tropical Fiesta Birthday')
INSERT INTO Templates (Name, CategoryId, IsPaid, Price, TemplateHtml, TemplateCss, TemplateJs, SchemaJson, CreatedBy, CreatedDate)
VALUES (N'Tropical Fiesta Birthday', @BirthdayId, 0, NULL, N'
<div class="tf-card">
  <div class="tf-banner">🌴 🎉 🌴</div>
  <div class="tf-body">
    <h1 class="tf-title">FIESTA TIME!</h1>
    <p class="tf-join">Join us to celebrate</p>
    <h2 class="tf-name">{{name}}</h2>
    <p class="tf-age">🎂 Turning {{age}}!</p>
    <div class="tf-details">
      <div class="tf-item">📅 {{date}}</div>
      <div class="tf-item">⏰ {{time}}</div>
      <div class="tf-item">📍 {{venue}}</div>
    </div>
    <p class="tf-msg">{{message}}</p>
  </div>
  <div class="tf-footer">🍍 🌺 🍹 🌺 🍍</div>
</div>', N'
@keyframes sway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
@keyframes popIn{from{opacity:0;transform:scale(.7) translateY(20px)}to{opacity:1;transform:none}}
.tf-card{background:linear-gradient(160deg,#fff7ed,#fef9c3);border:2px solid #fed7aa;border-radius:24px;overflow:hidden;max-width:460px;margin:0 auto;font-family:Arial,sans-serif;box-shadow:0 12px 40px rgba(234,88,12,.12)}
.tf-banner,.tf-footer{background:linear-gradient(135deg,#ea580c,#dc2626);padding:14px;text-align:center;font-size:1.4rem;letter-spacing:8px}
.tf-footer{background:linear-gradient(135deg,#d97706,#ea580c)}
.tf-body{padding:26px;text-align:center;animation:popIn .7s cubic-bezier(.34,1.56,.64,1) both}
.tf-title{font-size:1.8rem;font-weight:900;color:#ea580c;letter-spacing:.08em;margin:0 0 6px}
.tf-join{color:#d97706;font-size:.88rem;margin-bottom:8px}
.tf-name{font-size:1.9rem;font-weight:700;color:#c2410c;margin:0 0 8px}
.tf-age{color:#ea580c;font-size:1rem;margin-bottom:16px;animation:sway 2s ease-in-out infinite;display:inline-block}
.tf-details{display:flex;flex-direction:column;gap:7px;margin-bottom:14px}
.tf-item{background:rgba(234,88,12,.1);border-radius:10px;padding:8px 14px;color:#9a3412;font-size:.88rem}
.tf-msg{color:#c2410c;font-style:italic;font-size:.88rem}', N'',
N'[{"key":"name","label":"Name","type":"text","required":true},{"key":"age","label":"Age","type":"text","required":true},{"key":"date","label":"Date","type":"date","required":true},{"key":"time","label":"Time","type":"text","required":true},{"key":"venue","label":"Venue","type":"text","required":true},{"key":"message","label":"Message","type":"textarea","required":false}]',
@AdminId, GETUTCDATE());

PRINT 'V9: 10 templates inserted successfully.';
GO
