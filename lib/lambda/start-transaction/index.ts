import AWS = require("aws-sdk");
import { updateStepsWithItem } from '../common/ddb';

const tableName = process.env.DYNAMO_TABLE_NAME;

export const handler = async (event: any) => {
    try {
        console.log("StartTransactionFunction");
        console.log(event);

        if (event.TransactionDetails) {
            // write DynamoDB tx entry for this step
            const stepTxItem = { Name: "StartTransactionFunction", Status: "Success", Ts: Date.now() };
            await updateStepsWithItem(event.TransactionDetails.TransactionId, stepTxItem, tableName);
            return JSON.stringify({TransactionDetails: event.TransactionDetails, StepFunction: "StartTransactionFunction", Result: "Success"});
        }
        else {
            throw "This step function requires TransactionDetails to record state in DynamoDB."
        }
    } catch (err) {
        const stepTxItem = { Name: "StartTransactionFunction", Status: "Error", Error: err, Ts: Date.now() };
        await updateStepsWithItem(event.TransactionDetails.TransactionId, stepTxItem, tableName);
        console.log("Error", err);
        throw err;
    }
}