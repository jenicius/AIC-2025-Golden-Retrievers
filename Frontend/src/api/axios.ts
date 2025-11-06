import axios from 'axios';

const api = axios.create({ 
    baseURL: 'https://eventretrieval.oj.io.vn/api/v2/',
    headers: {'X-Custom-Header': 'foobar'}
});

export default api;