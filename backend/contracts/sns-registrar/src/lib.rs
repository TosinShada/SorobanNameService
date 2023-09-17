// #![deny(warnings)]
#![no_std]
use core::panic;

use sns_registry_interface::SnsRegistryClient;
use sns_resolver_interface::SnsResolverClient;
use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Bytes, BytesN, Env, String,
};

mod events;
mod test;
mod testutils;

pub(crate) const HIGH_BUMP_AMOUNT: u32 = 518400; // 60 days
pub(crate) const LOW_BUMP_AMOUNT: u32 = 518400; // 30 days
pub(crate) const GRACE_PERIOD: u64 = 1555200; // 90 days

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    // Registry Contract Address
    // () => Address
    Registry,
    // Resolver Contract Address
    // () => Address
    Resolver,
    // Native Token Contract Address
    // () => Address
    NativeToken,
    // Price per year of the domain
    // 5xlm per year domain
    // () => i128
    Price,
    // The hash of the tld (eg. test.sns => sns) owned by this contract
    // () => BytesN<32>
    BaseNode,
    // Owners of the sub-domains
    // The hash of the sub-domain is without the tld (eg test.sns => test)
    // BytesN<32> => Address
    Owners(BytesN<32>),
    // Expirations of the domains
    // pass the hash of the domain and get the expiration time as a timestamp
    // The hash of the sub-domain is without the tld (eg test.sns => test)
    // BytesN<32> => u64
    Expirations(BytesN<32>),
    // Admin of this contract
    // () => Address
    Admin,
}

#[contract]
struct SnsRegistrar;

#[contractimpl]
#[allow(clippy::needless_pass_by_value)]
impl SnsRegistrar {
    pub fn initialize(
        e: Env,
        registry: Address,
        admin: Address,
        resolver: Address,
        base_node: BytesN<32>,
        native_token: Address,
    ) {
        if has_registry(&e) {
            panic!("already initialized")
        }
        set_registry(&e, &registry);
        set_base_node(&e, &base_node);
        set_administrator(&e, &admin);
        set_native_token(&e, &native_token);
        set_resolver(&e, &resolver);
        set_domain_price(&e, &50000000);

        let registry_client = SnsRegistryClient::new(&e, &registry);
        registry_client.set_record(
            &e.current_contract_address(),
            &base_node,
            &e.current_contract_address(),
            &resolver,
            &u64::MAX,
        );
    }

    pub fn transfer_contract_ownership(e: Env, caller: Address, new_owner: Address) {
        caller.require_auth();
        require_administrator(&e, &caller);
        set_administrator(&e, &new_owner);
    }

    pub fn set_resolver(e: Env, caller: Address, resolver: Address) {
        caller.require_auth();
        require_administrator(&e, &caller);
        let base_node = get_base_node(&e);
        let registry = get_registry(&e);
        let registry_client = SnsRegistryClient::new(&e, &registry);
        registry_client.set_resolver(&e.current_contract_address(), &base_node, &resolver);
    }

    // Decide whether this is necessary to give the administrator the ability to move the base node to another registrar
    pub fn set_base_node(e: Env, caller: Address, owner: Address, resolver: Address, ttl: u64) {
        caller.require_auth();
        require_administrator(&e, &caller);
        let base_node = get_base_node(&e);
        let registry = get_registry(&e);
        let registry_client = SnsRegistryClient::new(&e, &registry);
        registry_client.set_record(
            &e.current_contract_address(),
            &base_node,
            &owner,
            &resolver,
            &ttl,
        );
    }

