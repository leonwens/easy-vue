import { parseHTML } from './parse';
function genProps(attrs) {
  const list = attrs.reduce((acc, cur) => {
    const { name, value } = cur;
    let _value = value;
    if (name === 'style') {
      _value = value.split(';').reduce((res, str) => {
        const [key, val] = str.split(':');
        res[key] = val;
        return res;
      }, {});
    }
    acc.push(`${name}:${JSON.stringify(_value)}`);
    return acc;
  }, []);
  return `{${list.join(',')}}`;
}
function gen(node) {
  const { type, text } = node;
  if (type === 1) {
    return codegen(node);
  } else {
    // 文本
    const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{bianliang}} 匹配到的内容是表达式的变量
    if (defaultTagRE.test(text)) {
      // {{data}} world --> _v(_s(data)+' world')
      const tokens = [];
      let match;
      let lastIndex = 0;
      defaultTagRE.lastIndex = 0;
      while ((match = defaultTagRE.exec(text))) {
        let index = match.index;
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        tokens.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length;
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      return `_v(${tokens.join('+')})`;
    } else {
      // hello --> _v('hello')
      return `_v(${JSON.stringify(text)})`;
    }
  }
}
function genChildren(list) {
  return list
    .map(child => {
      return gen(child);
    })
    .join(',');
}
function codegen(ast) {
  const { tag, attrs, children } = ast;
  const code = `_c('${tag}', ${attrs.length > 0 ? genProps(attrs) : 'null'} ${children.length > 0 ? `,${genChildren(children)}` : ''})`;
  return code;
}

export function compileToFunction(template) {
  // 将template转化成ast语法树
  const ast = parseHTML(template);
  // 根据ast生成render函数返回的字符串
  //   render(){
  //     return _c('div', {props}, [children])
  //   }
  let code = codegen(ast);
  code = `with(this){return ${code}}`;
  const render = new Function(code);
  return render;
}
