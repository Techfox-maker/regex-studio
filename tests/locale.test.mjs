import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {CATALOG} from '../src/catalog.mjs';
import {CATALOG_EN_TEXT} from '../src/catalog-en.mjs';
import {SYNTAX_SECTIONS} from '../src/syntax.mjs';
import {SYNTAX_EN_SECTIONS} from '../src/syntax-en.mjs';
import {RULE_TYPES,REPETITIONS,buildPattern,ruleSource,explainRule,getTemplate} from '../src/engine.mjs';
import {translateMessage} from '../src/messages-en.mjs';
import {getUiText,localizePage} from '../src/localize.mjs';
const app=await fs.readFile(new URL('../src/app.js',import.meta.url),'utf8');
const html=await fs.readFile(new URL('../src/index.html',import.meta.url),'utf8');
const hasHan=text=>/\p{Script=Han}/u.test(text);
const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

test('all 45 template records have complete English metadata without changing regex data',()=>{
 assert.equal(Object.keys(CATALOG_EN_TEXT).length,CATALOG.length);
 for(const item of CATALOG){const translated=CATALOG_EN_TEXT[item.id];assert.ok(translated,item.id);for(const field of ['name','category','description','note']){assert.equal(typeof translated[field],'string',item.id+' '+field);assert.ok(translated[field].length>0);assert.equal(hasHan(translated[field]),false,item.id+' '+field);}assert.equal(translated.pattern,undefined);assert.equal(translated.example,undefined);}
});
test('all syntax entries retain regex syntax and have English explanations',()=>{
 assert.equal(SYNTAX_EN_SECTIONS.length,SYNTAX_SECTIONS.length);
 let total=0;
 SYNTAX_SECTIONS.forEach((section,i)=>{const en=SYNTAX_EN_SECTIONS[i];assert.equal(en.items.length,section.items.length);assert.equal(hasHan(en.title),false);section.items.forEach((item,j)=>{assert.equal(en.items[j].syntax,item.syntax.replaceAll('集合A','setA').replaceAll('集合B','setB'));assert.equal(hasHan(en.items[j].description),false);assert.ok(en.items[j].example);total++;});});
 assert.equal(total,64);
});
test('every static HTML localization key has a Chinese and English value',()=>{
 const keys=[...html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)].map(match=>match[1]);
 assert.ok(keys.length>30,'static page coverage');
 for(const key of new Set(keys)){const zh=getUiText(key,'zh'),en=getUiText(key,'en');assert.ok(zh&&en,key);assert.notEqual(en,key,key);}
 assert.match(html,/id="ui-language-switch"/);assert.match(html,/data-ui-language="en"/);assert.match(html,/data-ui-language="zh"/);
});
test('switching the interface preserves rules, source, samples and export language',()=>{
 const state={uiLanguage:'zh',language:'python',rules:[{type:'literal',value:'数字',repeat:'once'}],rawSource:'^数字$',sample:'数字\nabc',start:true,end:true};
 const before=structuredClone(state);const calls=[];
 const code=app.slice(app.indexOf('function setUiLanguage('),app.indexOf('\nfunction highlightSource('));
 const set=vm.runInNewContext('('+code+')',{state,renderLocale:()=>calls.push('locale'),renderRules:()=>calls.push('rules'),update:()=>calls.push('update')});
 set('en');assert.equal(state.uiLanguage,'en');assert.deepEqual({...state,uiLanguage:'zh'},before);assert.deepEqual(calls,['locale','rules','update']);
 set('en');assert.equal(calls.length,3);set('invalid');assert.equal(calls.length,3);set('zh');assert.deepEqual(state,before);
});
test('English rule rendering preserves user-provided Chinese text and pattern bytes',()=>{
 const rule={id:'literal',type:'literal',value:'数字',repeat:'once',min:1,max:5};
 const code=app.slice(app.indexOf('function ruleCard('),app.indexOf('\nfunction renderRules()'));
 const render=vm.runInNewContext('('+code+')',{state:{rules:[rule],uiLanguage:'en'},t:text=>translateMessage(text,'en'),ui:(zh,en)=>en,typeMap:new Map(RULE_TYPES.map(type=>[type.id,type])),RULE_TYPES,REPETITIONS,ruleSource,escapeHTML});
 const markup=render(rule,0);assert.match(markup,/value="数字"/);assert.match(markup,/Literal|literal|Text|text/);assert.equal(buildPattern([rule]),'^数字$(?![\\s\\S])');
 for(const type of RULE_TYPES){assert.equal(hasHan(translateMessage(type.label,'en')),false,type.id);assert.equal(hasHan(translateMessage(type.description,'en')),false,type.id);}
 for(const repetition of REPETITIONS)assert.equal(hasHan(translateMessage(repetition.label,'en')),false,repetition.id);
 const explained=translateMessage(explainRule(rule),'en');assert.ok(explained.includes('数字'));assert.equal(hasHan(explained.replaceAll('数字','')),false,explained);
});
test('the interface preference is saved with the unchanged application state',()=>{
 const state={uiLanguage:'en',rules:[],sample:'original'};let saved;
 const code=app.slice(app.indexOf('function save()'),app.indexOf('\nfunction ruleCard('));
 const save=vm.runInNewContext('('+code+')',{state,storageKey:'test-key',localStorage:{setItem:(key,value)=>{saved=JSON.parse(value);}},$:()=>({textContent:''}),t:value=>value});
 save();assert.deepEqual(saved,state);
});


