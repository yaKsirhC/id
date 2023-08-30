import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { AiOutlineLoading } from "react-icons/ai"
import useRealtime from "../../../utils/useRealtime"
import SuiteMessages from "./SuiteMessages"
import SuiteWebcam from "./SuiteWebcam"

export default function StreamingSuite() {

    const [loading, setLoading] = useState<boolean>(true)
    const { lastMessage, sendMessage } = useRealtime('stream')

    const loadSuite = async () => {

        await new Promise(r => setTimeout(r, 3000))
        sendMessage({ stream: { event: 'stream:start' } })

    }

    useEffect(() => {

        if (lastMessage && lastMessage?.event) {

            const { event } = lastMessage
            if (!event) return

            if (event === 'suite:ready') {
                setLoading(false)
            }

        }

    }, [lastMessage])

    useEffect(() => {

        let interval: any

        if (loading === false) {

            interval = setInterval(() => {
                sendMessage({ stream: { event: 'stream:ping' } })
            }, 10000)
        }

        return () => clearInterval(interval)

    }, [loading])

    useEffect(() => {
        loadSuite()
    }, [])

    useEffect(() => {
        const handleBeforeUnload = (event: any) => {
            event.preventDefault();
            event.returnValue = ''; // This line is necessary for Chrome
            sendMessage({ stream: { event: 'stream:stop' } })
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return (
        <>
            {
                loading ?
                    <div className="flex flex-col items-center justify-center w-full h-full">
                        <AiOutlineLoading className="animate-spin text-slate-900 m-auto text-2xl" />
                    </div>
                    :
                    <div className="w-full h-full grid grid-cols-3 max-w-[1100px] gap-6 flex-grow z-10">

                        <SuiteWebcam lastSocketMessage={lastMessage} sendSocketMessage={sendMessage} loading={loading} />
                        <SuiteMessages lastSocketMessage={lastMessage} sendSocketMessage={sendMessage} />

                    </div>
            }
        </>
    )
}