import moment from "moment"
import { useContext, useEffect, useState } from "react"
import { AiOutlineAppstore, AiOutlineCamera, AiOutlineClockCircle, AiOutlineCreditCard, AiOutlineLink, AiOutlineLoading, AiOutlineVideoCamera } from "react-icons/ai"
import { BiCoinStack } from "react-icons/bi"
import { FiX } from "react-icons/fi"
import { HiGlobeAlt, HiOutlineGlobe, HiOutlineGlobeAlt } from "react-icons/hi"
import { HiOutlineSignal } from "react-icons/hi2"
import { toast } from "react-toastify"
import Layout from "../../../core/components/layout/Layout"
import { UserContext } from "../../../core/context/UserContext"
import { IStream } from "../../../core/types/stream.type"
import { IUser } from "../../../core/types/user.type"
import { getAPI } from "../../../core/utils/api"
import { isAuth } from "../../../core/utils/isAuth"

export default function AppHome() {

    const { user } = useContext(UserContext)

    const [loading, setLoading] = useState<boolean>(true)
    const [accounts, setAccounts] = useState<{
    }[]>([])

    const [stats, setStats] = useState<any[]>([])

    const loadStuff = async () => {

        const api = getAPI()
        let promises = []
        promises.push(
            api.get('/admin/accounts')
                .then((res) => {
                    setAccounts(res.data.accounts)
                })
                .catch(() => {
                    setAccounts([])
                })
        )
        await Promise.all(promises)
        setLoading(false)

    }

    useEffect(() => {
        loadStuff()
    }, [])

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const [modal, setModal] = useState<boolean>(false)
    const [requesting, setRequesting] = useState<boolean>(false)
    const [identifier, setIdentifier] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    // const [email, setEmail] = useState<string>('')

    const createAccount = async () => {

        if (requesting) return

        if (identifier === '' || username === '' || password === '' || name === '') {
            toast.warning('Please, fill the form')
            return
        }

        setRequesting(true)

        const api = getAPI()
        await api.post('/admin/create', {
            identifier,
            username,
            name,
            password,
            email: "email@email.com",
        })
        .then((res) => {

            toast.success('Account created')

            const account = res.data.account
            let obj = {
                ...account,
                totalMade: 0,
                lastStreamed: 'Never'
            }
            let accs = [obj, ...accounts]
            setAccounts(accs)

            setModal(false)
            setUsername('')
            setIdentifier('')
            setPassword('')
            setRequesting(false)

        })
        .catch((err) => {
            toast.error('Not possible to create account')
            setRequesting(false)
        })

    }

    return (
        <Layout>

            {
                modal ?
                    <div className='fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-4'>
                        <div className='p-4 rounded-lg bg-white md:min-w-[500px]'>

                            <div className='flex flex-row items-center justify-between'>

                                <h2 className='text-slate-900 font-semibold'>Create Account</h2>
                                <FiX className='cursor-pointer text-slate-900' onClick={() => setModal(false)} />

                            </div>

                            <p className='text-sm text-slate-600 mt-8'>Please, write an identifier for the user</p>
                            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} type="text" placeholder='Bella' className='p-2 w-full bg-slate-100 rounded-md text-slate-900 mt-2 placeholder:text-slate-500 outline-none' />

                            <p className='text-sm text-slate-600 mt-8'>Please, write the full name of the user (for CB validation)</p>
                            <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder='Bella Zenn' className='p-2 w-full bg-slate-100 rounded-md text-slate-900 mt-2 placeholder:text-slate-500 outline-none' />

                            <p className='text-sm text-slate-600 mt-8'>Please, write the chaturbate account username</p>
                            <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder='Chaturbate Username' className='p-2 w-full bg-slate-100 rounded-md text-slate-900 mt-2 placeholder:text-slate-500 outline-none' />

                            <p className='text-sm text-slate-600 mt-8'>Please, write the chaturbate account password</p>
                            <input value={password} onChange={(e) => setPassword(e.target.value)} type="text" placeholder='Chaturbate Password' className='p-2 w-full bg-slate-100 rounded-md text-slate-900 mt-2 placeholder:text-slate-500 outline-none' />

                            <div className='mt-6 flex flex-row items-center justify-end'>
                                <button className='px-6 py-2 rounded-md bg-slate-100 text-slate-900' onClick={() => setModal(false)}>Close</button>
                                <button className='px-6 py-2 rounded-md bg-blue-500 ml-2 text-white' onClick={() => createAccount()}>Create</button>
                            </div>


                        </div>
                    </div>
                    :
                    null
            }

            <h2 className="font-semibold text-3xl">Accounts</h2>

            <button onClick={() => setModal(true)} className="w-fit bg-slate-900 text-white px-6 py-2 rounded-full text-sm mt-6">Create Account</button>

            <p className="text-slate-500 mt-8 mb-2">Accounts</p>

            {
                loading ?
                    <AiOutlineLoading className="animate-spin" />
                    :
                    accounts.length === 0 ?
                        <p className="text-slate-500">No record found</p>
                        :
                        <div className="flex flex-col max-w-[1000px]">
                            <div className="overflow-x-auto">
                                <div className="inline-block min-w-full py-2">
                                    <div className="overflow-hidden">
                                        <table className="min-w-full text-left text-sm font-light">
                                            <thead className="border-b font-medium dark:border-neutral-500">
                                                <tr>
                                                    <th scope="col" className="px-6 py-4">Authentication Token</th>
                                                    <th scope="col" className="px-6 py-4">Identifier</th>
                                                    <th scope="col" className="px-6 py-4">Total Made</th>
                                                    <th scope="col" className="px-6 py-4">Last Streamed</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    accounts.map((s: any) => {
                                                        return (
                                                            <tr key={s._id.toString()} className="border-b dark:border-neutral-500">
                                                                <td className="whitespace-nowrap px-6 py-4">{s.token}</td>
                                                                <td className="whitespace-nowrap px-6 py-4">{s.identifier} ({s.account_username})</td>
                                                                <td className="whitespace-nowrap px-6 py-4">{s.totalMade} (~{formatter.format(s.totalMade * 0.025)})</td>
                                                                <td className="whitespace-nowrap px-6 py-4">{moment(s.lastStreamed).format('MMM, DD')}</td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
            }

        </Layout>
    )
}

export const getServerSideProps = isAuth()