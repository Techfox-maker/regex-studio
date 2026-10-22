export const SYNTAX_EN_SECTIONS = [
  {
    "title": "Basics and input formats",
    "items": [
      {
        "syntax": "abc",
        "description": "Literal characters match themselves; writing them consecutively creates a sequence.",
        "example": "cat matches cat, rather than a choice between c, a and t."
      },
      {
        "syntax": "/pattern/flags",
        "description": "JavaScript literal notation: slashes surround the pattern and flags follow them. Enter only the pattern in the source editor.",
        "example": "/\\d+/gu: enter \\d+ as the source; select g and u separately."
      },
      {
        "syntax": "new RegExp(pattern, flags)",
        "description": "The constructor takes a pattern string and flags. Backslashes need another escape inside an ordinary JavaScript string.",
        "example": "new RegExp(\"\\\\d+\", \"u\") is equivalent to /\\d+/u."
      }
    ]
  },
  {
    "title": "Character classes and sets",
    "items": [
      {
        "syntax": ".",
        "description": "Matches one character other than a line terminator, or any character with the s flag.",
        "example": "a.b matches a-b; matching a\\nb requires s."
      },
      {
        "syntax": "\\d",
        "description": "Matches an ASCII digit, equivalent to [0-9].",
        "example": "\\d{3} matches 123."
      },
      {
        "syntax": "\\D",
        "description": "Matches a character other than an ASCII digit.",
        "example": "\\D+ matches abc."
      },
      {
        "syntax": "\\w",
        "description": "Matches ASCII letters, digits and underscore; Unicode case-insensitive mode also includes characters that fold to them.",
        "example": "\\w+ matches hello_26; it does not mean letters from every language."
      },
      {
        "syntax": "\\W",
        "description": "Matches a character outside \\w.",
        "example": "\\W matches @."
      },
      {
        "syntax": "\\s",
        "description": "Matches whitespace, including spaces, tabs and line terminators.",
        "example": "a\\sb matches a b."
      },
      {
        "syntax": "\\S",
        "description": "Matches a non-whitespace character.",
        "example": "\\S+ matches hello."
      },
      {
        "syntax": "[abc]",
        "description": "Matches any one character in the set; adjacent members form a union.",
        "example": "[abc] matches a, b or c."
      },
      {
        "syntax": "[^abc]",
        "description": "Matches one character outside the set; ^ must appear first.",
        "example": "[^0-9] matches a, but not 3."
      },
      {
        "syntax": "[a-z]",
        "description": "A hyphen defines a range; several ranges can be combined.",
        "example": "[A-Za-z0-9] matches an ASCII letter or digit."
      },
      {
        "syntax": "[^]",
        "description": "The complement of the empty set matches any character, including a line terminator.",
        "example": "[^]+ matches text across lines."
      },
      {
        "syntax": "[]",
        "description": "An empty character set cannot match any character.",
        "example": "[] matches neither a nor the empty string."
      }
    ]
  },
  {
    "title": "Escapes and control characters",
    "items": [
      {
        "syntax": "\\. \\* \\+ \\? \\( \\) \\[ \\] \\{ \\} \\^ \\$ \\| \\\\",
        "description": "A backslash makes a special symbol literal. The Literal text rule escapes these symbols automatically.",
        "example": "\\(abc\\) matches (abc); \\. matches a literal dot."
      },
      {
        "syntax": "\\/",
        "description": "Escape a slash inside /.../ notation. A constructor pattern does not use / as a delimiter.",
        "example": "/a\\/b/u matches a/b."
      },
      {
        "syntax": "\\t \\n \\r",
        "description": "Match tab, line feed and carriage return respectively. A Windows line ending is commonly \\r\\n.",
        "example": "a\\tb matches a tab between a and b."
      },
      {
        "syntax": "\\v \\f",
        "description": "Match vertical tab and form feed respectively.",
        "example": "\\f matches U+000C."
      },
      {
        "syntax": "\\0",
        "description": "Matches NUL; do not immediately follow it with a decimal digit.",
        "example": "\\0 matches U+0000."
      },
      {
        "syntax": "\\cX",
        "description": "Matches a control character, with X in A-Z or a-z.",
        "example": "\\cJ matches line feed U+000A."
      },
      {
        "syntax": "\\xHH",
        "description": "Represents a character using two hexadecimal digits.",
        "example": "\\x41 matches A."
      },
      {
        "syntax": "\\uHHHH",
        "description": "Represents one UTF-16 code unit using four hexadecimal digits.",
        "example": "\\u4E2D matches U+4E2D."
      },
      {
        "syntax": "\\u{H…H}",
        "description": "Represents a Unicode code point; requires u or v and supports supplementary characters.",
        "example": "/\\u{1F600}/u matches 😀."
      },
      {
        "syntax": "[\\b]",
        "description": "Inside a character set, \\b means backspace rather than a word boundary.",
        "example": "[\\b] matches U+0008."
      }
    ]
  },
  {
    "title": "Unicode properties",
    "items": [
      {
        "syntax": "\\p{L}",
        "description": "Matches a Unicode letter; property escapes require u or v.",
        "example": "/\\p{L}+/u matches letters in many writing systems."
      },
      {
        "syntax": "\\p{Script=Han}",
        "description": "Matches Han characters by script. Property names and values are case-sensitive.",
        "example": "/\\p{Script=Han}+/u matches Han characters."
      },
      {
        "syntax": "\\P{…}",
        "description": "Matches a code point without the specified property; string properties cannot be complemented.",
        "example": "/\\P{Number}+/u matches non-numeric Unicode content."
      },
      {
        "syntax": "\\p{RGI_Emoji}",
        "description": "With v, matches a Unicode property of strings, including emoji sequences containing multiple code points.",
        "example": "/\\p{RGI_Emoji}/v matches a supported emoji sequence."
      }
    ]
  },
  {
    "title": "Anchors and word boundaries",
    "items": [
      {
        "syntax": "^",
        "description": "Asserts the beginning of the input, or a line beginning with m. It consumes no character.",
        "example": "/^abc/u matches text beginning with abc."
      },
      {
        "syntax": "$",
        "description": "Asserts the end of the input, or a line ending with m. It consumes no character.",
        "example": "/^abc$/mu can match a line containing abc in multiline text."
      },
      {
        "syntax": "\\b",
        "description": "Asserts a boundary between word and non-word characters, based on \\w. It is not Chinese word segmentation.",
        "example": "\\bcat\\b matches a separate cat, but not the cat inside scatter."
      },
      {
        "syntax": "\\B",
        "description": "Asserts a position that is not a word boundary, consuming no character.",
        "example": "\\Bcat matches cat inside scatter."
      }
    ]
  },
  {
    "title": "Repetition and greediness",
    "items": [
      {
        "syntax": "?",
        "description": "The preceding atom or group occurs zero or one time.",
        "example": "colou?r matches color or colour."
      },
      {
        "syntax": "*",
        "description": "The preceding atom or group occurs zero or more times.",
        "example": "ab*c matches ac, abc and abbc."
      },
      {
        "syntax": "+",
        "description": "The preceding atom or group occurs one or more times.",
        "example": "\\d+ matches consecutive digits."
      },
      {
        "syntax": "{n}",
        "description": "The preceding atom or group occurs exactly n times.",
        "example": "\\d{4} matches four digits."
      },
      {
        "syntax": "{n,}",
        "description": "The preceding atom or group occurs at least n times.",
        "example": "a{2,} matches aa, aaa and longer runs."
      },
      {
        "syntax": "{n,m}",
        "description": "The preceding atom or group occurs n to m times, inclusively, with non-negative integers n <= m.",
        "example": "\\d{2,4} matches two to four digits."
      },
      {
        "syntax": "*? +? ?? {n,m}?",
        "description": "Lazy matching first tries the fewest allowed repetitions, then expands if later rules need more. Limits stay the same, and an end anchor can still require the whole input.",
        "example": "For aaaa, a+ first matches aaaa and a+? first matches a; ^a+?$ still matches all four a characters. <.*?> first matches <a> in <a><b>."
      }
    ]
  },
  {
    "title": "Groups, alternatives and backreferences",
    "items": [
      {
        "syntax": "(…)",
        "description": "A capturing group treats a subexpression as a unit and saves its match in opening-parenthesis order.",
        "example": "(ab)+ matches ab or abab; (\\d{4})-(\\d{2}) captures year and month separately."
      },
      {
        "syntax": "(?:…)",
        "description": "A non-capturing group combines rules without saving a capture.",
        "example": "(?:ab|cd)+ matches abcd and abab, as well as cdab and cdcd."
      },
      {
        "syntax": "(?<name>…)",
        "description": "A named capture is available through groups.name in the result.",
        "example": "(?<year>\\d{4}) captures year."
      },
      {
        "syntax": "|",
        "description": "Alternatives try the left expression before the right expression.",
        "example": "cat|dog matches cat or dog; (?:cat|dog)s applies the final s to either alternative."
      },
      {
        "syntax": "\\1 \\2 …",
        "description": "A numeric backreference matches the exact text captured by the corresponding earlier group.",
        "example": "(\\w+)\\s+\\1 matches hello hello."
      },
      {
        "syntax": "\\k<name>",
        "description": "A named backreference matches the exact text captured by the named group again.",
        "example": "(?<word>\\w+)\\s+\\k<word> matches hi hi."
      }
    ]
  },
  {
    "title": "Lookahead and lookbehind",
    "items": [
      {
        "syntax": "(?=…)",
        "description": "A positive lookahead requires a subexpression after the current position; the assertion consumes no character.",
        "example": "\\d+(?=USD) matches only 100 in 100USD."
      },
      {
        "syntax": "(?!…)",
        "description": "A negative lookahead requires the following text not to match a subexpression.",
        "example": "foo(?!bar) matches foo in foobaz, but not in foobar."
      },
      {
        "syntax": "(?<=…)",
        "description": "A positive lookbehind requires a subexpression immediately before the current position.",
        "example": "(?<=￥)\\d+ matches only 100 in ￥100."
      },
      {
        "syntax": "(?<!…)",
        "description": "A negative lookbehind requires the preceding text not to match a subexpression.",
        "example": "(?<!x)foo matches foo in afoo, but not in xfoo."
      }
    ]
  },
  {
    "title": "Flags outside the expression",
    "items": [
      {
        "syntax": "g",
        "description": "Global search continues to later matches; exec and test use and update lastIndex.",
        "example": "/\\d+/g finds 12, then 34 in a12b34."
      },
      {
        "syntax": "i",
        "description": "Enables case-insensitive matching.",
        "example": "/abc/i matches AbC."
      },
      {
        "syntax": "m",
        "description": "Multiline mode changes ^ and $, without making the dot match line terminators.",
        "example": "/^cat$/m matches cat on the second line of dog\\ncat."
      },
      {
        "syntax": "s",
        "description": "Makes the dot match line terminators, without changing ^ or $.",
        "example": "/a.b/s matches a\\nb."
      },
      {
        "syntax": "u",
        "description": "Processes Unicode code points and enables property/code-point escapes; it does not group all user-perceived characters.",
        "example": "/^.$/u matches 😀; u and v cannot be combined."
      },
      {
        "syntax": "y",
        "description": "Sticky matching must begin at lastIndex; it does not skip characters to search later positions.",
        "example": "/cat/y with lastIndex=1 matches cat in xcat."
      },
      {
        "syntax": "d",
        "description": "Adds start/end indices for the match and capturing groups to exec results.",
        "example": "/a(b)/d.exec(\"ab\").indices contains the matching ranges."
      },
      {
        "syntax": "v",
        "description": "Unicode sets mode includes u features plus set operations and string properties. It cannot be combined with u.",
        "example": "/[\\p{L}&&\\p{ASCII}]/v matches ASCII letters."
      }
    ]
  },
  {
    "title": "Set operations and scoped flags",
    "items": [
      {
        "syntax": "[setA setB] · v",
        "description": "Adjacent sets form a union and can be nested. Do not insert spaces as separators.",
        "example": "/[[a-c][0-2]]/v matches a, b, c, 0, 1 or 2."
      },
      {
        "syntax": "[setA&&setB] · v",
        "description": "Intersection matches members present on both sides. Do not mix && and -- at one level; nest complex operations.",
        "example": "/[\\p{L}&&\\p{ASCII}]/v matches ASCII letters."
      },
      {
        "syntax": "[setA--setB] · v",
        "description": "Subtraction matches members on the left that are absent from the right.",
        "example": "/[\\w--_]/v matches letters or digits, excluding underscore."
      },
      {
        "syntax": "[\\q{ab|cd}] · v",
        "description": "Finite string alternatives inside a set can match multiple code points; longer alternatives are tried first.",
        "example": "/[\\q{ab|cd}]/v matches ab or cd."
      },
      {
        "syntax": "(?ims:…)",
        "description": "Enables selected i, m and s flags only inside the group. Older browsers may not support this syntax.",
        "example": "/(?i:abc)DEF/u matches AbCDEF; DEF remains case-sensitive."
      },
      {
        "syntax": "(?ims-ims:…)",
        "description": "Enables i/m/s flags before the hyphen and disables those after it. A flag cannot appear on both sides.",
        "example": "/(?i-s:a.b)/u ignores case inside this group but its dot does not match a line terminator."
      }
    ]
  }
];
