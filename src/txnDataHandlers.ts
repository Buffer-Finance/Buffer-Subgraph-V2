import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { ADDRESS_ZERO } from "./config";
import { _loadOrCreateTransaction } from "./initialize";

export function createTxnData(
  receipt: ethereum.TransactionReceipt | null,
  transaction: ethereum.Transaction,
  eventName: string,
  decodeTypes: string,
  mapDecodedData: (decodedData: ethereum.Value | null) => string
): void {
  let to = transaction.to;
  if (to === null) {
    to = Address.fromString(ADDRESS_ZERO);
  }

  const transactionEntity = _loadOrCreateTransaction(
    transaction.hash.toHexString(),
    transaction.hash.toHexString(),
    transaction.from,
    to,
    eventName
  );
  if (receipt !== null) {
    transactionEntity.gasUsed = receipt.gasUsed;
    transactionEntity.blockNumber = receipt.blockNumber;
    transactionEntity.cumulativeGasUsed = receipt.cumulativeGasUsed;
    transactionEntity.contractAddress = receipt.contractAddress;
  }
  // transactionEntity.input = transaction.input;
  const input = ethereum.decode(
    decodeTypes,
    getTxnInputDataToDecode(transaction.input)
  );
  if (input !== null) {
    transactionEntity.input = mapDecodedData(input);
  }
  transactionEntity.save();
}

function getTxnInputDataToDecode(inputValue: Bytes): Bytes {
  const inputDataHexString = inputValue.toHexString().slice(10); //take away function signature: '0x????????'
  const hexStringToDecode =
    // "0x0000000000000000000000000000000000000000000000000000000000000020" +
    inputDataHexString; // prepend tuple offset
  return Bytes.fromByteArray(Bytes.fromHexString(hexStringToDecode));
}
