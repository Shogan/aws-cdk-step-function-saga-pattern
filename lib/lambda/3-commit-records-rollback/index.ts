import { removeAttributeFromTransaction, setLockRecord, updateStepsWithItem } from '../common/ddb';

const tableName = process.env.DYNAMO_TABLE_NAME;

export const handler = async (event: any) => {
    try {
        console.log("3-CommitRecords-Rollback");
        console.log(event);

        if (event.Payload || Array.isArray(event)) {
            // 'rollback action'
            let transactionDetails = {} as any;

            if (Array.isArray(event)) {
                transactionDetails = JSON.parse(event[0].Payload).TransactionDetails;
            } else {
                transactionDetails = JSON.parse(event.Payload).TransactionDetails;                
            }

            await removeAttributeFromTransaction(transactionDetails.TransactionId, "SampleCommitRecords", tableName);
            const stepTxItem = { Name: "CommitRecordsRollback", Status: "RollbackSuccess", Ts: Date.now() };
            await updateStepsWithItem(transactionDetails.TransactionId, stepTxItem, tableName);
            await setLockRecord(transactionDetails.TransactionId, false, tableName);
            return JSON.stringify({TransactionDetails: transactionDetails, StepFunction: "CommitRecordsRollback", Result: "Success"});
        }
        else {
            throw "This step function requires TransactionDetails."
        }
    } catch (err) {
        console.log("Error", err);
        throw err;
    }
}