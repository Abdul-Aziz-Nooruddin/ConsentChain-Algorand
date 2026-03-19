import { Contract, BoxMap, uint64, Account, assert, Txn, itxn, gtxn, Global } from '@algorandfoundation/algorand-typescript';

export class ConsentManager extends Contract {
  consents = BoxMap<readonly [Account, Account], uint64>({ keyPrefix: 'c' });

  public giveConsent(company: Account): void {
    this.consents([Txn.sender, company]).value = 1;
  }

  public pauseConsent(company: Account): void {
    this.consents([Txn.sender, company]).value = 2;
  }

  public revokeConsent(company: Account): void {
    this.consents([Txn.sender, company]).delete();
  }

  public getConsent(user: Account, company: Account): uint64 {
    if (this.consents([user, company]).exists) {
      return this.consents([user, company]).value;
    }
    return 0;
  }

  public accessData(user: Account, payTxn: gtxn.PaymentTxn): void {
    assert(this.getConsent(user, Txn.sender) === 1, "Consent not given");
    assert(payTxn.receiver === Global.currentApplicationAddress, "Payment must be to the app");
    assert(payTxn.amount >= 2, "Payment amount too low");

    const halfAmount = payTxn.amount / 2 as uint64;
    const adminAmount = (payTxn.amount - halfAmount) as uint64;

    itxn.payment({
      receiver: Global.creatorAddress,
      amount: adminAmount,
      fee: 0,
    }).submit();

    itxn.payment({
      receiver: user,
      amount: halfAmount,
      fee: 0,
    }).submit();
  }
}
