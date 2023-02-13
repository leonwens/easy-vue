const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // [<div, div] 第0项为正则匹配结果，第1项为标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // [</div>] 第0项就是正则匹配结果
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //第0项为正则匹配结果，第1项为属性name，属性value为第3或4或5项
const startTagClose = /^\s*(\/?)>/; // <div> <br/> 两种风格都能匹配

export function parseHTML(html) {
  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  let ast;
  let currentParent;
  const stack = [];
  function advance(len) {
    html = html.substring(len);
  }
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      };
      advance(start[0].length);
      let attr, end;
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5]
        });
      }
      if (end) {
        advance(end[0].length);
      }
      return match;
    }
  }
  function cookStart(tag, attrs) {
    const node = {
      tag,
      type: ELEMENT_TYPE,
      attrs,
      children: [],
      parent: null
    };
    if (!ast) {
      ast = node;
    }
    if (currentParent) {
      node.parent = currentParent;
      currentParent.children.push(node);
    }
    currentParent = node;
    stack.push(node);
  }
  function cookText(text) {
    text = text.replace(/\s/g, '');
    text &&
      currentParent.children.push({
        type: TEXT_TYPE,
        text,
        parent: currentParent
      });
  }
  function cookEnd(tag) {
    stack.pop();
    currentParent = stack[stack.length - 1];
  }
  while (html) {
    const textEnd = html.indexOf('<');
    if (textEnd === 0) {
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        cookStart(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        cookEnd(endTagMatch[1]);
        advance(endTagMatch[0].length);
        continue;
      }
    }
    if (textEnd > 0) {
      const text = html.substring(0, textEnd);
      if (text) {
        cookText(text);
        advance(text.length);
      }
    }
  }
  return ast;
}
