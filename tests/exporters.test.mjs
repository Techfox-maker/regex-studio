import test from 'node:test';
import assert from 'node:assert/strict';
import {formatRegex,LANGUAGES} from '../src/exporters.mjs';
const strict='^\\d+$(?![\\s\\S])';
test('scoped modifiers stop automatic translation before changing dot semantics',()=>{
  for(const language of ['python','java','csharp']){
    const result=formatRegex('(?s:a.b)','u',language);
    assert.match(result.error,/局部修饰符/);
    assert.equal(result.copy,'');
  }
  assert.equal(formatRegex('(?s:a.b)','u','javascript').error,'');
});
test('all languages exported and JavaScript remains canonical',()=>{
  assert.equal(LANGUAGES.length,4);
  assert.equal(formatRegex('a/b','u','javascript').copy,'/a\\/b/u');
});
test('strict endings and flag mappings',()=>{
  const py=formatRegex(strict,'imsu','python');assert.match(py.copy,/\\\\Z/);assert.match(py.copy,/re.ASCII.*re.IGNORECASE.*re.MULTILINE.*re.DOTALL/);assert.equal(py.error,'');
  const java=formatRegex(strict,'imsu','java');assert.match(java.copy,/\\\\z/);assert.match(java.copy,/Pattern.CASE_INSENSITIVE/);assert.match(java.copy,/Pattern.MULTILINE/);assert.match(java.copy,/Pattern.DOTALL/);
  const cs=formatRegex(strict,'imsu','csharp');assert.match(cs.copy,/\\z/);assert.match(cs.copy,/RegexOptions.Singleline/);assert.doesNotMatch(cs.copy,/ECMAScript/);
});
test('language strings escape quotes and backslashes',()=>{
  const source='"\\\\x\\n';
  const py=formatRegex(source,'u','python');assert.ok(py.copy.includes('\\"'));assert.ok(py.copy.includes('\\\\\\\\'));
  const cs=formatRegex(source,'u','csharp');assert.ok(cs.copy.includes('@"""'));assert.ok(cs.copy.includes('\\\\x'));
});
test('Unicode script property maps to Java and errors for unsupported engines',()=>{
  assert.match(formatRegex('\\p{Script=Han}+','u','java').copy,/IsHan/);
  assert.ok(formatRegex('\\p{Script=Han}+','u','python').error);
  assert.ok(formatRegex('\\p{Script=Han}+','u','csharp').error);
  assert.ok(formatRegex('\\p{Emoji}+','u','java').error);
});
test('named references use Python syntax',()=>{
  const py=formatRegex('(?<word>a)\\k<word>','u','python');assert.ok(py.copy.includes('(?P<word>a)(?P=word)'));assert.equal(py.error,'');
  assert.ok(formatRegex('(?<under_score>a)','u','java').error);
});
test('global flag maps to iteration APIs',()=>{
  assert.match(formatRegex('a','gu','python').copy,/finditer\(text\)/);
  assert.match(formatRegex('a','gu','java').copy,/matcher.find\(\)/);
  assert.match(formatRegex('a','gu','csharp').copy,/regex.Matches\(text\)/);
});
test('shorthand classes and dot are made explicit, supplementary C# fails clearly',()=>{
  assert.ok(formatRegex('\\d\\w\\s.','u','csharp').copy.includes('[0-9][A-Za-z0-9_]'));
  assert.ok(formatRegex('.','u','python').copy.includes('[^\\\\n\\\\r'));
  assert.ok(formatRegex('😀+','u','csharp').error);
  assert.ok(formatRegex('a','y','python').error);
  assert.equal(formatRegex('[\\s\\S]+','u','python').error,'');
  assert.ok(formatRegex('[\\s\\S]+','u','python').copy.includes('[\\\\s\\\\S]+'));
  assert.ok(formatRegex('[\\S_]','u','python').error);
  assert.ok(formatRegex('\\cA\\0','u','java').copy.includes('\\\\x01\\\\x00'));
});
