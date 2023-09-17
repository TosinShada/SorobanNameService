#![cfg(test)]

extern crate std;

use crate::testutils::register_resolver;

use super::testutils::{register_registry, register_test_contract as register_sns, SnsRegistrar};
use sns_registry_interface::SnsRegistryClient;
use sns_resolver_interface::SnsResolverClient;
use soroban_sdk::{
    testutils::{Address as AddressTestTrait, Ledger},
    token, Address, Bytes, BytesN, Env,
};

fn create_registry_contract<'a>(
    e: &Env,
    admin: &Address,
    resolver: &Address,
) -> (Address, SnsRegistryClient<'a>) {
    let registry_id = register_registry(e);

    let registry: SnsRegistryClient<'_> = SnsRegistryClient::new(&e, &registry_id);
    registry.initialize(admin, resolver);
    (registry_id, registry)
}

fn create_resolver_contract<'a>(e: &Env, admin: &Address) -> (Address, SnsResolverClient<'a>) {
    let resolver_id = register_resolver(e);

    let resolver: SnsResolverClient<'_> = SnsResolverClient::new(&e, &resolver_id);
    resolver.initialize(admin);
    (resolver_id, resolver)
}

fn create_token_contract<'a>(
    e: &Env,
    admin: &Address,
) -> (token::Client<'a>, token::StellarAssetClient<'a>) {
    let contract_address = e.register_stellar_asset_contract(admin.clone());
    (
        token::Client::new(e, &contract_address),
        token::StellarAssetClient::new(e, &contract_address),
    )
}

fn advance_ledger(e: &Env, delta: u64) {
    e.ledger().with_mut(|l| {
        l.timestamp += delta;
    });
}

fn create_node(e: &Env, name: &str) -> BytesN<32> {
    let node = Bytes::from_slice(&e, name.as_bytes());
    e.crypto().sha256(&node)
}

fn append_node(e: &Env, node: &BytesN<32>, label: &BytesN<32>) -> BytesN<32> {
    let mut bytes = Bytes::new(e);
    bytes.append(&label.clone().into());
    bytes.append(&node.clone().into());
    e.crypto().sha256(&bytes)
}

struct Setup<'a> {
    env: Env,
    admin_user: Address,
    backup_admin_user: Address,
    base_node: BytesN<32>,
    domain_owner: Address,
    resolver: SnsResolverClient<'a>,
    resolver_address: Address,
    registrar: SnsRegistrar,
    registry: SnsRegistryClient<'a>,
}

/// Sets up an sns with -
///
impl Setup<'_> {
    fn new() -> Self {
        let e: Env = soroban_sdk::Env::default();
        let admin_user = Address::random(&e);
        let backup_admin_user = Address::random(&e);
        let domain_owner = Address::random(&e);
        let base_node = create_node(&e, "sns");

        let registrar_address = register_sns(&e);
        let (resolver_address, resolver) = create_resolver_contract(&e, &registrar_address);
        let (registry_address, registry) =
            create_registry_contract(&e, &registrar_address, &resolver_address);
        let (token_client, token_asset_client) = create_token_contract(&e, &admin_user);

        token_asset_client
            .mock_all_auths()
            .mint(&admin_user, &100000000000000);

        let registrar = SnsRegistrar::new(&e, registrar_address.clone());
        registrar.client().initialize(
            &registry_address,
            &admin_user,
            &resolver_address,
            &base_node,
            &token_client.address,
        );

        Self {
            env: e,
            admin_user,
            backup_admin_user,
            base_node,
            domain_owner,
            resolver,
            resolver_address,
            registrar,
            registry,
        }
    }
}

#[test]
fn test_transfer_contract_ownership() {
    let setup = Setup::new();

    setup
        .registrar
        .client()
        .mock_all_auths()
        .transfer_contract_ownership(&setup.admin_user, &setup.backup_admin_user);

    assert_eq!(
        true,
        setup
            .registrar
            .client()
            .is_administrator(&setup.backup_admin_user)
    );
}

#[test]
fn test_set_resolver() {
    let setup = Setup::new();

    setup
        .registrar
        .client()
        .mock_all_auths()
        .set_resolver(&setup.admin_user, &setup.resolver_address);

    assert_eq!(
        setup.resolver_address,
        setup.registry.resolver(&setup.base_node)
    );
}

#[test]
fn test_register() {
    let setup = Setup::new();

    let label = create_node(&setup.env, "test");
    let sub_node = append_node(&setup.env, &setup.base_node, &label);

    setup.registrar.client().mock_all_auths().register(
        &setup.admin_user,
        &setup.domain_owner,
        &label,
        &setup.domain_owner,
        &31536000,
    );

    assert_eq!(setup.domain_owner, setup.registry.owner(&sub_node));
    assert_eq!(31536000, setup.registrar.client().name_expiry(&label));
    assert_eq!(
        setup.domain_owner,
        setup.registrar.client().name_owner(&label)
    );
    assert_eq!(setup.domain_owner, setup.resolver.name(&sub_node));
}

#[test]
fn test_expiry() {
    let setup = Setup::new();

    let label = create_node(&setup.env, "test");

    setup.registrar.client().mock_all_auths().register(
        &setup.admin_user,
        &setup.domain_owner,
        &label,
        &setup.domain_owner,
        &31536000,
    );

    assert_eq!(31536000, setup.registrar.client().name_expiry(&label));
    assert_eq!(
        setup.domain_owner,
        setup.registrar.client().name_owner(&label)
    );

    advance_ledger(&setup.env, 31536000);

    // It shouldn't be available because of the grace period
    assert_eq!(false, setup.registrar.client().available(&label));

    advance_ledger(&setup.env, 1555201);
    assert_eq!(true, setup.registrar.client().available(&label));
}

#[test]
fn test_renew() {
    let setup = Setup::new();

    let label = create_node(&setup.env, "test");

    setup.registrar.client().mock_all_auths().register(
        &setup.admin_user,
        &setup.domain_owner,
        &label,
        &setup.domain_owner,
        &31536000,
    );

    assert_eq!(31536000, setup.registrar.client().name_expiry(&label));
    assert_eq!(
        setup.domain_owner,
        setup.registrar.client().name_owner(&label)
    );

    advance_ledger(&setup.env, 31536000);

    // It shouldn't be available because of the grace period
    assert_eq!(false, setup.registrar.client().available(&label));

    setup
        .registrar
        .client()
        .mock_all_auths()
        .renew(&setup.admin_user, &label, &31536000);

    assert_eq!(63072000, setup.registrar.client().name_expiry(&label));
    assert_eq!(
        setup.domain_owner,
        setup.registrar.client().name_owner(&label)
    );
}
