import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPattern, explainRule, getTemplate, RULE_TYPES, REPETITIONS,ruleSource} from '../src/engine.mjs';

const r = (type, options={}) => ({type, repeat:'once', value:'', min:1, max:5, ...options});
const compile = (rules, options) => new RegExp(buildPattern(rules, options), 'u');

test('literal metacharacters are matched literally and repeated as a unit', () => {
  const text = 'a.b+[x](y){2}^$|\\/';
  assert.ok(compile([r('literal',{value:text})]).test(text));
  assert.ok(!compile([r('literal',{value:text})]).test(text+'x'));
  const repeat = compile([r('literal',{value:'ab',repeat:'exact',min:2})]);
  assert.ok(repeat.test('abab'));
  assert.ok(!repeat.test('abb'));
  const lineBreak = buildPattern([r('literal',{value:'a\nb\r\u2028c'})]);
  assert.ok(!lineBreak.includes('\n'));
  assert.ok(new RegExp(lineBreak,'u').test('a\nb\r\u2028c'));
});

test('character sets escape symbols, never interpret user input as ranges', () => {
  const chars = 'a-z[]^\\/😀';
  const regex = compile([r('oneOf',{value:chars})]);
  for (const char of chars) assert.ok(regex.test(char), char);
  assert.ok(!regex.test('b'));
  const exclusion = compile([r('notOneOf',{value:'-]^'})]);
  assert.ok(exclusion.test('你'));
  assert.ok(!exclusion.test('-'));
});

test('explicit character ranges form a union while literal sets retain old semantics',()=>{
  const range=r('oneOf',{charMode:'ranges',rangeText:' A-Z， a-c, 0-7 '});
  assert.equal(ruleSource(range),'[A-Za-c0-7]');
  const regex=compile([range]);
  for(const char of ['A','Z','a','c','0','7']) assert.ok(regex.test(char),char);
  for(const char of ['d','8','-','AA']) assert.ok(!regex.test(char),char);
  const literal=compile([r('oneOf',{value:'a-z'})]);
  assert.ok(literal.test('-'));
  assert.ok(!literal.test('m'));
  const repeated=compile([{...range,repeat:'exact',min:3}]);
  assert.ok(repeated.test('Za7'));
  assert.ok(!repeated.test('Za'));
  const excluded=compile([r('notOneOf',{charMode:'ranges',rangeText:'A-Z,0-7'})]);
  assert.ok(excluded.test('a'));
  assert.ok(!excluded.test('G'));
  assert.match(explainRule(range),/字符范围/);
});

test('character ranges support Unicode endpoints and actionable invalid-input errors',()=>{
  const emoji=compile([r('oneOf',{charMode:'ranges',rangeText:'😀-😃,x'})]);
  assert.ok(emoji.test('😁'));
  assert.ok(emoji.test('x'));
  assert.ok(!emoji.test('😄'));
  for(const rangeText of ['', 'A-Z,', ',A-Z','A-Z,,0-7','AA-Z','A-ZZ','abc','Z-A']) assert.throws(()=>compile([r('oneOf',{charMode:'ranges',rangeText})]),/字符范围|范围|格式/);
  assert.ok(compile([r('oneOf',{charMode:'ranges',rangeText:'A-A'})]).test('A'));
});

test('Unicode Han and repeated emoji match full code points', () => {
  assert.ok(compile([r('chinese',{repeat:'oneOrMore'})]).test('汉字𠀀'));
  assert.ok(!compile([r('chinese')]).test('A'));
  assert.ok(compile([r('literal',{value:'😀',repeat:'exact',min:2})]).test('😀😀'));
});

test('strict end rejects trailing newlines; unanchored mode searches', () => {
  const rules = [r('digit',{repeat:'oneOrMore'})];
  assert.ok(compile(rules).test('123'));
  assert.ok(!compile(rules).test('123\n'));
  assert.ok(!new RegExp(buildPattern(rules),'mu').test('123\n'));
  assert.ok(compile(rules,{start:false,end:false}).test('abc123xyz'));
  assert.equal(buildPattern([]),'');
});

test('multiline option enables per-line boundaries only when requested', () => {
  const rules = [r('digit',{repeat:'oneOrMore'})];
  const source = buildPattern(rules,{multiline:true});
  assert.equal(source,'^\\d+$');
  assert.deepEqual([...('abc\n123\n456\ndef'.matchAll(new RegExp(source,'gmu')))].map(match=>match[0]),['123','456']);
  assert.ok(!new RegExp(buildPattern(rules),'mu').test('123\ndef'));
});

test('any character follows dotAll flag semantics', () => {
  const source = buildPattern([r('any')]);
  assert.ok(new RegExp(source,'u').test('A'));
  assert.ok(!new RegExp(source,'u').test('\n'));
  assert.ok(new RegExp(source,'su').test('\n'));
});

test('all quantifiers and lazy matching preserve their meaning', () => {
  assert.ok(compile([r('digit',{repeat:'zeroOrMore'})]).test(''));
  assert.ok(compile([r('digit',{repeat:'optional'})]).test('5'));
  assert.ok(!compile([r('digit',{repeat:'optional'})]).test('55'));
  assert.ok(compile([r('digit',{repeat:'range',min:2,max:3})]).test('123'));
  assert.ok(!compile([r('digit',{repeat:'range',min:2,max:3})]).test('1'));
  assert.ok(compile([r('digit',{repeat:'atLeast',min:2})]).test('12345'));
  const lazy = new RegExp(buildPattern([r('digit',{repeat:'oneOrMore',lazy:true})],{start:false,end:false}),'u');
  assert.equal('123'.match(lazy)[0],'1');
});

test('invalid bounds and missing values provide actionable errors', () => {
  for(const min of [-1,1.5,'','abc',Number.MAX_SAFE_INTEGER+1]) assert.throws(()=>buildPattern([r('digit',{repeat:'exact',min})]));
  assert.throws(()=>buildPattern([r('digit',{repeat:'range',min:4,max:2})]),/最多次数/);
  assert.throws(()=>buildPattern([r('literal')]),/请填写/);
  assert.throws(()=>buildPattern([r('unknown')]),/规则类型/);
  assert.throws(()=>buildPattern([r('digit',{repeat:'unknown'})]),/重复次数/);
});

test('templates accept representative examples and reject structural errors', () => {
  const cases = {
    username:[['Hello_2026','Codex'],['1invalid','ab','name-with-dash','A'.repeat(17)]],
    phone:[['13800138000','19912345678'],['12800138000','1380013800','138001380000']],
    email:[['hello@example.com','name+tag@sample.cn'],['hello.example.com','invalid@email','x@y.c']],
    date:[['2026-10-21','2025-01-01'],['26-10-21','2026/10/21','2026-1-01']],
    number:[['0','123','-42'],['3.14','--1','123x','']]
  };
  for(const [name,[valid,invalid]] of Object.entries(cases)) {
    const template=getTemplate(name);
    const regex=new RegExp(buildPattern(template.rules,template),template.flags);
    for(const text of valid) assert.ok(regex.test(text),`${name}: ${text}`);
    for(const text of invalid) assert.ok(!regex.test(text),`${name}: ${text}`);
  }
});

test('metadata and explanations cover the complete selectable rule vocabulary', () => {
  assert.equal(RULE_TYPES.length,13);
  assert.equal(REPETITIONS.length,7);
  assert.match(explainRule(r('literal',{value:'.',repeat:'range',min:2,max:4,lazy:true})),/文本「\.」.*2–4 次.*尽可能少/);
  assert.throws(()=>getTemplate('missing'),/找不到/);
});
