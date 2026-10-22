const TYPES = [
  ['digit', '数字', '\\d', '0–9 中的任意一个数字', false],
  ['letter', '英文字母', '[A-Za-z]', '任意一个大写或小写英文字母', false],
  ['lower', '小写字母', '[a-z]', 'a–z 中的任意一个小写字母', false],
  ['upper', '大写字母', '[A-Z]', 'A–Z 中的任意一个大写字母', false],
  ['alnum', '字母或数字', '[A-Za-z0-9]', '任意一个英文字母或数字', false],
  ['word', '字母、数字、下划线', '\\w', '任意一个英文字母、数字或下划线', false],
  ['chinese', '汉字', '\\p{Script=Han}', '任意一个汉字（需启用 u 标记）', false],
  ['whitespace', '空白字符', '\\s', '空格、制表符或换行等空白字符', false],
  ['any', '任意字符', '.', '任意一个非换行字符；启用 s 标记时也匹配换行', false],
  ['literal', '指定文本', '', '按原样匹配输入的文本，自动转义特殊符号', true],
  ['oneOf', '指定字符之一', '[]', '匹配输入字符中的任意一个，符号按原样处理', true],
  ['notOneOf', '排除指定字符', '[^]', '匹配输入字符以外的任意一个字符', true],
  ['raw', '正则片段', '', '保留分组、分支、断言等完整正则语法', true],
];

export const RULE_TYPES = TYPES.map(([id, label, token, description, needsValue]) => ({id, label, token, description, needsValue}));
export const REPETITIONS = [
  {id:'once', label:'1 次'},
  {id:'oneOrMore', label:'1 次或更多'},
  {id:'zeroOrMore', label:'0 次或更多'},
  {id:'optional', label:'0 或 1 次'},
  {id:'exact', label:'指定次数'},
  {id:'range', label:'次数范围'},
  {id:'atLeast', label:'至少次数'},
];