    pub fn register(
        e: Env,
        caller: Address,
        owner: Address,
        name: BytesN<32>,
        address_name: Address,
        duration: u64,
    ) -> u64 {
        caller.require_auth();
        require_registry_ownership(&e);
        assert!(is_name_available(&e, &name), "name is not available");

        let expiry_date = get_ledger_timestamp(&e) + duration;

        // [Todo] Look into this and see how to prevent an overflow
        if expiry_date + GRACE_PERIOD > u64::MAX {
            panic!("duration is too long");
        }

        let base_node = get_base_node(&e);
        let registry = get_registry(&e);
        let default_resolver = get_resolver(&e);

        // Transfer the cost of the registration to the contract
        let native_token_id = get_native_token(&e);
        let native_token_client = token::Client::new(&e, &native_token_id);
        let amount = get_domain_price(&e, &duration);

        native_token_client.transfer(&caller, &e.current_contract_address(), &amount);
        let sub_node = append_hash(&e, &base_node, &name);
        set_domain(&e, &name, &owner, &expiry_date);

        let registry_client = SnsRegistryClient::new(&e, &registry);

        registry_client.set_subnode_owner(
            &e.current_contract_address(),
            &base_node,
            &name,
            &owner,
            &default_resolver,
            &30,
        );

        set_resolver_name(&e, &sub_node, &address_name, &default_resolver);

        expiry_date
    }

    pub fn renew(e: Env, caller: Address, name: BytesN<32>, duration: u64) -> u64 {
        caller.require_auth();
        require_registry_ownership(&e);
        assert!(!is_name_available(&e, &name), "name is not registered");

        let expiry_date = get_domain_expiry(&e, &name);
        // Check if the domain is expired or not registered by getting the expiry date which can either be a timestamp or 0
        // If the expiry date is 0 then the domain is not registered and therefore adding the grace period will certainly make it less than the current timestamp
        if expiry_date + GRACE_PERIOD < get_ledger_timestamp(&e) {
            panic!("domain is expired or not registered");
        }

        let new_expiry_date = expiry_date + duration;
        if new_expiry_date + GRACE_PERIOD > u64::MAX {
            panic!("duration is too long");
        }

        let registry = get_registry(&e);
        let base_node = get_base_node(&e);

        // Transfer the cost of the registration to the contract
        let native_token_id = get_native_token(&e);
        let native_token_client = token::Client::new(&e, &native_token_id);
        let amount = get_domain_price(&e, &duration);
        native_token_client.transfer(&caller, &e.current_contract_address(), &amount);

        set_domain_expiry(&e, &name, &new_expiry_date);

        let registry_client = SnsRegistryClient::new(&e, &registry);
        registry_client.bump_subnode(&e.current_contract_address(), &base_node, &name);

        new_expiry_date
    }

    pub fn transfer(e: Env, caller: Address, name: BytesN<32>, new_owner: Address) {
        caller.require_auth();
        require_owner(&e, &name, &caller);

        let registry = get_registry(&e);
        let base_node = get_base_node(&e);

        // Look into a better way of handling the duration as it doesn't really matter since the domain is not being renewed and already bumped to the expiry date with the grace period
        set_domain_owner(&e, &name, &new_owner);

        let sub_node = append_hash(&e, &base_node, &name);

        let registry_client = SnsRegistryClient::new(&e, &registry);
        registry_client.set_owner(&e.current_contract_address(), &sub_node, &new_owner);
    }

    pub fn withdraw_funds(e: Env, caller: Address, amount: i128) {
        caller.require_auth();
        require_administrator(&e, &caller);

        let native_token_id = get_native_token(&e);
        let native_token_client = token::Client::new(&e, &native_token_id);

        native_token_client.transfer(&e.current_contract_address(), &caller, &amount);
    }

    pub fn set_resolver_name(e: Env, caller: Address, node: BytesN<32>, name: Address) {
        caller.require_auth();
        require_owner(&e, &node, &caller);

        let default_resolver = get_resolver(&e);
        let base_node = get_base_node(&e);
        let sub_node = append_hash(&e, &base_node, &node);
        set_resolver_name(&e, &sub_node, &name, &default_resolver);
    }

    pub fn set_resolver_text(e: Env, caller: Address, node: BytesN<32>, text: String) {
        caller.require_auth();
        require_owner(&e, &node, &caller);

        let default_resolver = get_resolver(&e);
        let base_node = get_base_node(&e);
        let sub_node = append_hash(&e, &base_node, &node);
        set_resolver_text(&e, &sub_node, &text, &default_resolver);
    }

