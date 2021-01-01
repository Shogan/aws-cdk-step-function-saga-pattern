import AWS = require("aws-sdk");

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export function addItemToExistingTransaction(id: string, item: any, attribName: string, tableName?: string) {
  
  if (!tableName) {
    throw 'tableName is required';
  }

  const params = {
    TableName: tableName,
    Key: {
      TransactionId: id
    },
    UpdateExpression: `set ${attribName}=:i`,
    ExpressionAttributeValues: {
      ':i': item
    },
    ReturnValues: "UPDATED_NEW"
  };

  return dynamoDB
    .update(params)
    .promise()
    .then(data => console.log(data.Attributes))
    .catch((err) => { throw err; });
}

export function removeAttributeFromTransaction(transactionId: string, attributeName: string, tableName?: string) {
  
  if (!tableName) {
    throw 'tableName is required';
  }

  const params = {
    TableName: tableName,
    Key: {
      TransactionId: transactionId
    },
    UpdateExpression: `REMOVE ${attributeName}`
  };

  return dynamoDB
    .update(params)
    .promise()
    .then(data => console.log(data.Attributes))
    .catch((err) => { throw err; });
}

export function updateStepsWithItem(id: string, stepitem: any, tableName?: string) {
  
    if (!tableName) {
      throw 'tableName is required';
    }
  
    const params = {
      TableName: tableName,
      Key: {
        TransactionId: id
      },
      UpdateExpression: 'set #Steps = list_append(if_not_exists(#Steps, :empty_list), :stepitem)',
      ExpressionAttributeNames: {
        '#Steps': 'Steps'
      },
      ExpressionAttributeValues: {
        ':stepitem': [stepitem],
        ':empty_list': []
      }
    };
  
    return dynamoDB
      .update(params)
      .promise()
      .then(data => console.log(data.Attributes))
      .catch((err) => { throw err; });
}

export function updateItem(id: string, updateExpression: string, expressionAttributeValues: Map<string, any>, tableName?: string) {
  
    if (!tableName) {
      throw 'tableName is required';
    }
  
    const params = {
      TableName: tableName,
      Key: {
        TransactionId: id
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues
    };
  
    return dynamoDB
      .update(params)
      .promise()
      .then(data => console.log(data.Attributes))
      .catch((err) => { throw err; });
}

export function getItemFromDB(id: string, tableName?: string, ) {

    if (!tableName) {
      throw 'tableName is required';
    }
    
    const params = {
      TableName: tableName,
      Key: {
        TransactionId: id
      }
    };
    
    return dynamoDB
      .get(params)
      .promise()
      .then(res => res.Item)
      .catch((err) => { throw err; });
}

export function setLockRecord(transactionId: string, lockState: boolean, tableName?: string) {
  
  if (!tableName) {
    throw 'tableName is required';
  }

  const params = {
    TableName: tableName,
    Key: {
      TransactionId: transactionId
    },
    UpdateExpression: `set Locked=:l`,
    ExpressionAttributeValues: {
      ':l': lockState
    }
  };

  return dynamoDB
    .update(params)
    .promise()
    .then(data => console.log(data.Attributes))
    .catch((err) => { throw err; });
}