import { useRouter } from "next/router"
import { destroyCookie, setCookie } from "nookies"
import { useContext } from "react"
import { AiOutlineAppstore, AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineCreditCard, AiOutlineUser, AiOutlineVideoCamera } from "react-icons/ai"
import { HiOutlineGlobeAlt } from "react-icons/hi"
import { UserContext } from "../../context/UserContext"
export default function Sidebar() {

    const { user } = useContext(UserContext)
    const router = useRouter()

    const tabs = [
        {
            name: 'Overview',
            admin: false,
            route: '/app',
            icon: <AiOutlineAppstore />
        },
        {
            name: 'Payouts',
            admin: false,
            route: '/app/payouts',
            icon: <AiOutlineCreditCard />
        },
        {
            name: 'Streaming Suite',
            admin: false,
            route: '/app/suite',
            icon: <AiOutlineVideoCamera />
        },
        {
            name: 'Analytics',
            admin: true,
            route: '/app/admin',
            icon: <AiOutlineAppstore />
        },
        {
            name: 'Accounts',
            admin: true,
            route: '/app/admin/accounts',
            icon: <AiOutlineUser />
        },
    ]

    const signOut = async () => {
        destroyCookie(undefined, 'nextauth.refreshtoken', { path: '/' })
        destroyCookie(undefined, 'nextauth.token', { path: '/' })
        window.location.href = 'https://cliq.live/'
    }

    return (
        <div className="fixed top-0 left-0 w-[80px] lg:w-[280px] p-6 lg:p-8 flex flex-col justify-between border-r border-slate-300 h-full">

            <div className="flex flex-col w-full">
                <div className="flex flex-row items-center">
                    <HiOutlineGlobeAlt className="text-3xl mr-2" />
                    <h2 className="font-semibold text-3xl hidden lg:block">cliq.live</h2>
                </div>

                <div className="w-full flex flex-col mt-8">
                    {
                        user!.admin ?
                            tabs.filter(e => e.admin === true).map((t) => {
                                return (
                                    <div key={t.route} onClick={() => {
                                        window.location.href = `https://cliq.live${t.route}`
                                    }} className={`mt-3 cursor-pointer flex flex-row items-center ${router.pathname === t.route ? 'bg-blue-100' : 'text-slate-500 hover:bg-blue-50 transition-all duration-300'} p-2`}>
                                        <div className="text-xl">{t.icon}</div>
                                        <p className="ml-2 hidden lg:block">{t.name}</p>
                                    </div>
                                )
                            })
                            :
                            tabs.filter(e => e.admin === false).map((t) => {
                                return (
                                    <div key={t.route} onClick={() => {
                                        window.location.href = `https://cliq.live${t.route}`
                                    }} className={`mt-3 cursor-pointer flex flex-row items-center ${router.pathname === t.route ? 'bg-blue-100' : 'text-slate-500 hover:bg-blue-50 transition-all duration-300'} p-2`}>
                                        <div className="text-xl">{t.icon}</div>
                                        <p className="ml-2 hidden lg:block">{t.name}</p>
                                    </div>
                                )
                            })
                    }
                </div>
            </div>

            <button onClick={() => signOut()} className="w-fit bg-slate-200 text-slate-500 p-2 rounded-full text-sm">
                <p className="hidden lg:block">Sign out</p>
                <AiOutlineArrowLeft className="block lg:hidden" />
            </button>

        </div>
    )
}