    pub fn set_resolver_details(
        e: Env,
        caller: Address,
        node: BytesN<32>,
        text: String,
        name: Address,
    ) {
        caller.require_auth();
        require_owner(&e, &node, &caller);

        let default_resolver = get_resolver(&e);
        let base_node = get_base_node(&e);
        let sub_node = append_hash(&e, &base_node, &node);
        set_resolver_details(&e, &sub_node, &name, &text, &default_resolver);
    }

    pub fn name_expiry(e: Env, name: BytesN<32>) -> u64 {
        get_domain_expiry(&e, &name)
    }

    pub fn name_owner(e: Env, name: BytesN<32>) -> Address {
        get_domain_owner(&e, &name)
    }

    pub fn available(e: Env, name: BytesN<32>) -> bool {
        is_name_available(&e, &name)
    }

    pub fn is_administrator(e: Env, caller: Address) -> bool {
        get_administrator(&e) == caller
    }

    pub fn withdrawable_balance(e: Env) -> i128 {
        let native_token_id = get_native_token(&e);
        let native_token_client = token::Client::new(&e, &native_token_id);
        native_token_client.balance(&e.current_contract_address())
    }
}

/*
Getter Functions
*/
fn get_ledger_timestamp(e: &Env) -> u64 {
    e.ledger().timestamp()
}

fn get_administrator(e: &Env) -> Address {
    e.storage()
        .persistent()
        .get::<_, Address>(&DataKey::Admin)
        .unwrap()
}

fn get_domain_owner(e: &Env, node: &BytesN<32>) -> Address {
    let expiry_time = get_domain_expiry(e, node);

    if get_ledger_timestamp(e) > (expiry_time + GRACE_PERIOD) {
        return e.current_contract_address();
    }

    e.storage()
        .persistent()
        .get::<_, Address>(&DataKey::Owners(node.clone()))
        .unwrap_or(e.current_contract_address())
}

fn get_domain_expiry(e: &Env, node: &BytesN<32>) -> u64 {
    e.storage()
        .persistent()
        .get::<_, u64>(&DataKey::Expirations(node.clone()))
        .unwrap_or(0)
}

fn get_registry_owner(e: &Env) -> Address {
    let base_node = get_base_node(e);
    let registry = get_registry(e);

    let registry_client = SnsRegistryClient::new(&e, &registry);
    registry_client.owner(&base_node)
}

fn get_base_node(e: &Env) -> BytesN<32> {
    e.storage()
        .persistent()
        .get::<_, BytesN<32>>(&DataKey::BaseNode)
        .expect("No base node found")
}

fn get_registry(e: &Env) -> Address {
    e.storage()
        .persistent()
        .get::<_, Address>(&DataKey::Registry)
        .expect("No registry found")
}

fn get_resolver(e: &Env) -> Address {
    e.storage()
        .persistent()
        .get::<_, Address>(&DataKey::Resolver)
        .expect("No resolver found")
}

fn get_native_token(e: &Env) -> Address {
    e.storage()
        .persistent()
        .get::<_, Address>(&DataKey::NativeToken)
        .expect("No native token found")
}

fn get_domain_price(e: &Env, duration: &u64) -> i128 {
    let no_of_years = duration / 31536000;

    if no_of_years <= 0 {
        panic!("Invalid duration");
    }

    let price = e
        .storage()
        .persistent()
        .get::<_, i128>(&DataKey::Price)
        .expect("No domain price found");
    price * (no_of_years as i128)
}

fn has_registry(e: &Env) -> bool {
    e.storage().persistent().has(&DataKey::Registry)
}

fn is_name_available(e: &Env, name: &BytesN<32>) -> bool {
    let domain_owner = get_domain_owner(&e, &name);
    domain_owner == e.current_contract_address()
}

fn append_hash(env: &Env, parent_hash: &BytesN<32>, leaf_hash: &BytesN<32>) -> BytesN<32> {
    let mut bytes = Bytes::new(env);
    bytes.append(&leaf_hash.clone().into());
    bytes.append(&parent_hash.clone().into());
    env.crypto().sha256(&bytes)
}

/*
Modifiers for the contract
*/
fn require_owner(e: &Env, node: &BytesN<32>, caller: &Address) {
    let domain_owner = get_domain_owner(e, node);
    assert!(domain_owner == *caller, "caller is not authorised");
}

