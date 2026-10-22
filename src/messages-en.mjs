// Translate application-authored messages only. Quoted rule values stay verbatim.
const messages = Object.fromEntries(String.raw`
数字	Digits
英文字母	English letters
小写字母	Lowercase letters
大写字母	Uppercase letters
字母或数字	Letters or digits
字母、数字、下划线	Letters, digits or underscore
汉字	Han characters
空白字符	Whitespace
任意字符	Any character
指定文本	Literal text
指定字符之一	One of these characters
排除指定字符	Exclude these characters
正则片段	Regex fragment
0–9 中的任意一个数字	Any digit from 0–9
任意一个大写或小写英文字母	Any uppercase or lowercase English letter
a–z 中的任意一个小写字母	Any lowercase letter from a–z
A–Z 中的任意一个大写字母	Any uppercase letter from A–Z
任意一个英文字母或数字	Any English letter or digit
任意一个英文字母、数字或下划线	Any English letter, digit or underscore
任意一个汉字（需启用 u 标记）	Any Han character (requires the u flag)
空格、制表符或换行等空白字符	Whitespace such as a space, tab or line break
任意一个非换行字符；启用 s 标记时也匹配换行	Any character except a line break; the s flag also allows line breaks
按原样匹配输入的文本，自动转义特殊符号	Match the entered text literally; special characters are escaped automatically
匹配输入字符中的任意一个，符号按原样处理	Match any one of the entered characters; symbols are treated literally
匹配输入字符以外的任意一个字符	Match any character except those entered
保留分组、分支、断言等完整正则语法	Keep full regex syntax, including groups, alternatives and assertions
1 次	Once
1 次或更多	One or more times
0 次或更多	Zero or more times
0 或 1 次	Zero or once
指定次数	Exact count
次数范围	Count range
至少次数	Minimum count
重复次数	Repeat count
最少次数	Minimum count
最多次数	Maximum count
次	times
请填写字符范围，例如 A-Z,a-c,0-7	Enter character ranges, for example A-Z,a-c,0-7
请选择有效的重复次数	Select a valid repetition option
最多次数不能小于最少次数	The maximum count cannot be less than the minimum
规则格式不正确	Invalid rule format
请选择有效的规则类型	Select a valid rule type
规则列表格式不正确	Invalid rule list
找不到这个模板	Template not found
类型	Type
字符输入方式	Character input mode
字符	Characters
范围	Ranges
字符范围	Character ranges
填写字符	Enter characters
匹配文本	Text to match
快捷选择字符范围	Quick character ranges
可同时选择 · 自定义如 a-c,0-7	Select multiple ranges · Custom example: a-c,0-7
合并多个字符范围；各段用逗号分隔，如 A-Z,a-c,0-7	Combine character ranges separated by commas, such as A-Z,a-c,0-7
拖动调整顺序	Drag to reorder
向上移动	Move up
向下移动	Move down
删除规则	Delete rule
满足条件时尽可能少匹配字符	Match as few characters as possible while satisfying the pattern
尽量少匹配	Lazy matching
请完善规则	Complete this rule
规则自动保存在当前浏览器	Rules are saved automatically in this browser
当前浏览器无法保存，离开前请复制表达式	This browser cannot save your rules. Copy the expression before leaving
使用常见表达式	Use a common expression
搭建匹配规则	Build matching rules
已修改 · 可继续调整	Modified · Keep editing
已自动拆成可视化规则	Converted into visual rules
参考来源 ↗	Source ↗
自定义表达式	Custom expression
编辑正则源码	Edit regex source
在下方填写不带两侧斜杠和修饰符的表达式。	Enter the expression below without surrounding slashes or flags.
从第一条规则开始	Start with your first rule
选择数字、字母或指定文本，搭建你的匹配逻辑。	Choose digits, letters or literal text to build your matching logic.
先尝试允许范围内最少的次数；若后续规则无法匹配，再增加次数重试。点击旁边问号查看例子。	Try the minimum allowed count first. If later rules fail, increase the count and try again. Select the question mark for examples.
查看尽量少匹配的说明和例子	See lazy matching explanations and examples
没有找到相关表达式	No matching expressions found
清除搜索与分类	Clear search and category
添加规则，生成你的表达式	Add a rule to generate your expression
表达式已就绪	Expression ready
✓ 表达式已就绪	✓ Expression ready
等待添加第一条规则	Waiting for the first rule
请完善左侧规则	Complete the rules on the left
表达式语法有误，请检查源码	Invalid regex syntax. Check the source
表达式语法有误，请检查括号、字符集合或转义符。	Invalid regex syntax. Check parentheses, character classes or escapes.
当前表达式无法直接导出	This expression cannot be exported directly
此字符串不符合完整表达式。手写源码无法可靠自动拆分，请检查分组、数量和边界。	This string does not match the complete expression. Custom source cannot always be decomposed reliably; check groups, counts and boundaries.
前面的规则均可匹配，但结尾仍有多余内容；请检查结尾限制和最后一条的重复次数。	The preceding rules match, but extra content remains at the end. Check the end boundary and the final rule's repetition count.
不符合完整的规则组合，请检查字符顺序。	The complete rule sequence does not match. Check character order.
当前源码已修改，请以实际测试结果为准	The source has been modified; use the actual test results.
源码模式：直接编辑表达式，并在测试区检查匹配结果。	Source mode: edit the expression directly and check the results in the test area.
从开头	From the start
请完善此条规则	Complete this rule
到行尾结束	To the end of the line
到文本结尾结束	To the end of the text
添加规则后，这里会显示每一步的含义。	Add rules to see what each step means.
表达式尚未完成	Expression incomplete
添加规则或选择左侧表达式	Add rules or choose an expression on the left
输入文本开始测试	Enter text to start testing
（空行）	(empty line)
缺少规则要求的字符或内容；已有字符没有定位到错误。	Required characters or content are missing; no existing characters were identified as invalid.
未符合完整表达式。	Does not match the complete expression.
正在测试…	Testing…
当前浏览器无法启动文本测试，请使用现代浏览器。	This browser cannot start the text test. Use a modern browser.
测试不可用	Testing unavailable
测试已暂停	Test paused
匹配耗时过长。请缩短测试文本，或减少连续的重复规则。	Matching took too long. Shorten the test text or reduce consecutive repetition rules.
无法完成测试	Unable to complete the test
部分内容暂不能精确定位字符；无法确定的字符保留原色，请参考失败原因。	Some invalid characters could not be located precisely. Uncertain characters keep their original color; refer to the failure explanation.
匹配较多，最多展示 500 处。	Many matches were found. Up to 500 are shown.
没有找到匹配。切换到“逐行验证”，可以查看每行未通过的规则说明。	No matches found. Switch to “Validate each line” to see why each line failed.
当前展示第一处匹配。开启 g 可查找所有匹配。	Only the first match is shown. Enable g to find all matches.
文本测试未能运行，请调整规则后重试。	The text test could not run. Adjust the rules and try again.
测试未完成	Test incomplete
已清空，可使用撤销恢复	Cleared. Use Undo to restore
表达式已复制	Expression copied
浏览器限制了复制，请直接选中上方表达式复制	Copying is restricted by the browser. Select and copy the expression above
请先修正源码语法，再转为可视化规则	Fix the source syntax before converting to visual rules
绿色：已匹配	Green: matched
红色：已定位的不匹配字符	Red: identified invalid characters
规则顺序已更新	Rule order updated
参考：	Reference:
参考来源：	Sources:
参考来源	Sources
全部分类	All categories
模板起点：	Starting template:
 · 已修改	 · Modified
要求从字符串开头匹配	Must match from the start of the string
重复	Repeat
最少	Minimum
已匹配	Matched
未匹配	Not matched
匹配成功	Match
匹配失败	No match
用户名	Username
手机号	Phone number
邮箱	Email
日期	Date
整数	Integer
请选择有效的目标语言。	Select a valid target language.
C# Regex 按 UTF-16 代码单元匹配；此表达式包含补充平面字符，无法安全自动转换。	C# Regex matches UTF-16 code units. This expression contains supplementary characters and cannot be converted safely.
此命名组名称不在可自动转换的 ASCII 名称范围内。	This named group does not use an ASCII name supported by automatic conversion.
Java 命名组须以英文字母开头，且只含英文字母和数字。	Java group names must start with an English letter and contain only English letters and digits.
目标语言不支持此重复命名组，需手动调整。	The target language does not support this duplicate group name. Adjust it manually.
命名反向引用不完整。	The named backreference is incomplete.
Python 内置 re 不支持 Unicode 属性转义 \p{…}；请保留 JavaScript 或手动改写字符范围。	Python's built-in re module does not support Unicode property escapes \p{…}. Keep JavaScript or rewrite the character ranges manually.
C# Regex 不支持 Script=Han 属性；汉字区块与完整 Han 脚本并不等价，未自动替换。	C# Regex does not support Script=Han. Han blocks are not equivalent to the full Han script, so no automatic replacement was made.
此 Unicode 属性未包含在当前语言的安全自动转换范围内。	This Unicode property is outside the safe automatic conversion subset for this language.
C# Regex 无法按 JavaScript u 模式安全转换此补充平面码点。	This supplementary code point cannot be safely converted from JavaScript u mode to C# Regex.
此字符集合中包含反向简写字符类，无法安全展开到目标语言；请手动改写。	This character class contains a negated shorthand that cannot be safely expanded for the target language. Rewrite it manually.
此修饰符暂不支持跨语言转换。	This flag is not supported by cross-language conversion.
局部修饰符组暂不支持自动跨语言转换，请在目标语言中手动改写。	Scoped modifier groups cannot be converted automatically. Rewrite them in the target language.
已转换常见语法；Unicode 大小写、边界、回溯和分组语义仍需在目标环境验证，页面测试使用 JavaScript 引擎。	Common syntax has been converted. Verify Unicode case handling, boundaries, backtracking and groups in the target environment; this page tests with JavaScript.
目标语言没有对应的 u 编译开关。	The target language has no equivalent u compile flag.
词边界语义可能因目标引擎不同。	Word-boundary behavior may differ in the target engine.
使用显式字符类保持常用 ASCII 数字和单词字符，未启用 ECMAScript 兼容模式；UTF-16 字符计数可能不同。	Explicit character classes preserve common ASCII digits and word characters. ECMAScript compatibility mode is not enabled; UTF-16 character counts may differ.
g 已转换为遍历全部匹配的 API 用法，需提供 text 变量。	The g flag has been converted into API calls that iterate over matches. Provide a text variable.
当前表达式未生成目标语言代码，避免提供不兼容的结果。	No target-language code was generated because the expression cannot be converted safely.
遍历 text 中的全部匹配；text 为待匹配字符串。	Iterate over all matches in text; text is the string to search.
ERE 不支持此命名分组或前后查找语法；可尝试 GNU grep -P。	ERE does not support this named group or lookaround syntax. Try GNU grep -P.
ERE 导出仅覆盖 ASCII 表达式；Unicode 内容请使用 GNU grep -P 并核对 UTF-8 环境。	ERE export covers ASCII expressions only. For Unicode, use GNU grep -P and check the UTF-8 environment.
ERE 不支持此分组或前后查找语法；可尝试 GNU grep -P。	ERE does not support this group or lookaround syntax. Try GNU grep -P.
ERE 不支持非贪婪量词；请改用 GNU grep -P。	ERE does not support lazy quantifiers. Use GNU grep -P.
字符集合中的数字转义无法自动转换为 ERE。	Numeric escapes inside a character class cannot be converted to ERE automatically.
此目标的 ERE 不支持自动导出反向引用；请选择 GNU grep -E、GNU sed -E 或 GNU grep -P。	Backreferences cannot be exported automatically for this ERE target. Choose GNU grep -E, GNU sed -E or GNU grep -P.
转换后的反向引用组号超过 GNU ERE 的 1–9 范围；请选择 GNU grep -P。	The converted backreference exceeds GNU ERE's group range 1–9. Choose GNU grep -P.
GNU ERE 的反向引用必须位于被引用组结束之后；请选择 GNU grep -P 并核对语义。	GNU ERE backreferences must follow the referenced group's closing parenthesis. Choose GNU grep -P and verify the behavior.
ERE 不支持命名反向引用；请选择 GNU grep -P。	ERE does not support named backreferences. Choose GNU grep -P.
ERE 不支持此属性或 Unicode/十六进制转义；请尝试 GNU grep -P。	ERE does not support this property, Unicode escape or hexadecimal escape. Try GNU grep -P.
JavaScript 的 Unicode 空白类无法通用转换为 POSIX ERE；请手动改为所需字符范围。	JavaScript Unicode whitespace classes cannot be converted generally to POSIX ERE. Specify the required characters manually.
词边界 \b / \B 不是通用 POSIX ERE 语法；请尝试 GNU grep -P。	Word boundaries \b / \B are not portable POSIX ERE syntax. Try GNU grep -P.
字符集合内的反向字符类无法安全展开为 ERE。	A negated class inside a character set cannot be expanded safely to ERE.
此 ERE 命令按行处理，未自动转换控制字符转义。	This ERE command processes one line at a time. Control-character escapes were not converted.
PCRE UTF 模式不接受独立代理项转义；请改用完整 Unicode 码点。	PCRE UTF mode does not accept isolated surrogate escapes. Use a complete Unicode code point.
本工具未自动转换 JavaScript Unicode 空白类到 grep PCRE；请显式填写所需空白字符。	JavaScript Unicode whitespace classes are not converted automatically to grep PCRE. Specify the required whitespace characters.
集合中的反向字符类需手动检查 PCRE 语义。	Check PCRE behavior manually for negated classes inside character sets.
此 Unicode 属性需核对本机 PCRE2 版本，未自动生成命令。	This Unicode property requires checking the local PCRE2 version. No command was generated automatically.
请选择受支持的 Shell 命令。	Select a supported Shell command.
此修饰符未包含在 Shell 自动转换范围内。	This flag is outside the Shell automatic conversion subset.
当前命令示例按行读取，无法保持 m / s 的全文语义；请关闭这些修饰符。	These commands read one line at a time and cannot preserve full-text m / s behavior. Disable those flags.
需要支持 -P 的 GNU grep / PCRE2，并使用适当的 UTF-8 locale。	Requires GNU grep with -P / PCRE2 support and an appropriate UTF-8 locale.
ERE 示例以 LC_ALL=C 处理 ASCII 数据；不保证 Unicode 字符、词边界和大小写语义与 JavaScript 一致。	ERE examples use LC_ALL=C for ASCII data. Unicode characters, word boundaries and case handling may differ from JavaScript.
按行匹配，严格文本结尾转换为行尾；尚未在 Linux 目标运行时执行验证。	Matches line by line, converting strict text endings into line endings. The commands have not been executed in the target Linux runtime.
grep -o 不输出空匹配，与 JavaScript g 对空匹配的结果不同。	grep -o omits empty matches, unlike JavaScript g.
本 sed 示例打印匹配行；g 不是行选择修饰符，未模拟逐处返回匹配。	This sed example prints matching lines. g is not a line-selection flag, so individual matches are not returned.
忽略大小写需要 GNU gawk，普通 POSIX awk 不提供 IGNORECASE。	Ignoring case requires GNU gawk; standard POSIX awk does not provide IGNORECASE.
本 awk 示例打印匹配行，未模拟 JavaScript g 的逐处返回。	This awk example prints matching lines rather than returning individual matches like JavaScript g.
Bash =~ 只返回是否匹配与首个匹配，不支持 JavaScript g 遍历。	Bash =~ returns match status and the first match; it does not iterate like JavaScript g.
Bash 示例假定 text 是单行 ASCII 字符串；包含换行的变量需另行处理。	The Bash example assumes text is a single-line ASCII string. Variables containing line breaks need separate handling.
未生成不兼容的 Shell 命令；可调整表达式或选择其他引擎。	No incompatible Shell command was generated. Adjust the expression or choose another engine.
手机号码只能包含数字 0–9	Phone numbers may contain only digits 0–9
手机号码长度必须为 11 位	Phone numbers must contain 11 digits
手机号码第 1 位必须是 1	The first digit of a phone number must be 1
手机号码第 2 位必须是 3–9	The second digit of a phone number must be 3–9
用户名只能包含英文字母、数字和下划线	Usernames may contain only English letters, digits and underscores
用户名长度必须为 5–16 位	Usernames must contain 5–16 characters
用户名第 1 位必须是英文字母	Usernames must start with an English letter
邮箱不能包含空格、制表符或换行	Email addresses cannot contain spaces, tabs or line breaks
邮箱必须包含且仅包含一个 @，且两侧不能为空	Email addresses must contain exactly one @ with nonempty text on both sides
邮箱 @ 前只能使用 ASCII 字母、数字和允许的邮箱符号	Before @, use only ASCII letters, digits and allowed email symbols
邮箱域名各段须为 1–63 位字母数字或短横线，且首尾不能为短横线	Each email domain label must contain 1–63 letters, digits or hyphens and cannot start or end with a hyphen
邮编只能包含数字 0–9	Postal codes may contain only digits 0–9
邮编长度必须为 6 位	Postal codes must contain six digits
ZIP Code 只能包含数字和短横线	ZIP Codes may contain only digits and hyphens
ZIP Code 必须为五位数字，或五位数字加短横线和四位数字	Use five digits, or five digits followed by a hyphen and four digits
密码不能包含空白字符	Passwords cannot contain whitespace
密码长度必须为 8–32 位	Passwords must contain 8–32 characters
密码缺少小写英文字母	The password is missing a lowercase English letter
密码缺少大写英文字母	The password is missing an uppercase English letter
密码缺少数字	The password is missing a digit
密码缺少符号	The password is missing a symbol
IPv4 地址只能包含数字和点	IPv4 addresses may contain only digits and dots
IPv4 地址必须是点分隔的四段数字	An IPv4 address must contain four numeric parts separated by dots
端口号只能包含数字	Ports may contain only digits
端口号不能有多余前导零	Ports cannot contain extra leading zeros
端口号必须在 0–65535 范围内	Ports must be in the range 0–65535
网址不能包含空白或尖括号	URLs cannot contain whitespace or angle brackets
网址必须以 http:// 或 https:// 开头	URLs must start with http:// or https://
网址主机必须是带字母顶级域的 ASCII 域名，不支持 IP 或 localhost	The URL host must be an ASCII domain with an alphabetic top-level domain; IP addresses and localhost are not supported
网址端口必须在 0–65535 范围内	The URL port must be in the range 0–65535
域名只能包含 ASCII 字母、数字、短横线和点	Domains may contain only ASCII letters, digits, hyphens and dots
域名总长度必须为 1–253 个字符	Domains must contain 1–253 characters in total
域名必须包含至少一个点，且每段不能为空	Domains must contain at least one dot, with no empty labels
域名每段须为 1–63 位，且首尾必须为字母或数字	Each domain label must contain 1–63 characters and start and end with a letter or digit
域名顶级域必须为 2–63 位英文字母	The top-level domain must contain 2–63 English letters
十六进制颜色必须以 # 开头	Hex colors must start with #
# 后只能包含十六进制数字 0–9、A–F	Only hexadecimal digits 0–9 and A–F may follow #
颜色数字部分长度必须为 3、4、6 或 8 位	The color must contain 3, 4, 6 or 8 hexadecimal digits
UUID 只能包含十六进制数字和短横线	UUIDs may contain only hexadecimal digits and hyphens
UUID 必须按 8-4-4-4-12 分组	UUIDs must use the 8-4-4-4-12 group format
UUID 第 3 组的首位（版本位）必须是 4	The first digit of UUID group 3 (the version) must be 4
UUID 第 4 组的首位（variant 位）必须是 8、9、A 或 B	The first digit of UUID group 4 (the variant) must be 8, 9, A or B
MAC 地址只能包含十六进制数字、冒号或短横线	MAC addresses may contain only hexadecimal digits, colons or hyphens
MAC 地址必须为六组两位十六进制数字	MAC addresses must contain six groups of two hexadecimal digits
MAC 地址必须使用相同的分隔符，不能混用冒号和短横线	Use the same separator throughout a MAC address; do not mix colons and hyphens
IPv6 完整写法只能包含十六进制数字和冒号	Full IPv6 addresses may contain only hexadecimal digits and colons
本模板需要八组完整 IPv6，不支持 :: 压缩形式	This template requires eight IPv6 groups; :: compression is not supported
IPv6 每组必须为 1–4 位十六进制数字	Each IPv6 group must contain 1–4 hexadecimal digits
月份必须在 01–12 范围内	The month must be in the range 01–12
日期中的日必须在 01–31 范围内	The day must be in the range 01–31
小时必须在 00–23 范围内	The hour must be in the range 00–23
分钟必须在 00–59 范围内	Minutes must be in the range 00–59
秒必须在 00–59 范围内	Seconds must be in the range 00–59
UTC 时间戳的日期与时间必须用大写 T 连接	The UTC timestamp must separate the date and time with an uppercase T
UTC 时间戳必须以大写 Z 结尾	The UTC timestamp must end with an uppercase Z
年月必须按 YYYY-MM 填写	Enter the year and month as YYYY-MM
数字只能包含可选正负号、数字和小数点	Numbers may contain only an optional sign, digits and a decimal point
整数只能包含可选正负号与数字	Integers may contain only an optional sign and digits
正负号只能在开头出现一次	A sign may appear only once, at the start
整数不能有多余前导零	Integers cannot contain extra leading zeros
正整数只能包含数字	Positive integers may contain only digits
正整数必须大于零，且不能有前导零	Positive integers must be greater than zero with no leading zeros
非负整数只能包含数字，不含正负号	Nonnegative integers may contain only digits, without a sign
除单个 0 外，非负整数不能以 0 开头	Nonnegative integers cannot start with 0 unless the entire value is 0
负整数必须以一个负号开头，后接数字	Negative integers must start with one minus sign followed by digits
负整数不能是 -0，也不能有前导零	Negative integers cannot be -0 or contain leading zeros
小数必须含一个小数点，且两侧都有数字	Decimals must contain one decimal point with digits on both sides
小数整数部分不能有多余前导零	The integer part of a decimal cannot contain extra leading zeros
数字须为可选符号、整数及可选小数，不能有多余的小数点	Use an optional sign, an integer and an optional decimal part, with no extra decimal points
数字整数部分不能有多余前导零	The integer part cannot contain extra leading zeros
金额只接受非负数字，不包含符号	Amounts accept only nonnegative numbers without a sign
金额最多两位小数，小数点后不能为空	Amounts allow up to two decimal places, with at least one digit after a decimal point
金额整数部分不能有多余前导零	The integer part of an amount cannot contain extra leading zeros
百分比必须为非负数字并以 % 结尾	Percentages must be nonnegative numbers ending with %
百分比数值必须在 0–100 范围内，且不含多余前导零	Percentages must be in the range 0–100 with no extra leading zeros
科学计数法须含尾数、e/E 和整数指数	Scientific notation requires a mantissa, e/E and an integer exponent
科学计数法尾数的整数部分不能有多余前导零	The integer part of the mantissa cannot contain extra leading zeros
千分位至少含一个逗号，逗号后每组恰好三位数字	Thousands notation requires at least one comma, with exactly three digits in each following group
只能包含 Unicode 汉字，不能包含标点、空格或字母	Use only Unicode Han characters, without punctuation, spaces or alphabetic letters
只能包含 ASCII 英文字母 A–Z 或 a–z	Use only ASCII English letters A–Z or a–z
只能包含小写英文字母 a–z	Use only lowercase English letters a–z
只能包含大写英文字母 A–Z	Use only uppercase English letters A–Z
只能包含 ASCII 英文字母与数字，不含下划线	Use only ASCII English letters and digits, without underscores
只能包含 ASCII 英文字母、数字和下划线	Use only ASCII English letters, digits and underscores
只能包含 Unicode 字母，不含数字、标点或组合音标	Use only Unicode letters, without digits, punctuation or combining marks
只能包含空白字符（空格、制表符、换行等）	Use only whitespace, such as spaces, tabs and line breaks
文本不能为空，也不能包含空白字符	Text cannot be empty or contain whitespace
Slug 只能包含小写字母、数字与短横线	Slugs may contain only lowercase letters, digits and hyphens
Slug 首尾不能为短横线，中间不能连续两个短横线	Slugs cannot start or end with a hyphen or contain consecutive hyphens
版本号必须是 MAJOR.MINOR.PATCH 三段数字	Versions must contain three numeric parts: MAJOR.MINOR.PATCH
版本号每段不能有多余前导零	Version components cannot contain extra leading zeros
文件名不能包含空白或目录分隔符	File names cannot contain whitespace or directory separators
图片文件扩展名须为 png、jpg/jpeg、gif、webp、svg 或 avif	Image extensions must be png, jpg/jpeg, gif, webp, svg or avif
文件名必须以 .json 结尾	The file name must end with .json
Base64 只能使用标准字母表字符与填充符 =	Base64 may contain only standard-alphabet characters and the padding character =
Base64 长度必须是 4 的倍数且不能为空	Base64 must be nonempty with a length divisible by 4
填充符 = 只能位于结尾，且最多两个	The padding character = may appear only at the end, at most twice
`.trim().split('\n').map(line=>line.split('\t')));

