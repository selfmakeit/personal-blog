import Mail from './mail.svg'
import Github from './github.svg'
import Facebook from './facebook.svg'
import Youtube from './youtube.svg'
import Linkedin from './linkedin.svg'
import Twitter from './twitter.svg'
import siteMetadata from '@/data/siteMetadata'
import Image from '@/components/Image'
import { IoLogoGithub, IoLogoLinkedin, IoMail, IoCall,IoLogoWechat } from 'react-icons/io5'
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
function Pop({title,img,size = 8}){
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <span
        className="text-sm text-gray-500 transition hover:text-gray-600"
        onClick={() => setShowModal(true)}
      >
        <IoLogoWechat className={`fill-current text-gray-700 hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-400 h-${size} w-${size}`}/>
      </span>
      {showModal ? (
        <>
          <div
            className="justify-center items-center hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-400 flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
          >
            <div className="relative w-auto my-6 mx-auto max-w-sm">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-center justify-center p-2 pt-1 pb-1 border-b border-solid border-slate-200 rounded-t">
                  <div className='flex items-end justify-end'>
                    <h3 className="font-semibold ">
                      {title}
                    </h3>

                  </div>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 float-right text-xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="h-6 w-6 text-black">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className="relative p-2 pt-1 pb-1 flex-auto">
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
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}
const SocialIcon = ({ kind, href, size = 8 }) => {
  
  if (!href || (kind === 'mail' && !/^mailto:\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/.test(href)))
    return null

  const SocialSvg = components[kind]
  if(kind === 'wechat'){
    return(
      <Pop img={siteMetadata.wx} title="Wechat" />
    )
  }else{
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
