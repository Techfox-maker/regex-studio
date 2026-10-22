import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {RULE_TYPES,REPETITIONS,ruleSource} from '../src/engine.mjs';
const app=await fs.readFile(new URL('../src/app.js',import.meta.url),'utf8');
const toggleCode=app.slice(app.indexOf('function toggleCharacterRange('),app.indexOf("\n['start','end']"));
const toggle=vm.runInNewContext(`(${toggleCode})`);
test('range presets support multiple selection, removal and preserve literal mode data',()=>{
  const rule={type:'oneOf',value:'a-z',repeat:'once'};
  toggle(rule,'A-Z');toggle(rule,'0-9');
  assert.equal(rule.rangeText,'A-Z,0-9');assert.equal(rule.charMode,'ranges');assert.equal(rule.value,'a-z');
  assert.equal(ruleSource(rule),'[A-Z0-9]');
  toggle(rule,'A-Z');assert.equal(rule.rangeText,'0-9');
  rule.rangeText='a-c,0-7';toggle(rule,'A-Z');assert.equal(ruleSource(rule),'[a-c0-7A-Z]');
});
test('rule renderer exposes explicit mode, range input and selected preset states',()=>{
  const renderCode=app.slice(app.indexOf('function ruleCard('),app.indexOf('\nfunction renderRules()'));
  const rule={id:'test-range',type:'oneOf',charMode:'ranges',rangeText:'A-Z,a-c,0-7',repeat:'once',value:''};
  const render=vm.runInNewContext(`(${renderCode})`,{t:value=>value,ui:zh=>zh,state:{rules:[rule]},typeMap:new Map(RULE_TYPES.map(type=>[type.id,type])),RULE_TYPES,REPETITIONS,ruleSource,escapeHTML:value=>String(value).replaceAll('"','&quot;')});
  const html=render(rule,0);
  assert.match(html,/data-field="charMode"/);assert.match(html,/data-field="rangeText" value="A-Z,a-c,0-7"/);
  assert.match(html,/data-range="A-Z" aria-pressed="true"/);assert.match(html,/data-range="a-z" aria-pressed="false"/);
});