const messageKeys=Object.keys(messages).sort((a,b)=>b.length-a.length);

function repetition(text) {
  if(messages[text]) return messages[text];
  let match;
  if((match=/^(\d+)–(\d+) 次$/.exec(text))) return `${match[1]}–${match[2]} times`;
  if((match=/^至少 (\d+) 次$/.exec(text))) return `at least ${match[1]} times`;
  if((match=/^(\d+) 次$/.exec(text))) return `${match[1]} ${match[1]==='1'?'time':'times'}`;
  return text;
}

function subject(text) {
  let match;
  if((match=/^文本「([\s\S]*)」$/.exec(text))) return `Text “${match[1]}”`;
  if((match=/^「([\s\S]*)」中的任意字符$/.exec(text))) return `Any character in “${match[1]}”`;
  if((match=/^「([\s\S]*)」以外的字符$/.exec(text))) return `Any character except those in “${match[1]}”`;
  if((match=/^(匹配|排除)字符范围「([\s\S]*)」中的任意字符$/.exec(text))) return `${match[1]==='排除'?'Any character outside':'Any character in'} the ranges “${match[2]}”`;
  if((match=/^正则片段「([\s\S]*)」（保留原有分组、分支与断言）$/.exec(text))) return `Regex fragment “${match[1]}” (preserving its groups, alternatives and assertions)`;
  return messages[text]||text;
}

