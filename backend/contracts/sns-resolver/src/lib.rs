#![no_std]
use core::panic;

use sns_resolver_interface::SnsResolverTrait;
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, String, Vec};

mod events;
mod test;
mod testutils;

pub(crate) const HIGH_BUMP_AMOUNT: u32 = 1036800; // 30 days
pub(crate) const LOW_BUMP_AMOUNT: u32 = 518400; // 60 days

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    // Registry Contract Address
    // () => Address
    Registry(BytesN<32>),
    // BytesN<32> => Address
    Names(BytesN<32>),
    // BytesN<32> => Vec<String>
    Texts(BytesN<32>),
    // Admin of this contract
    // () => Address
    Admin,
}

#[contract]
struct SnsResolver;

#[contractimpl]
#[allow(clippy::needless_pass_by_value)]
impl SnsResolverTrait for SnsResolver {
    fn initialize(e: Env, admin: Address) {
        if has_administrator(&e) {
            panic!("already initialized")
        }
        set_administrator(&e, &admin);
    }

    fn set_registry(e: Env, caller: Address, node: BytesN<32>, registry: Address) {
        caller.require_auth();
        require_administrator(&e, &caller);
        set_registry(&e, &node, &registry);
    }

    fn set_name(e: Env, caller: Address, node: BytesN<32>, name: Address) {
        caller.require_auth();
        // commented out to allow anyone to set name
        // require_administrator(&e, &caller);
        set_name(&e, &node, &name);
    }

    fn set_text(e: Env, caller: Address, node: BytesN<32>, text: String) {
        caller.require_auth();
        // commented out to allow anyone to set name
        // require_administrator(&e, &caller);
        set_text(&e, &node, &text);
    }

    fn remove(e: Env, caller: Address, node: BytesN<32>) {
        caller.require_auth();
        require_administrator(&e, &caller);
        remove_record(&e, &node);
    }

    fn name(e: Env, node: BytesN<32>) -> Address {
        get_name(&e, &node)
    }

    fn text(e: Env, node: BytesN<32>) -> Vec<String> {
        get_text(&e, &node)
    }

    fn registry(e: Env, node: BytesN<32>) -> Address {
        get_registry(&e, &node)
    }
}

/*
Getter Functions
*/
fn get_administrator(e: &Env) -> Address {
    e.storage()
        .persistent()
        .get::<_, Address>(&DataKey::Admin)
        .unwrap()
}

fn has_administrator(e: &Env) -> bool {
    e.storage().persistent().has(&DataKey::Admin)
}

fn get_name(e: &Env, node: &BytesN<32>) -> Address {
    e.storage()
        .persistent()
        .get::<_, Address>(&DataKey::Names(node.clone()))
        .expect("No name found")
}

fn get_text(e: &Env, node: &BytesN<32>) -> Vec<String> {
    e.storage()
        .persistent()
        .get::<_, Vec<String>>(&DataKey::Texts(node.clone()))
        .unwrap_or(Vec::new(&e))
}

fn get_registry(e: &Env, node: &BytesN<32>) -> Address {
    e.storage()
        .persistent()
        .get::<_, Address>(&DataKey::Registry(node.clone()))
        .expect("No registry found")
}

/*
Modifiers for the contract
*/
fn require_administrator(e: &Env, caller: &Address) {
    let admin = get_administrator(e);
    assert!(admin == *caller, "caller is not authorised");
}

/*
State Changing Functions
*/
fn set_name(e: &Env, node: &BytesN<32>, name: &Address) {
    e.storage()
        .persistent()
        .set(&DataKey::Names(node.clone()), name);
    e.storage()
        .persistent()
        .bump(&DataKey::Names(node.clone()), LOW_BUMP_AMOUNT, HIGH_BUMP_AMOUNT);
}

fn set_text(e: &Env, node: &BytesN<32>, text: &String) {
    let mut texts = get_text(&e, &node);
    texts.push_back(text.clone());
    e.storage()
        .persistent()
        .set(&DataKey::Texts(node.clone()), &texts);
    e.storage()
        .persistent()
        .bump(&DataKey::Texts(node.clone()), LOW_BUMP_AMOUNT, HIGH_BUMP_AMOUNT);
}

fn set_registry(e: &Env, node: &BytesN<32>, registry: &Address) {
    e.storage()
        .persistent()
        .set(&DataKey::Registry(node.clone()), registry);
    e.storage()
        .persistent()
        .bump(&DataKey::Registry(node.clone()), LOW_BUMP_AMOUNT, HIGH_BUMP_AMOUNT);
}

fn set_administrator(e: &Env, caller: &Address) {
    e.storage().persistent().set(&DataKey::Admin, caller);
    e.storage().persistent().bump(&DataKey::Admin, LOW_BUMP_AMOUNT, HIGH_BUMP_AMOUNT);
}

fn remove_record(e: &Env, node: &BytesN<32>) {
    e.storage()
        .persistent()
        .remove(&DataKey::Names(node.clone()));
    e.storage()
        .persistent()
        .remove(&DataKey::Texts(node.clone()));
}