fn require_registry_ownership(e: &Env) {
    let registrar = get_registry_owner(e);
    assert!(
        registrar == e.current_contract_address(),
        "Registrar is not authorised"
    );
}

fn require_administrator(e: &Env, caller: &Address) {
    let admin = get_administrator(e);
    assert!(admin == *caller, "caller is not authorised");
}

/*
State Changing Functions
*/
fn set_domain(e: &Env, node: &BytesN<32>, owner: &Address, expiry: &u64) {
    set_domain_owner(&e, &node, &owner);
    set_domain_expiry(&e, &node, &expiry);
}

fn set_domain_owner(e: &Env, node: &BytesN<32>, owner: &Address) {
    e.storage()
        .persistent()
        .set(&DataKey::Owners(node.clone()), owner);
    e.storage().persistent().bump(
        &DataKey::Owners(node.clone()),
        LOW_BUMP_AMOUNT,
        HIGH_BUMP_AMOUNT,
    );
}

fn set_domain_expiry(e: &Env, node: &BytesN<32>, expiry: &u64) {
    e.storage()
        .persistent()
        .set(&DataKey::Expirations(node.clone()), expiry);
    e.storage().persistent().bump(
        &DataKey::Expirations(node.clone()),
        LOW_BUMP_AMOUNT,
        HIGH_BUMP_AMOUNT,
    );
}

fn set_domain_price(e: &Env, price: &i128) {
    e.storage().persistent().set(&DataKey::Price, price);
    e.storage()
        .persistent()
        .bump(&DataKey::Price, LOW_BUMP_AMOUNT, HIGH_BUMP_AMOUNT);
}

fn set_registry(e: &Env, registry: &Address) {
    e.storage().persistent().set(&DataKey::Registry, registry);
    e.storage()
        .persistent()
        .bump(&DataKey::Registry, LOW_BUMP_AMOUNT, HIGH_BUMP_AMOUNT);
}

fn set_native_token(e: &Env, native_token: &Address) {
    e.storage()
        .persistent()
        .set(&DataKey::NativeToken, native_token);
    e.storage()
        .persistent()
        .bump(&DataKey::Registry, LOW_BUMP_AMOUNT, HIGH_BUMP_AMOUNT);
}

fn set_resolver(e: &Env, resolver: &Address) {
    e.storage().persistent().set(&DataKey::Resolver, resolver);
    e.storage()
        .persistent()
        .bump(&DataKey::Resolver, LOW_BUMP_AMOUNT, HIGH_BUMP_AMOUNT);
}

fn set_base_node(e: &Env, base_node: &BytesN<32>) {
    e.storage().persistent().set(&DataKey::BaseNode, base_node);
    e.storage()
        .persistent()
        .bump(&DataKey::BaseNode, LOW_BUMP_AMOUNT, HIGH_BUMP_AMOUNT);
}

fn set_administrator(e: &Env, caller: &Address) {
    e.storage().persistent().set(&DataKey::Admin, caller);
    e.storage()
        .persistent()
        .bump(&DataKey::Admin, LOW_BUMP_AMOUNT, HIGH_BUMP_AMOUNT);
}

fn set_resolver_name(e: &Env, sub_node: &BytesN<32>, name: &Address, default_resolver: &Address) {
    let resolver_client = SnsResolverClient::new(&e, default_resolver);

    resolver_client.set_name(&e.current_contract_address(), sub_node, name);
}

fn set_resolver_text(e: &Env, sub_node: &BytesN<32>, text: &String, default_resolver: &Address) {
    let resolver_client = SnsResolverClient::new(&e, default_resolver);

    resolver_client.set_text(&e.current_contract_address(), sub_node, text);
}

fn set_resolver_details(
    e: &Env,
    sub_node: &BytesN<32>,
    name: &Address,
    text: &String,
    default_resolver: &Address,
) {
    let resolver_client = SnsResolverClient::new(&e, default_resolver);

    resolver_client.set_name(&e.current_contract_address(), sub_node, name);
    resolver_client.set_text(&e.current_contract_address(), sub_node, text);
}