export function translateMessage(text,locale='zh') {
  if(locale!=='en'||typeof text!=='string'||!text) return text;
  if(Object.hasOwn(messages,text)) return messages[text];
  let match;
  if(/^(?:# |import re\r?\n|import java\.util\.regex\.|using System\.Text\.RegularExpressions;)/.test(text)) {
    const commented=text.split('\n').map(commandComment).join('\n');
    if(commented!==text) return commented;
  }
  if((match=/^第\s*(\d+)\s*条未通过：([\s\S]*)$/.exec(text))) return `Rule ${match[1]} failed: ${translateMessage(match[2],locale)}`;
  const startRequirement='；要求从字符串开头匹配';
  if(text.endsWith(startRequirement)) return `${translateMessage(text.slice(0,-startRequirement.length),locale)}; must match from the start of the string`;
  if((match=/^([\s\S]+)，匹配 ([\s\S]+?)(，尽可能少匹配)?$/.exec(text))) return `${subject(match[1])}: match ${repetition(match[2]).replace(/^[A-Z]/,letter=>letter.toLowerCase())}${match[3]?', as few as possible':''}`;
  if((match=/^第\s*(\d+)\s*段字符范围不能为空$/.exec(text))) return `Character range ${match[1]} cannot be empty`;
  if((match=/^第\s*(\d+)\s*段格式不正确：请输入单个字符或 A-Z 形式的范围$/.exec(text))) return `Range ${match[1]} is invalid: enter one character or a range such as A-Z`;
  if((match=/^第\s*(\d+)\s*段范围倒置：起点不能大于终点$/.exec(text))) return `Range ${match[1]} is reversed: its start cannot exceed its end`;
  if((match=/^(重复次数|最少次数|最多次数)必须是大于或等于 0 的整数$/.exec(text))) return `${messages[match[1]]} must be an integer greater than or equal to 0`;
  if((match=/^(重复次数|最少次数|最多次数)超出可用范围$/.exec(text))) return `${messages[match[1]]} is outside the supported range`;
  if((match=/^请填写「([\s\S]*)」的内容$/.exec(text))) return `Enter a value for “${messages[match[1]]||match[1]}”`;
  if((match=/^缺少指定内容「([\s\S]*)」(，同时存在标红的不符字符)?$/.exec(text))) return `Missing required content “${match[1]}”${match[2]?'; invalid characters are also marked in red':''}`;
  if((match=/^缺少指定文本「([\s\S]*)」$/.exec(text))) return `Missing literal text “${match[1]}”`;
  if((match=/^IPv4 第 ([1-4]) 段必须是 0–255，且不能有多余前导零$/.exec(text))) return `IPv4 part ${match[1]} must be in the range 0–255 without extra leading zeros`;
  if((match=/^日期部分必须是四位年、两位月、两位日，并使用 (.+) 分隔$/.exec(text))) return `Use a four-digit year, two-digit month and two-digit day, separated by ${match[1]}`;
  if((match=/^时间部分必须按 (HH:mm(?::ss)?) 填写，每段两位数字$/.exec(text))) return `Enter the time as ${match[1]}, with two digits in each part`;
  if((match=/^已应用([\s\S]*)模板，可继续修改规则$/.exec(text))) return `${messages[match[1]]||match[1]} template applied. You can keep editing the rules`;
  if((match=/^已载入「([\s\S]*)」及测试示例$/.exec(text))) return `Loaded “${messages[match[1]]||match[1]}” and its test examples`;
  if((match=/^(?:第\s*)?(\d+)\s*条规则(类型|字符输入方式|重复次数|最多次数|最少次数|重复次数)$/.exec(text))) return `Rule ${match[1]}: ${messages[match[2]]||match[2]}`;
  if((match=/^第\s*(\d+)\s*条规则的([\s\S]*)$/.exec(text))) return `Rule ${match[1]}: ${messages[match[2]]||match[2]}`;
  if((match=/^(拖动|上移|下移|删除)第\s*(\d+)\s*条规则$/.exec(text))) return `${({'拖动':'Drag','上移':'Move up','下移':'Move down','删除':'Delete'})[match[1]]} rule ${match[2]}`;
  if((match=/^添加或移除 ([\s\S]*) 范围$/.exec(text))) return `Add or remove the ${match[1]} range`;
  if((match=/^显示 (\d+) \/ (\d+) 条表达式$/.exec(text))) return `Showing ${match[1]} / ${match[2]} expressions`;
  if((match=/^([\d,]+) 字符$/.exec(text))) return `${match[1]} characters`;
  if((match=/^模板起点：([\s\S]*)$/.exec(text))) return `Starting template: ${match[1]}`;
  if((match=/^参考来源：([\s\S]*)$/.exec(text))) return `Sources: ${match[1]}`;
  if((match=/^参考：([\s\S]*)$/.exec(text))) return `Reference: ${match[1]}`;
  if((match=/^未通过完整格式要求：([\s\S]*)$/.exec(text))) return `Does not meet the complete format: ${translateMessage(match[1],locale)}`;
  if((match=/^([\s\S]*) · 已修改$/.exec(text))) return `${match[1]} · Modified`;
  // Export notices join known complete sentences; translate only a fully known sequence.
  let cursor=0,output='';
  while(cursor<text.length) {
    if(/\s/.test(text[cursor])) {output+=text[cursor++];continue;}
    const key=messageKeys.find(key=>text.startsWith(key,cursor));
    if(!key) break;
    output+=messages[key];cursor+=key.length;
  }
  return cursor===text.length?output:text;
}
