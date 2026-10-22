import test from 'node:test';
import assert from 'node:assert/strict';
import {locateInvalidCharacters} from '../src/character-diagnostics.mjs';
import {buildPattern} from '../src/engine.mjs';
import {CATALOG} from '../src/catalog.mjs';
import {parseTemplate} from '../src/template-parser.mjs';
const rule=(type,options={})=>({type,repeat:'once',value:'',min:1,max:5,...options});
const diagnose=(text,rules,options={})=>locateInvalidCharacters(text,{rules,start:true,end:true,flags:'u',...options});
const red=(text,result)=>result.ranges.map(range=>text.slice(range.start,range.end));

test('only invalid characters in repeated character classes are marked',()=>{
  for(const [text,type,expected] of [['Abcd123!','alnum',['!']],['12x34','digit',['x']],['1x2y3','digit',['x','y']]]) {
    const result=diagnose(text,[rule(type,{repeat:'oneOrMore'})]);
    assert.equal(result.precise,true);
    assert.deepEqual(red(text,result),expected);
  }
});

test('missing pattern content does not mark correct existing input',()=>{
  assert.deepEqual(diagnose('abX',[rule('literal',{value:'abc'})]),{ranges:[{start:2,end:3}],precise:true});
  assert.deepEqual(diagnose('ab',[rule('literal',{value:'abc'})]),{ranges:[],precise:true,missing:true,missingLiterals:['c']});
  assert.deepEqual(diagnose('12',[rule('digit',{repeat:'exact',min:3})]),{ranges:[],precise:true,missing:true});
  assert.deepEqual(diagnose('',[rule('letter')]),{ranges:[],precise:true,missing:true});
});

test('phone substitutions, overflow and cross-rule backtracking preserve correct prefixes',()=>{
  const phone=[rule('literal',{value:'1'}),rule('oneOf',{charMode:'ranges',rangeText:'3-9'}),rule('digit',{repeat:'exact',min:9})];
  const bad='12800138000';
  assert.deepEqual(diagnose(bad,phone).ranges,[{start:1,end:2}]);
  assert.deepEqual(diagnose('138001380009',phone).ranges,[{start:11,end:12}]);
  const rules=[rule('digit',{repeat:'oneOrMore'}),rule('literal',{value:'34'})];
  assert.deepEqual(diagnose('1234',rules).ranges,[]);
  assert.deepEqual(diagnose('12x34',rules).ranges,[{start:2,end:3}]);
});

test('literal groups repeat as a unit and Unicode ranges return UTF16 offsets',()=>{
  assert.deepEqual(diagnose('ababx',[rule('literal',{value:'ab',repeat:'exact',min:2})]).ranges,[{start:4,end:5}]);
  const text='汉😀字!';
  const result=diagnose(text,[rule('chinese',{repeat:'oneOrMore'})]);
  assert.deepEqual(result.ranges,[{start:1,end:3},{start:4,end:5}]);
  assert.deepEqual(red('😀😄',diagnose('😀😄',[rule('oneOf',{charMode:'ranges',rangeText:'😀-😃',repeat:'oneOrMore'})])),['😄']);
});

test('flags, optional rules, range counts, exclusions and unanchored context work',()=>{
  assert.deepEqual(diagnose('abc',[rule('literal',{value:'ABC'})],{flags:'iu'}).ranges,[]);
  assert.deepEqual(diagnose('ab',[rule('literal',{value:'x',repeat:'optional'}),rule('literal',{value:'ab'})]).ranges,[]);
  assert.deepEqual(diagnose('1234',[rule('digit',{repeat:'range',min:1,max:3})]).ranges,[{start:3,end:4}]);
  assert.deepEqual(red('a1b',diagnose('a1b',[rule('notOneOf',{charMode:'ranges',rangeText:'0-9',repeat:'oneOrMore'})])),['1']);
  assert.deepEqual(diagnose('prefix12suffix',[rule('digit',{repeat:'exact',min:2})],{start:false,end:false}).ranges,[]);
  assert.deepEqual(diagnose('12x',[rule('raw',{value:'[0-9]',repeat:'oneOrMore'})]).ranges,[{start:2,end:3}]);
});

test('unsupported or excessive complexity returns no speculative red ranges',()=>{
  assert.deepEqual(diagnose('abc',[rule('raw',{value:'(?=x)(a|b)\\1'})]),{ranges:[],precise:false});
  assert.deepEqual(diagnose('1'.repeat(181),[rule('digit',{repeat:'oneOrMore'})]),{ranges:[],precise:false});
  assert.deepEqual(diagnose('123',[rule('digit',{repeat:'exact',min:1000})]),{ranges:[],precise:false});
  const restored=new Function('return ('+locateInvalidCharacters.toString()+')')();
  assert.deepEqual(restored('12x',{rules:[rule('digit',{repeat:'oneOrMore'})],start:true,end:true,flags:'u'}).ranges,[{start:2,end:3}]);
});

