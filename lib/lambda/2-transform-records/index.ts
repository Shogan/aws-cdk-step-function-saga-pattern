import { updateStepsWithItem, addItemToExistingTransaction } from '../common/ddb';

const tableName = process.env.DYNAMO_TABLE_NAME;

export const handler = async (event: any) => {
    try {
        console.log("TransformRecords");
        console.log(event);
        
        const item = {
            "LastUpdated": Date.now(),
            "Data": "TransformRecords Data here"
        };

        if (event.TransactionDetails) {

            if (event.TransactionDetails.simulateFail) {
                if (Math.random() > 0.7) { 
                    throw "Throwing a random error in TransformRecords which had a 30% probability...";
                }
            }

            // 'business logic example'
            await addItemToExistingTransaction(event.TransactionDetails.TransactionId, item, "SampleTransformRecords", tableName);

            // write DynamoDB tx entry for this step
            const stepTxItem = { Name: "TransformRecords", Status: "Success", Ts: Date.now() };
            await updateStepsWithItem(event.TransactionDetails.TransactionId, stepTxItem, tableName);
            return JSON.stringify({TransactionDetails: event.TransactionDetails, StepFunction: "TransformRecords", Result: "Success"});
        }
        else {
            throw "This step function requires TransactionDetails to record state in DynamoDB."
        }
    } catch (err) {
        const stepTxItem = { Name: "TransformRecords", Status: "Error", Error: err, Ts: Date.now() };
        await updateStepsWithItem(event.TransactionDetails.TransactionId, stepTxItem, tableName);
        console.log("Error", err);
        throw err;
    }
}