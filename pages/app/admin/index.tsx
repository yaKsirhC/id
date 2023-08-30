import moment from "moment"
import { useContext, useEffect, useState } from "react"
import { AiOutlineAppstore, AiOutlineCamera, AiOutlineClockCircle, AiOutlineCreditCard, AiOutlineLink, AiOutlineLoading, AiOutlineVideoCamera } from "react-icons/ai"
import { BiCoinStack } from "react-icons/bi"
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
    const [withdrawals, setWithdrawals] = useState<{
        _id: string,
        user: IUser,
        amountTokens: number,
        amountUSD: number,
        paid: boolean,
        receiver: {
            provider: string, // Cash App, Zelle, Apple Pay
            data: string, // phone number / username
        },
        createdAt: Date,
    }[]>([])

    const [stats, setStats] = useState<any[]>([])

    const loadStuff = async () => {

        const api = getAPI()
        let promises = []
        promises.push(
            api.get('/admin/withdrawals')
                .then((res) => {
                    setWithdrawals(res.data.withdrawals)
                })
                .catch(() => {
                    setWithdrawals([])
                })
        )
        promises.push(
            api.get('/admin/analytics')
                .then((res) => {
                    setStats(res.data.stats)
                })
                .catch(() => {
                    setStats([])
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

    const [requesting, setRequesting] = useState<boolean>(false)

    const setPaid = async (id: string) => {

        if (requesting) return
        setRequesting(true)

        const api = getAPI()
        await api.post('/admin/withdraw', {
            id
        })
            .then((res) => {

                const old = withdrawals
                const index = old.findIndex(e => e._id.toString() === id)
                if (index >= 0) {
                    old[index].paid = true
                }

                setWithdrawals(old)
                setRequesting(false)
                toast.success('Updated')

            })
            .catch((err) => {
                toast.error('Not possible to update')
                setRequesting(false)
            })

    }

    return (
        <Layout>
            <h2 className="font-semibold text-3xl">Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
                <div className="w-full rounded-lg bg-slate-200 p-4 flex flex-col">
                    <div className="flex flex-row items-center justify-between">
                        <p>Last 7 days</p>
                        <AiOutlineCreditCard />
                    </div>
                    <h2 className="text-semibold text-3xl mt-6">{loading ? '...' : formatter.format(stats.filter((e: any) => e.days === '7d')[0]?.tokens * 0.05)}</h2>
                </div>
                <div className="w-full rounded-lg bg-slate-200 p-4 flex flex-col">
                    <div className="flex flex-row items-center justify-between">
                        <p>Last 30 days</p>
                        <AiOutlineCreditCard />
                    </div>
                    <h2 className="text-semibold text-3xl mt-6">{loading ? '...' : formatter.format(stats.filter((e: any) => e.days === '30d')[0]?.tokens * 0.05)}</h2>
                </div>
                <div className="w-full rounded-lg bg-slate-200 p-4 flex flex-col">
                    <div className="flex flex-row items-center justify-between">
                        <p>All time</p>
                        <AiOutlineCreditCard />
                    </div>
                    <h2 className="text-semibold text-3xl mt-6">{loading ? '...' : formatter.format(stats.filter((e: any) => e.days === 'alltime')[0]?.tokens * 0.05)}</h2>
                </div>
            </div>

            <p className="text-slate-500 mt-8 mb-2">Payouts</p>

            {
                loading ?
                    <AiOutlineLoading className="animate-spin" />
                    :
                    withdrawals.length === 0 ?
                        <p className="text-slate-500">No record found</p>
                        :
                        <div className="flex flex-col max-w-[1000px]">
                            <div className="overflow-x-auto">
                                <div className="inline-block min-w-full py-2">
                                    <div className="overflow-hidden">
                                        <table className="min-w-full text-left text-sm font-light">
                                            <thead className="border-b font-medium dark:border-neutral-500">
                                                <tr>
                                                    <th scope="col" className="px-6 py-4">User</th>
                                                    <th scope="col" className="px-6 py-4">Date</th>
                                                    <th scope="col" className="px-6 py-4">Amount</th>
                                                    <th scope="col" className="px-6 py-4">Receiver</th>
                                                    <th scope="col" className="px-6 py-4">Status</th>
                                                    <th scope="col" className="px-6 py-4">Update</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    withdrawals.map((s) => {
                                                        return (
                                                            <tr key={s._id.toString()} className="border-b dark:border-neutral-500">
                                                                <td className="whitespace-nowrap px-6 py-4">{s.user.identifier} ({s.user.account_username})</td>
                                                                <td className="whitespace-nowrap px-6 py-4">{moment(s.createdAt).format('MMM, DD')}</td>
                                                                <td className="whitespace-nowrap px-6 py-4">{s.amountTokens} (~{formatter.format(s.amountTokens * 0.025)})</td>
                                                                <td className="whitespace-nowrap px-6 py-4">{s.receiver.provider} | {s.receiver.data}</td>
                                                                <td className="whitespace-nowrap px-6 py-4">{s.paid ? 'Paid' : 'Pending'}</td>
                                                                <td className="whitespace-nowrap px-6 py-4"><a onClick={() => {
                                                                    if (!s.paid) {
                                                                        setPaid(s._id.toString())
                                                                    }
                                                                }} className={`${s.paid ? 'cursor-not-allowed' : 'cursor-pointer underline'}`}>{s.paid ? '...' : 'Mark as paid'}</a></td>
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