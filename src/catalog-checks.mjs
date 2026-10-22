// Necessary conditions for explaining catalog failures. These do not replace the final regex.
const check=(body,message)=>({pattern:`^(?:${body})$(?![\\s\\S])`,message});
const chars=(body,message)=>check(body+'+',message);
const any='[\\s\\S]*';
const label='[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?';
const port='(?:0|[1-9]\\d{0,3}|[1-5]\\d{4}|6[0-4]\\d{3}|65[0-4]\\d{2}|655[0-2]\\d|6553[0-5])';
const octet='(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)';
const map={
  'phone-cn':[
    chars('[0-9]','手机号码只能包含数字 0–9'),
    check('[0-9]{11}','手机号码长度必须为 11 位'),
    check('1'+any,'手机号码第 1 位必须是 1'),
    check('[0-9][3-9]'+any,'手机号码第 2 位必须是 3–9'),
  ],
  username:[
    chars('[A-Za-z0-9_]','用户名只能包含英文字母、数字和下划线'),
    check('[\\s\\S]{5,16}','用户名长度必须为 5–16 位'),
    check('[A-Za-z]'+any,'用户名第 1 位必须是英文字母'),
  ],
  email:[
    chars('[^\\s]','邮箱不能包含空格、制表符或换行'),
    check('[^@]+@[^@]+','邮箱必须包含且仅包含一个 @，且两侧不能为空'),
    check("[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[^@]+",'邮箱 @ 前只能使用 ASCII 字母、数字和允许的邮箱符号'),
    check('[^@]+@'+label+'(?:\\.'+label+')*','邮箱域名各段须为 1–63 位字母数字或短横线，且首尾不能为短横线'),
  ],
  'postal-cn':[chars('[0-9]','邮编只能包含数字 0–9'),check('[0-9]{6}','邮编长度必须为 6 位')],
  'zip-us':[chars('[0-9-]','ZIP Code 只能包含数字和短横线'),check('[0-9]{5}(?:-[0-9]{4})?','ZIP Code 必须为五位数字，或五位数字加短横线和四位数字')],
  'password-mix':[
    chars('[^\\s]','密码不能包含空白字符'),
    check('[\\s\\S]{8,32}','密码长度必须为 8–32 位'),
    check(any+'[a-z]'+any,'密码缺少小写英文字母'),
    check(any+'[A-Z]'+any,'密码缺少大写英文字母'),
    check(any+'[0-9]'+any,'密码缺少数字'),
    check(any+'[^A-Za-z0-9\\s]'+any,'密码缺少符号'),
  ],
  ipv4:[
    chars('[0-9.]','IPv4 地址只能包含数字和点'),
    check('[0-9]+(?:\\.[0-9]+){3}','IPv4 地址必须是点分隔的四段数字'),
    check(octet+'(?:\\.[0-9]+){3}','IPv4 第 1 段必须是 0–255，且不能有多余前导零'),
    check('[0-9]+\\.'+octet+'(?:\\.[0-9]+){2}','IPv4 第 2 段必须是 0–255，且不能有多余前导零'),
    check('(?:[0-9]+\\.){2}'+octet+'\\.[0-9]+','IPv4 第 3 段必须是 0–255，且不能有多余前导零'),
    check('(?:[0-9]+\\.){3}'+octet,'IPv4 第 4 段必须是 0–255，且不能有多余前导零'),
  ],
  port:[chars('[0-9]','端口号只能包含数字'),check('(?:0|[1-9][0-9]*)','端口号不能有多余前导零'),check(port,'端口号必须在 0–65535 范围内')],
  'http-url':[
    chars('[^\\s<>]','网址不能包含空白或尖括号'),
    check('https?://'+any,'网址必须以 http:// 或 https:// 开头'),
    check('https?://(?:'+label+'\\.)+[A-Za-z]{2,63}(?::[0-9]+)?(?:[/?#]'+any+')?','网址主机必须是带字母顶级域的 ASCII 域名，不支持 IP 或 localhost'),
    check('https?://[^:/?#]+(?::'+port+')?(?:[/?#]'+any+')?','网址端口必须在 0–65535 范围内'),
  ],
  domain:[
    chars('[A-Za-z0-9.-]','域名只能包含 ASCII 字母、数字、短横线和点'),
    check('[\\s\\S]{1,253}','域名总长度必须为 1–253 个字符'),
    check('[^.]+(?:\\.[^.]+)+','域名必须包含至少一个点，且每段不能为空'),
    check(label+'(?:\\.'+label+')+','域名每段须为 1–63 位，且首尾必须为字母或数字'),
    check(any+'\\.[A-Za-z]{2,63}','域名顶级域必须为 2–63 位英文字母'),
  ],
  'hex-color':[
    check('#'+any,'十六进制颜色必须以 # 开头'),
    check('#[0-9A-Fa-f]+','# 后只能包含十六进制数字 0–9、A–F'),
    check('#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})','颜色数字部分长度必须为 3、4、6 或 8 位'),
  ],
  'uuid-v4':[
    chars('[0-9A-Fa-f-]','UUID 只能包含十六进制数字和短横线'),
    check('[0-9A-Fa-f]{8}(?:-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}','UUID 必须按 8-4-4-4-12 分组'),
    check('[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4'+any,'UUID 第 3 组的首位（版本位）必须是 4'),
    check('[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[89aAbB]'+any,'UUID 第 4 组的首位（variant 位）必须是 8、9、A 或 B'),
  ],
  mac:[
    chars('[0-9A-Fa-f:-]','MAC 地址只能包含十六进制数字、冒号或短横线'),
    check('[0-9A-Fa-f]{2}(?:[:-][0-9A-Fa-f]{2}){5}','MAC 地址必须为六组两位十六进制数字'),
    check('[0-9A-Fa-f]{2}([:-])(?:[0-9A-Fa-f]{2}\\1){4}[0-9A-Fa-f]{2}','MAC 地址必须使用相同的分隔符，不能混用冒号和短横线'),
  ],
  'ipv6-full':[
    chars('[0-9A-Fa-f:]','IPv6 完整写法只能包含十六进制数字和冒号'),
    check('[^:]+(?::[^:]+){7}','本模板需要八组完整 IPv6，不支持 :: 压缩形式'),
    check('[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4}){7}','IPv6 每组必须为 1–4 位十六进制数字'),
  ],
};

