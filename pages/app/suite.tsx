import Layout from "../../core/components/layout/Layout"
import StreamingSuite from "../../core/components/screens/shared/StreamingSuite"
import { isAuth } from "../../core/utils/isAuth"

export default function AppHome() {

    return (
        <Layout>
            <StreamingSuite />
        </Layout>
    )
}

// export const getServerSideProps = isAuth()