const { spawn } = require("child_process")
const ts = require('typescript');
const fs = require("fs").promises;
const path = require("path");
const terser = require("terser");

async function convert() {
    const mainTsPath = path.join(process.cwd(), 'electron/main.ts');
    const mainJsPath = path.join(process.cwd(), 'build/main.js');

    const tsConfig = {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.CommonJS,
        removeComments: true,
        noEmitHelpers: true,
        inlineSourceMap: false,
    };

    const tsCode = await fs.readFile(mainTsPath, 'utf-8');
    const jsCodeDirty = ts.transpileModule(tsCode, { compilerOptions: tsConfig }).outputText;
    const jsCode = await terser.minify(jsCodeDirty, { mangle: { toplevel: true }, compress: { drop_console: true } })

    await fs.mkdir(path.dirname(mainJsPath), { recursive: true })
    await fs.writeFile(mainJsPath, jsCode.code);
}

function run() {
    spawn("electron", ["build/main.js"], { shell: true, stdio: "inherit" })
}

function build() {
    spawn("electron-builder", [], { shell: true, stdio: "inherit" });
}

function electron() {
    let isDev = false;

    return {
        name: 'electron',
        configResolved(config) {
            isDev = config.command === 'serve';
        },
        config: (config) => {
            config.base = "./"
        },
        buildStart() {
            if (isDev) {
                convert();
                run();
            } else {
                convert();
                build()
            }
        },
    };
}

module.exports = electron;
