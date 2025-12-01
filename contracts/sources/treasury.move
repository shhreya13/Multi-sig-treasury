module multisig::treasury {

    use sui::tx_context::TxContext;
    use sui::object::{UID, new};
    use sui::transfer;

    struct TREASURY has drop {}

    struct Treasury has key, store {
        id: UID,
        balance: u64
    }

    fun init(_witness: TREASURY, ctx: &mut TxContext) {
        let id = new(ctx);
        let treasury = Treasury { id, balance: 0 };
        transfer::share_object(treasury);
    }
}
