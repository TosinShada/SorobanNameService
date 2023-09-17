import { ContractSpec, Address } from 'soroban-client';
import { Buffer } from "buffer";
import { invoke } from './invoke.js';
export * from './invoke.js';
export * from './method-options.js';
export { Address };
;
;
export class Ok {
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
export class Err {
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
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
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
export const networks = {
    futurenet: {
        networkPassphrase: "Test SDF Future Network ; October 2022",
        contractId: "CD56WBELGO5BMP6RBWN64RKCT2J6NHMM6SKXKAC5DHWAWHQZ6BJ57BDJ",
    }
};
const Errors = {};
export class Contract {
    options;
    spec;
    constructor(options) {
        this.options = options;
        this.spec = new ContractSpec([
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
        return await invoke({
            method: 'initialize',
            args: this.spec.funcArgsToScVals("initialize", { admin, resolver }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setRecord({ caller, node, owner, resolver, ttl }, options = {}) {
        return await invoke({
            method: 'set_record',
            args: this.spec.funcArgsToScVals("set_record", { caller, node, owner, resolver, ttl }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setOwner({ caller, node, owner }, options = {}) {
        return await invoke({
            method: 'set_owner',
            args: this.spec.funcArgsToScVals("set_owner", { caller, node, owner }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setSubnodeOwner({ caller, node, label, owner, resolver, ttl }, options = {}) {
        return await invoke({
            method: 'set_subnode_owner',
            args: this.spec.funcArgsToScVals("set_subnode_owner", { caller, node, label, owner, resolver, ttl }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setResolver({ caller, node, resolver }, options = {}) {
        return await invoke({
            method: 'set_resolver',
            args: this.spec.funcArgsToScVals("set_resolver", { caller, node, resolver }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setTtl({ caller, node, ttl }, options = {}) {
        return await invoke({
            method: 'set_ttl',
            args: this.spec.funcArgsToScVals("set_ttl", { caller, node, ttl }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async bumpSubnode({ caller, node, label }, options = {}) {
        return await invoke({
            method: 'bump_subnode',
            args: this.spec.funcArgsToScVals("bump_subnode", { caller, node, label }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setApprovalForAll({ caller, operator, approved }, options = {}) {
        return await invoke({
            method: 'set_approval_for_all',
            args: this.spec.funcArgsToScVals("set_approval_for_all", { caller, operator, approved }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async owner({ node }, options = {}) {
        return await invoke({
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
        return await invoke({
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
        return await invoke({
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
        return await invoke({
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
        return await invoke({
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
        return await invoke({
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
