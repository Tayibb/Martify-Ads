export function postRequest(url, body, headers) {
	return fetch(url, {
		method: 'POST',
		headers: headers ? headers : { 'Content-Type': 'application/json' },
		body: headers ? body : JSON.stringify(body),
	}).then(checkHTTPErrors)
}

/**
 *  For handling all types of http errors
 * @param {*} response
 * @returns response.json
 */
async function checkHTTPErrors(response) {
	if (!response.ok) {
		if (response.status === 401)
			throw new Error('You do not have the correct permissions for this action')
		if (response.status === 404) return response.json()
		const error = await response.json()
		throw new Error(error.Reason || response.statusText)
	}
	return response.json()
}