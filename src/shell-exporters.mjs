export const SHELL_LANGUAGES=[
  {id:'grep-ere',label:'Linux · grep -E'},
  {id:'grep-pcre',label:'Linux · GNU grep -P'},
  {id:'sed',label:'Linux · GNU sed -E'},
  {id:'awk',label:'Linux · awk / gawk'},
  {id:'bash',label:'Linux · Bash [[ =~ ]]'},
];
const shellQuote=value=>"'"+value.replace(/'/g,"'\"'\"'")+"'";
const classes={d:'0-9',w:'A-Za-z0-9_'};
const strict='$(?![\\s\\S])';
function captureMap(source){
  const map=new Map(),stack=[];
  let original=0,converted=0,inside=false;
  for(let index=0;index<source.length;index++){
    const char=source[index];
    if(char==='\\'){index++;continue;}
    if(char==='['){inside=true;continue;}
    if(char===']'){inside=false;continue;}
    if(inside)continue;
    if(char==='('){
      converted++;
      if(source.startsWith('(?:',index)){stack.push(null);index+=2;}
      else if(source[index+1]==='?')throw new Error('ERE 不支持此命名分组或前后查找语法；可尝试 GNU grep -P。');
      else{const group={number:converted,end:Infinity};map.set(++original,group);stack.push(group);}
    }else if(char===')'){
      const group=stack.pop();if(group)group.end=index;
    }
  }
  return map;
}
function convertERE(source,{allowBackrefs=false}={}){
  if(source.endsWith(strict))source=source.slice(0,-strict.length)+'$';
  if(/[^\x20-\x7e]/.test(source))throw new Error('ERE 导出仅覆盖 ASCII 表达式；Unicode 内容请使用 GNU grep -P 并核对 UTF-8 环境。');
  const groups=captureMap(source);
  let result='',inside=false;
  for(let index=0;index<source.length;index++){
    const char=source[index];
    if(char==='['){inside=true;result+=char;continue;}
    if(char===']'){inside=false;result+=char;continue;}
    if(!inside&&source.startsWith('(?:',index)){result+='(';index+=2;continue;}
    if(!inside&&source.startsWith('(?',index))throw new Error('ERE 不支持此分组或前后查找语法；可尝试 GNU grep -P。');
    if(!inside&&(char==='?'&&/[*+?}]/.test(source[index-1]||'')))throw new Error('ERE 不支持非贪婪量词；请改用 GNU grep -P。');
    if(char!=='\\'){result+=char;continue;}
    const next=source[++index];
    if(next==='\\'){result+='\\\\';continue;}
    if(/[1-9]/.test(next)){
      if(inside)throw new Error('字符集合中的数字转义无法自动转换为 ERE。');
      if(!allowBackrefs)throw new Error('此目标的 ERE 不支持自动导出反向引用；请选择 GNU grep -E、GNU sed -E 或 GNU grep -P。');
      let digits=next;while(/[0-9]/.test(source[index+1]||''))digits+=source[++index];
      const group=groups.get(Number(digits));
      if(!group||group.number>9)throw new Error('转换后的反向引用组号超过 GNU ERE 的 1–9 范围；请选择 GNU grep -P。');
      if(group.end>=index)throw new Error('GNU ERE 的反向引用必须位于被引用组结束之后；请选择 GNU grep -P 并核对语义。');
      result+='\\'+group.number;continue;
    }
    if(next==='k')throw new Error('ERE 不支持命名反向引用；请选择 GNU grep -P。');
    if(/[pPuUxXc]/.test(next))throw new Error('ERE 不支持此属性或 Unicode/十六进制转义；请尝试 GNU grep -P。');
    if(/[sS]/.test(next))throw new Error('JavaScript 的 Unicode 空白类无法通用转换为 POSIX ERE；请手动改为所需字符范围。');
    if(/[bB]/.test(next))throw new Error('词边界 \\b / \\B 不是通用 POSIX ERE 语法；请尝试 GNU grep -P。');
    if(/[dDwW]/.test(next)){
      const content=classes[next.toLowerCase()],negative=next===next.toUpperCase();
      if(inside&&negative)throw new Error('字符集合内的反向字符类无法安全展开为 ERE。');
      result+=inside?content:`[${negative?'^':''}${content}]`;continue;
    }
    if(/[nrtvf0]/.test(next))throw new Error('此 ERE 命令按行处理，未自动转换控制字符转义。');
    result+=next==='/'?'/':'\\'+next;
  }
  return result;
}
function convertPCRE(source,flags){
  if(source.endsWith(strict))source=source.slice(0,-strict.length)+'\\z';
  let result='',inside=false;
  for(let index=0;index<source.length;index++){
    const char=source[index];
    if(char==='['){inside=true;result+=char;continue;}
    if(char===']'){inside=false;result+=char;continue;}
    if(char!== '\\'){result+=char==='.'&&!inside&&!flags.includes('s')?'[^\\r\\n\\x{2028}\\x{2029}]':char;continue;}
    const next=source[++index];
    if(next==='\\'){result+='\\\\';continue;}
    if(next==='/'){result+='/';continue;}
    if(next==='u'){
      let hex;
      if(source[index+1]==='{'){const end=source.indexOf('}',index+2);hex=source.slice(index+2,end);index=end;}
      else{hex=source.slice(index+1,index+5);index+=4;}
      const value=parseInt(hex,16);
      if(value>=0xd800&&value<=0xdfff)throw new Error('PCRE UTF 模式不接受独立代理项转义；请改用完整 Unicode 码点。');
      result+='\\x{'+hex+'}';continue;
    }
    if(/[sS]/.test(next))throw new Error('本工具未自动转换 JavaScript Unicode 空白类到 grep PCRE；请显式填写所需空白字符。');
    if(/[dDwW]/.test(next)){
      const content=classes[next.toLowerCase()],negative=next===next.toUpperCase();
      if(inside&&negative)throw new Error('集合中的反向字符类需手动检查 PCRE 语义。');
      result+=inside?content:`[${negative?'^':''}${content}]`;continue;
    }
    if((next==='p'||next==='P')&&source[index+1]==='{'){
      const end=source.indexOf('}',index+2);let property=source.slice(index+2,end);
      if(property==='Script=Han')property='sc=Han';
      if(!/^(?:sc=Han|L|Lu|Ll|N|Nd|M|P|S|Z|C)$/.test(property))throw new Error('此 Unicode 属性需核对本机 PCRE2 版本，未自动生成命令。');
      result+='\\'+next+'{'+property+'}';index=end;continue;
    }
    result+='\\'+next;
  }
  return result;
}

