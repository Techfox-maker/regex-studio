const strictEnd = '$(?![\\s\\S])';
const simpleTypes = new Map([
  ['\\d','digit'], ['[0-9]','digit'], ['\\w','word'], ['[A-Za-z0-9_]','word'],
  ['\\s','whitespace'], ['.','any'], ['[A-Za-z]','letter'], ['[a-zA-Z]','letter'],
  ['[a-z]','lower'], ['[A-Z]','upper'], ['[A-Za-z0-9]','alnum'], ['[a-zA-Z0-9]','alnum'],
  ['\\p{Script=Han}','chinese'], ['\\p{sc=Han}','chinese'],
]);

function escapeEnd(source, index) {
  const tail = source.slice(index);
  const match = /^(?:\\[pP]\{[^}]+\}|\\u\{[0-9a-fA-F]+\}|\\u[0-9a-fA-F]{4}|\\x[0-9a-fA-F]{2}|\\k<[^>]+>|\\[1-9][0-9]*|\\c[A-Za-z]|\\.)/su.exec(tail);
  return index + (match?.[0].length || 1);
}

function classEnd(source, index) {
  let cursor = index + 1;
  while (cursor < source.length) {
    if (source[cursor] === '\\') cursor = escapeEnd(source,cursor);
    else if (source[cursor++] === ']') return cursor;
  }
  return source.length;
}

function groupEnd(source,index) {
  let depth = 1;
  let cursor = index + 1;
  while (cursor < source.length) {
    const char = source[cursor];
    if (char === '\\') cursor = escapeEnd(source,cursor);
    else if (char === '[') cursor = classEnd(source,cursor);
    else {
      cursor++;
      if (char === '(') depth++;
      if (char === ')' && --depth === 0) return cursor;
    }
  }
  return source.length;
}

function hasTopLevelBranch(source) {
  for (let index=0;index<source.length;) {
    const char=source[index];
    if (char==='|') return true;
    if (char==='\\') index=escapeEnd(source,index);
    else if(char==='[') index=classEnd(source,index);
    else if(char==='(') index=groupEnd(source,index);
    else index++;
  }
  return false;
}

function makeRule(type,value='') {
  return {id:`rule-${Math.random().toString(36).slice(2,10)}`,type,value,repeat:'once',min:1,max:5,lazy:false};
}

function decodeLiteralEscape(atom) {
  if (/^\\[.*+?^${}()|[\]\\/\-]$/.test(atom)) return atom.slice(1);
  if (/^\\[nrtfv]$/.test(atom)) return ({n:'\n',r:'\r',t:'\t',f:'\f',v:'\v'})[atom[1]];
  return null;
}

function atomRule(atom) {
  if (simpleTypes.has(atom)) return makeRule(simpleTypes.get(atom));
  if (atom[0]==='[') {
    const negated=atom[1]==='^';
    const body=atom.slice(negated?2:1,-1);
    if(!/[\\,，\s]/u.test(body) && body.includes('-')) {
      const points=Array.from(body);
      const segments=[];
      let hasRange=false;
      for(let index=0;index<points.length;) {
        if(points[index+1]==='-' && index+2<points.length) {
          if(points[index].codePointAt(0)>points[index+2].codePointAt(0)) return makeRule('raw',atom);
          segments.push(points.slice(index,index+3).join(''));
          hasRange=true;
          index+=3;
        } else segments.push(points[index++]);
      }
      if(hasRange) return {...makeRule(negated?'notOneOf':'oneOf'),charMode:'ranges',rangeText:segments.join(',')};
    }
    let value='';
    for(let index=0;index<body.length;) {
      if(body[index]==='\\') {
        const end=escapeEnd(body,index);
        const literal=decodeLiteralEscape(body.slice(index,end));
        if(literal===null) return makeRule('raw',atom);
        value+=literal;
        index=end;
      } else {
        if(body[index]==='-' && index>0 && index<body.length-1) return makeRule('raw',atom);
        value+=body[index++];
      }
    }
    return value ? makeRule(negated?'notOneOf':'oneOf',value) : makeRule('raw',atom);
  }
  if(atom[0]==='\\') {
    const literal=decodeLiteralEscape(atom);
    return literal===null?makeRule('raw',atom):makeRule('literal',literal);
  }
  if('()^$|'.includes(atom[0])) return makeRule('raw',atom);
  return makeRule('literal',atom);
}

function applyQuantifier(rule,source,index) {
  const match=/^(?:([+*?])|\{(\d+)(?:(,)(\d*)?)?\})(\?)?/.exec(source.slice(index));
  if(!match) return index;
  if(match[1]) rule.repeat=({'+':'oneOrMore','*':'zeroOrMore','?':'optional'})[match[1]];
  else {
    rule.min=Number(match[2]);
    rule.repeat=match[3]?(match[4]?'range':'atLeast'):'exact';
    if(match[4]) rule.max=Number(match[4]);
  }
  rule.lazy=Boolean(match[5]);
  return index+match[0].length;
}

export function parseTemplate(pattern, flags='u') {
  new RegExp(pattern,flags);
  let source=pattern;
  // Anchors belong to individual alternatives in an ungrouped branch expression.
  if(hasTopLevelBranch(source)) return {rules:[makeRule('raw',source||'(?:)')],start:false,end:false};
  let start=source.startsWith('^');
  let end=false;
  if(start) source=source.slice(1);
  if(source.endsWith(strictEnd)) {end=true;source=source.slice(0,-strictEnd.length);}
  else if(flags.includes('m') && source.endsWith('$')) {
    let backslashes=0;
    for(let index=source.length-2;index>=0&&source[index]==='\\';index--) backslashes++;
    if(backslashes%2===0) {end=true;source=source.slice(0,-1);}
  }
  while(source.startsWith('(?:') && groupEnd(source,0)===source.length) source=source.slice(3,-1);
  if(hasTopLevelBranch(source)) return {rules:[makeRule('raw',source)],start,end};
  const rules=[];
  for(let index=0;index<source.length;) {
    const begin=index;
    const char=source[index];
    if(char==='(') index=groupEnd(source,index);
    else if(char==='[') index=classEnd(source,index);
    else if(char==='\\') index=escapeEnd(source,index);
    else index+=String.fromCodePoint(source.codePointAt(index)).length;
    const rule=atomRule(source.slice(begin,index));
    index=applyQuantifier(rule,source,index);
    const previous=rules.at(-1);
    if(previous?.type==='literal' && previous.repeat==='once' && rule.type==='literal' && rule.repeat==='once') previous.value+=rule.value;
    else rules.push(rule);
  }
  return {rules:rules.length?rules:[makeRule('raw','(?:)')],start,end};
}
