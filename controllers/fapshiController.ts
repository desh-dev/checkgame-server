const baseUrl = 'https://sandbox.fapshi.com';
const collectionHeaders = {
    apiuser: "3c8bf25f-001c-49f5-a47c-4db6c5dff4e7",
    apikey: "FAK_TEST_618420526694477b22d0"
};
const payoutHeaders = {
    apiuser: "3c8bf25f-001c-49f5-a47c-4db6c5dff4e7",
    apikey: "FAK_TEST_618420526694477b22d0"
};

interface Data {
    amount: number;
    email?: string;
    userId?: string;
    externalId?: string;
    redirectUrl?: string;
    message?: string;
}

interface DirectPayData extends Data {
    phone: string;
    medium?: string;
    name?: string;
}

interface Error {
    message: string;
    statusCode: number;
}

module.exports = {
    async initiatePay(req: any, res: any) {
        const data: Data = req.body; // Get data from request body
        try {
            if (!data?.amount)
                return res.status(400).json(error('amount required', 400));
            if (!Number.isInteger(data.amount))
                return res.status(400).json(error('amount must be of type integer', 400));
            if (data.amount < 100)
                return res.status(400).json(error('amount cannot be less than 100 XAF', 400));

            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...collectionHeaders
                },
                body: JSON.stringify(data)
            };
            const response = await fetch(baseUrl + '/initiate-pay', config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            responseData.statusCode = response.status;
            res.json(responseData); // Send response
        } catch (e: any) {
            const statusCode = e.response ? e.response.status : 500; // Check if e.response exists
            const errorData = e.response && e.response.data ? e.response.data : { message: 'Internal Server Error' }; // Fallback error data
            res.status(statusCode).json({ ...errorData, statusCode }); // Send error response
        }
    },
    
    async directPay(req: any, res: any) {
        const data: DirectPayData = req.body; // Get data from request body
        try {
            if (!data?.amount)
                return res.status(400).json(error('amount required', 400));
            if (!Number.isInteger(data.amount))
                return res.status(400).json(error('amount must be of type integer', 400));
            if (data.amount < 100)
                return res.status(400).json(error('amount cannot be less than 100 XAF', 400));
            if (!data?.phone)
                return res.status(400).json(error('phone number required', 400));
            if (typeof data.phone !== 'string')
                return res.status(400).json(error('phone must be of type string', 400));
            if (!/^6[\d]{8}$/.test(data.phone))
                return res.status(400).json(error('invalid phone number', 400));

            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...collectionHeaders
                },
                body: JSON.stringify(data)
            };
            const response = await fetch(baseUrl + '/direct-pay', config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            responseData.statusCode = response.status;
            res.json(responseData); // Send response
        } catch (e: any) {
            const statusCode = e.response ? e.response.status : 500; // Check if e.response exists
            const errorData = e.response && e.response.data ? e.response.data : { message: 'Internal Server Error' }; // Fallback error data
            res.status(statusCode).json({ ...errorData, statusCode }); // Send error response
        }
    },

    async paymentStatus(req: any, res: any) {
        const { transId } = req.body // Get transId from body
        console.log("transssIddd", req.body);
        try {
            if (!transId || typeof transId !== 'string')
                return res.status(400).json(error('invalid type, string expected', 400));
            if (!/^[a-zA-Z0-9]{8,10}$/.test(transId))
                return res.status(400).json(error('invalid transaction id', 400));

            const config = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...collectionHeaders
                }
            };
            const response = await fetch(baseUrl + '/payment-status/' + transId, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            responseData.statusCode = response.status;
            res.json(responseData); // Send response
        } catch (e: any) {
            const statusCode = e.response ? e.response.status : 500; // Check if e.response exists
            const errorData = e.response && e.response.data ? e.response.data : { message: 'Internal Server Error' }; // Fallback error data
            res.status(statusCode).json({ ...errorData, statusCode }); // Send error response
        }
    },
    
    async expirePay(req: any, res: any) {
        const { transId } = req.body // Get transId from request parameters
        try {
            if (!transId || typeof transId !== 'string')
                return res.status(400).json(error('invalid type, string expected', 400));
            if (!/^[a-zA-Z0-9]{8,9}$/.test(transId))
                return res.status(400).json(error('invalid transaction id', 400));

            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...collectionHeaders
                },
                body: JSON.stringify({ transId })
            };
            const response = await fetch(baseUrl + '/expire-pay', config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            responseData.statusCode = response.status;
            res.json(responseData); // Send response
        } catch (e: any) {
            const statusCode = e.response ? e.response.status : 500; // Check if e.response exists
            const errorData = e.response && e.response.data ? e.response.data : { message: 'Internal Server Error' }; // Fallback error data
            res.status(statusCode).json({ ...errorData, statusCode }); // Send error response
        }
    },
    
    async userTrans(req: any, res: any) {
        const userId = req.params.userId; // Get userId from request parameters
        try {
            if (!userId || typeof userId !== 'string')
                return res.status(400).json(error('invalid type, string expected', 400));
            if (!/^[a-zA-Z0-9-_]{1,100}$/.test(userId))
                return res.status(400).json(error('invalid user id', 400));

            const config = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...collectionHeaders
                }
            };
            const response = await fetch(baseUrl + '/transaction/' + userId, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            res.json(responseData); // Send response
        } catch (e: any) {
            const statusCode = e.response ? e.response.status : 500; // Check if e.response exists
            const errorData = e.response && e.response.data ? e.response.data : { message: 'Internal Server Error' }; // Fallback error data
            res.status(statusCode).json({ ...errorData, statusCode }); // Send error response
        }
    },
    async payout(req: any, res: any) {
        const data: DirectPayData = req.body; // Get data from request body
        try {
            if (!data?.amount)
                return res.status(400).json(error('amount required', 400));
            if (!Number.isInteger(data.amount))
                return res.status(400).json(error('amount must be of type integer', 400));
            if (data.amount < 500)
                return res.status(400).json(error('minimum withdrawal is 500 XAF', 400));
            if (!data?.phone)
                return res.status(400).json(error('phone number required', 400));
            if (typeof data.phone !== 'string')
                return res.status(400).json(error('phone must be of type string', 400));
            if (!/^6[\d]{8}$/.test(data.phone))
                return res.status(400).json(error('invalid phone number', 400));
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...payoutHeaders
                },
                body: JSON.stringify(data)
            };
            const response = await fetch(baseUrl + '/payout', config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            responseData.statusCode = response.status;
            res.json(responseData); // Send response
        } catch (e: any) {
            const statusCode = e.response ? e.response.status : 500; // Check if e.response exists
            const errorData = e.response && e.response.data ? e.response.data : { message: 'Internal Server Error' }; // Fallback error data
            res.status(statusCode).json({ ...errorData, statusCode }); // Send error response
        }
    }

}

function error(message: string, statusCode: number): Error {
    return { message, statusCode, name: 'Error' }; // Added name to return object
}
