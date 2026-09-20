(function(){
  if(window.__HD_MAP_CONTROLLER_INSTALLED)return;
  window.__HD_MAP_CONTROLLER_INSTALLED=true;
  const base=typeof window.hdMapBaseRenderPicker==='function'?window.hdMapBaseRenderPicker:window.renderMapPicker;

  function hdMapAttachFallbackPlans(){
    const card=document.getElementById('selectedMapCard');
    if(!card||!selectedMap||typeof window.hdRenderMapPlans!=='function')return;
    let extra=document.getElementById('mapExtraPanel');
    if(!extra){extra=document.createElement('div');extra.id='mapExtraPanel';card.appendChild(extra)}
    window.hdRenderMapPlans(selectedMap);
  }

  function hdMapFallback(reason='fallback'){
    if(typeof window.hdMapRenderFallback==='function')window.hdMapRenderFallback();
    hdMapAttachFallbackPlans();
    window.__HD_MAP_RENDER_STATE={mode:'fallback',reason,map:String(selectedMap||''),at:Date.now()};
    window.dispatchEvent(new CustomEvent('hd:map-rendered',{detail:{map:selectedMap||'',tab:null,mode:'fallback',reason}}));
    return 'fallback';
  }

  function hdRenderMapPickerCanonical(){
    try{base?.()}catch(err){console.error('map base render failed',err)}
    if(!selectedMap){
      window.__HD_MAP_RENDER_STATE={mode:'empty',reason:'no-map',map:'',at:Date.now()};
      return 'empty';
    }
    if(typeof window.hdMapTabsCoreApply==='function'){
      try{
        window.hdMapTabsCoreApply();
        window.__HD_MAP_RENDER_STATE={mode:'tabs',reason:'primary',map:String(selectedMap),at:Date.now()};
        return 'tabs';
      }catch(err){
        console.error('map tab render failed; falling back',err);
        return hdMapFallback('tabs-error');
      }
    }
    return hdMapFallback('tabs-unavailable');
  }

  window.hdRenderMapPickerCanonical=hdRenderMapPickerCanonical;
  window.renderMapPicker=hdRenderMapPickerCanonical;
  window.hdMapRendererInfo=()=>({
    installed:true,
    mode:window.__HD_MAP_RENDER_STATE?.mode||'idle',
    reason:window.__HD_MAP_RENDER_STATE?.reason||'',
    hasBase:typeof base==='function',
    hasTabs:typeof window.hdMapTabsCoreApply==='function',
    hasFallback:typeof window.hdMapRenderFallback==='function',
    hasPlans:typeof window.hdRenderMapPlans==='function'
  });

  if(typeof window.renderGuide==='function')window.renderGuide();
})();
