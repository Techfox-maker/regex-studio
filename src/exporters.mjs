// References: Python re, Java Pattern, Microsoft .NET Regex documentation.
// This converts a documented common subset; target engines are not executed here.
export const LANGUAGES = [
  {id:'javascript',label:'JavaScript'},
  {id:'python',label:'Python · re'},
  {id:'java',label:'Java · Pattern'},
  {id:'csharp',label:'C# · Regex'},
];
const whitespace='\\t\\n\\v\\f\\r \\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000\\ufeff';
const classes={d:'0-9',w:'A-Za-z0-9_',s:whitespace};
const categories=new Set(['L','Lu','Ll','Lt','Lm','Lo','M','Mn','Mc','Me','N','Nd','Nl','No','P','Pc','Pd','Ps','Pe','Pi','Pf','Po','S','Sm','Sc','Sk','So','Z','Zs','Zl','Zp','C','Cc','Cf','Cs','Co','Cn']);
const quote=value=>JSON.stringify(value).replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');

function convert(source,language,flags) {
  const strict='$(?![\\s\\S])';
  if(source.endsWith(strict))source=source.slice(0,-strict.length)+(language==='python'?'\\Z':'\\z');
  if(language==='csharp'&&/[\u{10000}-\u{10ffff}]/u.test(source))throw new Error('C# Regex 按 UTF-16 代码单元匹配；此表达式包含补充平面字符，无法安全自动转换。');
  let output='',inside=false;
  const names=[];
  for(let index=0;index<source.length;index++){
    const char=source[index];
    if(!inside&&source.startsWith('[\\s\\S]',index)){output+='[\\s\\S]';index+=5;continue;}
    if(char==='['){inside=true;output+=char;continue;}
    if(char===']'){inside=false;output+=char;continue;}
    if(char==='('&&!inside&&source.startsWith('(?<',index)&&!['=','!'].includes(source[index+3])){
      const end=source.indexOf('>',index+3);const name=source.slice(index+3,end);
      if(end<0||!(/^[A-Za-z_][A-Za-z0-9_]*$/).test(name))throw new Error('此命名组名称不在可自动转换的 ASCII 名称范围内。');
      if(language==='java'&&!/^[A-Za-z][A-Za-z0-9]*$/.test(name))throw new Error('Java 命名组须以英文字母开头，且只含英文字母和数字。');
      if(names.includes(name))throw new Error('目标语言不支持此重复命名组，需手动调整。');
      names.push(name);output+=(language==='python'?'(?P<':'(?<')+name+'>';index=end;continue;
    }
    if(char!== '\\'){
      // JS dot excludes CR, LF, LS and PS; other engines use different defaults.
      output+=char==='.'&&!inside&&!flags.includes('s')?'[^\\n\\r\\u2028\\u2029]':char;
      continue;
    }
    const next=source[++index];
    if(next==='\\'){output+='\\\\';continue;}
    if(next==='/'){output+='/';continue;}
    if(next==='0'){output+='\\x00';continue;}
    if(next==='c'){
      const value=source.charCodeAt(index+1)%32;output+='\\x'+value.toString(16).padStart(2,'0');index++;continue;
    }
    if(next==='k'&&source[index+1]==='<'){
      const end=source.indexOf('>',index+2);const name=source.slice(index+2,end);
      if(end<0)throw new Error('命名反向引用不完整。');
      output+=language==='python'?`(?P=${name})`:`\\k<${name}>`;index=end;continue;
    }
    if((next==='p'||next==='P')&&source[index+1]==='{'){
      const end=source.indexOf('}',index+2);let property=source.slice(index+2,end);
      if(language==='python')throw new Error('Python 内置 re 不支持 Unicode 属性转义 \\p{…}；请保留 JavaScript 或手动改写字符范围。');
      if(property==='Script=Han'||property==='sc=Han'){
        if(language==='csharp')throw new Error('C# Regex 不支持 Script=Han 属性；汉字区块与完整 Han 脚本并不等价，未自动替换。');
        property='IsHan';
      }else if(!categories.has(property))throw new Error('此 Unicode 属性未包含在当前语言的安全自动转换范围内。');
      output+=`\\${next}{${property}}`;index=end;continue;
    }
    if(next==='u'&&source[index+1]==='{'){
      const end=source.indexOf('}',index+2);const hex=source.slice(index+2,end);const value=parseInt(hex,16);
      if(language==='csharp'&&value>0xffff)throw new Error('C# Regex 无法按 JavaScript u 模式安全转换此补充平面码点。');
      output+=language==='java'?`\\x{${hex}}`:language==='python'?`\\U${value.toString(16).padStart(8,'0')}`:`\\u${value.toString(16).padStart(4,'0')}`;index=end;continue;
    }
    if(classes[next?.toLowerCase()]&&/[dDwWsS]/.test(next)){
      const content=classes[next.toLowerCase()];const negative=next===next.toUpperCase();
      if(inside&&negative)throw new Error('此字符集合中包含反向简写字符类，无法安全展开到目标语言；请手动改写。');
      output+=inside?content:`[${negative?'^':''}${content}]`;continue;
    }
    output+='\\'+next;
  }
  return output;
}