function dateChecks(separator,withTime=false){
  const sep=separator==='/'?'/':'-';
  const suffix=withTime?any:'';
  return [
    check('[0-9]{4}'+sep+'[0-9]{2}'+sep+'[0-9]{2}'+suffix,'日期部分必须是四位年、两位月、两位日，并使用 '+separator+' 分隔'),
    check('[0-9]{4}'+sep+'(?:0[1-9]|1[0-2])'+sep+any,'月份必须在 01–12 范围内'),
    check('[0-9]{4}'+sep+'[0-9]{2}'+sep+'(?:0[1-9]|[12][0-9]|3[01])'+suffix,'日期中的日必须在 01–31 范围内'),
  ];
}
function timeChecks(prefix='',seconds=false,suffix=''){
  return [
    check(prefix+'[0-9]{2}:[0-9]{2}'+(seconds?':[0-9]{2}':'')+suffix,'时间部分必须按 '+(seconds?'HH:mm:ss':'HH:mm')+' 填写，每段两位数字'),
    check(prefix+'(?:[01][0-9]|2[0-3]):'+any,'小时必须在 00–23 范围内'),
    check(prefix+'[0-9]{2}:[0-5][0-9]'+(seconds?':'+any:suffix),'分钟必须在 00–59 范围内'),
    ...(seconds?[check(prefix+'[0-9]{2}:[0-9]{2}:[0-5][0-9]'+suffix,'秒必须在 00–59 范围内')]:[]),
  ];
}
map['date-dash']=dateChecks('-');
map['date-slash']=dateChecks('/');
map['time-hm']=timeChecks();
map['time-hms']=timeChecks('',true);
map['datetime-local']=[...dateChecks('-',true),...timeChecks('[0-9]{4}-[0-9]{2}-[0-9]{2}[T ]',true)];
map['utc-timestamp']=[...dateChecks('-',true),check('[0-9]{4}-[0-9]{2}-[0-9]{2}T'+any,'UTC 时间戳的日期与时间必须用大写 T 连接'),check(any+'Z','UTC 时间戳必须以大写 Z 结尾'),...timeChecks('[0-9]{4}-[0-9]{2}-[0-9]{2}T',true,'(?:\\.[0-9]+)?Z')];
map['year-month']=[check('[0-9]{4}-[0-9]{2}','年月必须按 YYYY-MM 填写'),check('[0-9]{4}-(?:0[1-9]|1[0-2])','月份必须在 01–12 范围内')];

