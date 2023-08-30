import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiX } from 'react-icons/fi';
import { UserProvider } from '../core/context/UserContext';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {

  const contextClass: any = {
    success: "bg-green-200 text-gray-900",
    error: "bg-red-200 text-gray-900",
    warning: "bg-yellow-200 text-gray-900",
  };

  const CloseButton = ({ closeToast }: any) => (
    <FiX onClick={closeToast} className="text-gray-900 cursor-pointer" />
  );

  return (
    <UserProvider>
      <Head>
        <title>cliQ.</title>
      </Head>
      <ToastContainer
        style={{ maxWidth: '400px', width: '100%' }}
        toastClassName={({ type }: any) => contextClass[type || "default"] +
          "m-0 md:m-1 relative flex p-2 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer"
        }
        bodyClassName={() => "text-sm text-gray-900 font-med block p-3 flex flex-row items-center"}
        closeButton={CloseButton}
        hideProgressBar={true}
      />
      {/* @ts-ignore */}
      <Component {...pageProps} />
    </UserProvider>
  )
}