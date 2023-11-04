import { useContext } from "react"
import { UserContext } from "../../core/context/UserContext"
import { isAuth } from "../../core/utils/isAuth"

export default function Validation() {

    const { user } = useContext(UserContext)
    

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center">

        </div>
    )
}

export const getServerSideProps = isAuth()