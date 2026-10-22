import test from 'node:test';
import assert from 'node:assert/strict';
import {SHELL_LANGUAGES,formatShellRegex} from '../src/shell-exporters.mjs';
import {CATALOG} from '../src/catalog.mjs';
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';

test('five shell profiles and strict end conversion',()=>{
  assert.equal(SHELL_LANGUAGES.length,5);
  const ere=formatShellRegex('^\\d+$(?![\\s\\S])','u','grep-ere');
  assert.equal(ere.error,'');assert.ok(ere.copy.includes("'^[0-9]+$'"));assert.match(ere.notice,/按行/);
  assert.ok(formatShellRegex('^a$(?![\\s\\S])','u','grep-pcre').copy.includes('a\\z'));
});
test('shell quoting treats apostrophes and substitution literally',()=>{
  const result=formatShellRegex("a'b\\$\\(x\\)",'u','grep-ere');
  assert.ok(result.copy.includes("'a'\"'\"'b"));assert.match(result.copy,/-- /);
});
test('ERE declines unsupported constructs while GNU profiles support numeric backrefs',()=>{
  assert.ok(formatShellRegex('(?:ab)+','u','grep-ere').copy.includes("'(ab)+'"));
  for(const source of ['a+?','(?=a)a','\\bword\\b','\\p{L}+','\\s+','[\\D_]'])assert.ok(formatShellRegex(source,'u','grep-ere').error,source);
  assert.equal(formatShellRegex('(a)\\1','u','grep-ere').error,'');
  assert.ok(formatShellRegex('(a)\\1','u','awk').error);
  assert.ok(formatShellRegex('(a)\\1','u','bash').error);
});
test('noncapturing wrappers remap backrefs without counting escaped or class parentheses',()=>{
  const source='^(?:([a-z])(?:x))\\1$(?![\\s\\S])';
  assert.ok(formatShellRegex(source,'u','grep-ere').copy.includes('^(([a-z])(x))\\2$'));
  const escaped='^(?:\\([()]([a-z])\\))\\1$';
  assert.ok(formatShellRegex(escaped,'u','grep-ere').copy.includes('\\2$'));
  const overflow='(?:x)'.repeat(9)+'(a)\\1';
  assert.match(formatShellRegex(overflow,'u','grep-ere').error,/1–9/);
});
test('MAC catalog exports to GNU grep and sed, with awk still declined',()=>{
  const mac=CATALOG.find(item=>item.id==='mac');
  for(const id of ['grep-ere','sed']){
    const result=formatShellRegex(mac.pattern,mac.flags,id);
    assert.equal(result.error,'',id);assert.ok(result.copy.includes('\\2'),id);
  }
  assert.ok(formatShellRegex(mac.pattern,mac.flags,'awk').error);
});
test('mode flags map honestly to available commands',()=>{
  assert.match(formatShellRegex('a','igu','grep-ere').copy,/-i -o/);
  assert.match(formatShellRegex('a','igu','grep-ere').notice,/空匹配/);
  assert.ok(formatShellRegex('a','su','grep-ere').error);
  assert.match(formatShellRegex('a','iu','sed').copy,/\/Ip/);
  assert.match(formatShellRegex('a','iu','awk').copy,/gawk -v IGNORECASE=1/);
  const bash=formatShellRegex('a','iu','bash');assert.match(bash.copy,/shopt -s nocasematch/);assert.match(bash.copy,/\[\[ \$text =~ \$pattern \]\]/);
});
test('PCRE handles codepoints and properties while ERE declines them',()=>{
  assert.ok(formatShellRegex('\\u{4e2d}+','u','grep-pcre').copy.includes('\\x{4e2d}'));
  assert.ok(formatShellRegex('\\p{Script=Han}+','u','grep-pcre').copy.includes('\\p{sc=Han}'));
  assert.ok(formatShellRegex('中文+','u','grep-ere').error);
  assert.ok(formatShellRegex('\\p{Emoji}+','u','grep-pcre').error);
  assert.ok(formatShellRegex('\\uD800','u','grep-pcre').error);
});
test('sed and awk delimiters are escaped',()=>{
  const sed=formatShellRegex('a/b','u','sed');assert.ok(sed.copy.includes('a\\/b'));
  const awk=formatShellRegex('a/b','u','awk');assert.ok(awk.copy.includes('a\\/b'));
});
test('available Git-bundled GNU grep/sed execute nested and MAC backreferences correctly',t=>{
  if(process.env.RUN_GNU_INTEGRATION!=='1'){t.skip('Optional Windows/MSYS runtime check; set RUN_GNU_INTEGRATION=1 in a compatible environment.');return;}
  if(process.platform!=='win32'){t.skip('This optional check discovers Windows Git-bundled GNU tools.');return;}
  const lookup=spawnSync('where.exe',['git'],{encoding:'utf8'});
  const git=lookup.stdout?.split(/\r?\n/).find(Boolean);
  if(lookup.status!==0||!git){t.skip('Git executable unavailable.');return;}
  const root=path.dirname(path.dirname(git));
  const grep=path.join(root,'usr','bin','grep.exe'),sed=path.join(root,'usr','bin','sed.exe');
  if(!existsSync(grep)||!existsSync(sed)){t.skip('Git does not include GNU grep/sed.');return;}
  const mac=CATALOG.find(item=>item.id==='mac');
  const cases=[
    {source:'^(?:([a-z])(?:x))\\1$(?![\\s\\S])',flags:'u',input:'axa\naxb\nbxb\n',expected:'axa\nbxb\n'},
    {source:mac.pattern,flags:mac.flags,input:[...mac.valid,...mac.invalid].join('\n')+'\n',expected:mac.valid.join('\n')+'\n'},
  ];
  for(const item of cases){
    const grepCommand=formatShellRegex(item.source,item.flags,'grep-ere').copy;
    const pattern=grepCommand.match(/-- '([^']+)' input\.txt/)?.[1];
    assert.ok(pattern,'grep pattern present');
    const grepRun=spawnSync(grep,['-E','--','"'+pattern+'"'],{input:item.input,encoding:'utf8',argv0:'"'+grep+'"',windowsVerbatimArguments:true,env:{...process.env,LC_ALL:'C'}});
    assert.equal(grepRun.status,0,JSON.stringify({pattern,input:item.input,error:grepRun.stderr}));assert.equal(grepRun.stdout,item.expected);
    const sedCommand=formatShellRegex(item.source,item.flags,'sed').copy;
    const program=sedCommand.match(/-n '([^']+)' input\.txt/)?.[1];
    assert.ok(program,'sed program present');
    const sedRun=spawnSync(sed,['-E','-n','"'+program+'"'],{input:item.input,encoding:'utf8',argv0:'"'+sed+'"',windowsVerbatimArguments:true,env:{...process.env,LC_ALL:'C'}});
    assert.equal(sedRun.status,0,sedRun.stderr);assert.equal(sedRun.stdout,item.expected);
  }
});
