/* Rothrauff Outdoor's offline showroom display. All logos ship in the widget. */
(function () {
  'use strict';
  var canvas = document.getElementById('storeCanvas');
  var display = document.getElementById('storeDisplay');
  var grid = document.getElementById('storeBrandGrid');
  var page = 0;
  var since = Date.now();
  var pages = [
    {theme:'ride', eyebrow:'A LITTLE ASSIST. A LOT OF ADVENTURE.', title:['Find your','happy gear.'], sub:'More fresh air. More smiles. More reasons to ride.', callout:'Find your ride. Ask us about a test ride.', sticker:['LESS SCROLL.','MORE ROLL.'], brandTitle:'BIG NAMES. EVEN BETTER RIDES.', brands:[['Cannondale','cannondale.png'],['Himiway','himiway.svg'],['Velotric','velotric.png'],['Lectric','lectric.png'],['BULLS','bulls.jpg'],['Urtopia','urtopia.png']]},
    {theme:'trail', eyebrow:'TAKE THE LONG WAY HOME.', title:['Take the','scenic route.'], sub:'From everyday errands to your next trail-day escape.', callout:'Your next favorite ride is waiting. Let’s find it.', sticker:['FRESH AIR.','FULL SMILES.'], brandTitle:'MORE WAYS TO FIND YOUR OUTSIDE.', brands:[['Segway','segway.png'],['Magnum','magnum.svg'],['AIMA','aima.png'],['Bakcou','bakcou.png'],['Addmotor','addmotor.png']]},
    {theme:'outside', eyebrow:'FOR THE YARD. THE WATER. THE WEEKEND.', title:['Good days.','Great outdoors.'], sub:'Make room for more of the good stuff.', callout:'Tell us what you love doing outside.', sticker:['LESS ROUTINE.','MORE WEEKEND.'], brandTitle:'YOUR OUTDOOR FAVORITES, ALL IN ONE PLACE.', brands:[['Navimow','navimow.svg'],['NuCanoe','nucanoe.png'],['Maui Jim','maui-jim.png'],['Kamado Joe','kamado-joe.svg'],['Masterbuilt','masterbuilt.svg']]}
  ];
  function text(id, value) { document.getElementById(id).textContent = value; }
  function show(index) {
    page = (index + pages.length) % pages.length;
    var data = pages[page];
    canvas.className = 'store-canvas theme-' + data.theme;
    text('storeEyebrow',data.eyebrow);
    var headline = document.getElementById('storeHeadline');
    headline.textContent = data.title[0];
    headline.appendChild(document.createElement('br'));
    var em = document.createElement('em'); em.textContent = data.title[1]; headline.appendChild(em);
    text('storeSubline',data.sub);text('storeCallout',data.callout);
    text('storeStickerTop',data.sticker[0]);text('storeStickerBottom',data.sticker[1]);
    text('storeBrandHeading',data.brandTitle);
    grid.textContent = '';
    data.brands.forEach(function (brand) {
      var card = document.createElement('div');card.className = 'store-brand-card';
      var img = document.createElement('img');img.src = 'brands/'+brand[1];img.alt = brand[0];
      img.className = 'logo-'+brand[1].split('.')[0];
      img.onerror = function () { img.hidden = true;var label=document.createElement('span');label.className='brand-fallback';label.textContent=brand[0];card.appendChild(label); };
      card.appendChild(img);
      if (brand[0] === 'Addmotor') { var name = document.createElement('span');name.className='brand-caption';name.textContent='ADDMOTOR';card.appendChild(name);card.className+=' icon-brand'; }
      grid.appendChild(card);
    });
    var dots=document.querySelectorAll('.store-pages span');
    for(var i=0;i<dots.length;i++) dots[i].className=i===page?'is-active':'';
    since=Date.now();
  }
  function fit() {
    var scale = Math.min(window.innerWidth/1920, window.innerHeight/1080);
    var x = Math.round((window.innerWidth-1920*scale)/2);
    var y = Math.round((window.innerHeight-1080*scale)/2);
    canvas.style.transform='translate('+x+'px,'+y+'px) scale('+scale+')';
  }
  document.addEventListener('keydown',function(e){
    if(display.hidden)return;
    if(e.keyCode===37||e.keyCode===39){ show(page+(e.keyCode===39?1:-1));e.preventDefault();e.stopImmediatePropagation(); }
  });
  window.addEventListener('resize',fit);
  document.addEventListener('visibilitychange',function(){since=Date.now();});
  // No moving backgrounds or continuous rendering on the television.
  setInterval(function(){if(!(window.SKYLIGHT_PREVIEW && /[?&]still\b/.test(location.search))&&!document.hidden&&!display.hidden&&Date.now()-since>=14000)show(page+1);},1000);
  var requested = window.SKYLIGHT_PREVIEW && /[?&]storePage=([0-2])\b/.exec(location.search);
  show(requested ? Number(requested[1]) : 0);fit();
})();
