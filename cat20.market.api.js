
const apiEndpoint = 'https://api.catmarket.io';
const key = '';
const errorCode = 500;

//const server_endpoint = "http://localhost:8080";
const server_endpoint = "http://35.240.161.157";
const getHeaders = new Headers({
	'Authorization': 'Bearer ' + key
});

const postHeaders = new Headers({
	'Content-Type': 'application/json',
	'Authorization': 'Bearer ' + key
});
let postFormHeaders = new Headers({
	'Content-Type': 'application/x-www-form-urlencoded'
});

/**
 * Get open orders
 * @param address
 * @param tokenId
 * @param orderType
 * @param offset
 * @param limit
 * @returns
 */
async function getOpenOrders(address, tokenId, orderType, offset = 0, limit = 20) {
	if (!address) {
		address = '';
	}
	if (!tokenId) {
		tokenId = '';
	}
	if (!orderType) {
		orderType = '';
	}
	const url = `${apiEndpoint}/getOpenOrders?address=${address}&tokenId=${tokenId}&orderType=${orderType}&offset=${offset}&limit=${limit}`;
	return await apiGet(url);
}

async function getCancelOrders(address, tokenId, orderType, offset = 0, limit = 20) {
	if (!address) {
		address = '';
	}
	if (!tokenId) {
		tokenId = '';
	}
	if (!orderType) {
		orderType = '';
	}
	const url = `${apiEndpoint}/getCancelOrders?address=${address}&tokenId=${tokenId}&orderType=${orderType}&offset=${offset}&limit=${limit}`;
	return await apiGet(url);
}

async function getDealOrders(address, tokenId, orderType, offset = 0, limit = 20) {
	if (!address) {
		address = '';
	}
	if (!tokenId) {
		tokenId = '';
	}
	if (!orderType) {
		orderType = '';
	}
	const url = `${apiEndpoint}/getDealOrders?address=${address}&tokenId=${tokenId}&orderType=${orderType}&offset=${offset}&limit=${limit}`;
	return await apiGet(url);
}

async function getUserOrders(address, tokenId, orderType, offset = 0, limit = 20) {
	if (!address) {
		address = '';
	}
	if (!tokenId) {
		tokenId = '';
	}
	if (!orderType) {
		orderType = '';
	}
	const url = `${apiEndpoint}/getUserOrders?address=${address}&tokenId=${tokenId}&orderType=${orderType}&offset=${offset}&limit=${limit}`;
	return await apiGet(url);
}

async function getOrderById(orderId) {
	const url = `${apiEndpoint}/getOrderById?orderId=${orderId}`;
	return await apiGet(url);
}

async function getConfirmedOps(address, tokenId, opType, offset = 0, limit = 20) {
	if (!address) {
		address = '';
	}
	if (!tokenId) {
		tokenId = '';
	}
	if (!opType) {
		opType = '';
	}
	const url = `${apiEndpoint}/getConfirmedOps?address=${address}&tokenId=${tokenId}&opType=${opType}&offset=${offset}&limit=${limit}`;
	return await apiGet(url);
}

async function getUnconfirmedOps(address, tokenId, opType, offset = 0, limit = 20) {
	if (!address) {
		address = '';
	}
	if (!tokenId) {
		tokenId = '';
	}
	if (!opType) {
		opType = '';
	}
	const url = `${apiEndpoint}/getUnconfirmedOps?address=${address}&tokenId=${tokenId}&opType=${opType}&offset=${offset}&limit=${limit}`;
	return await apiGet(url);
}

async function getStats(tokenId) {
	if (!tokenId) {
		tokenId = '';
	}
	const url = `${apiEndpoint}/getStats?tokenId=${tokenId}`;
	return await apiGet(url);
}

/**
 * Retrieves the market stats for all tokens which have trades in the last 30 days
 * @param sortField The field to sort by ('volume', 'volume30d', 'volume7d', 'volume24h', 'volume6h')
 * @param offset
 * @param limit default 20, max 100
 * @returns
 */
async function getMarketStats(sortField, offset = 0, limit = 20) {
	const url = `${apiEndpoint}/getMarketStats?sortField=${sortField}&offset=${offset}&limit=${limit}`;
	return await apiGet(url);
}

async function makeOrder(tokenId, address, orderType, tokenAmount, satoshis, feePerByte, privateKeyStr) {
	let requestId = '', orderId = '', resultInfo = '';
	let successed = false;
	try {
		const pubKey = FB.getPublicKeyHex(privateKeyStr);
		const param = {
			orderType,
			tokenId,
			address,
			pubKey,
			tokenAmount,
			satoshis,
			feePerByte
		};
		const res = await apiPost(`${apiEndpoint}/makeOrder`, param);
		if (res.code !== 0) {
			console.error('makeOrder failed: %s', JSON.stringify(res));
			resultInfo = JSON.stringify(res);
			return res;
		}
		
		const data = res.data
		const wif = FB.getPrivateKeyWIF(privateKeyStr);
		const sigs = Cat20.signPsbt(data, wif, data.toSignInputs);
		requestId = data.requestId;
			
		const makeRes = await apiPost(`${apiEndpoint}/makeOrderSign`, {
			requestId: requestId,
			sigs: sigs
		});
		if (makeRes.code === 0) {
			orderId = makeRes.data[1];
			successed = true;
		}
		resultInfo = JSON.stringify(makeRes);
		return makeRes;
	} catch (e) {
		resultInfo = `${e.name} | ${e.message} | ${e.stack}`;
		return { code: errorCode, data: e.message };
	} finally {
		let dataParam = {
			tokenId,
			address,
			orderType,
			tokenAmount,
			satoshis,
			feePerByte,
			requestId,
			orderId,
			successed,
			resultInfo
		};
		saveOrderLog(dataParam, 'make');
	}
}

