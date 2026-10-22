import test from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG} from '../src/catalog.mjs';
import {getCatalogChecks} from '../src/catalog-checks.mjs';

test('all catalog checks are necessary conditions and never reject catalog valid examples',()=>{
  for(const item of CATALOG){
    const checks=getCatalogChecks(item.id);
    assert.ok(checks.length>0,item.id+' has checks');
    for(const value of item.valid)for(const check of checks)assert.equal(new RegExp(check.pattern,item.flags.replace('g','')).test(value),true,item.id+' '+JSON.stringify(value)+' '+check.message);
  }
});
function failure(id,value){return getCatalogChecks(id).find(check=>!new RegExp(check.pattern,'u').test(value))?.message;}
test('phone failures identify composition, length and individual prefix digits',()=>{
  assert.match(failure('phone-cn','138a0138000'),/只能包含数字/);
  assert.match(failure('phone-cn','1380013800'),/11 位/);
  assert.match(failure('phone-cn','23800138000'),/第 1 位/);
  assert.match(failure('phone-cn','12800138000'),/第 2 位/);
});
test('date failures identify month and day, and IP failures identify octet position',()=>{
  assert.match(failure('date-dash','2026-13-01'),/月份/);
  assert.match(failure('date-dash','2026-10-32'),/日必须/);
  assert.match(failure('ipv4','192.256.1.1'),/第 2 段/);
  assert.match(failure('ipv4','192.168.1.256'),/第 4 段/);
});
