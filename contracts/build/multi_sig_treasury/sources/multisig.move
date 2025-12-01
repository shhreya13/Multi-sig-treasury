module multisig::multisig {

    use sui::tx_context::TxContext;
    use sui::object::{UID, new};
    use sui::transfer;
    use std::vector;

    struct MULTISIG has drop {}  

    struct MultiSigWallet has key, store {
        id: UID,
        owners: vector<address>,
        threshold: u8
    }

    fun init(_witness: MULTISIG, ctx: &mut TxContext) {
        let id = new(ctx);
        let owners = vector::empty<address>();
        let threshold: u8 = 1;
        let wallet = MultiSigWallet { id, owners, threshold };
        transfer::share_object(wallet);
    }
}
