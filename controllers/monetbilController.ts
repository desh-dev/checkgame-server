import axios from "axios";
import { Request, Response } from "express";
import {v4 as uuidv4} from 'uuid';

const monetbilPayment = async (request: Request, response: Response) => {

    const { amount, phoneNumber, currentLanguage } = request.body;
    const monetbilServiceKey = "J9XjZzkFqjeL5fk34e1RNq98thRRwvYf"
    const referenceId = uuidv4().slice(0, 8);
    const monetbilURL = `https://api.monetbil.com/widget/v2.1/${monetbilServiceKey}`;

    const monetbilOptions = {
        amount: amount,
        phone: phoneNumber,
        locale: currentLanguage,
    }
    await axios.post(
        monetbilURL,
        monetbilOptions,
        {
            headers: {
                'Content-Type': 'application/json',
                // "X-reference-Id": referenceId,
                // "X-target-Environment": "sandbox",
                // Authorization: `Basic ${apiKey}`,
                // 'Ocp-Apim-Subscription-Key': subscriptionKey,
            },
        }
    ).then((res) => {response.json({ "data": res.data, "referenceId": referenceId })})
    .catch((err) => {
        // response.status(500).json({ error: 'An error occurred' });
        console.error(err);
    });
}
module.exports = { monetbilPayment }