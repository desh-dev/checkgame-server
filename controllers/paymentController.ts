import axios from "axios";
import { Request, Response } from "express";
import {v4 as uuidv4} from 'uuid';

const requestToPay = async (request: Request, response: Response) => {

    const { amount, phoneNumber } = request.body;
    console.log(amount, phoneNumber);
    const momoHost = 'sandbox.momodeveloper.mtn.com';
    // const momoTokenUrl = ` https://api.mtn.com/v1/oauth/access_token`;
    const momoTokenUrl = `https://${momoHost}/collection/token/`;
    const momoRequestToPayUrl = `https://${momoHost}/collection/v1_0/requesttopay`;

    let momoToken: string | null = null;
    
    // const { apiKey, subscriptionKey } = request.body;
    // console.log(apiKey, subscriptionKey);

    const apiKey = "Nzg1NTgxY2UtYWUxOC00YWRhLTk1MjgtNmRjYjZlMjc4OWU3OjY0MDdiZjU3MjNiMjQwM2U5MzVlNmRiNzhlNjQ4N2Q1";
    const subscriptionKey = "c0fcb652de904594b05ca0e13bffabfa"
    const referenceId = uuidv4().slice(0, 8);

    const options = {
        method: 'POST',
        url: 'https://api.mtn.com/v1/payments',
        headers: {'Content-Type': 'application/json', 'X-Authorization': '', Authorization: apiKey},
        data: {
          correlatorId: 'c5f80cb8-dc8b-11ea-87d0-0242ac130003',
          paymentDate: '2020-08-12T11:04:53.668Z',
          name: 'Manual Boost for RWC',
          callingSystem: 'ECW',
          transactionType: 'Payment',
          targetSystem: 'ECW',
          callbackURL: 'https://myCallBack/url',
          quoteId: '9223372036854775807',
        //   channel: 'AYO',
          description: 'Manual Boost for RW',
          authorizationCode: null,
          feeBearer: 'Payer',
          amount: {amount: amount, units: 'XOF'},
          taxAmount: {amount: 50, units: 'XOF'},
          totalAmount: {amount: amount, units: 'XOF'},
          payer: {
            payerIdType: 'MSISDN',
            payerId: phoneNumber,
            payerNote: 'Manual Boost for RWC',
            payerName: 'string',
            payerEmail: 'string',
            payerRef: '233364654737',
            payerSurname: 'Orimoloye',
            includePayerCharges: false
            },
          paymentMethod: {
            name: 'Manual Boost for RWC',
            description: 'Manual Boost for RWC',
            //   validFrom: '2021-07-21T17:32:28Z',
            //   validTo: '2021-07-21T17:32:28Z',
              type: 'Mobile Money',
              details: {
                digitalWallet: {
                    service: 'MoMo',
                    walletId: '237671826410',
                    // walletUri: 'https://paypal.me/johndoe'
                }
            }
            },
        }
    }
    
    await axios.post(
        momoTokenUrl,
        {},
        {
            headers: {
                'Content-Type': 'application/json',
                // "X-reference-Id": referenceId,
                // "X-target-Environment": "sandbox",
                Authorization: `Basic ${apiKey}`,
                'Ocp-Apim-Subscription-Key': subscriptionKey,
            },
        }
    ).then( async (res) => {
        momoToken = res.data.access_token;
        console.log(res.data);
        if (!momoToken) {
            response.status(500).json({ error: 'An error occurred' });
            return
        }
        const body = {
            amount: amount,
            currency: 'EUR',
            externalId: referenceId,
            payer: {
                partyIdType: 'MSISDN',
                partyId: phoneNumber,
            },
            payerMessage: 'CHECK GAME PAYMENT',
            payeeNote: 'TOP UP',
        };
          
        await axios.post(
            momoRequestToPayUrl,
            body,
            {
                headers: {
                'X-Reference-Id': referenceId,
                'X-Target-Environment': 'sandbox',
                'Ocp-Apim-Subscription-Key':'c0fcb652de904594b05ca0e13bffabfa',
                Authorization: `Bearer ${momoToken}`,
                'Content-Type': 'application/json',
                },
            }
            )
        .then((res) => {response.json({ "data": res.data, "referenceId": referenceId })})
        .catch((err) => {
            // response.status(500).json({ error: 'An error occurred' });
            console.error(err);
        });
    }).catch((err) => {
        response.status(500).json({ error: 'An error occurred' });
        console.error(err);
    });
}

module.exports = { requestToPay }