"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = exports.networks = exports.Err = exports.Ok = exports.Address = void 0;
const soroban_client_1 = require("soroban-client");
Object.defineProperty(exports, "Address", { enumerable: true, get: function () { return soroban_client_1.Address; } });
const buffer_1 = require("buffer");
const invoke_js_1 = require("./invoke.js");
__exportStar(require("./invoke.js"), exports);
__exportStar(require("./method-options.js"), exports);
;
;
class Ok {
    value;
    constructor(value) {
        this.value = value;
    }
    unwrapErr() {
        throw new Error('No error');
    }
    unwrap() {
        return this.value;
    }
    isOk() {
        return true;
    }
    isErr() {
        return !this.isOk();
    }
}
exports.Ok = Ok;
class Err {
    error;
    constructor(error) {
        this.error = error;
    }
    unwrapErr() {
        return this.error;
    }
    unwrap() {
        throw new Error(this.error.message);
    }
    isOk() {
        return false;
    }
    isErr() {
        return !this.isOk();
    }
}
exports.Err = Err;
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || buffer_1.Buffer;
}
const regex = /Error\(Contract, #(\d+)\)/;
function parseError(message) {
    const match = message.match(regex);
    if (!match) {
        return undefined;
    }
    if (Errors === undefined) {
        return undefined;
    }
    let i = parseInt(match[1], 10);
    let err = Errors[i];
    if (err) {
        return new Err(err);
    }
    return undefined;
}
exports.networks = {
    futurenet: {
        networkPassphrase: "Test SDF Future Network ; October 2022",
        contractId: "CAGD7EDMFT6NYMHODPEVVYWIYOTOOBLXSXHEBPUSY62EXLIB6WLMUDPG",
    }
};
const Errors = {};
class Contract {
    options;
    spec;
    constructor(options) {
        this.options = options;
        this.spec = new soroban_client_1.ContractSpec([
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAEAAAAAAAAABU5hbWVzAAAAAAAAAQAAA+4AAAAgAAAAAQAAAAAAAAAFVGV4dHMAAAAAAAABAAAD7gAAACAAAAAAAAAAAAAAAAVBZG1pbgAAAA==",
            "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==",
            "AAAAAAAAAAAAAAAIc2V0X25hbWUAAAADAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABG5vZGUAAAPuAAAAIAAAAAAAAAAEbmFtZQAAABMAAAAA",
            "AAAAAAAAAAAAAAAIc2V0X3RleHQAAAADAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABG5vZGUAAAPuAAAAIAAAAAAAAAAEdGV4dAAAABAAAAAA",
            "AAAAAAAAAAAAAAAGcmVtb3ZlAAAAAAACAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABG5vZGUAAAPuAAAAIAAAAAA=",
            "AAAAAAAAAAAAAAAEbmFtZQAAAAEAAAAAAAAABG5vZGUAAAPuAAAAIAAAAAEAAAAT",
            "AAAAAAAAAAAAAAAEdGV4dAAAAAEAAAAAAAAABG5vZGUAAAPuAAAAIAAAAAEAAAPqAAAAEA=="
        ]);
    }
    async initialize({ admin }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'initialize',
            args: this.spec.funcArgsToScVals("initialize", { admin }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setName({ caller, node, name }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'set_name',
            args: this.spec.funcArgsToScVals("set_name", { caller, node, name }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setText({ caller, node, text }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'set_text',
            args: this.spec.funcArgsToScVals("set_text", { caller, node, text }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async remove({ caller, node }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'remove',
            args: this.spec.funcArgsToScVals("remove", { caller, node }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async name({ node }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'name',
            args: this.spec.funcArgsToScVals("name", { node }),
            ...options,
            ...this.options,
            parseResultXdr: (xdr) => {
                return this.spec.funcResToNative("name", xdr);
            },
        });
    }
    async text({ node }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'text',
            args: this.spec.funcArgsToScVals("text", { node }),
            ...options,
            ...this.options,
            parseResultXdr: (xdr) => {
                return this.spec.funcResToNative("text", xdr);
            },
        });
    }
}
exports.Contract = Contract;