test('multiline anchors and inconsistent source return conservative diagnostics',()=>{
  assert.deepEqual(diagnose('\n',[rule('any')],{flags:'mu'}),{ranges:[],precise:false});
  assert.deepEqual(diagnose('12\nx',[rule('digit',{repeat:'oneOrMore'})],{flags:'mu'}),{ranges:[],precise:false});
  assert.deepEqual(diagnose('a\nb',[rule('literal',{value:'a\nb'})],{flags:'mu'}),{ranges:[],precise:false});
  assert.deepEqual(diagnose('\n',[rule('any')],{flags:'u',start:false,end:false}).ranges,[{start:0,end:1}]);
  assert.deepEqual(diagnose('\n',[rule('any')],{flags:'u'}).ranges,[{start:0,end:1}]);
  assert.deepEqual(diagnose('\n',[rule('any')],{flags:'su'}).ranges,[]);
  assert.deepEqual(diagnose('12x',[rule('digit',{repeat:'oneOrMore'})],{source:'(?=a)\\d+'}),{ranges:[],precise:false});
  const rules=[rule('literal',{value:'ab',repeat:'optional'}),rule('oneOf',{charMode:'ranges',rangeText:'0-7',repeat:'oneOrMore'})];
  assert.equal(diagnose('ab12x',rules,{source:buildPattern(rules)}).precise,true);
  assert.deepEqual(diagnose('ab12x',rules,{source:buildPattern(rules)}).ranges,[{start:4,end:5}]);
});

test('bounded worst-case 180-character input remains practical',t=>{
  const rules=[rule('literal',{value:'ab',repeat:'exact',min:64})];
  const start=performance.now();
  const result=diagnose('x'.repeat(180),rules,{source:buildPattern(rules)});
  t.diagnostic(`180-character/128-pattern-character alignment: ${(performance.now()-start).toFixed(1)} ms`);
  assert.equal(result.precise,true);
  assert.deepEqual(result.ranges,[{start:0,end:180}]);
  const multiline=('123x\n'.repeat(36)).slice(0,180);
  const multiStart=performance.now();
  assert.deepEqual(diagnose(multiline,rules,{flags:'mu'}),{ranges:[],precise:false});
  t.diagnostic(`180-character multiline conservative fallback: ${(performance.now()-multiStart).toFixed(1)} ms`);
});

test('real catalog email diagnoses illegal hyphen and absent at-sign without false red',()=>{
  const entry=CATALOG.find(item=>item.id==='email');
  const parsed=parseTemplate(entry.pattern,entry.flags);
  const plan={...parsed,flags:entry.flags,source:buildPattern(parsed.rules,parsed)};
  for(const text of ['hello@example.com','name+tag@sample.cn']) assert.deepEqual(locateInvalidCharacters(text,plan),{ranges:[],precise:true});
  assert.deepEqual(locateInvalidCharacters('name@-example.com',plan),{ranges:[{start:5,end:6}],precise:true});
  const missing=locateInvalidCharacters('hello.example.com',plan);
  assert.equal(missing.precise,true);
  assert.equal(missing.missing,true);
  assert.deepEqual(missing.ranges,[]);
  assert.ok(missing.missingLiterals.includes('@'));
});

test('ordinary groups, branches and nested repeat syntax align without capture dependencies',()=>{
  const rules=[rule('raw',{value:'(?:ab|cd){2,3}(x|y)?'})];
  assert.deepEqual(diagnose('abcdx',rules).ranges,[]);
  assert.deepEqual(diagnose('abcd!',rules).ranges,[{start:4,end:5}]);
  assert.deepEqual(diagnose('abXcd',rules).ranges,[{start:2,end:3}]);
  assert.equal(diagnose('abc',[rule('raw',{value:'(?=a)abc'})]).precise,false);
  assert.equal(diagnose('abab',[rule('raw',{value:'(ab)\\1'})]).precise,false);
});

test('every supported catalog template keeps its valid examples unmarked',()=>{
  for(const entry of CATALOG) {
    const parsed=parseTemplate(entry.pattern,entry.flags);
    const plan={...parsed,flags:entry.flags,source:buildPattern(parsed.rules,{...parsed,multiline:entry.flags.includes('m')})};
    for(const text of entry.valid) {
      const result=locateInvalidCharacters(text,plan);
      if(result.precise) {
        assert.deepEqual(result.ranges,[],entry.id+': '+text);
        assert.ok(!result.missing,entry.id+': '+text);
      }
    }
  }
});
