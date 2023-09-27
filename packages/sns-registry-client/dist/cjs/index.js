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
        contractId: "CAAZHBIXVON4YGJKIHY7TETMZ5FQWAX5GXKUQSERPBZG7XFD3YMJPQJJ",
    }
};
const Errors = {};
class Contract {
    options;
    spec;
    constructor(options) {
        this.options = options;
        this.spec = new soroban_client_1.ContractSpec([
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAEAAAAAAAAAB1JlY29yZHMAAAAAAQAAA+4AAAAgAAAAAQAAAAAAAAAJT3BlcmF0b3JzAAAAAAAAAgAAABMAAAATAAAAAAAAAAAAAAAFQWRtaW4AAAAAAAAAAAAAAAAAAA9EZWZhdWx0UmVzb2x2ZXIA",
            "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAhyZXNvbHZlcgAAABMAAAAA",
            "AAAAAAAAAAAAAAAKc2V0X3JlY29yZAAAAAAABQAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAARub2RlAAAD7gAAACAAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAIcmVzb2x2ZXIAAAATAAAAAAAAAAN0dGwAAAAABgAAAAA=",
            "AAAAAAAAAAAAAAAJc2V0X293bmVyAAAAAAAAAwAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAARub2RlAAAD7gAAACAAAAAAAAAABW93bmVyAAAAAAAAEwAAAAA=",
            "AAAAAAAAAAAAAAARc2V0X3N1Ym5vZGVfb3duZXIAAAAAAAAGAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABG5vZGUAAAPuAAAAIAAAAAAAAAAFbGFiZWwAAAAAAAPuAAAAIAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAhyZXNvbHZlcgAAABMAAAAAAAAAA3R0bAAAAAAGAAAAAA==",
            "AAAAAAAAAAAAAAAMc2V0X3Jlc29sdmVyAAAAAwAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAARub2RlAAAD7gAAACAAAAAAAAAACHJlc29sdmVyAAAAEwAAAAA=",
            "AAAAAAAAAAAAAAAHc2V0X3R0bAAAAAADAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABG5vZGUAAAPuAAAAIAAAAAAAAAADdHRsAAAAAAYAAAAA",
            "AAAAAAAAAAAAAAAMYnVtcF9zdWJub2RlAAAAAwAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAARub2RlAAAD7gAAACAAAAAAAAAABWxhYmVsAAAAAAAD7gAAACAAAAAA",
            "AAAAAAAAAAAAAAAUc2V0X2FwcHJvdmFsX2Zvcl9hbGwAAAADAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAACG9wZXJhdG9yAAAAEwAAAAAAAAAIYXBwcm92ZWQAAAABAAAAAA==",
            "AAAAAAAAAAAAAAAFb3duZXIAAAAAAAABAAAAAAAAAARub2RlAAAD7gAAACAAAAABAAAAEw==",
            "AAAAAAAAAAAAAAAIcmVzb2x2ZXIAAAABAAAAAAAAAARub2RlAAAD7gAAACAAAAABAAAAEw==",
            "AAAAAAAAAAAAAAADdHRsAAAAAAEAAAAAAAAABG5vZGUAAAPuAAAAIAAAAAEAAAAG",
            "AAAAAAAAAAAAAAAGcmVjb3JkAAAAAAABAAAAAAAAAARub2RlAAAD7gAAACAAAAABAAAH0AAAAAZSZWNvcmQAAA==",
            "AAAAAAAAAAAAAAAMcmVjb3JkX2V4aXN0AAAAAQAAAAAAAAAEbm9kZQAAA+4AAAAgAAAAAQAAAAE=",
            "AAAAAAAAAAAAAAATaXNfYXBwcm92ZWRfZm9yX2FsbAAAAAACAAAAAAAAAAhvcGVyYXRvcgAAABMAAAAAAAAABW93bmVyAAAAAAAAEwAAAAEAAAAB",
            "AAAAAQAAAAAAAAAAAAAABlJlY29yZAAAAAAAAwAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAhyZXNvbHZlcgAAABMAAAAAAAAAA3R0bAAAAAAG"
        ]);
    }
    async initialize({ admin, resolver }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'initialize',
            args: this.spec.funcArgsToScVals("initialize", { admin, resolver }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setRecord({ caller, node, owner, resolver, ttl }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'set_record',
            args: this.spec.funcArgsToScVals("set_record", { caller, node, owner, resolver, ttl }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setOwner({ caller, node, owner }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'set_owner',
            args: this.spec.funcArgsToScVals("set_owner", { caller, node, owner }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setSubnodeOwner({ caller, node, label, owner, resolver, ttl }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'set_subnode_owner',
            args: this.spec.funcArgsToScVals("set_subnode_owner", { caller, node, label, owner, resolver, ttl }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setResolver({ caller, node, resolver }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'set_resolver',
            args: this.spec.funcArgsToScVals("set_resolver", { caller, node, resolver }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setTtl({ caller, node, ttl }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'set_ttl',
            args: this.spec.funcArgsToScVals("set_ttl", { caller, node, ttl }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async bumpSubnode({ caller, node, label }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'bump_subnode',
            args: this.spec.funcArgsToScVals("bump_subnode", { caller, node, label }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setApprovalForAll({ caller, operator, approved }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'set_approval_for_all',
            args: this.spec.funcArgsToScVals("set_approval_for_all", { caller, operator, approved }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async owner({ node }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'owner',
            args: this.spec.funcArgsToScVals("owner", { node }),
            ...options,
            ...this.options,
            parseResultXdr: (xdr) => {
                return this.spec.funcResToNative("owner", xdr);
            },
        });
    }
    async resolver({ node }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'resolver',
            args: this.spec.funcArgsToScVals("resolver", { node }),
            ...options,
            ...this.options,
            parseResultXdr: (xdr) => {
                return this.spec.funcResToNative("resolver", xdr);
            },
        });
    }
    async ttl({ node }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'ttl',
            args: this.spec.funcArgsToScVals("ttl", { node }),
            ...options,
            ...this.options,
            parseResultXdr: (xdr) => {
                return this.spec.funcResToNative("ttl", xdr);
            },
        });
    }
    async record({ node }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'record',
            args: this.spec.funcArgsToScVals("record", { node }),
            ...options,
            ...this.options,
            parseResultXdr: (xdr) => {
                return this.spec.funcResToNative("record", xdr);
            },
        });
    }
    async recordExist({ node }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'record_exist',
            args: this.spec.funcArgsToScVals("record_exist", { node }),
            ...options,
            ...this.options,
            parseResultXdr: (xdr) => {
                return this.spec.funcResToNative("record_exist", xdr);
            },
        });
    }
    async isApprovedForAll({ operator, owner }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'is_approved_for_all',
            args: this.spec.funcArgsToScVals("is_approved_for_all", { operator, owner }),
            ...options,
            ...this.options,
            parseResultXdr: (xdr) => {
                return this.spec.funcResToNative("is_approved_for_all", xdr);
            },
        });
    }
}
exports.Contract = Contract;
