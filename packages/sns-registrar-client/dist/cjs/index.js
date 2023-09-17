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
        contractId: "CAW4XB6LQASCKCKQG5QKBAF5BSR74D7DKTOCRZDFAB742SKITISPLMK7",
    }
};
const Errors = {};
class Contract {
    options;
    spec;
    constructor(options) {
        this.options = options;
        this.spec = new soroban_client_1.ContractSpec([
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAACAAAAAAAAAAAAAAACFJlZ2lzdHJ5AAAAAAAAAAAAAAAIUmVzb2x2ZXIAAAAAAAAAAAAAAAtOYXRpdmVUb2tlbgAAAAAAAAAAAAAAAAVQcmljZQAAAAAAAAAAAAAAAAAACEJhc2VOb2RlAAAAAQAAAAAAAAAGT3duZXJzAAAAAAABAAAD7gAAACAAAAABAAAAAAAAAAtFeHBpcmF0aW9ucwAAAAABAAAD7gAAACAAAAAAAAAAAAAAAAVBZG1pbgAAAA==",
            "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABQAAAAAAAAAIcmVnaXN0cnkAAAATAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAACHJlc29sdmVyAAAAEwAAAAAAAAAJYmFzZV9ub2RlAAAAAAAD7gAAACAAAAAAAAAADG5hdGl2ZV90b2tlbgAAABMAAAAA",
            "AAAAAAAAAAAAAAAbdHJhbnNmZXJfY29udHJhY3Rfb3duZXJzaGlwAAAAAAIAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAJbmV3X293bmVyAAAAAAAAEwAAAAA=",
            "AAAAAAAAAAAAAAAMc2V0X3Jlc29sdmVyAAAAAgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAhyZXNvbHZlcgAAABMAAAAA",
            "AAAAAAAAAAAAAAANc2V0X2Jhc2Vfbm9kZQAAAAAAAAQAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAhyZXNvbHZlcgAAABMAAAAAAAAAA3R0bAAAAAAGAAAAAA==",
            "AAAAAAAAAAAAAAAIcmVnaXN0ZXIAAAAFAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAEbmFtZQAAA+4AAAAgAAAAAAAAAAxhZGRyZXNzX25hbWUAAAATAAAAAAAAAAhkdXJhdGlvbgAAAAYAAAABAAAABg==",
            "AAAAAAAAAAAAAAAFcmVuZXcAAAAAAAADAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABG5hbWUAAAPuAAAAIAAAAAAAAAAIZHVyYXRpb24AAAAGAAAAAQAAAAY=",
            "AAAAAAAAAAAAAAAIdHJhbnNmZXIAAAADAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABG5hbWUAAAPuAAAAIAAAAAAAAAAJbmV3X293bmVyAAAAAAAAEwAAAAA=",
            "AAAAAAAAAAAAAAAOd2l0aGRyYXdfZnVuZHMAAAAAAAIAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
            "AAAAAAAAAAAAAAARc2V0X3Jlc29sdmVyX25hbWUAAAAAAAADAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABG5vZGUAAAPuAAAAIAAAAAAAAAAEbmFtZQAAABMAAAAA",
            "AAAAAAAAAAAAAAARc2V0X3Jlc29sdmVyX3RleHQAAAAAAAADAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABG5vZGUAAAPuAAAAIAAAAAAAAAAEdGV4dAAAABAAAAAA",
            "AAAAAAAAAAAAAAAUc2V0X3Jlc29sdmVyX2RldGFpbHMAAAAEAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABG5vZGUAAAPuAAAAIAAAAAAAAAAEdGV4dAAAABAAAAAAAAAABG5hbWUAAAATAAAAAA==",
            "AAAAAAAAAAAAAAALbmFtZV9leHBpcnkAAAAAAQAAAAAAAAAEbmFtZQAAA+4AAAAgAAAAAQAAAAY=",
            "AAAAAAAAAAAAAAAKbmFtZV9vd25lcgAAAAAAAQAAAAAAAAAEbmFtZQAAA+4AAAAgAAAAAQAAABM=",
            "AAAAAAAAAAAAAAAJYXZhaWxhYmxlAAAAAAAAAQAAAAAAAAAEbmFtZQAAA+4AAAAgAAAAAQAAAAE=",
            "AAAAAAAAAAAAAAAQaXNfYWRtaW5pc3RyYXRvcgAAAAEAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAEAAAAB",
            "AAAAAAAAAAAAAAAUd2l0aGRyYXdhYmxlX2JhbGFuY2UAAAAAAAAAAQAAAAs=",
            "AAAAAQAAAAAAAAAAAAAABlJlY29yZAAAAAAAAwAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAhyZXNvbHZlcgAAABMAAAAAAAAAA3R0bAAAAAAG"
        ]);
    }
    async initialize({ registry, admin, resolver, base_node, native_token }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'initialize',
            args: this.spec.funcArgsToScVals("initialize", { registry, admin, resolver, base_node, native_token }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async transferContractOwnership({ caller, new_owner }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'transfer_contract_ownership',
            args: this.spec.funcArgsToScVals("transfer_contract_ownership", { caller, new_owner }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setResolver({ caller, resolver }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'set_resolver',
            args: this.spec.funcArgsToScVals("set_resolver", { caller, resolver }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setBaseNode({ caller, owner, resolver, ttl }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'set_base_node',
            args: this.spec.funcArgsToScVals("set_base_node", { caller, owner, resolver, ttl }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async register({ caller, owner, name, address_name, duration }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'register',
            args: this.spec.funcArgsToScVals("register", { caller, owner, name, address_name, duration }),
            ...options,
            ...this.options,
            parseResultXdr: (xdr) => {
                return this.spec.funcResToNative("register", xdr);
            },
        });
    }
    async renew({ caller, name, duration }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'renew',
            args: this.spec.funcArgsToScVals("renew", { caller, name, duration }),
            ...options,
            ...this.options,
            parseResultXdr: (xdr) => {
                return this.spec.funcResToNative("renew", xdr);
            },
        });
    }
    async transfer({ caller, name, new_owner }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'transfer',
            args: this.spec.funcArgsToScVals("transfer", { caller, name, new_owner }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async withdrawFunds({ caller, amount }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'withdraw_funds',
            args: this.spec.funcArgsToScVals("withdraw_funds", { caller, amount }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setResolverName({ caller, node, name }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'set_resolver_name',
            args: this.spec.funcArgsToScVals("set_resolver_name", { caller, node, name }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setResolverText({ caller, node, text }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'set_resolver_text',
            args: this.spec.funcArgsToScVals("set_resolver_text", { caller, node, text }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setResolverDetails({ caller, node, text, name }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'set_resolver_details',
            args: this.spec.funcArgsToScVals("set_resolver_details", { caller, node, text, name }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async nameExpiry({ name }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'name_expiry',
            args: this.spec.funcArgsToScVals("name_expiry", { name }),
            ...options,
            ...this.options,
            parseResultXdr: (xdr) => {
                return this.spec.funcResToNative("name_expiry", xdr);
            },
        });
    }
    async nameOwner({ name }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'name_owner',
            args: this.spec.funcArgsToScVals("name_owner", { name }),
            ...options,
            ...this.options,
            parseResultXdr: (xdr) => {
                return this.spec.funcResToNative("name_owner", xdr);
            },
        });
    }
    async available({ name }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'available',
            args: this.spec.funcArgsToScVals("available", { name }),
            ...options,
            ...this.options,
            parseResultXdr: (xdr) => {
                return this.spec.funcResToNative("available", xdr);
            },
        });
    }
    async isAdministrator({ caller }, options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'is_administrator',
            args: this.spec.funcArgsToScVals("is_administrator", { caller }),
            ...options,
            ...this.options,
            parseResultXdr: (xdr) => {
                return this.spec.funcResToNative("is_administrator", xdr);
            },
        });
    }
    async withdrawableBalance(options = {}) {
        return await (0, invoke_js_1.invoke)({
            method: 'withdrawable_balance',
            args: this.spec.funcArgsToScVals("withdrawable_balance", {}),
            ...options,
            ...this.options,
            parseResultXdr: (xdr) => {
                return this.spec.funcResToNative("withdrawable_balance", xdr);
            },
        });
    }
}
exports.Contract = Contract;