export function formatShellRegex(source,flags='u',id='grep-ere'){
  const base={display:'',copy:'',notice:'',error:''};
  if(!source)return base;
  try{
    if(!SHELL_LANGUAGES.some(item=>item.id===id))throw new Error('请选择受支持的 Shell 命令。');
    source=new RegExp(source,flags).source;
    if(/[^gimsu]/.test(flags))throw new Error('此修饰符未包含在 Shell 自动转换范围内。');
    if(/[ms]/.test(flags))throw new Error('当前命令示例按行读取，无法保持 m / s 的全文语义；请关闭这些修饰符。');
    const pcre=id==='grep-pcre';
    const converted=pcre?convertPCRE(source,flags):convertERE(source,{allowBackrefs:id==='grep-ere'||id==='sed'});
    const global=flags.includes('g'),ignore=flags.includes('i');
    const notices=[pcre?'需要支持 -P 的 GNU grep / PCRE2，并使用适当的 UTF-8 locale。':'ERE 示例以 LC_ALL=C 处理 ASCII 数据；不保证 Unicode 字符、词边界和大小写语义与 JavaScript 一致。','按行匹配，严格文本结尾转换为行尾；尚未在 Linux 目标运行时执行验证。'];
    let command='';
    if(id==='grep-ere'||pcre){
      command=`# ${pcre?'-P selects PCRE2':'-E selects extended regex'}; ${ignore?'-i ignores case; ':''}${global?'-o prints individual nonempty matches; ':'prints matching lines by default; '}-- ends options; input.txt is the input file.\n${pcre?'':'LC_ALL=C '}grep ${pcre?'-P':'-E'}${ignore?' -i':''}${global?' -o':''} -- ${shellQuote(converted)} input.txt`;
      if(global)notices.push('grep -o 不输出空匹配，与 JavaScript g 对空匹配的结果不同。');
    }else if(id==='sed'){
      const address=converted.replace(/\//g,'\\/');
      command=`# GNU sed: -E enables extended regex, -n disables default output, p prints matching lines${ignore?', I ignores case':''}; input.txt is the input file.\nLC_ALL=C sed -E -n ${shellQuote('/'+address+'/'+(ignore?'I':'')+'p')} input.txt`;
      if(global)notices.push('本 sed 示例打印匹配行；g 不是行选择修饰符，未模拟逐处返回匹配。');
    }else if(id==='awk'){
      const expression=converted.replace(/\//g,'\\/');
      command=`# ${ignore?'gawk -v IGNORECASE=1 ignores case (GNU extension); ':'awk uses POSIX extended regex; '}print outputs matching lines; input.txt is the input file.\nLC_ALL=C ${ignore?'gawk -v IGNORECASE=1':'awk'} ${shellQuote('/'+expression+'/ { print }')} input.txt`;
      if(ignore)notices.push('忽略大小写需要 GNU gawk，普通 POSIX awk 不提供 IGNORECASE。');
      if(global)notices.push('本 awk 示例打印匹配行，未模拟 JavaScript g 的逐处返回。');
    }else{
      command=`# Set the C locale${ignore?' and nocasematch to ignore case':''} in a Bash subshell; leave the right-hand variable of =~ unquoted. text is the input string.\n(\n  export LC_ALL=C\n${ignore?'  shopt -s nocasematch\n':''}  pattern=${shellQuote(converted)}\n  [[ $text =~ $pattern ]]\n)`;
      if(global)notices.push('Bash =~ 只返回是否匹配与首个匹配，不支持 JavaScript g 遍历。');
      notices.push('Bash 示例假定 text 是单行 ASCII 字符串；包含换行的变量需另行处理。');
    }
    return {display:command,copy:command,notice:notices.join(' '),error:''};
  }catch(error){return {...base,error:error.message,notice:'未生成不兼容的 Shell 命令；可调整表达式或选择其他引擎。'};}
}
