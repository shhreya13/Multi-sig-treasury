module multisig::policy_manager {

    use sui::tx_context::TxContext;
    use sui::object::{UID, new};
    use sui::transfer;

    struct Policy has key, store {
        id: UID,
        max_spend_limit: u64
    }

    public fun init_policy(limit: u64, ctx: &mut TxContext) {
        let id = new(ctx);
        let policy = Policy { id, max_spend_limit: limit };
        transfer::share_object(policy);
    }
}
