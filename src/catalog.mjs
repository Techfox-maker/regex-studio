// Patterns are independently composed JavaScript adaptations of the linked references.
// Each entry states its chosen scope rather than claiming complete business validation.
const docs = {
  classes:{title:'MDN · 字符类',url:'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Character_classes'},
  unicode:{title:'MDN · Unicode 属性转义',url:'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape'},
  quantifiers:{title:'MDN · 重复次数',url:'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Quantifiers'},
  email:{title:'WHATWG · HTML 邮箱语法',url:'https://html.spec.whatwg.org/multipage/input.html#email-state-(type=email)'},
  mobile:{title:'validator.js · 手机号码格式',url:'https://github.com/validatorjs/validator.js/blob/master/src/lib/isMobilePhone.js'},
  postal:{title:'validator.js · 邮政编码格式',url:'https://github.com/validatorjs/validator.js/blob/master/src/lib/isPostalCode.js'},
  password:{title:'validator.js · 密码组成检查',url:'https://github.com/validatorjs/validator.js/blob/master/src/lib/isStrongPassword.js'},
  integer:{title:'validator.js · 整数格式',url:'https://github.com/validatorjs/validator.js/blob/master/src/lib/isInt.js'},
  decimal:{title:'validator.js · 小数格式',url:'https://github.com/validatorjs/validator.js/blob/master/src/lib/isDecimal.js'},
  float:{title:'validator.js · 浮点数格式',url:'https://github.com/validatorjs/validator.js/blob/master/src/lib/isFloat.js'},
  date:{title:'RFC 3339 · 日期与时间语法',url:'https://www.rfc-editor.org/rfc/rfc3339.txt'},
  url:{title:'validator.js · 网址检查',url:'https://github.com/validatorjs/validator.js/blob/master/src/lib/isURL.js'},
  domain:{title:'validator.js · 域名检查',url:'https://github.com/validatorjs/validator.js/blob/master/src/lib/isFQDN.js'},
  ip:{title:'validator.js · IP 地址检查',url:'https://github.com/validatorjs/validator.js/blob/master/src/lib/isIP.js'},
  port:{title:'validator.js · 端口范围',url:'https://github.com/validatorjs/validator.js/blob/master/src/lib/isPort.js'},
  mac:{title:'validator.js · MAC 地址格式',url:'https://github.com/validatorjs/validator.js/blob/master/src/lib/isMACAddress.js'},
  uuid:{title:'validator.js · UUID 格式',url:'https://github.com/validatorjs/validator.js/blob/master/src/lib/isUUID.js'},
  color:{title:'MDN · CSS 十六进制颜色',url:'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/hex-color'},
  semver:{title:'SemVer · 语义化版本规范',url:'https://semver.org/'},
  base64:{title:'RFC 4648 · Base64 编码',url:'https://www.rfc-editor.org/rfc/rfc4648.txt'},
};
const label='[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?';
const domain=`(?:${label}\\.)+[A-Za-z]{2,63}`;
const port='(?:0|[1-9]\\d{0,3}|[1-5]\\d{4}|6[0-4]\\d{3}|65[0-4]\\d{2}|655[0-2]\\d|6553[0-5])';
const octet='(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)';
const date='[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])';
const time='(?:[01][0-9]|2[0-3]):[0-5][0-9]';
function item(id,name,category,body,description,note,source,valid,invalid,flags='u') {
  return {id,name,category,pattern:new RegExp(`^(?:${body})$(?![\\s\\S])`,flags).source,flags,description,note,source:docs[source],valid,invalid,example:[...valid.slice(0,2),...invalid.slice(0,2)].join('\n')};
}

