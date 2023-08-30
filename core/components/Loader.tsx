import { AiOutlineLoading } from "react-icons/ai";

export default function Loader() {
    return (
        <div className="w-full h-screen bg-white flex flex-col items-center justify-center p-12 relative overflow-hidden">

            <AiOutlineLoading className="animate-spin text-blue-500 text-xl" />

        </div>
    )
}