export function formatRegex(source,flags='u',language='javascript') {
  const result={display:'',copy:'',notice:'',error:''};
  if(!source)return result;
  if(!LANGUAGES.some(item=>item.id===language))return {...result,error:'请选择有效的目标语言。'};
  try{
    source=new RegExp(source,flags).source;
    if(language==='javascript'){
      result.display=result.copy=`/${source}/${flags}`;
      return result;
    }
    if(/[^gimsu]/.test(flags))throw new Error('此修饰符暂不支持跨语言转换。');
    if(/\(\?[ims-]+:/.test(source))throw new Error('局部修饰符组暂不支持自动跨语言转换，请在目标语言中手动改写。');
    const converted=convert(source,language,flags);
    const notice=['已转换常见语法；Unicode 大小写、边界、回溯和分组语义仍需在目标环境验证，页面测试使用 JavaScript 引擎。'];
    if(flags.includes('u'))notice.push('目标语言没有对应的 u 编译开关。');
    if(/[bB]/.test(source))notice.push('词边界语义可能因目标引擎不同。');
    const global=flags.includes('g');
    let code='';
    if(language==='python'){
      const options=['re.ASCII',...['i','m','s'].filter(flag=>flags.includes(flag)).map(flag=>({i:'re.IGNORECASE',m:'re.MULTILINE',s:'re.DOTALL'}[flag]))];
      code=`import re\n\ncompiled = re.compile(${quote(converted)}, ${options.join(' | ')})`;
      if(global)code+='\n# Iterate over all matches; text is the input string.\nfor match in compiled.finditer(text):\n    print(match.group(0))';
    }else if(language==='java'){
      const options=['i','m','s'].filter(flag=>flags.includes(flag)).map(flag=>({i:'Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE',m:'Pattern.MULTILINE',s:'Pattern.DOTALL'}[flag]));
      code=`import java.util.regex.Pattern;\n${global?'import java.util.regex.Matcher;\n':''}\nPattern pattern = Pattern.compile(${quote(converted)}${options.length?', '+options.join(' | '):''});`;
      if(global)code+='\n// Iterate over all matches; text is the input string.\nMatcher matcher = pattern.matcher(text);\nwhile (matcher.find()) {\n    System.out.println(matcher.group());\n}';
    }else{
      const options=['RegexOptions.CultureInvariant',...['i','m','s'].filter(flag=>flags.includes(flag)).map(flag=>({i:'RegexOptions.IgnoreCase',m:'RegexOptions.Multiline',s:'RegexOptions.Singleline'}[flag]))];
      code=`using System.Text.RegularExpressions;\n\nvar regex = new Regex(@"${converted.replace(/"/g,'""')}", ${options.join(' | ')});`;
      if(global)code+='\n// Iterate over all matches; text is the input string.\nforeach (Match match in regex.Matches(text)) {\n    System.Console.WriteLine(match.Value);\n}';
      notice.push('使用显式字符类保持常用 ASCII 数字和单词字符，未启用 ECMAScript 兼容模式；UTF-16 字符计数可能不同。');
    }
    if(global)notice.push('g 已转换为遍历全部匹配的 API 用法，需提供 text 变量。');
    result.display=result.copy=code;result.notice=notice.join(' ');return result;
  }catch(error){return {...result,error:error.message,notice:'当前表达式未生成目标语言代码，避免提供不兼容的结果。'};}
}
