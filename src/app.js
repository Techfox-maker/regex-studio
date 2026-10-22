import { VERSION } from './version.mjs';
import { RULE_TYPES, REPETITIONS, buildPattern, explainRule, getTemplate, ruleSource } from './engine.mjs';
import { CATALOG } from './catalog.mjs';
import { LANGUAGES, formatRegex } from './exporters.mjs';
import { SHELL_LANGUAGES, formatShellRegex } from './shell-exporters.mjs';
import { getCatalogChecks } from './catalog-checks.mjs';
import { parseTemplate } from './template-parser.mjs';
import { locateInvalidCharacters } from './character-diagnostics.mjs';
import { SYNTAX_SECTIONS, SYNTAX_SOURCES } from './syntax.mjs';
import { CATALOG_EN_TEXT } from './catalog-en.mjs';
import { SYNTAX_EN_SECTIONS } from './syntax-en.mjs';
import { translateMessage } from './messages-en.mjs';
import { localizePage } from './localize.mjs';

const $ = selector => document.querySelector(selector);
const storageKey = 'regex-studio-v1';
const typeMap = new Map(RULE_TYPES.map(type => [type.id, type]));
const catalogMap = new Map(CATALOG.map(item=>[item.id,item]));
const outputLanguages=[...LANGUAGES,...SHELL_LANGUAGES];
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const clone = value => JSON.parse(JSON.stringify(value));
let state = {...getTemplate('username'), mode:'lines', template:'username', editor:'rules', rawSource:'', catalogId:'', sourceEdited:false, uiLanguage:'en'};
let history = [];
let currentSource = '';
let currentValid = false;
let matchWorker;
let testTimer;
let toastTimer;
let inputCheckpoint = false;
let currentExport;
let ruleDrag;
let diagnosticPlan={checks:[],fallback:''};
const t = text => translateMessage(String(text??''),state.uiLanguage);
const ui = (zh,en) => state.uiLanguage==='en'?en:zh;
function localCatalog(item){return item&&state.uiLanguage==='en'?{...item,...CATALOG_EN_TEXT[item.id],source:{...item.source,title:CATALOG_EN_TEXT[item.id]?.sourceTitle||item.source.title}}:item;}

try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && Array.isArray(saved.rules) && saved.rules.length <= 40 && saved.rules.every(rule => typeMap.has(rule.type))) {
    buildPattern(saved.rules, saved);
    state = {...state,...saved,flags:[...'gims'].filter(flag => String(saved.flags).includes(flag)).join('')+'u'};
    state.sample = String(state.sample || '').slice(0,10000);
    state.mode = state.mode === 'text' ? 'text' : 'lines';
    state.editor = state.editor === 'source' ? 'source' : 'rules';
    state.rawSource = String(state.rawSource || '').slice(0,5000);
    state.language=outputLanguages.some(language=>language.id===state.language)?state.language:'javascript';
    state.uiLanguage=state.uiLanguage==='zh'?'zh':'en';
  }
} catch {}

if(state.editor==='source'&&state.catalogId&&!state.sourceEdited&&catalogMap.has(state.catalogId)){
  Object.assign(state,parseTemplate(state.rawSource||catalogMap.get(state.catalogId).pattern,state.flags));
  state.editor='rules';
}

