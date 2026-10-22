import test from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG} from '../src/catalog.mjs';

test('catalog has unique identifiers, categories, examples and primary-source links',()=>{
  assert.equal(CATALOG.length,45);
  assert.equal(new Set(CATALOG.map(item=>item.id)).size,CATALOG.length);
  assert.equal(new Set(CATALOG.map(item=>item.category)).size,6);
  for(const item of CATALOG){
    assert.ok(item.flags.includes('u'),item.id);
    assert.ok(item.description && item.note && item.example,item.id);
    assert.ok(item.valid.length>=2 && item.invalid.length>=2,item.id);
    assert.match(item.source.url,/^https:\/\/(?:developer\.mozilla\.org|html\.spec\.whatwg\.org|github\.com|semver\.org|www\.rfc-editor\.org)\//);
  }
});

for(const item of CATALOG){
  test(`${item.name}: accepts valid examples, rejects invalid examples and trailing newline`,()=>{
    for(const value of item.valid)assert.equal(new RegExp(item.pattern,item.flags).test(value),true,`${item.id} should accept ${JSON.stringify(value)}`);
    for(const value of item.invalid)assert.equal(new RegExp(item.pattern,item.flags).test(value),false,`${item.id} should reject ${JSON.stringify(value)}`);
    // Whitespace-only expressions intentionally accept newline as content.
    if(item.id!=='whitespace')assert.equal(new RegExp(item.pattern,item.flags).test(item.valid[0]+'\n'),false,`${item.id} trailing newline`);
    const literal=new Function(`return /${item.pattern}/${item.flags}`)();
    assert.equal(literal.source,new RegExp(item.pattern,item.flags).source,item.id+' is safe to copy as a regex literal');
  });
}
