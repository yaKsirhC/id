import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { BiCoinStack } from "react-icons/bi"
import { HiStatusOnline } from "react-icons/hi"

export default function SuiteWebcam(
    props: {
        lastSocketMessage: any,
        sendSocketMessage: any,
        loading: boolean,
    }
) {

    const [streaming, setStreaming] = useState<boolean>(false)
    const [status, setStatus] = useState<string>('Offline')

    const videoRef = useRef<any>(null)
    const [recorder, setRecorder] = useState<MediaRecorder | null>(null)

    const [tokenAmount, setTokenAmount] = useState<number>(0)
    const [privateRequested, setPrivateRequested] = useState<boolean>(false)

    const acceptPrivateRequest = () => {
        setPrivateRequested(false)
        props.sendSocketMessage({ stream: { event: 'stream:accept-private', data: { message: 'accept' } } })
    }

    useEffect(() => {

        let timer: any;

        if (privateRequested) {
            timer = setTimeout(() => {
                setPrivateRequested(false);
            }, 120 * 1000);
        }

        return () => clearTimeout(timer);

    }, [privateRequested]);

    useEffect(() => {

        if (props.loading === false) {

            const setupCam = async () => {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true, video: true
                });
                videoRef.current.srcObject = stream;
            }

            setupCam()
        }

    }, [props.loading])

    const startStream = async () => {
        const recorder = new MediaRecorder(videoRef.current.srcObject)

        recorder.addEventListener('dataavailable', (event) => {
            const blob = new Blob([event.data], { type: 'video/webm' });
            console.log(blob)
            props.sendSocketMessage({ stream: { event: 'stream:video', data: { video: blob } } })
        });

        recorder.start(3000);
        setRecorder(recorder)
        setStreaming(true)
    }

    const stopCam = () => {
        const videoTracks = videoRef.current.srcObject.getVideoTracks();
        const audioTracks = videoRef.current.srcObject.getAudioTracks();

        videoTracks.forEach((track: any) => track.stop());
        audioTracks.forEach((track: any) => track.stop());

        videoRef.current.srcObject = null;
    };

    const stopStream = () => {
        if (recorder) {
            setStatus('Offline')
            props.sendSocketMessage({ stream: { event: 'stream:stop' } })
            recorder.stop();
            stopCam()
            setRecorder(null);
            setStreaming(false);
            window.location.href = `https://id-sepia.vercel.app/app`
        }
    };

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    useEffect(() => {

        if (props.lastSocketMessage && props.lastSocketMessage?.event) {

            const { event, data } = props.lastSocketMessage
            if (!event) return

            if (event === 'room:status') {
                setStatus(data.status)
            }

            if (event === 'room:tip') {
                const amount = (tokenAmount + Number(data.amount))
                setTokenAmount(amount)
            }

            if (event === 'suite:tokens') {
                const amount = (tokenAmount + Number(data.amount))
                setTokenAmount(amount)
            }

            if(event === 'room:private') {
                setPrivateRequested(true)
            }

        }

    }, [props.lastSocketMessage])

    return (
        <div className="w-full flex flex-col">
            <video ref={videoRef} autoPlay muted className='w-full rounded-lg' />
            {
                streaming ?
                    <button className="mt-2 p-3 w-full rounded-lg bg-red-500 text-white" onClick={() => stopStream()}>Stop Stream</button>
                    :
                    <button className="mt-2 p-3 w-full rounded-lg bg-green-500 text-white" onClick={() => startStream()}>Start Stream</button>
            }
            <div className="mt-2 rounded-lg p-3 bg-slate-200 text-slate-900 flex flex-row items-center">
                <BiCoinStack /> <p className="ml-2">{tokenAmount} Tokens Made (~{formatter.format(tokenAmount * 0.025)})</p>
            </div>
            <div className="mt-2 rounded-lg p-3 bg-slate-200 text-slate-900 flex flex-row items-center">
                <HiStatusOnline /> <p className="ml-2">Stream Status: {status}</p>
            </div>

            {
                privateRequested ?
                    <div className="mt-2 rounded-lg p-3 bg-slate-200 text-slate-900 flex flex-row items-center">
                        <p>Someone requested a Private Show! <br /> <a className="text-green-400 cursor-pointer underline" onClick={() => acceptPrivateRequest()}>Accept</a></p>
                    </div>
                    :
                    null
            }

        </div>
    )
}