(() => {
  "use strict";

  const STORAGE_KEY = "ubie-humor-progress-v1";
  const questions = [
    { id:"duration", context:"PARA COMEÇAR", title:"Há quanto tempo você percebe mudanças importantes no seu humor?", help:"Considere tristeza, irritabilidade, ansiedade, euforia ou oscilações fora do seu padrão.", options:["Menos de uma semana","Entre 1 e 2 semanas","Entre 2 semanas e 3 meses","Mais de 3 meses"], scores:[0,1,2,3], kind:"context" },
    { id:"interest", title:"Você perdeu o interesse ou o prazer em coisas que normalmente aprecia?", help:"Pense em atividades, pessoas, hobbies, trabalho ou autocuidado.", options:frequency(), scores:[0,1,2,3], kind:"low" },
    { id:"down", title:"Você se sentiu triste, deprimido, vazio ou sem esperança?", help:"Escolha a frequência que mais se aproxima da sua experiência.", options:frequency(), scores:[0,1,2,3], kind:"low" },
    { id:"sleep", title:"Seu sono mudou de forma incômoda?", help:"Inclua dificuldade para dormir, despertares, sono excessivo ou rotina muito irregular.", options:frequency(), scores:[0,1,2,3], kind:"low" },
    { id:"energy", title:"Você teve pouca energia ou cansaço difícil de explicar?", help:"Considere também o esforço necessário para começar ou terminar tarefas simples.", options:frequency(), scores:[0,1,2,3], kind:"low" },
    { id:"appetite", title:"Seu apetite diminuiu ou aumentou além do habitual?", help:"Responda pela frequência, mesmo que o peso não tenha mudado.", options:frequency(), scores:[0,1,2,3], kind:"low" },
    { id:"worth", title:"Você se sentiu mal consigo mesmo, culpado ou como se estivesse decepcionando alguém?", help:"Inclua autocrítica intensa, sensação de fracasso ou culpa desproporcional.", options:frequency(), scores:[0,1,2,3], kind:"low" },
    { id:"focus", title:"Você teve dificuldade para se concentrar ou tomar decisões?", help:"Por exemplo: acompanhar uma conversa, ler, trabalhar ou escolher entre opções simples.", options:frequency(), scores:[0,1,2,3], kind:"low" },
    { id:"movement", title:"Você ficou muito mais lento ou inquieto do que o habitual?", help:"Pense em mudanças percebidas por você ou por outras pessoas na fala, nos movimentos ou na agitação.", options:frequency(), scores:[0,1,2,3], kind:"low" },
    { id:"safety", title:"Você pensou que seria melhor não estar vivo ou em se machucar?", help:"Esta pergunta existe para priorizar sua segurança. Você pode continuar, mas apoio humano é importante.", options:frequency(), scores:[0,1,2,3], kind:"low", safety:true },
    { id:"elevated", context:"TAMBÉM NAS ÚLTIMAS DUAS SEMANAS", title:"Houve períodos em que você ficou incomumente eufórico, expansivo ou irritável?", help:"Considere uma mudança clara do seu jeito habitual, percebida também por outras pessoas.", options:["Não","Talvez, mas foi leve","Sim, por algumas horas","Sim, por um dia ou mais"], scores:[0,1,2,3], kind:"activation" },
    { id:"lessSleep", title:"Você precisou dormir muito menos e, ainda assim, não se sentiu cansado?", help:"Isso é diferente de dormir pouco e ficar exausto no dia seguinte.", options:["Não","Uma vez","Em alguns dias","Na maioria dos dias"], scores:[0,1,2,3], kind:"activation" },
    { id:"racing", title:"Seus pensamentos ficaram acelerados ou sua fala muito mais rápida?", help:"Considere ideias passando depressa, dificuldade de interromper a fala ou sensação de mente ligada demais.", options:["Não","Levemente","De forma perceptível","De forma intensa"], scores:[0,1,2,3], kind:"activation" },
    { id:"impulse", title:"Você agiu com mais impulsividade ou assumiu riscos incomuns?", help:"Por exemplo: gastos, discussões, direção, sexo, uso de substâncias ou decisões repentinas.", options:["Não","Pouco","Algumas vezes","Muitas vezes ou com consequências"], scores:[0,1,2,3], kind:"activation" },
    { id:"impact", context:"PARA FINALIZAR", title:"Quanto essas mudanças têm atrapalhado sua vida?", help:"Considere trabalho, estudos, relações, cuidados pessoais e responsabilidades.", options:["Nada","Um pouco","Bastante","Extremamente"], scores:[0,1,2,3], kind:"impact" }
  ];

  const state = { index:0, answers:{}, safetyShown:false, resumeMode:"resume" };
  const $ = (selector) => document.querySelector(selector);
  const views = { home:$("#home-view"), quiz:$("#quiz-view"), result:$("#result-view") };

  function frequency(){ return ["Nenhum dia","Vários dias","Mais da metade dos dias","Quase todos os dias"]; }
  function showView(name){ Object.entries(views).forEach(([key,node]) => node.hidden = key !== name); window.scrollTo({top:0,behavior:"smooth"}); }
  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify({index:state.index,answers:state.answers,savedAt:Date.now()})); $("#save-status").textContent="Progresso salvo neste dispositivo"; }
  function clear(){ localStorage.removeItem(STORAGE_KEY); state.index=0; state.answers={}; state.safetyShown=false; }
  function saved(){ try { const data=JSON.parse(localStorage.getItem(STORAGE_KEY)); return data && data.answers && Object.keys(data.answers).length ? data : null; } catch { return null; } }

  function startFresh(){ clear(); showView("quiz"); renderQuestion(); }
  function resume(data){ state.answers=data.answers||{}; state.index=Math.min(data.index||0,questions.length-1); showView("quiz"); renderQuestion(); }

  function renderQuestion(){
    const q=questions[state.index]; const value=state.answers[q.id];
    $("#progress-copy").textContent=`${state.index+1} de ${questions.length}`;
    $("#progress").setAttribute("aria-valuenow",String(state.index+1));
    $("#progress span").style.width=`${((state.index+1)/questions.length)*100}%`;
    $("#question-number").textContent=String(state.index+1).padStart(2,"0");
    $("#question-context").textContent=q.context||"NAS ÚLTIMAS DUAS SEMANAS";
    $("#question-title").textContent=q.title;
    $("#question-help").textContent=q.help;
    $("#answers").innerHTML=q.options.map((option,i)=>`<button type="button" class="answer${value===i?" selected":""}" role="radio" aria-checked="${value===i}" data-answer="${i}"><span class="answer-index">${String.fromCharCode(65+i)}</span><span class="answer-text"><strong>${option}</strong></span><span class="answer-radio" aria-hidden="true"></span></button>`).join("");
    const note=$("#answer-note"); note.hidden=!q.safety; note.textContent=q.safety?"Se você estiver em risco imediato, não espere o resultado: ligue 192, vá a um pronto atendimento ou peça ajuda a alguém próximo.":"";
    $("#previous-btn").disabled=state.index===0; $("#previous-btn").style.visibility=state.index===0?"hidden":"visible";
    $("#next-btn").disabled=value===undefined; $("#next-btn").innerHTML=state.index===questions.length-1?"Ver meu resultado <span>→</span>":"Continuar <span>→</span>";
    $("#question-title").focus({preventScroll:true});
  }

  function selectAnswer(index){
    const q=questions[state.index]; state.answers[q.id]=index; save(); renderQuestion();
    if(q.safety && index>0 && !state.safetyShown){ state.safetyShown=true; openModal("safety-modal"); }
  }

  function next(){ if(state.answers[questions[state.index].id]===undefined)return; if(state.index<questions.length-1){state.index++;save();renderQuestion();}else{renderResult();} }
  function previous(){ if(state.index>0){state.index--;save();renderQuestion();} }

  function renderResult(){
    const lowQuestions=questions.filter(q=>q.kind==="low");
    const lowScore=lowQuestions.reduce((sum,q)=>sum+(q.scores[state.answers[q.id]]||0),0);
    const activation=questions.filter(q=>q.kind==="activation").reduce((sum,q)=>sum+(q.scores[state.answers[q.id]]||0),0);
    const impact=state.answers.impact||0; const urgent=(state.answers.safety||0)>0;
    const levels=[
      {max:4,label:"Baixa",title:"Poucos sinais neste momento",text:"Suas respostas mostram poucos sinais persistentes de baixo humor. Ainda assim, observe mudanças e cuide da rotina."},
      {max:9,label:"Leve",title:"Alguns sinais merecem atenção",text:"Há sinais leves que podem se beneficiar de acompanhamento, rotina estável e uma conversa com alguém de confiança."},
      {max:14,label:"Moderada",title:"Vale buscar uma avaliação profissional",text:"Os sinais aparecem com frequência suficiente para justificar uma conversa com psicólogo ou médico, especialmente se interferem na rotina."},
      {max:19,label:"Alta",title:"Procure apoio profissional em breve",text:"As respostas indicam sofrimento relevante. Organize uma avaliação profissional e compartilhe este resultado com alguém de confiança."},
      {max:27,label:"Muito alta",title:"Priorize cuidado profissional",text:"Os sinais relatados são intensos. Procure avaliação de saúde mental o quanto antes; se não estiver seguro, busque atendimento imediato."}
    ];
    const level=levels.find(item=>lowScore<=item.max);
    $("#score").textContent=String(lowScore); $("#score-label").textContent=level.label; $("#score-fill").style.width=`${Math.max(5,(lowScore/27)*100)}%`; $("#score-text").textContent=level.text;
    $("#insight-title").textContent=level.title;
    $("#insight-text").textContent=impact>=2?"Você relatou que as mudanças estão afetando áreas importantes da vida. O impacto funcional é um motivo adicional para procurar orientação profissional.":"O impacto relatado parece limitado, mas duração, intensidade e mudança do seu padrão pessoal continuam sendo importantes.";
    $("#activation-card").hidden=activation<4;
    $("#urgent-card").hidden=!urgent;
    $("#result-date").textContent=new Intl.DateTimeFormat("pt-BR",{dateStyle:"long"}).format(new Date());
    const recs=[];
    if(urgent) recs.push(["Agora","Priorize segurança","Não fique sozinho. Ligue 192 em risco imediato ou 188 para apoio emocional."]);
    recs.push(["1","Registre o padrão","Anote sono, energia, irritabilidade, gatilhos e duração das oscilações por alguns dias."]);
    if(lowScore>=10||activation>=4||impact>=2) recs.push(["2","Marque uma conversa","Procure psicólogo, psiquiatra ou médico e leve este resumo para contextualizar os sinais."]); else recs.push(["2","Proteja sua base","Mantenha horários de sono, alimentação, movimento leve e contato social previsíveis."]);
    recs.push(["3","Reavalie com contexto","Observe se os sinais persistem, pioram ou surgem após remédios, substâncias ou mudanças físicas."]);
    $("#recommendations").innerHTML=recs.map(([n,t,p])=>`<div class="recommendation"><span>${n}</span><strong>${t}</strong><p>${p}</p></div>`).join("");
    localStorage.removeItem(STORAGE_KEY); showView("result"); $("#result-title").focus({preventScroll:true});
  }

  let lastFocus=null;
  function openModal(id){ const modal=document.getElementById(id); if(!modal)return; lastFocus=document.activeElement; modal.hidden=false; document.body.style.overflow="hidden"; const focusable=modal.querySelector("button,a"); if(focusable)focusable.focus(); }
  function closeModal(id){ const modal=document.getElementById(id); if(!modal)return; modal.hidden=true; document.body.style.overflow=""; if(lastFocus&&lastFocus.focus)lastFocus.focus(); }

  $("#start-btn").addEventListener("click",startFresh);
  $("#answers").addEventListener("click",e=>{const button=e.target.closest("[data-answer]");if(button)selectAnswer(Number(button.dataset.answer));});
  $("#next-btn").addEventListener("click",next); $("#previous-btn").addEventListener("click",previous);
  $("#save-exit-btn").addEventListener("click",()=>{save();showView("home");});
  $("#print-btn").addEventListener("click",()=>window.print());
  $("#restart-btn").addEventListener("click",()=>{if(confirm("Apagar o resultado e começar novamente?"))startFresh();});
  document.querySelectorAll("[data-go-home]").forEach(el=>el.addEventListener("click",()=>showView("home")));
  document.querySelectorAll("[data-open]").forEach(el=>el.addEventListener("click",()=>openModal(el.dataset.open)));
  document.querySelectorAll("[data-close]").forEach(el=>el.addEventListener("click",()=>closeModal(el.dataset.close)));
  document.querySelectorAll(".modal-layer").forEach(layer=>layer.addEventListener("click",e=>{if(e.target===layer&&layer.id!=="safety-modal")closeModal(layer.id);}));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){const open=document.querySelector(".modal-layer:not([hidden])");if(open&&open.id!=="safety-modal")closeModal(open.id);}});
  $("#resume-option").addEventListener("click",()=>{state.resumeMode="resume";$("#resume-option").classList.add("selected");$("#new-option").classList.remove("selected");});
  $("#new-option").addEventListener("click",()=>{state.resumeMode="new";$("#new-option").classList.add("selected");$("#resume-option").classList.remove("selected");});
  $("#resume-confirm").addEventListener("click",()=>{const data=saved();closeModal("resume-modal");state.resumeMode==="new"||!data?startFresh():resume(data);});
  $("#year").textContent=String(new Date().getFullYear());
  const existing=saved(); if(existing) setTimeout(()=>openModal("resume-modal"),350);
})();
