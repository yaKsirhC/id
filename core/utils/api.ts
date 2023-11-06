import axios from "axios";
import { parseCookies, setCookie } from "nookies";

export function getAPI(ctx?: any) {

    const { 'nextauth.token': token, 'nextauth.refreshtoken': refreshtoken } = parseCookies(ctx)

    const api = axios.create({
        baseURL: 'https://api.cliq.live/'
    })

    api.interceptors.response.use(
        (response) => {
            return response;
        },
        async function (error) {
            if (error.response.status === 401 && error.response.data.message === 'Token not provided') {
                const response: any = await refreshToken(error);
                if (response.status !== 401) {
                    return response;
                }
            }
            return Promise.reject(error);
        }
    );
    async function refreshToken(error: any) {
        return new Promise((resolve, reject) => {
            try {
                api.post('/auth/refresh', {
                    refreshToken: refreshtoken
                })
                    .then(async (res) => {
                        setCookie(ctx, 'nextauth.token', res.data.token, {
                            maxAge: 7200,
                            path: '/'
                        })
                        setCookie(ctx, 'nextauth.refreshtoken', res.data.refreshToken, {
                            maxAge: 10800,
                            path: '/'
                        })
                        let config = error.config
                        let new_headers = {
                            ...config.headers,
                            token: `Bearer ${res.data.token}`
                        }
                        config.headers = new_headers
                        resolve(axios.request(error.config))
                    })
                    .catch((err) => {
                        return reject(error);
                    })
            } catch (err) {
                return reject(err);
            }
        });
    };

    if (token) {
        api.defaults.headers['token'] = `Bearer ${token}`;
    }

    return api;
}