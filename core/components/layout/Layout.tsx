import Sidebar from "./Sidebar";

export default function Layout(
    props: {
        children: React.ReactNode
    }
) {
    return (
        <div className="bg-slate-50 w-full flex flex-col h-full min-h-screen">
            <Sidebar />
            <div className="w-full h-full flex flex-col flex-grow">
                <div className="ml-[80px] lg:ml-[270px] flex flex-col flex-grow h-full p-10">
                    {props.children}
                </div>
            </div>
        </div>
    )
}