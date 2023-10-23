const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const valuesParser = require('postcss-values-parser');
const css = require('css');

// 入力となるCSSファイルのパス
const cssFilePath = path.join(__dirname, 'styles.css');

// 出力するReactコンポーネントのファイルパス
const outputFilePath = path.join(__dirname, 'GeneratedComponent.js');

// CSSをReactコンポーネントに変換する関数
const cssToComponent = (css) => {
  const ast = css.parse(css);

  const styleObject = {};

  // CSSセレクタごとにループ
  ast.stylesheet.rules.forEach((rule) => {
    if (rule.type === 'rule') {
      rule.selectors.forEach((selector) => {
        const parsedSelector = postcss(valuesParser).process(selector).root;
        const selectorKey = parsedSelector.toString();

        if (!styleObject[selectorKey]) {
          styleObject[selectorKey] = {};
        }

        rule.declarations.forEach((declaration) => {
          const propertyName = declaration.property;
          const propertyValue = declaration.value;

          styleObject[selectorKey][propertyName] = propertyValue;
        });
      });
    }
  });

  // 生成したスタイルオブジェクトをReactコンポーネントに変換
  let componentCode = 'import React from "react";\n\n';
  for (const selectorKey in styleObject) {
    componentCode += `const ${selectorKey} = ${JSON.stringify(styleObject[selectorKey], null, 2)};\n`;
  }
  componentCode += '\nconst MyComponent = (props) => {\n  return (\n    <div {...props}>\n';

  // セレクタごとにスタイルを適用
  for (const selectorKey in styleObject) {
    componentCode += `      <div style={${selectorKey}} />\n`;
  }

  componentCode += '    </div>\n  );\n};\n\nexport default MyComponent;';

  return componentCode;
};

// CSSファイルを読み込む
fs.readFile(cssFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading CSS file:', err);
    return;
  }

  // CSSをReactコンポーネントに変換
  const reactComponentCode = cssToComponent(data);

  // Reactコンポーネントをファイルに書き込む
  fs.writeFile(outputFilePath, reactComponentCode, (err) => {
    if (err) {
      console.error('Error writing React component file:', err);
    } else {
      console.log('React component generated successfully:', outputFilePath);
    }
  });
});