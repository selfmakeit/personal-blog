import Mail from './mail.svg'
import Github from './github.svg'
import Facebook from './facebook.svg'
import Youtube from './youtube.svg'
import Linkedin from './linkedin.svg'
import Twitter from './twitter.svg'
import siteMetadata from '@/data/siteMetadata'
import Image from '@/components/Image'
import { IoLogoGithub, IoLogoLinkedin, IoMail, IoCall, IoLogoWechat } from 'react-icons/io5'
// import Popup from "../Popup";
import { useState } from 'react'
// Icons taken from: https://simpleicons.org/

const components = {
  mail: Mail,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
}
function Pop({ title, img, size = 8 }) {
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      <span
        className="text-sm text-gray-500 transition hover:text-gray-600"
        onClick={() => setShowModal(true)}
      >
        <IoLogoWechat
          className={`fill-current text-gray-700 hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-400 h-${size} w-${size}`}
        />
      </span>
      {showModal ? (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none hover:text-blue-500 focus:outline-none dark:text-gray-200 dark:hover:text-blue-400">
            <div className="relative my-6 mx-auto w-auto max-w-sm">
              {/*content*/}
              <div className="relative flex w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-center justify-center rounded-t border-b border-solid border-slate-200 p-2 pt-1 pb-1">
                  <div className="flex items-end justify-end">
                    <h3 className="font-semibold ">{title}</h3>
                  </div>
                  <button
                    className="float-right ml-auto border-0 bg-transparent p-1 text-xl font-semibold leading-none outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="h-6 w-6 text-black">×</span>
                  </button>
                </div>
                {/*body*/}
                <div className="relative flex-auto p-2 pt-1 pb-1">
                  <Image
                    src={img}
                    alt="wechat"
                    width="182px"
                    height="182px"
                    className="h-42 w-42"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
        </>
      ) : null}
    </>
  )
}
const SocialIcon = ({ kind, href, size = 8 }) => {
  if (!href || (kind === 'mail' && !/^mailto:\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/.test(href)))
    return null

  const SocialSvg = components[kind]
  if (kind === 'wechat') {
    return <Pop img={siteMetadata.wx} title="Wechat" />
  } else {
    return (
      <a
        className="text-sm text-gray-500 transition hover:text-gray-600"
        target="_blank"
        rel="noopener noreferrer"
        href={href}
      >
        <span className="sr-only">{kind}</span>
        <SocialSvg
          className={`fill-current text-gray-700 hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-400 h-${size} w-${size}`}
        />
      </a>
    )
  }
}

export default SocialIcon
