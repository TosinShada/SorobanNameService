#![cfg(test)]

use super::testutils::{register_test_contract as register_sns_resolver, SnsResolver};
use soroban_sdk::{testutils::Address as AddressTestTrait, Address, Bytes, BytesN, Env, String};

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

struct Setup {
    env: Env,
    base_node: BytesN<32>,
    domain_owner: Address,
    resolver: SnsResolver,
    registrar_address: Address,
}

/// Sets up an sns with -
///
impl Setup {
    fn new() -> Self {
        let e: Env = soroban_sdk::Env::default();
        let domain_owner = Address::random(&e);
        let registrar_address = Address::random(&e);
        let base_node = create_node(&e, "sns");

        let resolver_address = register_sns_resolver(&e);
        let resolver = SnsResolver::new(&e, resolver_address.clone());
        resolver.client().initialize(&registrar_address);

        Self {
            env: e,
            base_node,
            domain_owner,
            resolver,
            registrar_address,
        }
    }
}

#[test]
fn test_set_name() {
    let setup = Setup::new();
    let resolver = &setup.resolver;
    let registrar_address = &setup.registrar_address;
    let base_node = &setup.base_node;
    let domain_owner = &setup.domain_owner;
    let label = create_node(&setup.env, "tosinshada");
    let domain = append_node(&setup.env, &base_node, &label);

    resolver
        .client()
        .mock_all_auths()
        .set_name(&registrar_address, &domain, &domain_owner);

    let name = resolver.client().name(&domain);
    assert_eq!(name, *domain_owner);
}

#[test]
fn test_set_text() {
    let setup = Setup::new();
    let resolver = &setup.resolver;
    let registrar_address = &setup.registrar_address;
    let base_node = &setup.base_node;
    let text_record = String::from_slice(&setup.env, "wounvuwb3828240482jj");
    let label = create_node(&setup.env, "tosinshada");
    let domain = append_node(&setup.env, &base_node, &label);

    resolver
        .client()
        .mock_all_auths()
        .set_text(&registrar_address, &domain, &text_record);

    let text = resolver.client().text(&domain);
    assert_eq!(text.len(), 1);
    assert_eq!(text.get_unchecked(0), text_record);
}

#[test]
#[should_panic(expected = "No name found")]
fn test_remove() {
    let setup = Setup::new();
    let resolver = &setup.resolver;
    let registrar_address = &setup.registrar_address;
    let base_node = &setup.base_node;
    let text_record = String::from_slice(&setup.env, "wounvuwb3828240482jj");
    let domain_owner = &setup.domain_owner;
    let label = create_node(&setup.env, "test");
    let domain = append_node(&setup.env, &base_node, &label);

    resolver
        .client()
        .mock_all_auths()
        .set_name(&registrar_address, &domain, &domain_owner);

    resolver
        .client()
        .mock_all_auths()
        .set_text(&registrar_address, &domain, &text_record);

    let name = resolver.client().name(&domain);
    let text = resolver.client().text(&domain);

    assert_eq!(name, *domain_owner);
    assert_eq!(text.len(), 1);
    assert_eq!(text.get_unchecked(0), text_record);

    resolver
        .client()
        .mock_all_auths()
        .remove(&registrar_address, &domain);

    let _address = resolver.client().name(&domain);
}
