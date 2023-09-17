#![deny(warnings)]
#![no_std]

use soroban_sdk::{contractclient, contractspecfn, Address, BytesN, Env, String, Vec};
pub struct Spec;

/// Interface for SnsResolver
#[contractspecfn(name = "Spec", export = false)]
#[contractclient(name = "SnsResolverClient")]
pub trait SnsResolverTrait {
    fn initialize(e: Env, admin: Address);
    fn set_name(e: Env, caller: Address, node: BytesN<32>, name: Address);
    fn set_text(e: Env, caller: Address, node: BytesN<32>, text: String);
    fn remove(e: Env, caller: Address, node: BytesN<32>);
    fn name(e: Env, node: BytesN<32>) -> Address;
    fn text(e: Env, node: BytesN<32>) -> Vec<String>;
}
