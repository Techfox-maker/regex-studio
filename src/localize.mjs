export const UI_TEXT = {
  "page.title": {
    "zh": "Regex Studio · 正则表达式生成器",
    "en": "Regex Studio · Regular Expression Builder"
  },
  "page.description": {
    "zh": "无需记住复杂语法。从下拉框选择规则，实时构建、理解和测试正则表达式。",
    "en": "Build, understand, and test regular expressions by choosing rules from dropdowns."
  },
  "nav.home": {
    "zh": "Regex Studio 首页",
    "en": "Regex Studio home"
  },
  "nav.main": {
    "zh": "主导航",
    "en": "Main navigation"
  },
  "nav.builder": {
    "zh": "构建工作台",
    "en": "Regex builder"
  },
  "nav.syntax": {
    "zh": "语法速查",
    "en": "Syntax reference"
  },
  "nav.local": {
    "zh": "在浏览器中运行",
    "en": "Runs in your browser"
  },
  "library.title": {
    "zh": "常用模板",
    "en": "Pattern library"
  },
  "library.intro": {
    "zh": "从常见场景开始，点击即可使用。",
    "en": "Start with a common use case. Click a pattern to use it."
  },
  "library.searchLabel": {
    "zh": "搜索常用正则",
    "en": "Search the pattern library"
  },
  "library.searchPlaceholder": {
    "zh": "搜索邮箱、网址、数字…",
    "en": "Search emails, URLs, numbers…"
  },
  "library.clearSearch": {
    "zh": "清除搜索",
    "en": "Clear search"
  },
  "library.categoryLabel": {
    "zh": "按分类筛选",
    "en": "Filter by category"
  },
  "library.allCategories": {
    "zh": "全部分类",
    "en": "All categories"
  },
  "library.listLabel": {
    "zh": "常见正则表达式列表",
    "en": "Common regular expressions"
  },
  "library.footer": {
    "zh": "本地可用 · 附示例与参考来源",
    "en": "Works locally · Examples and references included"
  },
  "hero.eyebrow": {
    "zh": "少一点语法，多一点直觉",
    "en": "LESS SYNTAX. MORE INTUITION."
  },
  "hero.start": {
    "zh": "正则表达式，",
    "en": "Build regex, "
  },
  "hero.end": {
    "zh": "选出来。",
    "en": "one rule at a time."
  },
  "hero.description": {
    "zh": "把想匹配的内容变成规则，一步一步拼出你的表达式。",
    "en": "Turn what you want to match into rules, then build your expression step by step."
  },
  "workspace.intro": {
    "zh": "选择左侧模板，或用下拉规则从零搭建。",
    "en": "Choose a pattern on the left, or start from scratch with dropdown rules."
  },
  "workspace.live": {
    "zh": "修改即生效",
    "en": "Updates as you edit"
  },
  "builder.order": {
    "zh": "规则会按从上到下的顺序匹配",
    "en": "Rules match in order, from top to bottom"
  },
  "builder.undo": {
    "zh": "撤销上一步",
    "en": "Undo the last change"
  },
  "builder.clear": {
    "zh": "清空",
    "en": "Clear"
  },
  "editor.mode": {
    "zh": "编辑方式",
    "en": "Editing mode"
  },
  "editor.visual": {
    "zh": "可视化搭建",
    "en": "Visual builder"
  },
  "editor.source": {
    "zh": "正则源码",
    "en": "Regex source"
  },
  "builder.matchWhat": {
    "zh": "匹配什么",
    "en": "Match what"
  },
  "builder.repeatHow": {
    "zh": "重复多少次",
    "en": "Repeat how often"
  },
  "builder.rulesLabel": {
    "zh": "已添加的规则",
    "en": "Added rules"
  },
  "builder.add": {
    "zh": "添加一条规则",
    "en": "Add a rule"
  },
  "builder.addHint": {
    "zh": "选择内容，继续拼接",
    "en": "Choose content to keep building"
  },
  "builder.boundaries": {
    "zh": "匹配范围",
    "en": "Match boundaries"
  },
  "builder.start": {
    "zh": "从开头匹配",
    "en": "Start of input"
  },
  "builder.end": {
    "zh": "在结尾结束",
    "en": "End of input"
  },
  "lazy.title": {
    "zh": "“尽量少匹配”是什么意思？",
    "en": "What does “lazy matching” mean?"
  },
  "lazy.subtitle": {
    "zh": "说明与例子",
    "en": "Explanation and examples"
  },
  "lazy.term": {
    "zh": "尽量少匹配（非贪婪）",
    "en": "Lazy matching (non-greedy)"
  },
  "lazy.definitionStart": {
    "zh": "：在满足整条表达式的前提下，重复部分先尝试",
    "en": ": to satisfy the complete expression, repetition first tries the "
  },
  "lazy.minimum": {
    "zh": "允许范围内最少的次数",
    "en": "lowest allowed number of repetitions"
  },
  "lazy.definitionEnd": {
    "zh": "；若后续规则无法匹配，再增加次数重试。",
    "en": "; if later rules fail, it increases that number and tries again."
  },
  "lazy.greedy": {
    "zh": "默认的贪婪匹配会先尝试更多次数，必要时也会回退。下表仅比较",
    "en": "Greedy matching tries more repetitions first and backtracks when needed. This table compares only the "
  },
  "lazy.firstMatch": {
    "zh": "第一次匹配",
    "en": "first match"
  },
  "lazy.unanchored": {
    "zh": "，未加开头和结尾限制：",
    "en": ", without start or end anchors:"
  },
  "lazy.testText": {
    "zh": "测试文本",
    "en": "Test text"
  },
  "lazy.greedyLabel": {
    "zh": "默认贪婪",
    "en": "Greedy (default)"
  },
  "lazy.lazyLabel": {
    "zh": "尽量少匹配",
    "en": "Lazy"
  },
  "lazy.entireText": {
    "zh": "→ 整段文本",
    "en": "→ the entire text"
  },
  "lazy.limitsStart": {
    "zh": "它不会突破重复次数的上下限：",
    "en": "Lazy matching still respects repetition limits: "
  },
  "lazy.limitsMiddle": {
    "zh": "仍匹配 3 次。若整条表达式要求匹配到结尾，",
    "en": " still matches exactly 3 times. If the complete expression must reach the end, "
  },
  "lazy.against": {
    "zh": "对",
    "en": " against "
  },
  "lazy.limitsEnd": {
    "zh": "仍须匹配全部 4 个 a。非贪婪也不保证执行更快。",
    "en": " must still match all 4 a characters. Lazy matching is not necessarily faster."
  },
  "source.omitDelimiters": {
    "zh": "无需填写 / 和末尾修饰符",
    "en": "Omit the / delimiters and trailing flags"
  },
  "source.placeholder": {
    "zh": "例如 ^[a-zA-Z]+$",
    "en": "For example: ^[a-zA-Z]+$"
  },
  "source.visualNote": {
    "zh": "可切换到可视化搭建：普通字符拆为下拉规则，复杂分组、分支和断言保留为可编辑的正则片段。",
    "en": "Switch to the visual builder to turn simple characters into dropdown rules. Complex groups, alternatives, and assertions remain editable regex fragments."
  },
  "builder.footer": {
    "zh": "修改任意规则，右侧表达式会同步更新。",
    "en": "Change any rule to update the expression instantly."
  },
  "expression.title": {
    "zh": "你的正则表达式",
    "en": "Your regular expression"
  },
  "expression.language": {
    "zh": "输出语言",
    "en": "Output language"
  },
  "expression.copy": {
    "zh": "复制表达式",
    "en": "Copy expression"
  },
  "flags.title": {
    "zh": "修饰符",
    "en": "Flags"
  },
  "flags.ignoreCaseTitle": {
    "zh": "忽略英文字母大小写",
    "en": "Match letters without case sensitivity"
  },
  "flags.ignoreCase": {
    "zh": "忽略大小写",
    "en": "Ignore case"
  },
  "flags.multilineTitle": {
    "zh": "让开头和结尾匹配每一行的边界",
    "en": "Make start and end anchors match each line boundary"
  },
  "flags.multiline": {
    "zh": "多行",
    "en": "Multiline"
  },
  "flags.dotAllTitle": {
    "zh": "让任意字符也匹配换行",
    "en": "Allow the dot to match line breaks"
  },
  "flags.dotAll": {
    "zh": "含换行",
    "en": "Dotall"
  },
  "flags.globalTitle": {
    "zh": "全文查找时返回所有匹配",
    "en": "Return all matches when searching the full text"
  },
  "flags.global": {
    "zh": "全局",
    "en": "Global"
  },
  "flags.unicodeTitle": {
    "zh": "使用 Unicode 模式处理字符",
    "en": "Handle characters in Unicode mode"
  },
  "test.title": {
    "zh": "试一试，匹配了吗？",
    "en": "Test your expression"
  },
  "test.live": {
    "zh": "实时测试",
    "en": "Live testing"
  },
  "test.mode": {
    "zh": "测试方式",
    "en": "Test mode"
  },
  "test.lines": {
    "zh": "逐行验证",
    "en": "Line by line"
  },
  "test.fullText": {
    "zh": "全文查找",
    "en": "Search full text"
  },
  "test.example": {
    "zh": "填入示例",
    "en": "Load example"
  },
  "test.inputLabel": {
    "zh": "输入待测试文本",
    "en": "Enter text to test"
  },
  "test.placeholder": {
    "zh": "在这里输入要测试的文本，每行一个示例…",
    "en": "Enter text to test, with one example per line…"
  },
  "test.resultsLabel": {
    "zh": "匹配结果",
    "en": "Match results"
  },
  "test.engineNote": {
    "zh": "实时测试使用 JavaScript 引擎；其他语言的导出用法需在对应环境验证。",
    "en": "Live tests use the JavaScript engine. Verify exported code in the target language environment."
  },
  "explain.title": {
    "zh": "读懂这条表达式",
    "en": "Understand this expression"
  },
  "explain.subtitle": {
    "zh": "把正则翻译成容易理解的话",
    "en": "The matching logic, in plain language"
  },
  "footer.tagline": {
    "zh": "把复杂的匹配，变成简单的选择。",
    "en": "Turn complex matching into simple choices."
  },
  "syntax.count": {
    "zh": "REGEX CHEAT SHEET · 64 条",
    "en": "REGEX CHEAT SHEET · 64 ENTRIES"
  },
  "syntax.title": {
    "zh": "正则语法速查",
    "en": "Regex syntax reference"
  },
  "syntax.close": {
    "zh": "关闭语法速查",
    "en": "Close the syntax reference"
  },
  "syntax.delimiters": {
    "zh": "两侧的斜杠是 JavaScript 正则字面量的边界；",
    "en": "The slashes delimit a JavaScript regex literal; "
  },
  "syntax.unicode": {
    "zh": "启用 Unicode 模式。源码输入框只填写中间的表达式，输出语言可在右侧选择。",
    "en": " enables Unicode mode. Enter only the pattern in the source editor, and choose the output language on the right."
  },
  "syntax.engine": {
    "zh": "以下以 JavaScript 为准。生成器支持 g、i、m、s 和 u；d、y、v 等高级修饰符需在支持的 JavaScript 环境使用。",
    "en": "The reference below uses JavaScript syntax. This builder supports g, i, m, s, and u. Advanced flags such as d, y, and v require a JavaScript environment that supports them."
  },
  "syntax.strictEnd": {
    "zh": "要求匹配到文本真正的末尾，避免末尾换行意外通过整串校验。",
    "en": " requires the actual end of the input, including when a trailing line break is present."
  },
  "syntax.done": {
    "zh": "明白了，继续搭建",
    "en": "Got it, keep building"
  },
  "language.label": {
    "zh": "界面语言",
    "en": "Interface language"
  }
};

export function getUiText(key,locale='zh') {
  return UI_TEXT[key]?.[locale==='en'?'en':'zh'];
}

export function localizePage(locale='zh') {
  const language=locale==='en'?'en':'zh';
  document.documentElement.lang=language==='en'?'en':'zh-CN';
  document.title=getUiText('page.title',language);
  const description=document.querySelector('meta[name="description"]');
  if(description)description.setAttribute('content',getUiText('page.description',language));
  document.querySelectorAll('[data-i18n]').forEach(element=>{
    const text=getUiText(element.dataset.i18n,language);
    if(text!==undefined)element.textContent=text;
  });
  for(const attribute of ['placeholder','title','aria-label']) {
    document.querySelectorAll('[data-i18n-'+attribute+']').forEach(element=>{
      const text=getUiText(element.getAttribute('data-i18n-'+attribute),language);
      if(text!==undefined)element.setAttribute(attribute,text);
    });
  }
  document.querySelectorAll('[data-ui-language]').forEach(button=>{
    const selected=button.dataset.uiLanguage===language;
    button.setAttribute('aria-pressed',String(selected));
    button.classList.toggle('selected',selected);
  });
  return language;
}
