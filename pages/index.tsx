import { setCookie } from 'nookies'
import { useState } from 'react'
import { BiArrowToRight, BiLink } from 'react-icons/bi'
import { toast } from 'react-toastify'
import { getAPI } from '../core/utils/api'
import { isAuth } from '../core/utils/isAuth'
export default function Home() {

  const [token, setToken] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const login = async () => {

    if (loading) return
    setLoading(true)

    const api = getAPI()
    await api.post('/auth/login', {
      token
    })
      .then((res) => {

        setCookie(undefined, 'nextauth.token', res.data.token, {
          maxAge: 21600,
          path: '/'
        })
        setCookie(undefined, 'nextauth.refreshtoken', res.data.refreshToken, {
          maxAge: 86400,
          path: '/'
        })

        toast.success('Success! Redirecting..')

        setTimeout(() => {
          window.location.href = 'https://cliq.live/app'
        }, 2000);

      })
      .catch((err) => {

        if (err.response && err.response?.data?.message) {
          toast.error(err.response.data.message)
        } else {
          toast.error('Not possible to sign in')
        }

        setLoading(false)

      })

  }

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center justify-center p-8 relative overflow-hidden">

      <div className='w-full max-w-[450px] mx-auto flex flex-col items-center justify-center'>

        <h2 className="text-slate-900 font-semibold text-4xl">Welcome back</h2>
        <p className="text-slate-500 mt-4">Please, paste your session code to get started</p>

        <div className="mt-4 rounded-full w-full relative">
          <BiLink className='text-slate-900 absolute top-1/2 transform -translate-y-1/2 left-[15px] text-lg' />
          <input value={token} onChange={(e) => setToken(e.target.value)} type="text" className="w-full py-3 pr-[80px] pl-[45px] bg-slate-100 text-slate-900 placeholder:text-slate-500 text-sm rounded-full outline-none" />
          <button onClick={() => {
            if (token.length === 36) {
              login()
            }
          }} className={`${token.length === 36 ? 'bg-blue-700 hover:bg-slate-900' : 'bg-[#333]'} transition-all duration-300 absolute top-1/2 transform -translate-y-1/2 right-[15px] py-2 rounded-full px-5`}>
            <BiArrowToRight className='text-white' />
          </button>
        </div>

      </div>

    </div>
  )
}

export const getServerSideProps = isAuth()