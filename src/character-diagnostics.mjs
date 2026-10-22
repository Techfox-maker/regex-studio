export function locateInvalidCharacters(text, plan) {
  // Self-contained: the browser serializes this function into the matching Worker.
  const uncertain=()=>({ranges:[],precise:false});
  try {
    if(typeof text!=='string' || !plan || !Array.isArray(plan.rules)) return uncertain();
    const chars=Array.from(text);
    if(chars.length>180 || plan.rules.length>40) return uncertain();
    // Per-line anchors need context beyond this character-sequence alignment.
    if((plan.flags||'').includes('m') && (plan.start!==false||plan.end!==false) && /[\r\n\u2028\u2029]/u.test(text)) return uncertain();
    const offsets=[0];
    for(const char of chars) offsets.push(offsets.at(-1)+char.length);
    const regexFlags=(plan.flags||'u').replace(/[gmyd]/g,'');
    const charFlags=/[uv]/.test(regexFlags)?regexFlags:regexFlags+'u';
    const escape=value=>value.replace(/[.*+?^${}()|[\]\\/]/g,'\\$&');
    const escapeClass=value=>value.replace(/[\\\]\[\-^/]/g,'\\$&');
    const nodes=[];
    const node=()=>{if(nodes.length>=260) throw Error('large');nodes.push({eps:[],edges:[]});return nodes.length-1;};
    const tokens={digit:'\\d',letter:'[A-Za-z]',lower:'[a-z]',upper:'[A-Z]',alnum:'[A-Za-z0-9]',word:'\\w',chinese:'\\p{Script=Han}',whitespace:'\\s',any:'.'};
    const predicate=source=>{const regex=new RegExp('^(?:'+source+')$',charFlags);return char=>regex.test(char);};
    function literalPredicate(value) {const result=predicate(escape(value));result.literal=value;return result;}
    function parseRaw(source) {
      let cursor=0,depth=0;
      function expression() {
        if(++depth>16) throw Error('deep');
        const branches=[sequence()];
        while(source[cursor]==='|') {cursor++;branches.push(sequence());}
        depth--;
        return branches.length===1?branches[0]:{kind:'alt',children:branches};
      }
      function sequence() {
        const children=[];
        while(cursor<source.length&&source[cursor]!==')'&&source[cursor]!=='|') {
          let child=atom();
          const tail=source.slice(cursor);
          const quantity=/^(?:([*+?])|\{(\d+)(?:(,)(\d*)?)?\})/.exec(tail);
          if(quantity) {
            cursor+=quantity[0].length;
            if(source[cursor]==='?') cursor++;
            const repeat=quantity[1]?({'*':'zeroOrMore','+':'oneOrMore','?':'optional'})[quantity[1]]:quantity[3]?(quantity[4]?'range':'atLeast'):'exact';
            const [min,max]=bounds({repeat,min:quantity[2],max:quantity[4]});
            child={kind:'repeat',child,min,max};
          }
          children.push(child);
        }
        return {kind:'seq',children};
      }
      function atom() {
        const begin=cursor,char=source[cursor++];
        if(char==='(') {
          if(source[cursor]==='?') {
            if(source.slice(cursor,cursor+2)!=='?:') throw Error('assertion');
            cursor+=2;
          }
          const child=expression();
          if(source[cursor++]!==')') throw Error('group');
          return child;
        }
        if(char==='[') {
          let closed=false;
          while(cursor<source.length) {
            const next=source[cursor++];
            if(next==='\\') cursor++;
            else if(next===']') {closed=true;break;}
          }
          if(!closed) throw Error('class');
          return {kind:'atom',test:predicate(source.slice(begin,cursor))};
        }
        if(char==='\\') {
          const match=/^\\(?:[pP]\{[^}]+\}|u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|c[A-Za-z]|[\s\S])/u.exec(source.slice(begin));
          if(!match||/^\\(?:[1-9]|k|b|B)/u.test(match[0])) throw Error('reference');
          cursor=begin+match[0].length;
          const atomSource=match[0];
          const test=predicate(atomSource);
          if(/^\\[^A-Za-z0-9]$/u.test(atomSource)) test.literal=atomSource.slice(1);
          return {kind:'atom',test};
        }
        if('^$*+?{}'.includes(char)) throw Error('boundary');
        if(char==='.') return {kind:'atom',test:predicate('.')};
        const value=String.fromCodePoint(source.codePointAt(begin));
        cursor=begin+value.length;
        return {kind:'atom',test:literalPredicate(value)};
      }
      const result=expression();
      if(cursor!==source.length) throw Error('syntax');
      return result;
    }
    function atoms(rule) {
      if(rule.type==='literal') {
        if(typeof rule.value!=='string'||!rule.value.length) throw Error('empty');
        const result=Array.from(rule.value).map(literalPredicate);
        result.source=escape(rule.value);
        return result;
      }
      let source=tokens[rule.type];
      if(rule.type==='oneOf'||rule.type==='notOneOf') {
        let value;
        if(rule.charMode==='ranges') {
          if(typeof rule.rangeText!=='string'||!rule.rangeText.trim()) throw Error('empty');
          value=rule.rangeText.split(/[,，]/).map(part=>{
            const points=Array.from(part.trim());
            if(points.length===1) return escapeClass(points[0]);
            if(points.length!==3||points[1]!=='-'||points[0].codePointAt(0)>points[2].codePointAt(0)) throw Error('range');
            return escapeClass(points[0])+'-'+escapeClass(points[2]);
          }).join('');
        } else {
          if(typeof rule.value!=='string'||!rule.value.length) throw Error('empty');
          value=escapeClass(rule.value);
        }
        source='['+(rule.type==='notOneOf'?'^':'')+value+']';
      }
      if(rule.type==='raw') {
        source=rule.value;
        if(typeof source!=='string'||!source.length) throw Error('complex');
        const result=[];
        result.ast=parseRaw(source);
        result.source='(?:'+source+')';
        return result;
      }
      if(!source) throw Error('unsupported');
      const result=[predicate(source)];
      result.source=rule.type==='raw'?'(?:'+source+')':source;
      return result;
    }
    function bounds(rule) {
      const repeat=rule.repeat||'once';
      let min,max;
      if(repeat==='once') [min,max]=[1,1];
      else if(repeat==='optional') [min,max]=[0,1];
      else if(repeat==='zeroOrMore') [min,max]=[0,Infinity];
      else if(repeat==='oneOrMore') [min,max]=[1,Infinity];
      else if(repeat==='exact') min=max=Number(rule.min);
      else if(repeat==='range') [min,max]=[Number(rule.min),Number(rule.max)];
      else if(repeat==='atLeast') [min,max]=[Number(rule.min),Infinity];
      else throw Error('repeat');
      if(!Number.isInteger(min)||min<0||min>64||max<min||(max!==Infinity&&(!Number.isInteger(max)||max>64))) throw Error('large');
      return [min,max];
    }
    function unit(from,to,tests) {
      if(tests.ast) {emit(tests.ast,from,to);return;}
      let current=from;
      tests.forEach((test,index)=>{
        const next=index===tests.length-1?to:node();
        nodes[current].edges.push({to:next,test});
        current=next;
      });
    }
    function emit(ast,from,to) {
      if(ast.kind==='atom') {nodes[from].edges.push({to,test:ast.test});return;}
      if(ast.kind==='alt') {for(const child of ast.children) emit(child,from,to);return;}
      if(ast.kind==='seq') {
        let position=from;
        if(!ast.children.length) nodes[from].eps.push(to);
        ast.children.forEach((child,index)=>{const next=index===ast.children.length-1?to:node();emit(child,position,next);position=next;});
        return;
      }
      let position=from;
      for(let index=0;index<ast.min;index++) {const next=node();emit(ast.child,position,next);position=next;}
      if(ast.max===Infinity) {nodes[position].eps.push(to);emit(ast.child,position,position);}
      else {
        for(let index=ast.min;index<ast.max;index++) {const next=node();nodes[position].eps.push(next);emit(ast.child,position,next);position=next;}
        nodes[position].eps.push(to);
      }
    }
    const first=node();
    let current=first;
    const ruleSources=[];
    for(const rule of plan.rules) {
      const tests=atoms(rule);
      const [min,max]=bounds(rule);
      const repeat=rule.repeat||'once';
      const quantity=({once:'',optional:'?',zeroOrMore:'*',oneOrMore:'+',exact:'{'+min+'}',range:'{'+min+','+max+'}',atLeast:'{'+min+',}'})[repeat];
      let ruleSource=tests.source;
      if(quantity&&rule.type==='literal'&&rule.value.length>1) ruleSource='(?:'+ruleSource+')';
      ruleSources.push(ruleSource+quantity+(quantity&&rule.lazy?'?':''));
      for(let index=0;index<min;index++) {const next=node();unit(current,next,tests);current=next;}
      if(max===Infinity) {
        const next=node();
        nodes[current].eps.push(next);
        unit(current,current,tests);
        current=next;
      } else for(let index=min;index<max;index++) {const next=node();nodes[current].eps.push(next);unit(current,next,tests);current=next;}
    }
    if(typeof plan.source==='string') {
      const expected=plan.rules.length?(plan.start===false?'':'^')+ruleSources.join('')+(plan.end===false?'':(plan.flags||'').includes('m')?'$':'$(?![\\s\\S])'):'';
      if(new RegExp(expected,regexFlags).source!==new RegExp(plan.source,regexFlags).source) return uncertain();
    }
    const last=current;
    if(plan.start===false) nodes[first].edges.push({to:first,test:()=>true,free:true});
    if(plan.end===false) nodes[last].edges.push({to:last,test:()=>true,free:true});
    const width=nodes.length;
    const total=width*(chars.length+1);
    const distances=new Float64Array(total);distances.fill(Infinity);
    const previous=new Int32Array(total);previous.fill(-1);
    const marked=new Int32Array(total);marked.fill(-1);
    const missingSteps=new Uint8Array(total);
    const missingText=new Array(total);
    const heap=[];
    function push(score,key) {
      let index=heap.length;heap.push([score,key]);
      while(index>0) {const parent=(index-1)>>1;if(heap[parent][0]<=score) break;heap[index]=heap[parent];index=parent;}
      heap[index]=[score,key];
    }
    function pop() {
      const head=heap[0],tail=heap.pop();
      if(heap.length) {
        let index=0;
        while(true) {let child=index*2+1;if(child>=heap.length) break;if(child+1<heap.length&&heap[child+1][0]<heap[child][0]) child++;if(heap[child][0]>=tail[0]) break;heap[index]=heap[child];index=child;}
        heap[index]=tail;
      }
      return head;
    }
    function relax(from,to,score,mark=-1,missing=false,literal='') {
      if(score>=distances[to]) return;
      distances[to]=score;previous[to]=from;marked[to]=mark;missingSteps[to]=missing?1:0;missingText[to]=literal;push(score,to);
    }
    distances[first]=0;push(0,first);
    const target=chars.length*width+last;
    let visits=0;
    while(heap.length) {
      const [score,key]=pop();
      if(score!==distances[key]) continue;
      if(key===target) break;
      if(++visits>65000) return uncertain();
      const index=Math.floor(key/width),state=key%width;
      for(const next of nodes[state].eps) relax(key,index*width+next,score);
      if(index<chars.length) relax(key,(index+1)*width+state,score+1000000000+100000+(chars.length-index),index);
      for(const edge of nodes[state].edges) {
        // Prefer an absent mandatory literal over staining an existing character.
        // For generic classes, a same-cost invalid input is the clearer diagnosis.
        if(!edge.free) relax(key,index*width+edge.to,score+1000000000+(edge.test.literal?0:200000),-1,true,edge.test.literal||'');
        if(index<chars.length) {
          const match=edge.test(chars[index]);
          relax(key,(index+1)*width+edge.to,score+(match?0:1000000000+100000+(chars.length-index)),match?-1:index);
        }
      }
    }
    if(!Number.isFinite(distances[target])) return uncertain();
    const invalid=new Set();
    let missing=false;
    const missingLiterals=[];
    for(let cursor=target;cursor!==first&&cursor>=0;cursor=previous[cursor]) {
      if(marked[cursor]>=0) invalid.add(marked[cursor]);
      if(missingSteps[cursor]) {missing=true;if(missingText[cursor]) missingLiterals.unshift(missingText[cursor]);}
    }
    const ranges=[];
    for(let index=0;index<chars.length;index++) if(invalid.has(index)) {
      if(ranges.length&&ranges.at(-1).end===offsets[index]) ranges.at(-1).end=offsets[index+1];
      else ranges.push({start:offsets[index],end:offsets[index+1]});
    }
    return {ranges,precise:true,...(missing?{missing:true}:{}),...(missingLiterals.length?{missingLiterals}:{} )};
  } catch {return uncertain();}
}
