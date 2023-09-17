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
        contractId: "CC2Z2SVPMKBQYAEHE7BBCVQHD5WG2MKAEKVUO7CWAVYRF2TON7KV5KAH",
    }
};
const Errors = {};
export class Contract {
    options;
    spec;
    constructor(options) {
        this.options = options;
        this.spec = new ContractSpec([
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
        return await invoke({
            method: 'initialize',
            args: this.spec.funcArgsToScVals("initialize", { admin }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setName({ caller, node, name }, options = {}) {
        return await invoke({
            method: 'set_name',
            args: this.spec.funcArgsToScVals("set_name", { caller, node, name }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async setText({ caller, node, text }, options = {}) {
        return await invoke({
            method: 'set_text',
            args: this.spec.funcArgsToScVals("set_text", { caller, node, text }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async remove({ caller, node }, options = {}) {
        return await invoke({
            method: 'remove',
            args: this.spec.funcArgsToScVals("remove", { caller, node }),
            ...options,
            ...this.options,
            parseResultXdr: () => { },
        });
    }
    async name({ node }, options = {}) {
        return await invoke({
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
        return await invoke({
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
