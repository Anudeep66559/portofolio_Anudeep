(function(){
  "use strict";
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  /* ---------- LOADER (circular scope-dial) ---------- */
  var loader = document.getElementById('loader');
  var prog = document.getElementById('loaderProg');
  var pctEl = document.getElementById('loaderPct');
  var statusEl = document.getElementById('loaderStatus');
  var C = 2 * Math.PI * 46;
  if(prog){ prog.style.strokeDasharray = C; prog.style.strokeDashoffset = C; }
  function setStage(v){ if(statusEl) statusEl.textContent = v<25?'Initializing':v<60?'Loading':v<95?'Finalizing':'Ready'; }
  function done(){ loader.classList.add('done'); document.body.classList.add('loaded'); }
  function run(){
    var t0 = performance.now(), dur = reduceMotion?400:1600;
    function step(now){
      var p = Math.min(1,(now-t0)/dur), e = 1-Math.pow(1-p,3), v = Math.round(e*100);
      if(pctEl) pctEl.textContent = String(v).padStart(3,'0');
      if(prog) prog.style.strokeDashoffset = C*(1-v/100);
      setStage(v);
      if(p<1) requestAnimationFrame(step); else setTimeout(done, reduceMotion?100:260);
    }
    requestAnimationFrame(step);
  }
  if(document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', run);
  setTimeout(function(){ if(!loader.classList.contains('done')){ if(pctEl)pctEl.textContent='100'; if(prog)prog.style.strokeDashoffset=0; setStage(100); done(); } }, 4500);

  /* ---------- GUN-SCOPE CURSOR ---------- */
  if(!coarse){
    var crossV = document.getElementById('scopeCrossV');
    var crossH = document.getElementById('scopeCrossH');
    var ring = document.getElementById('scopeRing');
    var dot = document.getElementById('scopeDot');
    var tx = window.innerWidth/2, ty = window.innerHeight/2;
    var rx = tx, ry = ty, dx = tx, dy = ty;
    window.addEventListener('mousemove', function(e){
      tx = e.clientX; ty = e.clientY;
      document.body.classList.add('cursor-ready');
      crossV.style.left = tx + 'px';
      crossH.style.top = ty + 'px';
      var xs = String(Math.round(tx)).padStart(4,'0');
      var ys = String(Math.round(ty)).padStart(4,'0');
      var cX = document.getElementById('coordX'), cY = document.getElementById('coordY');
      if(cX) cX.textContent = xs; if(cY) cY.textContent = ys;
    }, {passive:true});
    function raf(){
      rx += (tx-rx)*0.18; ry += (ty-ry)*0.18;
      dx += (tx-dx)*0.45; dy += (ty-dy)*0.45;
      ring.style.transform = 'translate('+rx+'px,'+ry+'px)';
      dot.style.transform = 'translate('+dx+'px,'+dy+'px)';
      requestAnimationFrame(raf);
    }
    raf();
    document.addEventListener('mouseleave', function(){ document.body.classList.add('hide-cursor'); });
    document.addEventListener('mouseenter', function(){ document.body.classList.remove('hide-cursor'); });
    var hoverSel = 'a, button, .contact-card, .discipline-tabs button, .chip, table.data tr, .project, .legend-card, .nav-arrow, .doc-link, [data-tilt], .hover-underline';
    document.querySelectorAll(hoverSel).forEach(function(el){
      el.addEventListener('mouseenter', function(){ document.body.classList.add('hovering'); });
      el.addEventListener('mouseleave', function(){ document.body.classList.remove('hovering'); });
    });
  }

  /* ---------- IST CLOCK ---------- */
  function clock(){
    var now = new Date();
    var utc = now.getTime() + now.getTimezoneOffset()*60000;
    var ist = new Date(utc + 5.5*3600000);
    var h = String(ist.getHours()).padStart(2,'0');
    var m = String(ist.getMinutes()).padStart(2,'0');
    var s = String(ist.getSeconds()).padStart(2,'0');
    var el = document.getElementById('clock');
    if(el) el.textContent = h+':'+m+':'+s;
  }
  clock(); setInterval(clock, 1000);

  /* ---------- SCROLL PROGRESS + ACTIVE NAV ---------- */
  var progFill = document.getElementById('progressFill');
  var scrollPctEl = document.getElementById('scrollPct');
  var sheets = Array.prototype.slice.call(document.querySelectorAll('.sheet'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.hud-nav button'));
  var navPrev = document.getElementById('navPrev');
  var navNext = document.getElementById('navNext');
  function activeIndex(){
    var mid = (window.scrollY||0) + window.innerHeight*0.4;
    var idx = 0;
    sheets.forEach(function(s,i){ if(s.offsetTop <= mid) idx = i; });
    return idx;
  }
  /* Gentle parallax depth: selected blocks drift on the independent
     `translate` CSS property, so they never clash with hover transforms
     or the figure mouse-tilt (which uses `transform`). Reduced-motion = off. */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('.figwrap, .legend-card, .stat, .hstat'));
  var parallaxTicking = false;
  function applyParallax(){
    if(reduceMotion) return;
    var vh = window.innerHeight, vc = vh/2, half = vh/2;
    for(var i=0;i<parallaxEls.length;i++){
      var el = parallaxEls[i], r = el.getBoundingClientRect();
      if(r.bottom < -60 || r.top > vh+60){ continue; }
      var center = r.top + r.height/2;
      var p = (center - vc)/half;                 // -1 (top edge) .. 1 (bottom edge)
      if(p < -1) p = -1; else if(p > 1) p = 1;
      el.style.translate = '0 ' + (-p * 20).toFixed(1) + 'px';
    }
  }
  function onScroll(){
    var doc = document.documentElement;
    var st = window.scrollY || doc.scrollTop;
    var max = doc.scrollHeight - doc.clientHeight;
    var ratio = max>0 ? st/max : 0;
    progFill.style.width = (ratio*100)+'%';
    scrollPctEl.textContent = String(Math.round(ratio*100)).padStart(3,'0')+'%';
    var idx = activeIndex();
    navLinks.forEach(function(a,i){ a.classList.toggle('active', i===idx); });
    navPrev.classList.toggle('hide', idx===0);
    navNext.classList.toggle('hide', idx===sheets.length-1);
    if(!parallaxTicking){ parallaxTicking = true; requestAnimationFrame(function(){ parallaxTicking = false; applyParallax(); }); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', function(){ applyParallax(); });
  onScroll();

  /* ---------- INTERSECTION REVEALS ---------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, {threshold:0.16, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal, .stagger, .chart[data-anim]').forEach(function(el){ io.observe(el); });

  /* ---------- SHEET HEAD ENTRANCE ---------- */
  if(!reduceMotion){
    var sio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          var head = en.target.querySelector('.sheet-head');
          if(head && !head.dataset.done){
            head.style.transition='none';
            head.style.transform='translateY(-24px)'; head.style.opacity='0';
            requestAnimationFrame(function(){
              head.style.transition='transform .8s cubic-bezier(.16,1,.3,1),opacity .8s';
              head.style.transform='none'; head.style.opacity='1';
            });
            head.dataset.done='1';
          }
        }
      });
    }, {threshold:0.1});
    sheets.forEach(function(s){ sio.observe(s); });
  }

  /* ---------- DISCIPLINE TABS ---------- */
  var discData = {
    concrete:{c:'var(--concrete)', t:'Reinforced & plain concrete · flowability, GGBS replacement, IS 456 detailing.'},
    steel:   {c:'var(--steel)',    t:'Structural steel design · frames, connections, member design.'},
    soil:    {c:'var(--soil)',     t:'Geotechnical & foundation engineering · bearing, settlement.'},
    flow:    {c:'var(--flow)',     t:'Hydraulics & sediment kinematics · supercritical flow, particle tracking.'},
    code:    {c:'var(--code)',     t:'Computation · C/C++, MATLAB, GIS, measurement & data analysis.'}
  };
  var tabs = document.querySelectorAll('.discipline-tabs button');
  var discDesc = document.getElementById('discDesc');
  tabs.forEach(function(b){
    b.addEventListener('click', function(){
      tabs.forEach(function(x){x.classList.remove('active');});
      b.classList.add('active');
      var d = discData[b.getAttribute('data-disc')];
      document.documentElement.style.setProperty('--accent', d.c);
      discDesc.style.color = d.c;
      discDesc.textContent = d.t;
    });
  });

  /* ---------- MAGNETIC ---------- */
  if(!coarse && !reduceMotion){
    document.querySelectorAll('.magnetic').forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width/2);
        var my = e.clientY - (r.top + r.height/2);
        el.style.transform = 'translate('+(mx*0.22)+'px,'+(my*0.3)+'px)';
      });
      el.addEventListener('mouseleave', function(){ el.style.transform='none'; });
    });
  }

  /* ---------- 3D TILT on project figures ---------- */
  if(!coarse && !reduceMotion){
    document.querySelectorAll('[data-tilt]').forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left)/r.width - 0.5;
        var py = (e.clientY - r.top)/r.height - 0.5;
        var svg = el.querySelector('svg');
        if(svg) svg.style.transform = 'rotateY('+(px*14)+'deg) rotateX('+(-py*14)+'deg) translateZ(8px)';
      });
      el.addEventListener('mouseleave', function(){
        var svg = el.querySelector('svg');
        if(svg) svg.style.transform = '';
      });
    });
  }

  /* ---------- NAV: veil page transition ---------- */
  var veil = document.getElementById('veil');
  function goToSheet(i){
    var target = sheets[i];
    if(!target) return;
    if(reduceMotion){ target.scrollIntoView(); return; }
    veil.classList.add('show');
    setTimeout(function(){
      var top = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top, behavior: 'instant' });
      setTimeout(function(){ veil.classList.remove('show'); }, 90);
    }, 420);
  }
  navLinks.forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var i = sheets.indexOf(document.getElementById(a.getAttribute('data-target')));
      if(i>=0) goToSheet(i);
    });
  });
  navPrev.addEventListener('click', function(){ var i=activeIndex(); if(i>0) goToSheet(i-1); });
  navNext.addEventListener('click', function(){ var i=activeIndex(); if(i<sheets.length-1) goToSheet(i+1); });

  /* ---------- COUNT-UP ---------- */
  function countUp(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals')||'0',10);
    var suf = el.getAttribute('data-suffix')||'';
    if(reduceMotion){ el.textContent = target.toFixed(dec)+suf; return; }
    var dur=1200, t0=null;
    function step(ts){
      if(!t0)t0=ts;
      var k = Math.min((ts-t0)/dur,1);
      var v = target*(1-Math.pow(1-k,3));
      el.textContent = v.toFixed(dec)+suf;
      if(k<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counted = new WeakSet();
  var cfo = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        en.target.querySelectorAll('[data-count]').forEach(function(n){
          if(!counted.has(n)){ counted.add(n); countUp(n); }
        });
        cfo.unobserve(en.target);
      }
    });
  }, {threshold:0.4});
  document.querySelectorAll('.hero-stats, .key-facts').forEach(function(w){ cfo.observe(w); });

  /* ---------- PARALLAX ---------- */
  if(!coarse && !reduceMotion){
    var bp = document.querySelector('.blueprint');
    var heroArt = document.getElementById('heroArt');
    window.addEventListener('scroll', function(){
      var st = window.scrollY;
      if(bp) bp.style.transform = 'translateY('+(st*0.12)+'px)';
      if(heroArt) heroArt.style.transform = 'translateY(calc(-50% + '+(st*0.18)+'px))';
    }, {passive:true});
  }

  /* ---------- KEYBOARD nav ---------- */
  document.addEventListener('keydown', function(e){
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
    if(e.key==='ArrowDown' || e.key==='PageDown'){ var i=activeIndex(); if(i<sheets.length-1){ goToSheet(i+1); e.preventDefault(); } }
    else if(e.key==='ArrowUp' || e.key==='PageUp'){ var i=activeIndex(); if(i>0){ goToSheet(i-1); e.preventDefault(); } }
  });

  /* ---------- PROJECT ACCORDION (click a project name to expand) ---------- */
  document.querySelectorAll('.project').forEach(function(proj){
    var head = proj.querySelector('.p-head');
    var panel = proj.querySelector('.p-panel') as HTMLElement | null;
    if(!head || !panel) return;
    function setOpen(open){
      if(open){
        proj.classList.add('open'); head.setAttribute('aria-expanded','true');
        if(reduceMotion){ panel.style.maxHeight='none'; return; }
        panel.style.maxHeight = panel.scrollHeight + 'px';
        window.setTimeout(function(){ if(proj.classList.contains('open')) panel.style.maxHeight='none'; }, 580);
      } else {
        proj.classList.remove('open'); head.setAttribute('aria-expanded','false');
        if(reduceMotion){ panel.style.maxHeight='0px'; return; }
        panel.style.maxHeight = panel.scrollHeight + 'px';
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ panel.style.maxHeight='0px'; }); });
      }
    }
    head.addEventListener('click', function(){
      var opening = !proj.classList.contains('open');
      setOpen(!proj.classList.contains('open'));
      if(opening) proj.dispatchEvent(new CustomEvent('project:open', {bubbles:true}));
    });
  });

  /* ---------- CURSOR-FOLLOWING PROJECT PREVIEW ---------- */
  if(!coarse){
    var pc = document.getElementById('projCursor');
    var reg = document.querySelector('.register');
    if(pc && reg){
      var pcImg = pc.querySelector('.pc-img');
      var pcFig = pc.querySelector('.pc-fig');
      var pcName = pc.querySelector('.pc-name');
      var pcTx = 0, pcTy = 0, pcX = 0, pcY = 0, pcRot = 0, pcRotT = 0;
      var curProj = null;
      var PW = 248, PH = 180;
      function reveal(){
        pc.classList.remove('loaded');
        void pc.offsetWidth;
        pc.classList.add('loaded');
      }
      function loadProj(proj){
        var svg = proj.querySelector('svg');
        var fig = proj.querySelector('.figcall');
        var name = proj.querySelector('.p-name-text');
        if(svg){ pcImg.innerHTML = ''; pcImg.appendChild(svg.cloneNode(true)); }
        if(fig) pcFig.textContent = fig.textContent.trim();
        if(name) pcName.textContent = name.textContent.trim();
        reveal();
      }
      function show(proj){
        if(curProj !== proj){
          if(curProj === null){ pcX = pcTx; pcY = pcTy; } /* snap on (re)appear */
          curProj = proj;
          loadProj(proj);
        }
        pc.classList.add('show');
      }
      function hide(){
        pc.classList.remove('show');
        pc.classList.remove('loaded');
        curProj = null;
      }
      reg.addEventListener('mousemove', function(e){
        var tgt = e.target as Element | null;
        var proj = (tgt && tgt.closest) ? tgt.closest('.project') : null;
        if(!proj || proj.classList.contains('open')){
          if(curProj !== null) hide();
          return;
        }
        var me = e as MouseEvent;
        var mx = me.clientX, my = me.clientY;
        var px = mx + 26, py = my + 26;
        if(px + PW > window.innerWidth - 8) px = mx - PW - 26;
        if(py + PH > window.innerHeight - 8) py = my - PH - 26;
        pcTx = px; pcTy = py;
        pcRotT = Math.max(-10, Math.min(10, (pcTx - pcX) * 0.45)); /* momentum lean */
        show(proj);
      }, {passive:true});
      reg.addEventListener('mouseleave', function(){ hide(); }, {passive:true});
      reg.addEventListener('project:open', function(){ hide(); });
      function pcLoop(){
        if(reduceMotion){ pcX = pcTx; pcY = pcTy; pcRot = 0; }
        else {
          pcX += (pcTx - pcX) * 0.2;
          pcY += (pcTy - pcY) * 0.2;
          pcRot += (pcRotT - pcRot) * 0.18;
        }
        pc.style.translate = pcX.toFixed(1) + 'px ' + pcY.toFixed(1) + 'px';
        pc.style.rotate = pcRot.toFixed(2) + 'deg';
        requestAnimationFrame(pcLoop);
      }
      pcLoop();
    }
  }
})();