export const CATALOG = [
  item('email','电子邮箱','常用验证',"[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*",'按 HTML 邮箱输入语法检查 ASCII 地址。','参考 WHATWG 改写；允许无点域名，不验证投递能力或完整 RFC 5322。','email',['hello@example.com','name+tag@sample.cn'],['hello.example.com','name@-example.com']),
  item('username','用户名','常用验证','[A-Za-z][A-Za-z0-9_]{4,15}','字母开头，5–16 位字母、数字或下划线。','这是常见业务规则示例，可按产品需求调整长度。','quantifiers',['hello_2026','Codex'],['1user','ab']),
  item('phone-cn','大陆手机号常见格式','常用验证','1[3-9][0-9]{9}','1 开头、第二位 3–9 的 11 位数字。','按常见长度和前缀作宽松检查；不核验最新号段、归属或号码是否存在。','mobile',['13800138000','19912345678'],['12800138000','1380013800']),
  item('postal-cn','六位数字邮编','常用验证','[0-9]{6}','六位数字的邮政编码输入格式。','仅检查长度；可用于中国大陆等六位邮编输入，不核验地区分配。','postal',['100000','200120'],['10000','ABC123']),
  item('password-mix','密码组成示例','常用验证','(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\\s])[^\\s]{8,32}','8–32 位，含大小写字母、数字与符号。','仅演示组成约束，不能据此判断真实密码强度；不允许空白。','password',['Abcd123!','Regex_2026'],['abcdef12','ABC123!!']),
  item('zip-us','美国 ZIP Code 格式','常用验证','[0-9]{5}(?:-[0-9]{4})?','五位 ZIP，或五位加四位扩展。','仅检查格式，不验证邮编是否分配。','postal',['10001','90210-1234'],['1000','90210-123']),

  item('integer','带符号整数','数字金额','[+-]?(?:0|[1-9][0-9]*)','可带正负号，不保留多余前导零。','接受 +0 与 -0；不限制整数精度。','integer',['-42','+2026'],['01','3.14']),
  item('positive-integer','正整数','数字金额','[1-9][0-9]*','大于零的十进制整数。','不接受正号、零及前导零。','integer',['1','2026'],['0','-1']),
  item('nonnegative-integer','非负整数','数字金额','(?:0|[1-9][0-9]*)','零或不带符号的正整数。','不接受正号及多余前导零。','integer',['0','42'],['-1','003']),
  item('negative-integer','负整数','数字金额','-[1-9][0-9]*','负号后跟非零十进制整数。','不接受 -0 或前导零。','integer',['-1','-2026'],['0','-01']),
  item('decimal','带小数点的数','数字金额','[+-]?(?:0|[1-9][0-9]*)\\.[0-9]+','可带符号，必须含小数点及小数位。','要求小数点两侧都有数字，不接受科学计数法。','decimal',['3.14','-0.25'],['42','.5']),
  item('number','整数或小数','数字金额','[+-]?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?','接受整数或十进制小数。','不接受科学计数法、千分位或多余前导零。','float',['42','-3.14'],['1e3','01.2']),
  item('money-two','金额输入：最多两位小数','数字金额','(?:0|[1-9][0-9]*)(?:\\.[0-9]{1,2})?','非负数字，可带一至两位小数。','仅输入格式示例，不处理货币符号、舍入或数值上限。','decimal',['123.45','0.5'],['-1.00','1.234']),
  item('percentage','百分比：0–100%','数字金额','(?:100(?:\\.0+)?|(?:[0-9]|[1-9][0-9])(?:\\.[0-9]+)?)%','0 至 100 的数字，末尾带百分号。','不接受负数或空格；100 的小数部分只能为零。','float',['12.5%','100.0%'],['100.1%','-1%']),
  item('scientific','科学计数法','数字金额','[+-]?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?[eE][+-]?[0-9]+','尾数后跟 e 或 E 及整数指数。','仅检查写法，不判断溢出和浮点精度。','float',['1e3','-1.25E-10'],['1.2','e10']),
  item('thousands','千分位数字','数字金额','[+-]?[1-9][0-9]{0,2}(?:,[0-9]{3})+(?:\\.[0-9]+)?','至少一处分组三位的逗号分隔数字。','采用英文逗号和小数点，不接受本地化分隔符。','decimal',['1,234','-12,345.67'],['1234','12,34']),

  item('date-dash','日期 YYYY-MM-DD','日期时间',date,'四位年份、两位月份和日期。','月份 01–12、日期 01–31；不检查闰年及每月天数。','date',['2026-10-21','2024-02-29'],['2026-13-01','2026-1-01']),
  item('date-slash','日期 YYYY/MM/DD','日期时间','[0-9]{4}/(?:0[1-9]|1[0-2])/(?:0[1-9]|[12][0-9]|3[01])','使用斜杠分隔的年月日。','参照日期字段范围改写；不检查实际日历合法性。','date',['2026/10/21','2025/01/01'],['2026-10-21','2026/00/01']),
  item('time-hm','时间 HH:mm','日期时间',time,'24 小时制的小时与分钟。','小时 00–23，分钟 00–59。','date',['09:30','23:59'],['24:00','9:30']),
  item('time-hms','时间 HH:mm:ss','日期时间',time+':[0-5][0-9]','24 小时制，精确到秒。','秒限 00–59，此简化表达式不支持闰秒 60。','date',['09:30:05','23:59:59'],['24:00:00','12:30:60']),
  item('datetime-local','本地日期时间','日期时间',date+'[T ]'+time+':[0-5][0-9]','年月日与时分秒，以 T 或空格连接。','不含时区；仅检查字段范围，不检查实际日期。','date',['2026-10-21T09:30:00','2026-10-21 23:59:59'],['2026-10-21','2026-10-21T24:00:00']),
  item('utc-timestamp','UTC 时间戳常见格式','日期时间',date+'T'+time+':[0-5][0-9](?:\\.[0-9]+)?Z','以大写 T 和 Z 标识的 UTC 日期时间。','RFC 3339 的常见子集：不含时区偏移、闰秒或日历校验。','date',['2026-10-21T09:30:00Z','2026-10-21T09:30:00.123Z'],['2026-10-21T09:30:00+08:00','2026-10-21T09:30:00']),
  item('year-month','年月 YYYY-MM','日期时间','[0-9]{4}-(?:0[1-9]|1[0-2])','四位年份与两位月份。','四位年份输入格式，不限制业务年份范围。','date',['2026-10','2000-01'],['2026-13','26-10']),

  item('http-url','HTTP(S) 域名网址','网络地址',`https?://${domain}(?::${port})?(?:[/?#][^\\s<>]*)?`,'以 http:// 或 https:// 开头的域名网址。','常见 ASCII 域名子集；不支持 IP、localhost 或完整 URL 语法，不代表网址可访问。','url',['https://example.com/path?q=1','http://sub.example.org:8080/'],['ftp://example.com','https://bad host.com'],'iu'),
  item('domain','ASCII 域名','网络地址',`(?=.{1,253}$(?![\\s\\S]))${domain}`,'由点分隔的字母数字域名。','单标签最多 63 字符；顶级域为字母，不支持 Unicode 域名、尾点或查询 DNS。','domain',['example.com','sub.example.org'],['-example.com','example..com'],'iu'),
  item('ipv4','IPv4 地址','网络地址',`(?:${octet}\\.){3}${octet}`,'四段 0–255 的十进制 IPv4 地址。','不接受多余前导零；不判断地址是否可路由。','ip',['192.168.1.1','255.255.255.255'],['256.1.1.1','192.168.01.1']),
  item('port','端口号 0–65535','网络地址',port,'0–65535 的无符号十进制端口。','接受 0 作格式值，不表示端口已开放；不接受前导零。','port',['0','65535'],['65536','080']),
  item('mac','MAC 地址：冒号或短横线','网络地址','[0-9A-Fa-f]{2}([:-])(?:[0-9A-Fa-f]{2}\\1){4}[0-9A-Fa-f]{2}','六组两位十六进制，分隔符一致。','只支持常见 48 位表示法，不包含点分隔或无分隔形式。','mac',['AA:BB:CC:DD:EE:FF','01-23-45-67-89-ab'],['AA:BB-CC:DD:EE:FF','AA:BB:CC:DD:EE']),
  item('ipv6-full','IPv6：八组完整写法','网络地址','(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}','八组一至四位十六进制 IPv6 地址。','仅支持未压缩形式，不支持 ::、IPv4 嵌入或区域标识。','ip',['2001:db8:0:0:0:0:0:1','fe80:0:0:0:1234:5678:9abc:def0'],['2001:db8::1','12345:0:0:0:0:0:0:1']),

  item('han','纯汉字','文本字符','\\p{Script=Han}+','一个或多个 Unicode 汉字。','不含中文标点、空格或拼音；必须保留 u 标记。','unicode',['正则表达式','汉字'],['你好！','hello']),
  item('letters','纯英文字母','文本字符','[A-Za-z]+','一个或多个 ASCII 英文字母。','不包含重音字母及其他文字。','classes',['Regex','ABCdef'],['hello1','é']),
  item('lowercase','纯小写英文字母','文本字符','[a-z]+','仅接受 a–z。','开启 i 标记会改变大小写限制。','classes',['regex','hello'],['Regex','abc1']),
  item('uppercase','纯大写英文字母','文本字符','[A-Z]+','仅接受 A–Z。','开启 i 标记会改变大小写限制。','classes',['REGEX','ABC'],['Abc','ABC1']),
  item('alphanumeric','纯字母和数字','文本字符','[A-Za-z0-9]+','一个或多个 ASCII 字母或数字。','不含下划线、空白和汉字。','classes',['Regex2026','123ABC'],['hello_world','正则1']),
  item('word-chars','字母数字下划线','文本字符','\\w+','一个或多个 JavaScript 单词字符。','此处的单词字符仅为 ASCII 字母、数字和下划线。','classes',['hello_world','Regex2026'],['hello-world','中文']),
  item('unicode-letters','各语言字母','文本字符','\\p{L}+','仅包含 Unicode 字母。','包含汉字等字母类别；分解形式的组合音标可能需另加 Mark 类别。','unicode',['Café','中文'],['abc1','hello!']),
  item('whitespace','纯空白字符','文本字符','\\s+','一个或多个空白字符。','包括空格、制表符及换行；测试含换行内容时请切换全文查找。','classes',['   ','\t'],['abc',' a']),
  item('no-whitespace','无空白文本','文本字符','\\S+','一个或多个非空白字符。','仅排除空白，不限制符号或语言。','classes',['hello_world','正则!'],['hello world',' a']),

  item('uuid-v4','UUID v4','开发格式','[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}','8-4-4-4-12 分组，版本位为 4。','检查版本与 variant 位，不验证随机性或唯一性。','uuid',['550e8400-e29b-41d4-a716-446655440000','6ba7b810-9dad-41d1-80b4-00c04fd430c8'],['550e8400-e29b-11d4-a716-446655440000','550e8400e29b41d4a716446655440000']),
  item('hex-color','CSS 十六进制颜色','开发格式','#[0-9a-fA-F]{3}(?:[0-9a-fA-F]|[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?','支持 #RGB、#RGBA、#RRGGBB、#RRGGBBAA。','不匹配颜色名称、rgb() 或其他 CSS 颜色函数。','color',['#5865de','#abcd'],['#12345','#GGG']),
  item('slug','网址 Slug','开发格式','[a-z0-9]+(?:-[a-z0-9]+)*','小写字母数字，用单个短横线分词。','本条采用常见自定义命名约定，不支持汉字或下划线。','quantifiers',['regex-studio','hello-2026'],['-hello','hello--world']),
  item('semver-core','版本号 MAJOR.MINOR.PATCH','开发格式','(?:0|[1-9][0-9]*)\\.(?:0|[1-9][0-9]*)\\.(?:0|[1-9][0-9]*)','三个无多余前导零的版本数字。','SemVer 核心版本子集；不支持预发布、构建元数据及 v 前缀。','semver',['1.2.3','0.0.1'],['01.2.3','1.2.3-beta']),
  item('image-name','常见图片文件名','开发格式','[^\\s\\/\\\\]+\\.(?:png|jpe?g|gif|webp|svg|avif)','不含空白或目录分隔符的常见图片文件名。','只检查扩展名，不验证文件内容、类型或操作系统文件名合法性。','quantifiers',['photo.JPG','logo.svg'],['image.txt','folder/photo.png'],'iu'),
  item('json-name','JSON 文件名','开发格式','[^\\s\\/\\\\]+\\.json','不含空白或目录分隔符、以 .json 结尾的文件名。','只检查名称后缀，不解析 JSON 内容。','quantifiers',['settings.json','data.v2.JSON'],['data.json.txt','folder/data.json'],'iu'),
  item('base64','Base64：标准字母表与填充','开发格式','(?=.+)(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?','标准 Base64 字母表，四字符对齐并带所需填充。','不接受空串、换行或 URL-safe 字母表；仅检查结构，不检查填充位是否规范。','base64',['SGVsbG8=','YWJj'],['SGVsbG8','ab-_']),
];
