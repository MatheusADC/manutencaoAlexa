const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');
const axios = require('axios');
const tokenId = "YOUR_TOKEN_ID";

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Olá, bem-vindo à skill Manuteção, como posso ajudar?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CadastrarProdutoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CadastrarProdutoIntent';
    },
    async handle(handlerInput) {
        var nomeProduto = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nomeProduto');
        var preco = Alexa.getSlotValue(handlerInput.requestEnvelope, 'preco');
        var nomeCliente = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nomeCliente');
        var telefoneCliente = Alexa.getSlotValue(handlerInput.requestEnvelope, 'telefoneCliente');
        var id = Alexa.getSlotValue(handlerInput.requestEnvelope, 'identificacao');
        var status = Alexa.getSlotValue(handlerInput.requestEnvelope, 'status');
        var data = Alexa.getSlotValue(handlerInput.requestEnvelope, 'data');
        var confirmacao = Alexa.getSlotValue(handlerInput.requestEnvelope, 'confirmacao');

        var produto = {
            'nomeProduto': nomeProduto,
            'preco': preco,
            'nomeCliente': nomeCliente,
            'telefoneCliente': telefoneCliente,
            'id': id,
            'status': status,
            'data': data
        };

        var dados = await handlerInput.attributesManager.getPersistentAttributes();

        if (Array.isArray(dados)) {
            var idExistente = dados.some(item => item.id === id);
            if (idExistente) {
                const speakOutput = 'Esse ID já foi utilizado. Por favor, forneça um ID diferente.';
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            } else {
                dados.push(produto);
            }
        } else {
            dados = [produto];
        }

        if (confirmacao === 'não' || confirmacao === 'nao') {
            const speakOutput = 'O produto não foi cadastrado.';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        } else {
            handlerInput.attributesManager.setPersistentAttributes(dados);
            await handlerInput.attributesManager.savePersistentAttributes();

            const speakOutputSuccess = 'O produto foi cadastrado com sucesso!';

            return handlerInput.responseBuilder
                .speak(speakOutputSuccess)
                .reprompt(speakOutputSuccess)
                .getResponse();
        }
    }
};

const ConsultarProdutoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ConsultarProdutoIntent';
    },
    async handle(handlerInput) {
        var id = Alexa.getSlotValue(handlerInput.requestEnvelope, 'identificacao');
        var speakOutput = 'Produto não cadastrado!';
    
        var dados = await handlerInput.attributesManager.getPersistentAttributes();
        
        if(Array.isArray(dados)){
          for(var i = 0; i < dados.length; i++) {
              if(dados[i].id === id) {
                  var nomeProduto = dados[i].nomeProduto;
                  var preco = dados[i].preco;
                  var nomeCliente = dados[i].nomeCliente;
                  var telefoneCliente = dados[i].telefoneCliente;
                  var status = dados[i].status;
                  var data = dados[i].data;
                  speakOutput = `O produto ${nomeProduto} pertencente ao cliente ${nomeCliente} possuidor do telefone de contato ${telefoneCliente} com o status ${status} tem o valor de reparo de ${preco} reais e foi recebido na data de ${data}`
              }
          }
        } 
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const RemoverProdutoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RemoverProdutoIntent';
    },
    async handle(handlerInput) {
        var id = Alexa.getSlotValue(handlerInput.requestEnvelope, 'identificacao');
        
        var dados = await handlerInput.attributesManager.getPersistentAttributes();
        
        var index = dados.findIndex(item => item.id === id);
        
        if (index !== -1) {
            dados.splice(index, 1);
            
            handlerInput.attributesManager.setPersistentAttributes(dados);
            await handlerInput.attributesManager.savePersistentAttributes();
            
            const speakOutput = 'O produto foi removido com sucesso!';
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        } else {
            const speakOutput = 'Não foi possível encontrar um produto com o ID fornecido.';
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};

const AlterarStatusProdutoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AlterarStatusProdutoIntent';
    },
    async handle(handlerInput) {
        var id = Alexa.getSlotValue(handlerInput.requestEnvelope, 'identificacao');
        var status = Alexa.getSlotValue(handlerInput.requestEnvelope, 'status');
        var speakOutput = 'Produto não cadastrado!';
    
        var dados = await handlerInput.attributesManager.getPersistentAttributes();
        
        if(Array.isArray(dados)){
          for(var i = 0; i < dados.length; i++) {
              if(dados[i].id === id) {
                dados[i].status = status;
                handlerInput.attributesManager.setPersistentAttributes(dados);
                await handlerInput.attributesManager.savePersistentAttributes();
                speakOutput = `O status do produto com o ID ${id} foi alterado para ${status} com sucesso!`;
              }
          }
        } 
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const EnviarZapIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'EnviarZapIntent';
    },
    async handle(handlerInput) {
        var id = Alexa.getSlotValue(handlerInput.requestEnvelope, 'identificacao');
        var speakOutput = 'Produto não cadastrado!';
    
        var dados = await handlerInput.attributesManager.getPersistentAttributes();
    
        if(Array.isArray(dados)){
          for(var i = 0; i < dados.length; i++) {
              if(dados[i].id === id) {
                var telefoneCliente = dados[i].telefoneCliente;
                var telefone = '+55' + telefoneCliente;
                var nomeProduto = dados[i].nomeProduto;
                var nomeCliente = dados[i].nomeCliente;
                var mensagem = `Olá ${nomeCliente}, o produto ${nomeProduto} já está consertado e pronto para ser retirado!`
                var res = await require("axios").default;
    
                var options = {
                  method: 'POST',
                  url: 'https://api.wzap.chat/v1/messages',
                  headers: {'Content-Type': 'application/json', Token: `${tokenId}`},
                  data: {phone: `${telefone}`, message: `${mensagem}`}
                };
                res.request(options).then(function (response) {
                  console.log(response.data);
                }).catch(function (error) {
                  console.error(error);
                });
                      }
                  }
                } 
       
        speakOutput = `A mensagem ${mensagem} foi enviada com sucesso para o telefone ${telefone}!`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        return handlerInput.responseBuilder.getResponse();
    }
};
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CadastrarProdutoIntentHandler,
        ConsultarProdutoIntentHandler,
        RemoverProdutoIntentHandler,
        AlterarStatusProdutoIntentHandler,
        EnviarZapIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .withPersistenceAdapter(
        new ddbAdapter.DynamoDbPersistenceAdapter({
            tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME,
            createTable: false,
            dynamoDBClient: new AWS.DynamoDB({apiVersion:'latest',
                region: process.env.DYNAMODB_PERSISTENCE_REGION
            })
        })
    )
    .lambda();
