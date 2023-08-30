import { useEffect, useRef, useState } from "react"
import { BiLink } from "react-icons/bi"
import { FiSend } from "react-icons/fi"

export default function SuiteMessages(props: {
    sendSocketMessage: any,
    lastSocketMessage: any,
}) {

    const [privateOpen, setPrivateOpen] = useState<boolean>(false)
    const [privateChat, setPrivateChat] = useState<string>('')

    const [messageToSend, setMessageToSend] = useState<string>('')

    const privateChatRef = useRef<any>(null)
    const globalChatRef = useRef<any>(null)

    const [privateMessages, setPrivateMessages] = useState<{
        user: string,
        messages: {
            id: string,
            message: string,
            me: boolean,
            new: boolean,
        }[]
    }[]>([])

    const [globalMessages, setGlobalMessages] = useState<{
        id: string,
        tip: boolean,
        user: string,
        message?: string,
        amount?: number,
    }[]>([])

    const [unseen, setUnseen] = useState<number>(0)

    const pushChatBottom = (global: boolean) => {
        if (global) {
            if (globalChatRef.current === null) return
            let YH = globalChatRef.current.scrollHeight
            globalChatRef.current.scroll({
                top: YH + 155,
                behavior: 'smooth'
            })
        } else {
            if (privateChatRef.current === null) return
            let YH = privateChatRef.current.scrollHeight
            privateChatRef.current.scroll({
                top: YH + 155,
                behavior: 'smooth'
            })
        }
    }

    const updatePrivateMessages = (newPms: any) => {
        setPrivateMessages([...newPms])
    }

    useEffect(() => {

        if (privateChat) {

            const index = privateMessages.findIndex(e => e.user === privateChat)
            if (index >= 0) {

                props.sendSocketMessage({ stream: { event: 'suite:seen', data: { chat: privateChat }} })

                let oldChats = privateMessages
                let oldMessages = oldChats[index].messages
                let filter = oldMessages.filter(e => e.new === true)
                let unseenAmount = filter.length
                const newNumber = unseen - unseenAmount
                setUnseen(newNumber >= 0 ? newNumber : 0)

                for (const t of filter) {
                    const dx = oldMessages.indexOf(t)
                    oldMessages[dx].new = false
                }

                oldChats[index].messages = oldMessages
                updatePrivateMessages(oldChats)

            }

        }

    }, [privateChat])

    useEffect(() => {
        pushChatBottom(true)
    }, [globalMessages, privateMessages])

    const sendStreamMessage = async () => {
        if (messageToSend !== '') {
            if (privateChat) {
                props.sendSocketMessage({ stream: { event: 'stream:private', data: { message: messageToSend, toUser: privateChat } } })
            } else {
                props.sendSocketMessage({ stream: { event: 'stream:message', data: { message: messageToSend } } })
            }
            setMessageToSend('')
        }
    }

    useEffect(() => {

        if (props.lastSocketMessage && props.lastSocketMessage?.event) {

            const { event, data } = props.lastSocketMessage
            if (!event) return

            if (event === 'suite:messages') {

                let privateMsgs = []
                let roomMsgs = []

                const roomMessages = data.roomMessages
                const privateMessages = data.privateMessages

                for (const r of roomMessages) {
                    roomMsgs.push({
                        id: r._id.toString(),
                        tip: false,
                        user: r.user,
                        message: r.message,
                    })
                }

                for (const p of privateMessages) {
                    const chat = p.chat
                    const messages = p.messages
                    let obj = {
                        user: chat.otherUser,
                        messages: messages.map((m: any) => {
                            return {
                                id: m._id.toString(),
                                new: false,
                                message: m.message,
                                me: m.user === 'me'
                            }
                        })
                    }
                    privateMsgs.push(obj)
                }

                updatePrivateMessages(privateMsgs)
                setGlobalMessages(roomMsgs)

            }

            if (event === 'user:message') {

                const otherUser = data.otherUser
                const message = data.message
                const sender = data.sender

                const index = privateMessages.findIndex(e => e.user === otherUser)

                if (index >= 0) {

                    let old = privateMessages
                    let oldMessages = old[index].messages
                    let newMessages = [...oldMessages, { id: data.id, new: otherUser === sender, message, me: sender !== otherUser }]
                    old[index].messages = newMessages
                    updatePrivateMessages(old)

                    if (sender === otherUser) {
                        const unseenAmount = unseen
                        setUnseen(unseenAmount + 1)
                    }

                } else {

                    let old = [...privateMessages]

                    old.push({
                        user: otherUser,
                        messages: [
                            {
                                id: data.id,
                                me: otherUser !== sender,
                                message,
                                new: otherUser === sender,
                            }
                        ]
                    })

                    updatePrivateMessages(old)

                    if (sender === otherUser) {
                        const unseenAmount = unseen
                        setUnseen(unseenAmount + 1)
                    }

                }

            }

            if (event === 'room:tip') {
                let obj = {
                    id: data.id,
                    tip: true,
                    user: data.user,
                    amount: Number(data.amount),
                    message: data?.message
                }
                let arr = [...globalMessages, obj]
                setGlobalMessages(arr)
            }

            if (event === 'room:notice') {
                let obj = {
                    id: `${Math.floor(Date.now() / 1000)}`,
                    tip: false,
                    user: '',
                    amount: 0,
                    message: data?.message
                }
                let arr = [...globalMessages, obj]
                setGlobalMessages(arr)
            }

            if (event === 'room:message') {
                let obj = {
                    id: data.id,
                    tip: false,
                    user: data.user,
                    message: data?.message
                }
                let arr = [...globalMessages, obj]
                setGlobalMessages(arr)
            }

        }

    }, [props.lastSocketMessage])

    return (
        <div className="w-full col-span-2 h-full bg-slate-200 rounded-lg border border-slate-300 flex flex-col justify-between">

            <div className="p-4 border-b border-slate-400 flex flex-row items-center justify-between">
                <h2 className="text-slate-">{privateOpen ? privateChat ? 'Private Chat' : 'Private Messages' : 'Messages'}</h2>
                {
                    privateOpen ?
                        privateChat ?
                            <button onClick={() => setPrivateChat('')} className="bg-slate-700 text-white px-6 py-2 rounded-full relative">
                                Close Private Chat
                            </button>
                            :
                            <button onClick={() => setPrivateOpen(false)} className="bg-slate-700 text-white px-6 py-2 rounded-full relative">
                                Close Private Messages
                            </button>
                        :
                        <button onClick={() => setPrivateOpen(true)} className="bg-slate-700 text-white px-6 py-2 rounded-full relative">
                            Privates
                            {unseen > 0 ? <p className="bg-red-500 text-white absolute -bottom-[5px] -right-[5px] text-xs px-2 rounded-full py-1">{unseen}</p> : null}
                        </button>
                }
            </div>

            <div className="w-full h-full p-4 flex flex-col overflow-y-auto flex-grow">

                {
                    privateOpen ?
                        privateChat ?
                            <div ref={privateChatRef} className="w-full flex flex-col flex-grow overflow-y-auto p-4">
                                {
                                    privateMessages.filter(e => e.user === privateChat)[0].messages.map((m) => {
                                        if (m.me) {
                                            return (
                                                <p key={m.id} className='text-right text-slate-900'><span className='font-semibold'>me:</span> {m.message}</p>
                                            )
                                        } else {
                                            return (
                                                <p className="text-slate-900" key={m.id}><span className='font-semibold'>{privateChat}:</span> {m.message}</p>
                                            )
                                        }
                                    })
                                }
                            </div>
                            :
                            <div className="w-full flex flex-col flex-grow overflow-y-auto p-4">
                                {
                                    privateMessages.map((p) => {
                                        return (
                                            <div key={p.user} onClick={() => setPrivateChat(p.user)} className='w-full py-2 px-4 bg-slate-600 text-white cursor-pointer hover:bg-slate-700 transition-all duration-300 rounded-md flex flex-row items-center justify-between'>
                                                <div className='flex flex-row items-center'>
                                                    <h2 className='font-semibold'>@{p.user}:</h2>
                                                    <p className='ml-1 text-sm'>{p.messages[p.messages.length - 1].message}</p>
                                                </div>
                                                {
                                                    p.messages[p.messages.length - 1].new ?
                                                        <p className='bg-red-500 text-sm font-semibold text-white px-4 py-1 rounded-full'>NEW</p>
                                                        :
                                                        null
                                                }
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        :
                        <div ref={globalChatRef} className="w-full h-full p-4 flex flex-col overflow-y-auto flex-grow">
                            {
                                globalMessages.map((m) => {
                                    if (m.tip) {
                                        return (
                                            <p key={m.id} className='flex flex-row items-center py-1 px-3 my-1 text-sm bg-yellow-200 text-yellow-600 w-fit rounded-full'><BiLink /> {m.user} tipped {m.amount} tokens{m.message ? ':' : ''} {m.message}</p>
                                        )
                                    } else {
                                        return (
                                            <p key={m.id} className={`text-slate-900 ${m?.user === 'me' ? 'text-right' : 'text-left'}`}><span className='font-semibold my-1'>{m.user ? m.user : 'Notice'}:</span> {m.message}</p>
                                        )
                                    }
                                })
                            }

                        </div>
                }

            </div>

            {
                (privateOpen && !privateChat) ?
                    null
                    :
                    <div className="p-4 border-t border-slate-400 flex flex-row items-center">

                        <input onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                sendStreamMessage()
                            }
                        }} value={messageToSend} onChange={(e) => setMessageToSend(e.target.value)} type="text" className='text-slate-900 px-4 py-2 rounded-full bg-slate-300 w-full outline-none mr-4' placeholder='Write a message..' />

                        <button onClick={() => sendStreamMessage()} className='bg-slate-500 text-white px-4 py-2 rounded-full'>
                            <FiSend />
                        </button>

                    </div>
            }

        </div>
    )
}