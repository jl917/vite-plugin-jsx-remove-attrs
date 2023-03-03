import { createFilter, Plugin } from 'vite';
import { CallExpression, Program, transformSync } from '@swc/core';
import { Visitor } from '@swc/core/Visitor';

interface ITransformResult {
  code: string;
  map?: string;
}

const include = [/\.[cm]?[tj]sx?$/];
const exclude = ['**/node_modules/**'];

const filterFile = createFilter(include, exclude);

class PluginRemoveAttr extends Visitor {
  ignoreList: string[];
  constructor(ignoreList: string[]) {
    super();
    this.ignoreList = ignoreList;
  };
  visitCallExpression(n: CallExpression) {
    if (n.callee.type === 'Identifier' && n.callee.value === 'jsx') {
      if (n.arguments[1]?.expression.type === 'ObjectExpression') {
        const newProperties = n.arguments[1].expression.properties.filter(e => {
          return (e.type === 'KeyValueProperty') && (e.key.type === 'StringLiteral') && !this.ignoreList.includes(e.key.value)
        })
        n.arguments[1].expression.properties = newProperties
      }
    }
    return super.visitCallExpression(n);
  }
}

const removeAttributes = (ignoreList: string[] = []): Plugin => ({
  name: 'vite-plugin-jsx-remove-attrs',
  apply: 'build',
  transform: (src: string, id: string) => {
    let result: ITransformResult = { code: src };
    const isTrans = (process.env.NODE_ENV === 'production') && filterFile(id);
    if (isTrans) {
      try {
        result = transformSync(src, {
          plugin: (program: Program): any => new PluginRemoveAttr(ignoreList).visitProgram(program),
          sourceMaps: true,
          jsc: {
            parser: {
              syntax: 'ecmascript',
              jsx: true,
            }
          }
        })
      } catch {
        console.log('error file: ', id);
      }
    }
    return result;
  },
})

export default removeAttributes;
