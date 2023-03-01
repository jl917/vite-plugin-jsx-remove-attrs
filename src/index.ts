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

class PluginTransformImport extends Visitor {
  ignoreList: string[];
  constructor(ignoreList, program) {
    super();
    this.ignoreList = ignoreList;
    this.visitProgram(program);
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
  name: 'vite-plugin-remove-attributes',
  apply: 'build',
  transform: (src: string, id: string) => {
    let result: ITransformResult = { code: '', map: '' };
    const isTrans = (process.env.NODE_ENV === 'production') && filterFile(id);
    if (isTrans) {
      result = transformSync(src, {
        plugin: (program: Program): any => new PluginTransformImport(ignoreList, program),
        sourceMaps: true,
        jsc: {
          parser: {
            syntax: 'ecmascript',
            jsx: true,
          }
        }
      })
    }
    return result;
  },
})

export default removeAttributes;