const numericChars=chars('[+0-9.\\-]','数字只能包含可选正负号、数字和小数点');
map.integer=[chars('[+0-9\\-]','整数只能包含可选正负号与数字'),check('[+-]?[0-9]+','正负号只能在开头出现一次'),check('[+-]?(?:0|[1-9][0-9]*)','整数不能有多余前导零')];
map['positive-integer']=[chars('[0-9]','正整数只能包含数字'),check('[1-9][0-9]*','正整数必须大于零，且不能有前导零')];
map['nonnegative-integer']=[chars('[0-9]','非负整数只能包含数字，不含正负号'),check('(?:0|[1-9][0-9]*)','除单个 0 外，非负整数不能以 0 开头')];
map['negative-integer']=[check('-[0-9]+','负整数必须以一个负号开头，后接数字'),check('-[1-9][0-9]*','负整数不能是 -0，也不能有前导零')];
map.decimal=[numericChars,check('[+-]?[0-9]+\\.[0-9]+','小数必须含一个小数点，且两侧都有数字'),check('[+-]?(?:0|[1-9][0-9]*)\\.[0-9]+','小数整数部分不能有多余前导零')];
map.number=[numericChars,check('[+-]?[0-9]+(?:\\.[0-9]+)?','数字须为可选符号、整数及可选小数，不能有多余的小数点'),check('[+-]?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?','数字整数部分不能有多余前导零')];
map['money-two']=[chars('[0-9.]','金额只接受非负数字，不包含符号'),check('[0-9]+(?:\\.[0-9]{1,2})?','金额最多两位小数，小数点后不能为空'),check('(?:0|[1-9][0-9]*)(?:\\.[0-9]{1,2})?','金额整数部分不能有多余前导零')];
map.percentage=[check('[0-9]+(?:\\.[0-9]+)?%','百分比必须为非负数字并以 % 结尾'),check('(?:100(?:\\.0+)?|(?:[0-9]|[1-9][0-9])(?:\\.[0-9]+)?)%','百分比数值必须在 0–100 范围内，且不含多余前导零')];
map.scientific=[check('[+-]?[0-9]+(?:\\.[0-9]+)?[eE][+-]?[0-9]+','科学计数法须含尾数、e/E 和整数指数'),check('[+-]?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?[eE][+-]?[0-9]+','科学计数法尾数的整数部分不能有多余前导零')];
map.thousands=[check('[+-]?[0-9]{1,3}(?:,[0-9]{3})+(?:\\.[0-9]+)?','千分位至少含一个逗号，逗号后每组恰好三位数字')];
map.han=[chars('\\p{Script=Han}','只能包含 Unicode 汉字，不能包含标点、空格或字母')];
map.letters=[chars('[A-Za-z]','只能包含 ASCII 英文字母 A–Z 或 a–z')];
map.lowercase=[chars('[a-z]','只能包含小写英文字母 a–z')];
map.uppercase=[chars('[A-Z]','只能包含大写英文字母 A–Z')];
map.alphanumeric=[chars('[A-Za-z0-9]','只能包含 ASCII 英文字母与数字，不含下划线')];
map['word-chars']=[chars('\\w','只能包含 ASCII 英文字母、数字和下划线')];
map['unicode-letters']=[chars('\\p{L}','只能包含 Unicode 字母，不含数字、标点或组合音标')];
map.whitespace=[chars('\\s','只能包含空白字符（空格、制表符、换行等）')];
map['no-whitespace']=[chars('\\S','文本不能为空，也不能包含空白字符')];
map.slug=[chars('[a-z0-9-]','Slug 只能包含小写字母、数字与短横线'),check('[a-z0-9]+(?:-[a-z0-9]+)*','Slug 首尾不能为短横线，中间不能连续两个短横线')];
map['semver-core']=[check('[0-9]+\\.[0-9]+\\.[0-9]+','版本号必须是 MAJOR.MINOR.PATCH 三段数字'),check('(?:0|[1-9][0-9]*)\\.(?:0|[1-9][0-9]*)\\.(?:0|[1-9][0-9]*)','版本号每段不能有多余前导零')];
map['image-name']=[chars('[^\\s/\\\\]','文件名不能包含空白或目录分隔符'),check(any+'\\.(?:png|jpe?g|gif|webp|svg|avif)','图片文件扩展名须为 png、jpg/jpeg、gif、webp、svg 或 avif')];
map['json-name']=[chars('[^\\s/\\\\]','文件名不能包含空白或目录分隔符'),check(any+'\\.json','文件名必须以 .json 结尾')];
map.base64=[chars('[A-Za-z0-9+/=]','Base64 只能使用标准字母表字符与填充符 ='),check('(?:[\\s\\S]{4})+','Base64 长度必须是 4 的倍数且不能为空'),check('[A-Za-z0-9+/]+={0,2}','填充符 = 只能位于结尾，且最多两个')];

export function getCatalogChecks(id){return map[id]||[];}
