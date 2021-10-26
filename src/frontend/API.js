import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3001'
// TODO: modify instance defaults for dev.
// TODO: replace axios by something else.

export async function getAffaires() {
	try {
		const response = await axios.get('/api/v1/affaires')
		if (response.status !== 200) {
			throw new Error("Invalid status code");
		}
		return response.data
	} catch (error) {
		console.error(error);
	}
}

export async function getAffaire(id) {
	try {
		const response = await axios.get(`/affaires/${id}/pieces`)
		return response.data
	} catch (error) {
		console.error(error);
	}
}

export async function getLatestAnalysis(id) {
	try {
		const response = await axios.get(`http://localhost:8000/api/v1/analysis/${id}`)
		return response.data
	} catch (error) {
		console.error(error)
	}
}

export async function requestAnalysis(id) {
	try {
		const response = await axios.post(`http://localhost:8000/api/v1/analyze`, { case_id: id })
		return response.data
	} catch (error) {
		console.error(error)
	}
}
