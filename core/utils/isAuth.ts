import { destroyCookie, parseCookies, setCookie } from "nookies"
import { getAPI } from "./api"

export function isAuth() {

    return async (ctx: any) => {

        const { 'nextauth.token': token, 'nextauth.refreshtoken': refreshtoken } = parseCookies(ctx)

        const path = String(ctx.req.url)

        let hasToken = false
        if (token || refreshtoken) {
            hasToken = true
        }

        let user: any = null
        const api = getAPI(ctx)

        if (!hasToken) {

            if (path.startsWith('/app')) {
                return {
                    redirect: {
                        destination: '/',
                        permanent: false
                    }
                }
            }

        } else {

            let admin: boolean = false

            await api.get('/user/me', {
                headers: {
                    Accept: 'application/json',
                    'Accept-Encoding': 'identity'
                },
                params: {
                    trophies: true
                }
            })
                .then((res) => {
                    user = res.data.user
                })
                .catch((err) => {
                    destroyCookie(ctx, 'nextauth.token')
                    destroyCookie(ctx, 'nextauth.refreshtoken')
                    return {
                        redirect: {
                            destination: '/',
                            permanent: false
                        }
                    }
                })

            if (user.admin) {
                admin = true
            }

            if (path === '/') {
                return {
                    redirect: {
                        destination: '/app',
                        permanent: false
                    }
                }
            }

            if (!user.verified && !user.admin && path !== '/app/validation') {
                return {
                    redirect: {
                        destination: '/app/validation',
                        permanent: false
                    }
                }
            }

            if (admin && !path.includes('admin')) {
                return {
                    redirect: {
                        destination: '/app/admin',
                        permanent: false
                    }
                }
            }

        }

        return {
            props: {
                user
            }
        }

    }


}