const typeMap = new Map(RULE_TYPES.map(type => [type.id, type]));
const repeatMap = new Map(REPETITIONS.map(repeat => [repeat.id, repeat]));
const escapeLineBreaks = value => value.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const escapeLiteral = value => escapeLineBreaks(value.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'));
const escapeClass = value => escapeLineBreaks(value.replace(/[\\\]\[\-^/]/g, '\\$&'));

function characterRanges(value) {
  if(typeof value!=='string' || !value.trim()) throw new Error('请填写字符范围，例如 A-Z,a-c,0-7');
  return value.split(/[,，]/).map((part,index)=>{
    const segment=part.trim();
    if(!segment) throw new Error(`第 ${index+1} 段字符范围不能为空`);
    const points=Array.from(segment);
    if(points.length===1) return escapeClass(segment);
    if(points.length!==3 || points[1]!=='-') throw new Error(`第 ${index+1} 段格式不正确：请输入单个字符或 A-Z 形式的范围`);
    if(points[0].codePointAt(0)>points[2].codePointAt(0)) throw new Error(`第 ${index+1} 段范围倒置：起点不能大于终点`);
    return escapeClass(points[0])+'-'+escapeClass(points[2]);
  }).join('');
}

function count(value, label) {
  if ((typeof value !== 'number' && typeof value !== 'string') || !/^\d+$/.test(String(value))) throw new Error(`${label}必须是大于或等于 0 的整数`);
  const result = Number(value);
  if (!Number.isSafeInteger(result)) throw new Error(`${label}超出可用范围`);
  return result;
}

function quantifier(rule) {
  const repeat = rule.repeat || 'once';
  if (!repeatMap.has(repeat)) throw new Error('请选择有效的重复次数');
  switch (repeat) {
    case 'once': return '';
    case 'oneOrMore': return '+';
    case 'zeroOrMore': return '*';
    case 'optional': return '?';
    case 'exact': return `{${count(rule.min, '重复次数')}}`;
    case 'atLeast': return `{${count(rule.min, '最少次数')},}`;
    case 'range': {
      const min = count(rule.min, '最少次数');
      const max = count(rule.max, '最多次数');
      if (min > max) throw new Error('最多次数不能小于最少次数');
      return `{${min},${max}}`;
    }
  }
}

export function ruleSource(rule) {
  if (!rule || typeof rule !== 'object') throw new Error('规则格式不正确');
  const type = typeMap.get(rule.type);
  if (!type) throw new Error('请选择有效的规则类型');
  let source = type.token;
  if (type.needsValue) {
    const usesRanges=(rule.type==='oneOf'||rule.type==='notOneOf') && rule.charMode==='ranges';
    if(usesRanges) source=`[${rule.type==='notOneOf'?'^':''}${characterRanges(rule.rangeText)}]`;
    else {
      if (typeof rule.value !== 'string' || !rule.value.length) throw new Error(`请填写「${type.label}」的内容`);
      if (rule.type === 'raw') source = `(?:${rule.value})`;
      else if (rule.type === 'literal') source = escapeLiteral(rule.value);
      else source = `[${rule.type === 'notOneOf' ? '^' : ''}${escapeClass(rule.value)}]`;
    }
  }
  const quant = quantifier(rule);
  if (quant && rule.type === 'literal' && rule.value.length > 1) source = `(?:${source})`;
  return source + quant + (quant && rule.lazy ? '?' : '');
}

export function buildPattern(rules, {start = true, end = true, multiline = false} = {}) {
  if (!Array.isArray(rules)) throw new Error('规则列表格式不正确');
  if (!rules.length) return '';
  const body = rules.map(ruleSource).join('');
  // The final assertion makes the end strict even when $ can precede a final newline.
  return (start ? '^' : '') + body + (end ? (multiline ? '$' : '$(?![\\s\\S])') : '');
}

export function explainRule(rule) {
  ruleSource(rule);
  const type = typeMap.get(rule.type);
  let subject = type.label;
  if (rule.type === 'literal') subject = `文本「${rule.value}」`;
  if (rule.type === 'oneOf') subject = `「${rule.value}」中的任意字符`;
  if (rule.type === 'notOneOf') subject = `「${rule.value}」以外的字符`;
  if ((rule.type==='oneOf'||rule.type==='notOneOf') && rule.charMode==='ranges') subject=`${rule.type==='notOneOf'?'排除':'匹配'}字符范围「${rule.rangeText}」中的任意字符`;
  if (rule.type === 'raw') subject = `正则片段「${rule.value}」（保留原有分组、分支与断言）`;
  const repeat = rule.repeat || 'once';
  const repetition = repeat === 'exact' ? `${Number(rule.min)} 次` : repeat === 'range' ? `${Number(rule.min)}–${Number(rule.max)} 次` : repeat === 'atLeast' ? `至少 ${Number(rule.min)} 次` : repeatMap.get(repeat).label;
  return `${subject}，匹配 ${repetition}${rule.lazy && repeat !== 'once' ? '，尽可能少匹配' : ''}`;
}

function makeRule(type, repeat = 'once', options = {}) {
  return {id: `rule-${Math.random().toString(36).slice(2, 10)}`, type, value:'', repeat, min:1, max:5, lazy:false, ...options};
}

export function getTemplate(name) {
  const digits = '0123456789';
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const common = {start:true, end:true, flags:'u'};
  switch (name) {
    case 'username': return {...common, rules:[makeRule('letter'), makeRule('word','range',{min:4,max:15})], sample:'hello_2026\nCodex\n1invalid\nab\nregex_builder'};
    case 'phone': return {...common, rules:[makeRule('literal','once',{value:'1'}),makeRule('oneOf','once',{value:'3456789'}),makeRule('digit','exact',{min:9})], sample:'13800138000\n19912345678\n12800138000\n1380013800'};
    case 'email': return {...common, rules:[makeRule('oneOf','oneOrMore',{value:letters+digits+'._%+-'}),makeRule('literal','once',{value:'@'}),makeRule('oneOf','oneOrMore',{value:letters+digits+'.-'}),makeRule('literal','once',{value:'.'}),makeRule('letter','atLeast',{min:2})], sample:'hello@example.com\nname+tag@sample.cn\ninvalid@email\nhello.example.com'};
    case 'date': return {...common, rules:[makeRule('digit','exact',{min:4}),makeRule('literal','once',{value:'-'}),makeRule('digit','exact',{min:2}),makeRule('literal','once',{value:'-'}),makeRule('digit','exact',{min:2})], sample:'2026-10-21\n2025-01-01\n2026/10/21\n26-10-21'};
    case 'number': return {...common, rules:[makeRule('literal','optional',{value:'-'}),makeRule('digit','oneOrMore')], sample:'2026\n-42\n0\n3.14\nhello'};
    default: throw new Error('找不到这个模板');
  }
}
