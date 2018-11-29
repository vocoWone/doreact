const chalk = require("chalk");
const childProcess = require("child_process");
const fs = require("fs-extra");

function spawn(command, args, errorMessage) {
    const isWindows = process.platform === "win32"; // spawn with {shell: true} can solve .cmd resolving, but prettier doesn't run correctly on mac/linux
    const result = childProcess.spawnSync(isWindows ? command + ".cmd" : command, args, {stdio: "inherit"});
    if (result.error) {
        console.error(result.error);
        process.exit(1);
    }
    if (result.status !== 0) {
        console.error(chalk`{red.bold ${errorMessage}}`);
        console.error(`non-zero exit code returned, code=${result.status}, command=${command} ${args.join(" ")}`);
        process.exit(1);
    }
}

function checkCodeStyle() {
    console.info(chalk`{green.bold [task]} {white.bold check code style}`);
    return spawn("prettier", ["--config", "config/prettier.json", "--list-different", "{core,test}/**/*.{ts,tsx}"], "check code style failed, please format above files");
}

function test() {
    console.info(chalk`{green.bold [task]} {white.bold test}`);
    return spawn("jest", ["--config", "config/jest.json"], "test failed, please fix");
}

function lint() {
    console.info(chalk`{green.bold [task]} {white.bold lint}`);
    return spawn("tslint", ["-c", "config/tslint.json", "{core,test}/**/*.{ts,tsx}"], "lint failed, please fix");
}

function cleanup() {
    console.info(chalk`{green.bold [task]} {white.bold cleanup}`);
    fs.emptyDirSync("build");
}

function compile() {
    console.info(chalk`{green.bold [task]} {white.bold compile}`);
    return spawn("tsc", ["-p", "config/tsconfig.json"], "compile failed, please fix");
}

function distribute() {
    console.info(chalk`{green.bold [task]} {white.bold distribute}`);
    fs.mkdirsSync("build/dist/lib");
    fs.copySync("build/out/src", "build/dist/lib/", {dereference: true});
    fs.copySync("package.json", "build/dist/package.json", {dereference: true});
    const removeComment = /\/\*(.*?)\*\//g;
    const webpackConfigDev = fs
        .readFileSync("core/webpack/webpack.config.dev.js")
        .toString()
        .replace(removeComment, "");
    fs.writeFileSync("build/out/src/webpack/webpack.config.dev.js", webpackConfigDev);
    const webpackConfigBuild = fs
        .readFileSync("core/webpack/webpack.config.build.js")
        .toString()
        .replace(removeComment, "");
    fs.writeFileSync("build/out/src/webpack/webpack.config.build.js", webpackConfigBuild);
    fs.copySync("build/out/src/webpack/webpack.config.dev.js", "build/dist/lib/webpack/webpack.config.dev.js", {dereference: true});
    fs.copySync("build/out/src/webpack/webpack.config.build.js", "build/dist/lib/webpack/webpack.config.build.js", {dereference: true});
}

function build() {
    cleanup();
    checkCodeStyle();
    // test();
    lint();
    compile();
    distribute();
}

build();