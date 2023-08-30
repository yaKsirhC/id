import { parseCookies } from "nookies";
import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { ContextData, IUser } from "../types/user.type";
import { getAPI } from "../utils/api";

export const UserContext = React.createContext<ContextData>({} as ContextData)

export const UserProvider = (props: { children: React.ReactNode }) => {

    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<IUser | null>(null)

    const { 'nextauth.token': token, 'nextauth.refreshtoken': refreshtoken } = parseCookies()

    const loadUser = async () => {
        if (token || refreshtoken) {
            const api = getAPI()
            await api.get('/user/me')
                .then((res) => {
                    setUser(res.data.user)
                    setLoading(false)
                })
                .catch((err) => {
                    setUser(null)
                    setLoading(false)
                })
        } else {
            setUser(null)
            setLoading(false)
        }
    }

    const removeBalance = (amount: number) => {
        let oldUser = user
        oldUser!.balance = amount
        setUser(oldUser)
    }

    useEffect(() => {
        loadUser()
    }, [])

    return (
        <UserContext.Provider value={{ user, removeBalance }}>
            {
                loading ?
                    <Loader />
                    :
                    props.children
            }
        </UserContext.Provider>
    )

}