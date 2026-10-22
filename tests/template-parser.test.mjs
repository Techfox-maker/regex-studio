import test from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG} from '../src/catalog.mjs';
import {parseTemplate} from '../src/template-parser.mjs';
import {buildPattern,RULE_TYPES,ruleSource} from '../src/engine.mjs';

const rebuilt=(pattern,flags='u')=>{const result=parseTemplate(pattern,flags);return {...result,pattern:buildPattern(result.rules,{...result,multiline:flags.includes('m')})};};

test('all 45 catalog entries retain example and boundary semantics as editable rules',()=>{
  assert.equal(CATALOG.length,45);
  for(const entry of CATALOG) {
    const parsed=rebuilt(entry.pattern,entry.flags);
    assert.ok(parsed.rules.length,entry.id);
    const original=new RegExp(entry.pattern,entry.flags);
    const generated=new RegExp(parsed.pattern,entry.flags);
    const samples=[...entry.valid,...entry.invalid,'','abc','123','中文','\n','😀',...entry.valid.flatMap(value=>[value+'\n',' '+value,value+'x'])];
    for(const sample of samples) assert.equal(generated.test(sample),original.test(sample),`${entry.id}: ${JSON.stringify(sample)}\n${parsed.pattern}`);
  }
});

test('simple syntax is exposed as ordinary builder rules',()=>{
  const parsed=rebuilt('^[A-Za-z]\\w{4,15}$(?![\\s\\S])');
  assert.deepEqual(parsed.rules.map(rule=>[rule.type,rule.repeat]),[['letter','once'],['word','range']]);
  assert.equal(parsed.start,true);
  assert.equal(parsed.end,true);
  const literal=parseTemplate('a\\.bc[3456789]+?','u');
  assert.deepEqual(literal.rules.map(rule=>rule.type),['literal','oneOf']);
  assert.equal(literal.rules[0].value,'a.bc');
  assert.equal(literal.rules[1].lazy,true);
  const phone=CATALOG.find(entry=>entry.id==='phone-cn');
  const phoneRules=parseTemplate(phone.pattern,phone.flags).rules;
  assert.deepEqual(phoneRules.map(rule=>rule.type),['literal','oneOf','digit']);
  assert.equal(phoneRules[1].charMode,'ranges');
  assert.equal(phoneRules[1].rangeText,'3-9');
  assert.equal(parseTemplate('[1-35-8]').rules[0].rangeText,'1-3,5-8');
  assert.equal(parseTemplate('[A-Fa-f0-9]').rules[0].rangeText,'A-F,a-f,0-9');
  assert.equal(parseTemplate('[A-Fx0-7]').rules[0].rangeText,'A-F,x,0-7');
  assert.equal(parseTemplate('[abc_]').rules[0].type,'oneOf');
  assert.equal(parseTemplate('[abc_]').rules[0].value,'abc_');
});

test('groups, assertions and backreferences keep numbering and branch precedence',()=>{
  for(const pattern of ['^(a)(b)\\2\\1$','^(?<pair>ab)\\k<pair>$','^(?=a)(a|b)+$','^a|b$','^(?:a|b)$','(?<=x)\\p{L}+','\\u{1F600}{2}','\\x41\\u0042']) {
    const parsed=rebuilt(pattern);
    for(const sample of ['abba','ab','abab','aa','b','xb','xa','x中文','😀😀','AB','a\n','b\n']) assert.equal(new RegExp(parsed.pattern,'u').test(sample),new RegExp(pattern,'u').test(sample),pattern+': '+sample);
  }
});

test('plain dollar remains a raw assertion without m, preserving final-newline behavior',()=>{
  const parsed=rebuilt('^abc$');
  assert.equal(parsed.end,false);
  assert.equal(new RegExp(parsed.pattern,'u').test('abc\n'),/^abc$/u.test('abc\n'));
  const multi=rebuilt('^abc$','mu');
  assert.equal(multi.end,true);
  assert.ok(new RegExp(multi.pattern,'mu').test('z\nabc\ny'));
});

test('raw rule wraps whole expression and applies quantity to the whole fragment',()=>{
  assert.ok(RULE_TYPES.some(rule=>rule.id==='raw'));
  const source=ruleSource({type:'raw',value:'ab|cd',repeat:'exact',min:2});
  assert.equal(source,'(?:ab|cd){2}');
  assert.ok(new RegExp('^'+source+'$','u').test('abcd'));
});
