import moment from "moment"
import { useContext, useEffect, useState } from "react"
import { AiOutlineAppstore, AiOutlineCamera, AiOutlineClockCircle, AiOutlineCreditCard, AiOutlineLink, AiOutlineLoading, AiOutlineVideoCamera } from "react-icons/ai"
import { BiCoinStack } from "react-icons/bi"
import { HiGlobeAlt, HiOutlineGlobe, HiOutlineGlobeAlt } from "react-icons/hi"
import { HiOutlineSignal } from "react-icons/hi2"
import Layout from "../../core/components/layout/Layout"
import { UserContext } from "../../core/context/UserContext"
import { IStream } from "../../core/types/stream.type"
import { getAPI } from "../../core/utils/api"
import { isAuth } from "../../core/utils/isAuth"

export default function AppHome() {

    const { user } = useContext(UserContext)

    const [loading, setLoading] = useState<boolean>(true)
    const [streams, setStreams] = useState<IStream[]>([])

    const [averageTokens, setAverageTokens] = useState<number>(0)
    const [averageTime, setAverageTime] = useState<string>('')

    const loadStuff = async () => {

        const api = getAPI()
        let promises = []
        promises.push(
            api.get('/user/streams')
                .then((res) => {
                    setStreams(res.data.streams)
                    setAverageTime(res.data.averageDuration)
                    setAverageTokens(res.data.averageTokens)
                })
                .catch(() => {
                    setStreams([])
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

    function convertSecondsToString(seconds: number) {
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);

        if (hours === 0) {
            return hours + "h" + minutes + "m";
        } else {
            return hours + "h" + ("0" + minutes).slice(-2) + "m";
        }
    }

    return (
        <Layout>
            <h2 className="font-semibold text-3xl">Overview</h2>

            <p className="text-slate-500 mt-8 mb-2">Balance (~{formatter.format(user!.balance * 0.025)})</p>
            <h2 className="text-3xl font-semibold flex flex-row items-center"><BiCoinStack className="mr-3" /> {user!.balance} tokens</h2>

            <p className="text-slate-500 mt-8 mb-2">Good to know</p>
            <h2 className="font-bold flex flex-row items-center relative pl-[10px]"><div className="absolute top-1/2 transform -translate-y-1/2 left-0 w-[5px] h-[80%] bg-yellow-500 mr-2"></div> Your stream average duration is {loading ? '...' : averageTime}</h2>
            <h2 className="font-bold flex flex-row items-center relative pl-[10px]"><div className="absolute top-1/2 transform -translate-y-1/2 left-0 w-[5px] h-[80%] bg-yellow-500 mr-2"></div> You make an average of {loading ? '...' : averageTokens} tokens per stream</h2>

            <p className="text-slate-500 mt-8 mb-2">Last Streams</p>

            {
                loading ?
                    <AiOutlineLoading className="animate-spin" />
                    :
                    streams.length === 0 ?
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
                                                    <th scope="col" className="px-6 py-4">Duration</th>
                                                    <th scope="col" className="px-6 py-4">Tokens Made</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    streams.map((s) => {
                                                        return (
                                                            <tr key={s._id.toString()} className="border-b dark:border-neutral-500">
                                                                <td className="whitespace-nowrap px-6 py-4">{moment(s.createdAt).format('MMM, DD')}</td>
                                                                <td className="whitespace-nowrap px-6 py-4">
                                                                    <div className="flex flex-row items-center">
                                                                        <AiOutlineClockCircle className="mr-2" /> {convertSecondsToString(s.seconds)}
                                                                    </div>
                                                                </td>
                                                                <td className="whitespace-nowrap px-6 py-4">{s.tokens} (~{formatter.format(s.tokens * 0.025)})</td>
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