function toast(message) {
  $('#toast').textContent = t(message);
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'),2400);
}
function remember() {
  history.push(clone(state));
  if(history.length > 35) history.shift();
  $('#undo-button').disabled = false;
}
function save() {
  try { localStorage.setItem(storageKey,JSON.stringify(state)); $('#save-status').textContent=t('规则自动保存在当前浏览器'); }
  catch { $('#save-status').textContent=t('当前浏览器无法保存，离开前请复制表达式'); }
}
function ruleCard(rule,index) {
  const type=typeMap.get(rule.type);
  const quantities=['range','exact','atLeast'].includes(rule.repeat);
  let preview='';try{preview=ruleSource(rule);}catch{preview=t('请完善规则');}
  const number=index+1;
  const label=ui('第 '+number+' 条规则','Rule '+number);
  const set=rule.type==='oneOf'||rule.type==='notOneOf';
  const ranges=set&&rule.charMode==='ranges';
  const description=t(ranges?'合并多个字符范围；各段用逗号分隔，如 A-Z,a-c,0-7':type.description);
  const typeSelect='<div class="select-wrap type-wrap"><select class="rule-type" data-field="type" aria-label="'+escapeHTML(label+' '+t('类型'))+'">'+RULE_TYPES.map(item=>'<option value="'+item.id+'" '+(item.id===rule.type?'selected':'')+'>'+escapeHTML(t(item.label))+'</option>').join('')+'</select></div>';
  const selectedRanges=String(rule.rangeText||'').split(/[,，]/).map(value=>value.trim());
  let valueInput='';
  if(set){
    valueInput='<div class="character-editor"><div class="character-controls"><div class="select-wrap character-mode-wrap"><select data-field="charMode" aria-label="'+escapeHTML(label+' '+t('字符输入方式'))+'"><option value="literal" '+(!ranges?'selected':'')+'>'+t('字符')+'</option><option value="ranges" '+(ranges?'selected':'')+'>'+t('范围')+'</option></select></div><input class="rule-value" data-field="'+(ranges?'rangeText':'value')+'" value="'+escapeHTML(ranges?rule.rangeText||'':rule.value||'')+'" maxlength="1000" aria-label="'+escapeHTML(label+' '+t(ranges?'字符范围':type.label))+'" placeholder="'+escapeHTML(ranges?'A-Z,a-c,0-7':t('填写字符'))+'"></div><div class="range-presets" aria-label="'+t('快捷选择字符范围')+'">'+['A-Z','a-z','0-9'].map(range=>'<button type="button" data-range="'+range+'" aria-pressed="'+(ranges&&selectedRanges.includes(range))+'" class="range-preset '+(ranges&&selectedRanges.includes(range)?'selected':'')+'" title="'+escapeHTML(ui('添加或移除 '+range+' 范围','Toggle the '+range+' range'))+'">'+range+'</button>').join('')+'<span>'+t('可同时选择 · 自定义如 a-c,0-7')+'</span></div></div>';
  }else if(type.needsValue){
    valueInput='<input class="rule-value" data-field="value" value="'+escapeHTML(rule.value)+'" maxlength="'+(rule.type==='raw'?5000:500)+'" aria-label="'+escapeHTML(label+' '+t(type.label))+'" placeholder="'+t(rule.type==='raw'?'正则片段':'匹配文本')+'">';
  }
  const quantityInputs=quantities?'<div class="quantity"><input type="number" min="0" max="10000" step="1" data-field="min" value="'+escapeHTML(rule.min)+'" aria-label="'+escapeHTML(label+' '+t(rule.repeat==='exact'?'重复次数':'最少次数'))+'" title="'+t(rule.repeat==='exact'?'重复次数':'最少次数')+'">'+(rule.repeat==='range'?'<span>–</span><input type="number" min="0" max="10000" step="1" data-field="max" value="'+escapeHTML(rule.max)+'" aria-label="'+escapeHTML(label+' '+t('最多次数'))+'" title="'+t('最多次数')+'">':'')+'<span>'+t('次')+'</span></div>':'';
  return '<div class="rule-card'+(type.needsValue?' has-value':'')+(set?' has-character-editor':'')+'" data-id="'+escapeHTML(rule.id)+'"><div class="rule-main"><button class="drag-handle" type="button" aria-label="'+escapeHTML(ui('拖动第 '+number+' 条规则','Drag rule '+number))+'" title="'+t('拖动调整顺序')+'"><span aria-hidden="true">⠿</span><span class="rule-index sr-only">'+String(number).padStart(2,'0')+'</span></button><div class="rule-match'+(type.needsValue?' with-value':'')+'">'+typeSelect+valueInput+'</div><div class="select-wrap repeat-wrap"><select data-field="repeat" aria-label="'+escapeHTML(label+' '+t('重复次数'))+'">'+REPETITIONS.map(item=>'<option value="'+item.id+'" '+(item.id===rule.repeat?'selected':'')+'>'+t(item.label)+'</option>').join('')+'</select></div>'+quantityInputs+'<div class="rule-controls"><button class="icon-button" data-action="up" title="'+t('向上移动')+'" aria-label="'+escapeHTML(ui('上移第 '+number+' 条规则','Move rule '+number+' up'))+'" '+(index===0?'disabled':'')+'>↑</button><button class="icon-button" data-action="down" title="'+t('向下移动')+'" aria-label="'+escapeHTML(ui('下移第 '+number+' 条规则','Move rule '+number+' down'))+'">↓</button><button class="icon-button delete-rule" data-action="delete" title="'+t('删除规则')+'" aria-label="'+escapeHTML(ui('删除第 '+number+' 条规则','Delete rule '+number))+'">×</button></div></div><div class="rule-description"><span class="rule-description-text" title="'+escapeHTML(description)+'">'+escapeHTML(description)+'</span><code class="rule-preview" title="'+escapeHTML(preview)+'">'+escapeHTML(preview)+'</code>'+(rule.repeat!=='once'?'<label class="lazy-label" title="'+t('满足条件时尽可能少匹配字符')+'"><input type="checkbox" data-field="lazy" '+(rule.lazy?'checked':'')+'>'+t('尽量少匹配')+'</label>':'')+'</div></div>';
}
function renderRules() {
  const isSource=state.editor==='source';
  $('#visual-editor').hidden=isSource;
  $('#source-editor').hidden=!isSource;
  $('#builder-title').textContent=t(isSource?'使用常见表达式':'搭建匹配规则');
  document.querySelectorAll('[data-editor]').forEach(button=>{const selected=button.dataset.editor===state.editor;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',selected);});
  const selected=localCatalog(catalogMap.get(state.catalogId));
  $('#template-origin').hidden=!selected||isSource;
  $('#template-origin').innerHTML=selected?`<div><strong>${t('模板起点：')}${escapeHTML(selected.name)}</strong><span>${t(state.sourceEdited?'已修改 · 可继续调整':'已自动拆成可视化规则')}</span></div><p>${escapeHTML(selected.note||selected.description)}</p><a href="${escapeHTML(selected.source.url)}" target="_blank" rel="noopener noreferrer">${t('参考来源')} ↗</a>`:'';
  $('#source-input').value=state.rawSource||'';
  $('#source-category').textContent=selected?selected.category:t('自定义表达式');
  $('#source-title').textContent=selected?selected.name+(state.sourceEdited?t(' · 已修改'):''):t('编辑正则源码');
  $('#source-description').textContent=selected?selected.description:t('在下方填写不带两侧斜杠和修饰符的表达式。');
  $('#source-note').textContent=selected?selected.note:'';
  $('#source-link').hidden=!selected;
  if(selected){$('#source-link').href=selected.source.url;$('#source-link').textContent=t('参考：')+selected.source.title+' ↗';}
  $('#rules-list').innerHTML=state.rules.length?state.rules.map(ruleCard).join(''):`<div class="empty-state"><strong>${t('从第一条规则开始')}</strong>${t('选择数字、字母或指定文本，搭建你的匹配逻辑。')}</div>`;
  $('#rules-list').lastElementChild?.querySelector('[data-action="down"]')?.setAttribute('disabled','');
  $('#rules-list').querySelectorAll('.lazy-label').forEach(label=>{
    label.title=t('先尝试允许范围内最少的次数；若后续规则无法匹配，再增加次数重试。点击旁边问号查看例子。');
    const info=document.createElement('button');info.type='button';info.className='lazy-info';info.dataset.lazyHelp='';info.textContent='?';info.setAttribute('aria-label',t('查看尽量少匹配的说明和例子'));label.after(info);
  });
  $('#add-rule').disabled=state.rules.length>=40;
  $('#anchor-start').checked=!!state.start;
  $('#anchor-end').checked=!!state.end;
  $('[data-flag="i"]').checked=state.flags.includes('i');
  document.querySelectorAll('[data-flag]').forEach(input=>input.checked=state.flags.includes(input.dataset.flag));
  document.querySelectorAll('[data-template]').forEach(button=>button.classList.toggle('active',button.dataset.template===state.template));
  renderLibrary();
}
function renderLibrary() {
  const query=$('#library-search').value.trim().toLocaleLowerCase();
  const category=$('#library-category').value;
  const matches=CATALOG.filter(item=>{const local=localCatalog(item);return (category==='all'||item.category===category)&&(!query||[item.name,item.description,item.pattern,item.category,local.name,local.description,local.category].join(' ').toLocaleLowerCase().includes(query));}).map(localCatalog);
  $('#clear-search').hidden=!query;
  $('#library-count').textContent=ui(`显示 ${matches.length} / ${CATALOG.length} 条表达式`,`Showing ${matches.length} / ${CATALOG.length} patterns`);
  let previous='';
  $('#library-list').innerHTML=matches.length?matches.map(item=>{let heading='';if(previous!==item.category){previous=item.category;heading=`<div class="library-group">${escapeHTML(item.category)}</div>`;}return heading+`<button class="library-item ${state.catalogId===item.id?'active':''}" data-catalog="${escapeHTML(item.id)}" aria-pressed="${state.catalogId===item.id}"><span class="library-item-name">${escapeHTML(item.name)}<span aria-hidden="true">↗</span></span><span class="library-item-description">${escapeHTML(item.description)}</span><code>${escapeHTML(item.pattern)}</code></button>`;}).join(''):`<div class="library-empty">${t('没有找到相关表达式')}<br><button id="reset-library">${t('清除搜索与分类')}</button></div>`;
}
function renderLocale(){
  localizePage(state.uiLanguage);
  const category=$('#library-category').value||'all';
  $('#library-category').innerHTML=`<option value="all">${t('全部分类')}</option>`+[...new Set(CATALOG.map(item=>item.category))].map(value=>{
    const entry=localCatalog(CATALOG.find(item=>item.category===value));
    return `<option value="${escapeHTML(value)}">${escapeHTML(entry.category)}</option>`;
  }).join('');
  $('#library-category').value=category;
  $('#output-language').innerHTML=outputLanguages.map(language=>`<option value="${language.id}">${escapeHTML(t(language.label))}</option>`).join('');
  $('.match-legend').innerHTML=`<span class="matched-legend">${t('绿色：已匹配')}</span><span class="unmatched-legend">${t('红色：已定位的不匹配字符')}</span>`;
  const sections=state.uiLanguage==='en'?SYNTAX_EN_SECTIONS:SYNTAX_SECTIONS;
  $('#syntax-sections').innerHTML=sections.map(section=>`<section class="syntax-section"><h3>${escapeHTML(section.title)}</h3>${section.items.map(item=>`<div class="syntax-entry"><code>${escapeHTML(item.syntax)}</code><span>${escapeHTML(item.description)}</span><div class="syntax-example">${escapeHTML(item.example)}</div></div>`).join('')}</section>`).join('');
  $('#syntax-sources').innerHTML=t('参考来源：')+SYNTAX_SOURCES.map(source=>`<a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t(source.title))} ↗</a>`).join('');
}
function setUiLanguage(language){
  if(!['zh','en'].includes(language)||state.uiLanguage===language)return;
  state.uiLanguage=language;
  renderLocale();renderRules();update();
}
function highlightSource(source) {
  const tokens=source.match(/\\p\{[^}]+\}|\[(?:\\.|[^\]\\])*\]|\\.|\{\d+(?:,\d*)?\}|[+*?]|[$^]|./gu)||[];
  return tokens.map(token=>`<span class="${token.startsWith('[')||token.startsWith('\\')?'token-class':/^[+*?{]/.test(token)?'token-quantifier':/^[\^$]/.test(token)?'token-anchor':'token-literal'}">${escapeHTML(token)}</span>`).join('');
}
function update() {
  state.language=state.language||'javascript';
  save();
  currentValid=false;
  $('#flags-output').textContent=state.flags;
  $('#character-count').textContent=ui(`${state.sample.length.toLocaleString()} 字符`,`${state.sample.length.toLocaleString('en')} characters`);
  document.querySelectorAll('[data-mode]').forEach(button=>{const selected=button.dataset.mode===state.mode;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',selected);});
  $('#test-results').classList.toggle('is-line-mode',state.mode==='lines');
  let error='';
  try {
    currentSource=state.editor==='source'?state.rawSource:buildPattern(state.rules,{start:state.start,end:state.end,multiline:state.flags.includes('m')});
    if(currentSource) currentSource=new RegExp(currentSource,state.flags).source;
    currentValid=!!currentSource;
    $('#pattern-output').innerHTML=currentSource?highlightSource(currentSource):`<span style="font-size:13px;color:#8b94b4">${t('添加规则，生成你的表达式')}</span>`;
    $('#expression-status').innerHTML=currentValid?`<span>✓</span> ${t('表达式已就绪')}`:t('等待添加第一条规则');
  } catch(caught) {
    error=caught.message;
    currentSource='';
    $('#pattern-output').textContent=t('请完善左侧规则');
    $('#expression-status').textContent=t(state.editor==='source'?'表达式语法有误，请检查源码':error);
    if(state.editor==='source')error='表达式语法有误，请检查括号、字符集合或转义符。';
  }
  $('#copy-button').disabled=!currentValid;
  currentExport=currentValid?(SHELL_LANGUAGES.some(language=>language.id===state.language)?formatShellRegex(currentSource,state.flags,state.language):formatRegex(currentSource,state.flags,state.language)):undefined;
  if(currentExport)currentExport={...currentExport,display:translateMessage(currentExport.display,'en'),copy:translateMessage(currentExport.copy,'en')};
  const isJavaScript=state.language==='javascript';
  $('#output-language').value=state.language;
  document.querySelectorAll('.code-slash').forEach(item=>item.hidden=!isJavaScript);
  $('#flags-output').hidden=!isJavaScript;
  $('.code-display').classList.toggle('language-code',!isJavaScript);
  if(currentExport&&!isJavaScript)$('#pattern-output').textContent=currentExport.error?t('当前表达式无法直接导出'):currentExport.display;
  $('#export-notice').textContent=currentExport?t(currentExport.error||currentExport.notice||''):'';
  $('#export-notice').classList.toggle('error',!!currentExport?.error);
  $('#copy-button').disabled=!currentValid||!!currentExport?.error;
  diagnosticPlan={checks:[],fallback:'此字符串不符合完整表达式。手写源码无法可靠自动拆分，请检查分组、数量和边界。'};
  if(currentValid&&state.editor!=='source'){
    let prefix=state.start?'^':'';
    diagnosticPlan.checks=state.rules.map((rule,index)=>{prefix+=ruleSource(rule);return {pattern:prefix,message:`第 ${index+1} 条未通过：${explainRule(rule)}${index===0&&state.start?'；要求从字符串开头匹配':''}`};});
    diagnosticPlan.fallback=state.end?'前面的规则均可匹配，但结尾仍有多余内容；请检查结尾限制和最后一条的重复次数。':'不符合完整的规则组合，请检查字符顺序。';
  }else if(currentValid&&state.catalogId&&!state.sourceEdited){
    const entry=localCatalog(catalogMap.get(state.catalogId));
    diagnosticPlan.checks=getCatalogChecks(state.catalogId);
    diagnosticPlan.fallback=entry?`未通过完整格式要求：${entry.description}${entry.note?'。'+entry.note:''}`:diagnosticPlan.fallback;
  }
  if(currentValid){
    const parts=state.editor==='rules'?{rules:state.rules,start:state.start,end:state.end}:parseTemplate(currentSource,state.flags);
    // The parser preserves semantics while changing harmless group/class spelling.
    const diagnosticSource=buildPattern(parts.rules,{...parts,multiline:state.flags.includes('m')});
    diagnosticPlan.characters={...parts,flags:state.flags,source:diagnosticSource};
  }
  const parts=[];
  if(state.editor==='source'){
    const entry=localCatalog(catalogMap.get(state.catalogId));
    if(entry){parts.push(entry.description);if(entry.note)parts.push(entry.note);if(state.sourceEdited)parts.push('当前源码已修改，请以实际测试结果为准');}
    else parts.push('源码模式：直接编辑表达式，并在测试区检查匹配结果。');
  }else{
    if(state.start)parts.push('从开头');
    state.rules.forEach(rule=>{try{parts.push(explainRule(rule));}catch{parts.push('请完善此条规则');}});
    if(state.end)parts.push(state.flags.includes('m')?'到行尾结束':'到文本结尾结束');
  }
  $('#explanation').innerHTML=parts.length?parts.map((part,index)=>(index?'<span class="explain-arrow" aria-hidden="true">→</span>':'')+`<span class="explain-item">${escapeHTML(t(part))}</span>`).join(''):t('添加规则后，这里会显示每一步的含义。');
  clearTimeout(testTimer);
  if(matchWorker){matchWorker.terminate();matchWorker=undefined;}
  if(!currentValid||!state.sample){
    $('#test-results').innerHTML='';
    $('#match-summary').textContent=t(error?'表达式尚未完成':!currentValid?'添加规则或选择左侧表达式':'输入文本开始测试');
    showMessage(error||'');
    return;
  }
  showMessage('');
  testTimer=setTimeout(testMatch,130);
}
function showMessage(message,error=false) {
  $('#test-message').textContent=t(message);
  $('#test-message').hidden=!message;
  $('#test-message').classList.toggle('error',error);
}
function highlightMatches(text,matches,examinedEnd=text.length,markGaps=true){
  if(!text)return `<span class="muted">${t('（空行）')}</span>`;
  let position=0,html='';
  for(const match of matches){
    if(match.start>position){const gap=escapeHTML(text.slice(position,match.start));html+=markGaps?`<span class="unmatched-text">${gap}</span>`:gap;}
    html+=`<mark>${match.value?escapeHTML(match.value):'∅'}</mark>`;
    position=match.start+match.value.length;
  }
  const boundary=Math.max(position,Math.min(text.length,examinedEnd));
  if(position<boundary){const gap=escapeHTML(text.slice(position,boundary));html+=markGaps?`<span class="unmatched-text">${gap}</span>`:gap;}
  if(boundary<text.length)html+=escapeHTML(text.slice(boundary));
  return html;
}
function highlightInvalidCharacters(text,ranges){
  if(!text)return `<span class="muted">${t('（空行）')}</span>`;
  let position=0,html='';
  for(const range of ranges){
    html+=escapeHTML(text.slice(position,range.start));
    html+=`<span class="unmatched-text">${escapeHTML(text.slice(range.start,range.end))}</span>`;
    position=range.end;
  }
  return html+escapeHTML(text.slice(position));
}
function workerMain() {
  self.onmessage=event=>{
    const {source,flags,text,mode,diagnostics}=event.data;
    try{
      const diagnosticChecks=(diagnostics?.checks||[]).map(check=>{try{return {...check,regex:new RegExp(check.pattern,flags.replace('g',''))};}catch{return null;}}).filter(Boolean);
      const requiredLiterals=(diagnostics?.characters?.rules||[]).flatMap((rule,index)=>{
        const repeat=rule.repeat||'once';
        const required=repeat==='once'||repeat==='oneOrMore'||(['exact','range','atLeast'].includes(repeat)&&Number(rule.min)>0);
        if(rule.type!=='literal'||!rule.value||!required)return [];
        const pattern=rule.value.replace(/[.*+?^${}()|[\]\\/]/g,'\\$&');
        return [{index,value:rule.value,regex:new RegExp(pattern,flags.replace(/[gmyd]/g,''))}];
      });
      const failureReason=(value,invalid)=>{
        if(invalid?.missing&&invalid.missingLiterals?.length){
          const missingText=invalid.missingLiterals.join('');
          const missing=requiredLiterals.find(literal=>!literal.regex.test(value)&&invalid.missingLiterals.some(char=>literal.value.includes(char)));
          return `${missing?`第 ${missing.index+1} 条未通过：`:''}缺少指定内容「${missingText}」${invalid.ranges.length?'，同时存在标红的不符字符':''}`;
        }
        for(const check of diagnosticChecks){if(!check.regex.test(value))return check.message;}
        if(invalid?.missing&&!invalid.ranges.length)return '缺少规则要求的字符或内容；已有字符没有定位到错误。';
        return diagnostics?.fallback||'未符合完整表达式。';
      };
      if(mode==='lines'){
        const regex=new RegExp(source,flags.replace('g',''));
        const lines=text.split(/\r\n|\n|\r/).map((value,index)=>{const match=regex.exec(value);const invalid=match?{ranges:[],precise:true}:diagnostics?.characters?locateInvalidCharacters(value,diagnostics.characters):{ranges:[],precise:false};return {value,index,matched:!!match,start:match?.index||0,length:match?.[0].length||0,reason:match?'':failureReason(value,invalid),invalidRanges:invalid.ranges,precise:invalid.precise};});
        self.postMessage({mode,lines,count:lines.filter(line=>line.matched).length,total:lines.length});
      }else{
        const regex=new RegExp(source,flags);
        const matches=[];let match;
        while((match=regex.exec(text))!==null){matches.push({start:match.index,value:match[0]});if(!regex.global||matches.length>=500)break;if(match[0]===''){const point=text.codePointAt(regex.lastIndex);regex.lastIndex+=point>0xffff?2:1;}}
        const invalid=matches.length?{ranges:[],precise:true}:diagnostics?.characters?locateInvalidCharacters(text,diagnostics.characters):{ranges:[],precise:false};
        self.postMessage({mode,matches,count:matches.length,limited:matches.length>=500,invalidRanges:invalid.ranges,precise:invalid.precise});
      }
    }catch(error){self.postMessage({error:error.message});}
  };
}
function testMatch() {
  showMessage('');
  $('#match-summary').textContent=t('正在测试…');
  const url=URL.createObjectURL(new Blob([`const locateInvalidCharacters=${locateInvalidCharacters.toString()};\n(${workerMain.toString()})()`],{type:'text/javascript'}));
  try { matchWorker=new Worker(url); } catch { URL.revokeObjectURL(url);showMessage('当前浏览器无法启动文本测试，请使用现代浏览器。',true);$('#match-summary').textContent=t('测试不可用');return; }
  URL.revokeObjectURL(url);
  const ownedWorker=matchWorker;
  const timeout=setTimeout(()=>{if(matchWorker===ownedWorker){ownedWorker.terminate();matchWorker=undefined;$('#match-summary').textContent=t('测试已暂停');$('#test-results').innerHTML='';showMessage('匹配耗时过长。请缩短测试文本，或减少连续的重复规则。',true);}},700);
  ownedWorker.onmessage=event=>{
    clearTimeout(timeout);
    if(matchWorker!==ownedWorker)return;
    ownedWorker.terminate();matchWorker=undefined;
    const data=event.data;
    if(data.error){showMessage(data.error,true);$('#match-summary').textContent=t('无法完成测试');return;}
    if(data.mode==='lines'){
      $('#match-summary').innerHTML=`<strong>${data.count}</strong> / ${data.total} ${ui('行匹配','lines matched')}`;
      $('#test-results').innerHTML=data.lines.map(line=>`<div class="match-row ${line.matched?'success':'failed'}"><span class="match-icon">${line.matched?'✓':'×'}</span><div class="match-content"><code title="${escapeHTML(line.value)}">${line.matched?highlightMatches(line.value,[{start:line.start,value:line.value.slice(line.start,line.start+line.length)}],line.value.length,false):highlightInvalidCharacters(line.value,line.invalidRanges||[])}</code>${line.reason?`<div class="failure-reason" title="${escapeHTML(t(line.reason))}">${escapeHTML(t(line.reason))}</div>`:''}</div><span class="line-number">${String(line.index+1).padStart(2,'0')}</span></div>`).join('');
      if(data.lines.some(line=>!line.matched&&!line.precise))showMessage('部分内容暂不能精确定位字符；无法确定的字符保留原色，请参考失败原因。');
    }else{
      $('#match-summary').innerHTML=`${ui('找到','Found')} <strong>${data.count}${data.limited?'+':''}</strong> ${ui('处匹配','matches')}`;
      const last=data.matches.at(-1);
      const html=data.count?highlightMatches(state.sample,data.matches,data.limited||!state.flags.includes('g')?last.start+last.value.length:state.sample.length):highlightInvalidCharacters(state.sample,data.invalidRanges||[]);
      $('#test-results').innerHTML=`<div class="match-row ${data.count?'success':''}"><code>${html}</code></div>`;
      if(data.limited)showMessage('匹配较多，最多展示 500 处。');
      else if(!data.count)showMessage('没有找到匹配。切换到“逐行验证”，可以查看每行未通过的规则说明。');
      else if(!state.flags.includes('g'))showMessage('当前展示第一处匹配。开启 g 可查找所有匹配。');
    }
  };
  ownedWorker.onerror=()=>{clearTimeout(timeout);ownedWorker.terminate();if(matchWorker===ownedWorker){matchWorker=undefined;showMessage('文本测试未能运行，请调整规则后重试。',true);$('#match-summary').textContent=t('测试未完成');}};
  ownedWorker.postMessage({source:currentSource,flags:state.flags,text:state.sample,mode:state.mode,diagnostics:diagnosticPlan});
}

$('#add-rule').addEventListener('click',()=>{
  if(state.rules.length>=40)return;
  remember();state.template='';
  state.rules.push({id:crypto.randomUUID?crypto.randomUUID():`rule-${Date.now()}`,type:'digit',value:'',repeat:'once',min:1,max:5,lazy:false});
  renderRules();update();
  $('#rules-list').lastElementChild?.querySelector('select')?.focus({preventScroll:true});
});
$('#rules-list').addEventListener('click',event=>{
  if(event.target.closest('[data-lazy-help]')){
    const help=$('#lazy-explainer');help.open=true;help.querySelector('summary').focus({preventScroll:true});help.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});return;
  }
  const preset=event.target.closest('[data-range]');
  if(preset){
    const rule=state.rules.find(rule=>rule.id===preset.closest('[data-id]').dataset.id);
    remember();toggleCharacterRange(rule,preset.dataset.range);state.template='';state.sourceEdited=true;renderRules();update();return;
  }
  const button=event.target.closest('[data-action]');if(!button)return;
  const index=state.rules.findIndex(rule=>rule.id===button.closest('[data-id]').dataset.id);
  remember();state.template='';
  if(button.dataset.action==='delete')state.rules.splice(index,1);
  else {const target=index+(button.dataset.action==='up'?-1:1);if(target>=0&&target<state.rules.length)[state.rules[index],state.rules[target]]=[state.rules[target],state.rules[index]];}
  renderRules();update();
});
$('#rules-list').addEventListener('focusin',()=>inputCheckpoint=false);
$('#rules-list').addEventListener('input',event=>{
  const field=event.target.dataset.field;
  if(!field||event.target.tagName==='SELECT')return;
  const rule=state.rules.find(rule=>rule.id===event.target.closest('[data-id]').dataset.id);
  if(!inputCheckpoint){remember();inputCheckpoint=true;}
  rule[field]=field==='lazy'?event.target.checked:event.target.value;
  state.template='';
  const card=event.target.closest('[data-id]');
  try{card.querySelector('.rule-preview').textContent=ruleSource(rule);}catch{card.querySelector('.rule-preview').textContent=t('请完善规则');}
  if(field==='rangeText'){
    const ranges=String(rule.rangeText||'').split(/[,，]/).map(value=>value.trim());
    card.querySelectorAll('[data-range]').forEach(button=>{const selected=ranges.includes(button.dataset.range);button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',selected);});
  }
  document.querySelectorAll('[data-template]').forEach(button=>button.classList.remove('active'));
  update();
});
$('#rules-list').addEventListener('change',event=>{
  if(event.target.tagName!=='SELECT')return;
  const rule=state.rules.find(rule=>rule.id===event.target.closest('[data-id]').dataset.id);
  const field=event.target.dataset.field;remember();state.template='';rule[field]=event.target.value;
  renderRules();update();
});
function toggleCharacterRange(rule,range){
  const ranges=String(rule.rangeText||'').split(/[,，]/).map(value=>value.trim()).filter(Boolean);
  const selected=rule.charMode==='ranges'&&ranges.includes(range);
  rule.rangeText=(selected?ranges.filter(value=>value!==range):[...new Set([...ranges,range])]).join(',');
  rule.charMode='ranges';
}
['start','end'].forEach(name=>$('#anchor-'+name).addEventListener('change',event=>{remember();state[name]=event.target.checked;state.template='';renderRules();update();}));
document.querySelectorAll('[data-flag]').forEach(input=>input.addEventListener('change',()=>{remember();state.flags=[...'gims'].filter(flag=>$(`[data-flag="${flag}"]`).checked).join('')+'u';update();}));
document.querySelectorAll('[data-template]').forEach(button=>button.addEventListener('click',()=>{remember();state={...getTemplate(button.dataset.template),mode:state.mode,template:button.dataset.template,editor:'rules',rawSource:'',catalogId:'',sourceEdited:false,uiLanguage:state.uiLanguage,language:state.language};$('#test-input').value=state.sample;renderRules();update();toast('已应用'+button.textContent+'模板，可继续修改规则');}));
$('#clear-button').addEventListener('click',()=>{if(state.editor==='source'){if(!state.rawSource)return;remember();state.rawSource='';state.sourceEdited=true;}else{if(!state.rules.length)return;remember();state.rules=[];state.template='';}renderRules();update();toast('已清空，可使用撤销恢复');});
$('#undo-button').addEventListener('click',()=>{if(!history.length)return;const locale=state.uiLanguage;state=history.pop();state.uiLanguage=locale;$('#undo-button').disabled=!history.length;$('#test-input').value=state.sample;renderRules();update();});
$('#test-input').addEventListener('input',event=>{state.sample=event.target.value;update();});
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{state.mode=button.dataset.mode;update();}));
$('#sample-button').addEventListener('click',()=>{state.sample=state.editor==='source'&&catalogMap.has(state.catalogId)?catalogMap.get(state.catalogId).example:getTemplate(state.template||'username').sample;$('#test-input').value=state.sample;update();});
$('#copy-button').addEventListener('click',async()=>{
  if(!currentValid)return;
  const value=currentExport?.copy||`/${currentSource}/${state.flags}`;
  try{if(!navigator.clipboard?.writeText)throw new Error();await navigator.clipboard.writeText(value);toast('表达式已复制');}
  catch{const field=document.createElement('textarea');field.value=value;field.style.cssText='position:fixed;opacity:0;left:0;top:0';document.body.append(field);field.select();try{if(!document.execCommand('copy'))throw new Error();toast('表达式已复制');}catch{toast('浏览器限制了复制，请直接选中上方表达式复制');}field.remove();}
});
$('#help-button').addEventListener('click',()=>$('#help-dialog').showModal());
$('#close-help').addEventListener('click',()=>$('#help-dialog').close());
$('#help-done').addEventListener('click',()=>$('#help-dialog').close());
$('#help-dialog').addEventListener('click',event=>{if(event.target===$('#help-dialog')){const box=event.target.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)event.target.close();}});
document.querySelectorAll('[data-editor]').forEach(button=>button.addEventListener('click',()=>{if(state.editor===button.dataset.editor)return;if(button.dataset.editor==='rules'&&state.rawSource&&!currentValid){toast('请先修正源码语法，再转为可视化规则');return;}remember();if(button.dataset.editor==='source')state.rawSource=currentSource;else if(state.rawSource)Object.assign(state,parseTemplate(state.rawSource,state.flags));state.editor=button.dataset.editor;renderRules();update();}));
$('#source-input').addEventListener('focus',()=>inputCheckpoint=false);
$('#source-input').addEventListener('input',event=>{if(!inputCheckpoint){remember();inputCheckpoint=true;}state.rawSource=event.target.value;state.sourceEdited=true;const item=localCatalog(catalogMap.get(state.catalogId));if(item)$('#source-title').textContent=item.name+t(' · 已修改');update();});
$('#library-search').addEventListener('input',renderLibrary);
$('#library-category').addEventListener('change',renderLibrary);
$('#clear-search').addEventListener('click',()=>{$('#library-search').value='';renderLibrary();$('#library-search').focus();});
$('#library-list').addEventListener('click',event=>{
  if(event.target.closest('#reset-library')){$('#library-search').value='';$('#library-category').value='all';renderLibrary();return;}
  const button=event.target.closest('[data-catalog]');if(!button)return;
  const item=catalogMap.get(button.dataset.catalog);if(!item)return;
  const parsed=parseTemplate(item.pattern,item.flags);
  remember();state={...state,...parsed,editor:'rules',rawSource:item.pattern,catalogId:item.id,sourceEdited:false,flags:item.flags,mode:'lines',sample:item.example,template:''};
  $('#test-input').value=state.sample;renderRules();update();toast(ui('已载入「'+item.name+'」及测试示例','Loaded “'+localCatalog(item).name+'” and its examples'));
  if(matchMedia('(max-width:760px)').matches)$('.builder-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
});
$('#library-total').textContent=CATALOG.length;
const matchLegend=document.createElement('div');matchLegend.className='match-legend';matchLegend.innerHTML='<span class="matched-legend">绿色：已匹配</span><span class="unmatched-legend">红色：已定位的不匹配字符</span>';$('#test-results').before(matchLegend);
$('#output-language').addEventListener('change',event=>{state.language=event.target.value;update();});
$('#ui-language-switch').addEventListener('click',event=>{const button=event.target.closest('[data-ui-language]');if(button)setUiLanguage(button.dataset.uiLanguage);});
$('#rules-list').addEventListener('pointerdown',event=>{
  const handle=event.target.closest('.drag-handle');if(!handle||event.button!==0)return;
  event.preventDefault();const card=handle.closest('.rule-card');
  ruleDrag={pointer:event.pointerId,handle,card,order:state.rules.map(rule=>rule.id)};
  $('#rules-list').setPointerCapture(event.pointerId);card.classList.add('is-dragging');$('#rules-list').classList.add('rule-dragging');
});
$('#rules-list').addEventListener('pointermove',event=>{
  if(!ruleDrag||event.pointerId!==ruleDrag.pointer)return;
  const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('#rules-list .rule-card');
  if(!target||target===ruleDrag.card)return;
  const bounds=target.getBoundingClientRect();
  if(event.clientY>bounds.top+bounds.height/2)target.after(ruleDrag.card);else target.before(ruleDrag.card);
});
function finishRuleDrag(event,cancel=false){
  if(!ruleDrag||event.pointerId!==ruleDrag.pointer)return;
  const order=[...$('#rules-list').children].map(card=>card.dataset.id);
  const original=ruleDrag.order;ruleDrag=undefined;$('#rules-list').classList.remove('rule-dragging');
  if(!cancel&&order.some((id,index)=>id!==original[index])){remember();const map=new Map(state.rules.map(rule=>[rule.id,rule]));state.rules=order.map(id=>map.get(id));state.template='';toast('规则顺序已更新');}
  renderRules();update();
}
$('#rules-list').addEventListener('pointerup',event=>finishRuleDrag(event));
$('#rules-list').addEventListener('pointercancel',event=>finishRuleDrag(event,true));
$('#rules-list').addEventListener('lostpointercapture',event=>finishRuleDrag(event,true));
$('#app-version').textContent=VERSION;
$('#test-input').value=state.sample;
$('#test-input').rows=10;
$('#test-input').wrap='off';
renderLocale();renderRules();update();
