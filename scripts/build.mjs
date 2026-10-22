import {VERSION} from '../src/version.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=process.argv[2]?path.resolve(process.argv[2]):path.join(root,'outputs');
await fs.mkdir(output,{recursive:true});
const read=name=>fs.readFile(path.join(root,'src',name),'utf8');
const modules=[
 ['version.mjs','VERSION'],
 ['engine.mjs','RULE_TYPES,REPETITIONS,buildPattern,explainRule,getTemplate,ruleSource'],
 ['catalog.mjs','CATALOG'],['catalog-en.mjs','CATALOG_EN_TEXT'],
 ['exporters.mjs','LANGUAGES,formatRegex'],['shell-exporters.mjs','SHELL_LANGUAGES,formatShellRegex'],
 ['catalog-checks.mjs','getCatalogChecks'],['template-parser.mjs','parseTemplate'],
 ['character-diagnostics.mjs','locateInvalidCharacters'],
 ['syntax.mjs','SYNTAX_SECTIONS,SYNTAX_SOURCES'],['syntax-en.mjs','SYNTAX_EN_SECTIONS'],
 ['messages-en.mjs','translateMessage'],['localize.mjs','localizePage']
];
const [html,app,...styles]=await Promise.all(['index.html','app.js','styles.css','compact.css','library.css','locale.css'].map(read));
const wrap=(code,names)=>'const {'+names+'}=(()=>{\n'+code.replace(/^export /gm,'')+'\nreturn {'+names+'};\n})();';
const parts=[];
for(const [file,names] of modules)parts.push(wrap(await read(file),names));
const script='(()=>{\n'+parts.join('\n')+'\n'+app.replace(/^import .*?;\s*/gm,'')+'\n})();';
new Script(script);
const inline=html.replace('<link rel="stylesheet" href="styles.css">',()=>'<style>'+styles.join('\n')+'</style>')
 .replace(/\s*<link rel="stylesheet" href="(?:compact|library|locale).css">/g,'')
 .replace('<script type="module" src="app.js"></script>',()=>'<script>\n'+script+'\n</script>');
await fs.writeFile(path.join(output,'regex-studio.html'),inline);
console.log('Generated standalone offline page.');
console.log(VERSION);
