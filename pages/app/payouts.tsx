import moment from "moment"
import { useContext, useEffect, useState } from "react"
import { AiOutlineAppstore, AiOutlineCamera, AiOutlineClockCircle, AiOutlineCreditCard, AiOutlineLink, AiOutlineLoading, AiOutlineVideoCamera } from "react-icons/ai"
import { BiCoinStack } from "react-icons/bi"
import { FiX } from "react-icons/fi"
import { HiGlobeAlt, HiOutlineGlobe, HiOutlineGlobeAlt } from "react-icons/hi"
import { HiOutlineSignal } from "react-icons/hi2"
import { toast } from "react-toastify"
import Layout from "../../core/components/layout/Layout"
import { UserContext } from "../../core/context/UserContext"
import { IStream } from "../../core/types/stream.type"
import { IWithdraw } from "../../core/types/withdraw.type"
import { getAPI } from "../../core/utils/api"
import { isAuth } from "../../core/utils/isAuth"

export default function AppHome() {

    const { user, removeBalance } = useContext(UserContext)

    const [loading, setLoading] = useState<boolean>(true)
    const [withdrawals, setWithdrawals] = useState<IWithdraw[]>([])

    const [modal, setModal] = useState<boolean>(false)
    const [requesting, setRequesting] = useState<boolean>(false)
    const [amountTokens, setAmountTokens] = useState<number>(0)
    const [type, setType] = useState<string>('Zelle')
    const [receiver, setReceiver] = useState<string>('')

    const requestWithdraw = async () => {

        if (requesting) return
        if (amountTokens > user!.balance) {
            toast.warning('You do not have enough balance')
            return
        }

        if (receiver === '') {
            toast.warning('Please, fill the form')
            return
        }

        setRequesting(true)
        const api = getAPI()

        await api.post('/user/withdraw', {
            amount: amountTokens,
            provider: type,
            receiver,
        })
            .then((res) => {

                const request = res.data.withdraw
                let old = [request, ...withdrawals]
                setWithdrawals(old)
                toast.success('Request successfully made')
                setModal(false)
                setReceiver('')
                setType('Zelle')
                setRequesting(false)
                removeBalance(amountTokens)

            })
            .catch((err) => {
                if (err.response && err.response?.data?.message) {
                    toast.error(err.response.data.message)
                } else {
                    toast.error('Not possible to request withdraw')
                }
                setRequesting(false)
            })

    }

    const loadStuff = async () => {

        const api = getAPI()
        let promises = []
        promises.push(
            api.get('/user/withdrawals')
                .then((res) => {
                    setWithdrawals(res.data.withdrawals)
                })
                .catch(() => {
                    setWithdrawals([])
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

    return (
        <Layout>

            {
                modal ?
                    <div className='fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-4'>
                        <div className='p-4 rounded-lg bg-white md:min-w-[500px]'>

                            <div className='flex flex-row items-center justify-between'>

                                <h2 className='text-slate-900 font-semibold'>Request Withdraw</h2>
                                <FiX className='cursor-pointer text-slate-900' onClick={() => setModal(false)} />

                            </div>

                            <p className='text-sm text-slate-600 mt-8'>Please, write the amount of tokens you would like to withdraw</p>
                            <input defaultValue={0} type="number" onChange={(e) => setAmountTokens(Number(e.target.value))} className='p-2 w-full bg-slate-100 rounded-md text-slate-900 mt-2 placeholder:text-slate-500 outline-none' />
                            <p className='text-slate-600 mt-2 text-sm'>~{formatter.format(amountTokens * 0.025)}</p>

                            <p className='text-sm text-slate-600 mt-6'>Please, select how you would like to receive the money</p>
                            <select className='bg-slate-100 w-full p-2 rounded-md text-slate-900 mt-2 outline-none' value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="Zelle">Zelle</option>
                                <option value="Cash App">Cash App</option>
                                <option value="Apple Pay">Apple Pay</option>
                            </select>

                            <p className='text-sm text-slate-600 mt-6'>Write your information to receive the money</p>
                            <input value={receiver} onChange={(e) => setReceiver(e.target.value)} type="text" placeholder='Phone number, email or username' className='p-2 w-full bg-slate-100 rounded-md text-slate-900 mt-2 placeholder:text-slate-500 outline-none' />

                            <div className='mt-6 flex flex-row items-center justify-end'>
                                <button className='px-6 py-2 rounded-md bg-slate-100 text-slate-900' onClick={() => setModal(false)}>Close</button>
                                <button className='px-6 py-2 rounded-md bg-blue-500 ml-2 text-white' onClick={() => requestWithdraw()}>Request</button>
                            </div>


                        </div>
                    </div>
                    :
                    null
            }

            <h2 className="font-semibold text-3xl">Payouts</h2>

            <p className="text-slate-500 mt-8 mb-2">Balance (~{formatter.format(user!.balance * 0.025)})</p>
            <h2 className="text-3xl font-semibold flex flex-row items-center"><BiCoinStack className="mr-3" /> {user!.balance} tokens</h2>

            <button onClick={() => setModal(true)} className="w-fit bg-slate-900 text-white px-6 py-2 rounded-full text-sm mt-6">Request Withdrawal</button>

            <p className="text-slate-500 mt-8 mb-2">Withdrawals</p>

            {
                loading ?
                    <AiOutlineLoading className="animate-spin" />
                    :
                    withdrawals.length === 0 ?
                        <p className="text-slate-500">No record found</p>
                        :
                        <div className="flex flex-col max-w-[600px]">
                            <div className="overflow-x-auto">
                                <div className="inline-block min-w-full py-2">
                                    <div className="overflow-hidden">
                                        <table className="min-w-full text-left text-sm font-light">
                                            <thead className="border-b font-medium dark:border-neutral-500">
                                                <tr>
                                                    <th scope="col" className="px-6 py-4">Date</th>
                                                    <th scope="col" className="px-6 py-4">Amount</th>
                                                    <th scope="col" className="px-6 py-4">Receiver</th>
                                                    <th scope="col" className="px-6 py-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    withdrawals.map((s) => {
                                                        return (
                                                            <tr key={s._id.toString()} className="border-b dark:border-neutral-500">
                                                                <td className="whitespace-nowrap px-6 py-4">{moment(s.createdAt).format('MMM, DD')}</td>
                                                                <td className="whitespace-nowrap px-6 py-4">{s.amountTokens} (~{formatter.format(s.amountTokens * 0.025)})</td>
                                                                <td className="whitespace-nowrap px-6 py-4">{s.receiver.provider} | {s.receiver.data}</td>
                                                                <td className="whitespace-nowrap px-6 py-4">{s.paid ? 'Paid' : 'Pending'}</td>
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