use soroban_sdk::{Address, BytesN, Env, String, Symbol};

pub(crate) fn set_name(e: &Env, name: Address, node: BytesN<32>) {
    let topics = (Symbol::new(e, "new_name_resolution"), name);
    e.events().publish(topics, node);
}

pub(crate) fn set_text(e: &Env, node: BytesN<32>, text: String) {
    let topics = (Symbol::new(e, "new_text_record"), node);
    e.events().publish(topics, text);
}

pub(crate) fn remove_name(e: &Env, node: BytesN<32>) {
    let topics = (Symbol::new(e, "remove_domain_resolution"), node);
    e.events().publish(topics, ());
}