test('new and legacy visitors start in English while explicit Chinese preferences survive',()=>{
 const bootstrap=app.slice(app.indexOf('const $ ='),app.indexOf('function toast('));
 function load(saved){return vm.runInNewContext(bootstrap+';state',{RULE_TYPES,CATALOG,LANGUAGES:[],SHELL_LANGUAGES:[],getTemplate,buildPattern,translateMessage,CATALOG_EN_TEXT,localStorage:{getItem:()=>saved?JSON.stringify(saved):null}});}
 assert.equal(load().uiLanguage,'en');
 const legacy={rules:[{type:'digit',repeat:'once'}],flags:'u',sample:'1'};
 assert.equal(load(legacy).uiLanguage,'en');
 assert.equal(load({...legacy,uiLanguage:'zh'}).uiLanguage,'zh');
});
test('static locale updates labels and accessibility without touching an input value',()=>{
 const original=globalThis.document;
 const label={dataset:{i18n:'nav.builder'},textContent:''};
 const field={value:'数字 abc',attrs:{'data-i18n-placeholder':'test.placeholder'},getAttribute(key){return this.attrs[key];},setAttribute(key,value){this.attrs[key]=value;}};
 const buttons=['zh','en'].map(value=>({dataset:{uiLanguage:value},attrs:{},setAttribute(key,value){this.attrs[key]=value;},classList:{toggle(){}}}));
 const doc={documentElement:{lang:''},title:'',querySelector:()=>({setAttribute(){}}),querySelectorAll(selector){if(selector==='[data-i18n]')return [label];if(selector==='[data-i18n-placeholder]')return [field];if(selector==='[data-ui-language]')return buttons;return [];}};
 globalThis.document=doc;
 try{localizePage('en');assert.equal(doc.documentElement.lang,'en');assert.equal(label.textContent,getUiText('nav.builder','en'));assert.equal(field.value,'数字 abc');assert.equal(buttons[1].attrs['aria-pressed'],'true');localizePage('zh');assert.equal(doc.documentElement.lang,'zh-CN');assert.equal(label.textContent,getUiText('nav.builder','zh'));assert.equal(field.value,'数字 abc');assert.equal(buttons[0].attrs['aria-pressed'],'true');}finally{if(original===undefined)delete globalThis.document;else globalThis.document=original;}
});
