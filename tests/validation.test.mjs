import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {buildPattern,ruleSource,explainRule} from '../src/engine.mjs';
import {locateInvalidCharacters} from '../src/character-diagnostics.mjs';
import {CATALOG} from '../src/catalog.mjs';
import {getCatalogChecks} from '../src/catalog-checks.mjs';
import {parseTemplate} from '../src/template-parser.mjs';
const app=await fs.readFile(new URL('../src/app.js',import.meta.url),'utf8');
const workerCode=app.slice(app.indexOf('function workerMain()'),app.indexOf('\nfunction testMatch()'));
function validate(rules,text,options={}){
  const messages=[];const self={postMessage:value=>messages.push(structuredClone(value))};
  vm.runInNewContext(`const locateInvalidCharacters=${locateInvalidCharacters.toString()};\n(${workerCode})()`,{self});
  const flags=options.flags||'u';
  const parts={rules,start:true,end:true,...options.parts};
  const normalized=buildPattern(parts.rules,{...parts,multiline:flags.includes('m')});
  let prefix=parts.start?'^':'';
  const checks=rules.map((rule,index)=>{prefix+=ruleSource(rule);return {pattern:prefix,message:`第 ${index+1} 条未通过：${explainRule(rule)}`};});
  self.onmessage({data:{source:options.source||normalized,flags,text,mode:'lines',diagnostics:{checks:options.checks||checks,fallback:'结尾仍有多余内容',characters:{...parts,flags,source:normalized}}}});
  assert.equal(messages[0].error,undefined);
  return messages[0];
}
const rule=(type,repeat='once',extra={})=>({type,repeat,value:'',min:1,max:5,...extra});
test('phone diagnostics identify the first impossible segment',()=>{
  const rules=[rule('literal','once',{value:'1'}),rule('oneOf','once',{value:'3456789'}),rule('digit','exact',{min:9})];
  const output=validate(rules,'13800138000\n12800138000\n1380013800\n23800138000');
  assert.equal(output.count,1);assert.equal(output.lines[0].reason,'');
  assert.match(output.lines[1].reason,/第 2 条/);assert.match(output.lines[2].reason,/第 3 条/);assert.match(output.lines[3].reason,/第 1 条/);
  assert.deepEqual(output.lines[1].invalidRanges,[{start:1,end:2}]);
  assert.deepEqual(output.lines[2].invalidRanges,[]);
  assert.deepEqual(output.lines[3].invalidRanges,[{start:0,end:1}]);
});
test('prefix checks preserve backtracking across earlier rules',()=>{
  const output=validate([rule('literal','oneOrMore',{value:'a'}),rule('literal','once',{value:'a'}),rule('literal','once',{value:'b'})],'aab\naac');
  assert.equal(output.lines[0].matched,true);assert.match(output.lines[1].reason,/第 3 条/);
});
test('extra suffix is distinguished from a failed content rule',()=>{
  const output=validate([rule('digit','exact',{min:2})],'123\n12');
  assert.equal(output.lines[0].reason,'结尾仍有多余内容');assert.equal(output.lines[1].matched,true);
});
test('literal metacharacters and empty input get segment diagnostics',()=>{
  const output=validate([rule('literal','once',{value:'a.b'}),rule('digit')],'a.b1\naXb1\n');
  assert.equal(output.lines[0].matched,true);assert.match(output.lines[1].reason,/第 1 条/);assert.match(output.lines[2].reason,/第 1 条/);
});

test('literal substitution highlights only the wrong character without claiming the whole literal is missing',()=>{
  const output=validate([rule('literal','once',{value:'abc'})],'abX');
  assert.equal(output.lines[0].matched,false);
  assert.equal(output.lines[0].precise,true);
  assert.deepEqual(output.lines[0].invalidRanges,[{start:2,end:3}]);
  assert.match(output.lines[0].reason,/第 1 条/);
  assert.doesNotMatch(output.lines[0].reason,/缺少.*abc/);
});

test('literal omission identifies the missing suffix while keeping existing characters neutral',()=>{
  const output=validate([rule('literal','once',{value:'abc'})],'ab');
  assert.equal(output.lines[0].matched,false);
  assert.equal(output.lines[0].precise,true);
  assert.deepEqual(output.lines[0].invalidRanges,[]);
  assert.match(output.lines[0].reason,/缺少.*c/);
  assert.doesNotMatch(output.lines[0].reason,/缺少.*abc/);
});

test('Worker colors only located invalid characters and leaves complex failures neutral',()=>{
  const mixed=validate([rule('alnum','oneOrMore')],'Abcd123!');
  assert.deepEqual(mixed.lines[0].invalidRanges,[{start:7,end:8}]);
  const digits=validate([rule('digit','oneOrMore')],'12x34');
  assert.deepEqual(digits.lines[0].invalidRanges,[{start:2,end:3}]);
  const complex=validate([rule('raw','once',{value:'(?=ab)(ab)\\1'})],'abx');
  assert.deepEqual(complex.lines[0].invalidRanges,[]);
  assert.equal(complex.lines[0].precise,false);
});

for(const mode of ['rules','source']){
  test(`email screenshot regression through matching Worker in ${mode} mode`,()=>{
    const email=CATALOG.find(item=>item.id==='email');
    const parsed=parseTemplate(email.pattern,email.flags);
    const source=mode==='source'?email.pattern:buildPattern(parsed.rules,{...parsed,multiline:email.flags.includes('m')});
    const parts=mode==='source'?parseTemplate(source,email.flags):parsed;
    const text='hello@example.com\nname+tag@sample.cn\nhello.example.com\nname@-example.com';
    const output=validate(parts.rules,text,{parts,source,flags:email.flags,checks:mode==='source'?getCatalogChecks(email.id):undefined});
    assert.equal(output.count,2);
    assert.equal(output.total,4);
    assert.equal(output.lines[0].matched,true);
    assert.equal(output.lines[1].matched,true);
    assert.equal(output.lines[2].matched,false);
    assert.equal(output.lines[3].matched,false);
    assert.deepEqual(output.lines[2].invalidRanges,[],'missing @ must not color correct existing characters');
    assert.match(output.lines[2].reason,/缺少.*@/);
    assert.equal(output.lines[2].precise,true);
    assert.deepEqual(output.lines[3].invalidRanges,[{start:5,end:6}],'only the invalid leading domain hyphen is red');
    assert.equal(output.lines[3].precise,true);
  });
}

test('result markup colors only diagnosed spans and does not label unexamined context',()=>{
  const start=app.indexOf('function highlightMatches(');
  const end=app.indexOf('function workerMain()');
  const escapeHTML=value=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const render=vm.runInNewContext(`(()=>{${app.slice(start,end)};return {highlightMatches,highlightInvalidCharacters};})()`,{escapeHTML});
  assert.equal(render.highlightInvalidCharacters('Abcd123!',[{start:7,end:8}]),'Abcd123<span class="unmatched-text">!</span>');
  assert.equal(render.highlightInvalidCharacters('ab',[]),'ab');
  assert.equal(render.highlightInvalidCharacters('<x>',[{start:1,end:2}]),'&lt;<span class="unmatched-text">x</span>&gt;');
  assert.equal(render.highlightMatches('12x34',[{start:0,value:'12'}],2),'<mark>12</mark>x34');
  assert.equal(render.highlightMatches('x12y',[{start:1,value:'12'}],4,false),'x<mark>12</mark>y');
});
