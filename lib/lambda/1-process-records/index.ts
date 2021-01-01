import { updateStepsWithItem, addItemToExistingTransaction } from '../common/ddb';

const tableName = process.env.DYNAMO_TABLE_NAME;

export const handler = async (event: any) => {
    try {
        console.log("ProcessRecords");
        console.log(event);
        
        const item = {
            "LastUpdated": Date.now(),
            "Data": "ProcessRecords Data was added here initially."
        };

        if (event.TransactionDetails) {

            if (event.TransactionDetails.simulateFail) {
                if (Math.random() > 0.7) { 
                    throw "Throwing a random error in ProcessRecords which had a 30% probability...";
                }
            }

            // 'business logic example'
            await addItemToExistingTransaction(event.TransactionDetails.TransactionId, item, "SampleProcessRecords", tableName);

            // write DynamoDB tx entry for this step         
            const stepTxItem = { Name: "ProcessRecords", Status: "Success", Ts: Date.now() };
            await updateStepsWithItem(event.TransactionDetails.TransactionId, stepTxItem, tableName);
            return JSON.stringify({TransactionDetails: event.TransactionDetails, StepFunction: "ProcessRecords", Result: "Success"});
        }
        else {
            throw "This step function requires TransactionDetails to record state in DynamoDB."
        }
    } catch (err) {
        const stepTxItem = { Name: "ProcessRecords", Status: "Error", Error: err, Ts: Date.now() };
        await updateStepsWithItem(event.TransactionDetails.TransactionId, stepTxItem, tableName);
        console.log("Error", err);
        throw err;
    }
}