async function takeOrder(orderId, address, feePerByte, privateKeyStr) {
	let requestId = '', resultInfo = '';
	let successed = false;
	try {
		const pubKey = FB.getPublicKeyHex(privateKeyStr);
		const param = { orderId, address, pubKey, feePerByte };
		const res = await apiPost(`${apiEndpoint}/takeOrder`, param);
		
		if (res.code !== 0) {
			console.error('takeOrder failed: %s', JSON.stringify(res));
			resultInfo = JSON.stringify(res);
			return res;
	    }
	
	    const data = res.data
	    const wif = FB.getPrivateKeyWIF(privateKeyStr);
	    const sigs = Cat20.signPsbt(data, wif, data.toSignInputs);
	
	    requestId = data.requestId;
	    const makeRes = await apiPost(`${apiEndpoint}/takeOrderSign`, {
	        requestId: requestId,
	        sigs: sigs
	    });
	    if (makeRes.code === 0) {
			successed = true;
		}
		resultInfo = JSON.stringify(makeRes);
	    return makeRes;
	} catch (e) {
		resultInfo = `${e.name} | ${e.message} | ${e.stack}`;
		return { code: errorCode, data: e.message };
	} finally {
		let dataParam = {
			address,
			feePerByte,
			requestId,
			orderId,
			successed,
			resultInfo
		};
		saveOrderLog(dataParam, 'take');
	}
}

async function cancelOrder(orderId, feePerByte, privateKeyStr) {
	let resultInfo = '';
	let successed = false;
	try {
		const pubKey = FB.getPublicKeyHex(privateKeyStr);
		const param = { orderId, pubKey, feePerByte };
		const res = await apiPost(`${apiEndpoint}/cancelOrder`, param);
		
		if (res.code !== 0) {
			console.error('cancelOrder failed: %s', JSON.stringify(res));
			resultInfo = JSON.stringify(res);
			return res;
		}
		
		const data = res.data
		const wif = FB.getPrivateKeyWIF(privateKeyStr);
		const sigs = Cat20.signPsbt(data, wif, data.toSignInputs);
		
		const makeRes = await apiPost(`${apiEndpoint}/cancelOrderSign`, {
			requestId: data.requestId,
			sigs: sigs
		});
		if (makeRes.code === 0) {
			successed = true;
		}
		resultInfo = JSON.stringify(makeRes);
		return makeRes;
	} catch (e) {
		resultInfo = `${e.name} | ${e.message} | ${e.stack}`;
		return { code: errorCode, data: e.message };
	} finally {
		let dataParam = { feePerByte, orderId, successed, resultInfo };
		saveOrderLog(dataParam, 'cancel');
	}
}


function saveOrderLog(dataParam, path) {
	const token = getServerToken(dataParam);
	postFormHeaders.set('token', token);
	const formData = new URLSearchParams(dataParam).toString();
	fetch(`${server_endpoint}/dex-order/${path}`, { method: 'POST', headers: postFormHeaders, body: formData }).then(console.log);
}

async function apiGet(url) {
	return fetch(url, { method: 'GET', headers: getHeaders}).then(async (res) => {
		const contentType = res.headers.get('content-type');
		if (contentType.includes('json')) {
			return res.json();
		} else {
			return res.text();
		}
	}).then(async (data) => {
		if (typeof data === 'object') {
			return data;
    	} else if (typeof data === 'string') {
	    	return { code: errorCode, data: data };
	    }
	}).catch((e) => {
		return { code: errorCode, data: e.message };
	});
}

async function apiPost(url, param) {
	return fetch(url, { method: 'POST', headers: postHeaders, body: JSON.stringify(param) }).then(async (res) => {
		const contentType = res.headers.get('content-type');
		if (contentType.includes('json')) {
			return res.json();
		} else {
			return res.text();
		}
	}).then(async (data) => {
		if (typeof data === 'object') {
			return data;
    	} else if (typeof data === 'string') {
    		return { code: errorCode, data: data };
	    }
	}).catch((e) => {
		return { code: errorCode, data: e.message };
	});
}

function getServerToken(param) {
	const arr = Object.keys(param).sort();
	let valueArr = [];
	arr.forEach(key => {
		valueArr.push(param[key]);
	});
	const str = valueArr.join('');
	return Safnect.sha1(Safnect.base64Encode(str));
}


module.exports = {
	getOpenOrders,
	getCancelOrders,
	getDealOrders,
	getUserOrders,
	getOrderById,
	getConfirmedOps,
	getUnconfirmedOps,
	getStats,
	getMarketStats,
	makeOrder,
	takeOrder,
	cancelOrder
};

