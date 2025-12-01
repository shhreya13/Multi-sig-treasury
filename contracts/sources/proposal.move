module multisig::proposal {

    use sui::object::{UID, new};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use std::vector;
    use multisig::multisig::MultiSigWallet;

    struct Proposal has key, store {
        id: UID,
        target: address,
        amount: u64,
        approvals: vector<address>,
        executed: bool
    }

    public fun create_proposal(target: address, amount: u64, ctx: &mut TxContext) {
        let id = new(ctx);
        let approvals = vector::empty<address>();
        let proposal = Proposal { id, target, amount, approvals, executed: false };
        transfer::share_object(proposal);
    }
}
