(function(){
  function hdWorkspaceCompatInstall(){
    if(window.__hdWorkspaceCompatInstalled)return;
    if(typeof window.hdWSShowElement!=='function'){setTimeout(hdWorkspaceCompatInstall,100);return}
    window.__hdWorkspaceCompatInstalled=true;

    const original=Element.prototype.scrollIntoView;
    if(typeof original==='function'&&!Element.prototype.__hdOriginalScrollIntoView){
      Object.defineProperty(Element.prototype,'__hdOriginalScrollIntoView',{value:original,configurable:true});
      Element.prototype.scrollIntoView=function(...args){
        try{
          let node=this.closest?.('section')||null,hidden=false;
          while(node){if(node.classList?.contains('hd-ws-hidden')){hidden=true;break}node=node.parentElement?.closest?.('section')||null}
          if(hidden)window.hdWSShowElement(this,false);
        }catch{}
        return original.apply(this,args);
      };
    }

    window.hdNavigateTo=function(target,options={}){
      const el=typeof target==='string'?document.getElementById(target):target;
      if(!el)return false;
      try{window.hdWSShowElement(el,false)}catch{}
      if(options.scroll!==false)setTimeout(()=>el.scrollIntoView({behavior:options.behavior||'smooth',block:options.block||'start'}),20);
      if(options.hash!==false&&el.id)history.replaceState(null,'',`#${el.id}`);
      return true;
    };
  }

  window.addEventListener('hd:modules-ready',()=>setTimeout(hdWorkspaceCompatInstall,0));
  window.addEventListener('load',()=>setTimeout(hdWorkspaceCompatInstall,800));
  setTimeout(hdWorkspaceCompatInstall,1600);
})();
