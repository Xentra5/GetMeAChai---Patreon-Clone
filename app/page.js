import Image from "next/image";
import { BookOpenText } from 'lucide-react';
import supportImg from "../images/support.png";
import tea from "../images/tea.png";
import doller from "../images/doller.png";
import profile from "../images/profile.png";



export default function Home() {
  return (
    <>
      <div className="flex flex-col flex-1 justify-center items-center text-white p-24">
        <div className="flex items-start text-6xl font-bold mb-4">  Buy me a Chai
          
          <Image
                src={tea}
                alt="Support"
                width={106}
                height={106}
                className="w-24 h-24 relative -top-5"
              /> </div>

        
        <p> A crowdfunding platform for creators . Get funded by your fans and followers . Start Now</p>

        <div className="mt-6">
          <button
            className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-semibold text-heading rounded-full group bg-gradient-to-br from-purple-600 to-blue-500 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
          >
            <span className="relative z-10 px-4 py-2.5">Start Here</span>

            <span
              aria-hidden="true"
              className="absolute inset-0 z-0 bg-neutral-primary-soft/10 backdrop-blur-md opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100"
            />

            <span
              aria-hidden="true"
              className="absolute -left-10 top-0 h-full w-10 bg-gradient-to-r from-white/40 via-white/10 to-transparent opacity-0 blur-sm transition-all duration-500 group-hover:left-1/2 group-hover:opacity-100"
            />
          </button>

          <button
            className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-semibold text-heading rounded-full group bg-gradient-to-br from-purple-600 to-blue-500 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 ml-4"
          >
            <span className="relative z-10 px-4 py-2.5">Read More</span>

            <span
              aria-hidden="true"
              className="absolute inset-0 z-0 bg-neutral-primary-soft/10 backdrop-blur-md opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100"
            />

            <span
              aria-hidden="true"
              className="absolute -left-10 top-0 h-full w-10 bg-gradient-to-r from-white/40 via-white/10 to-transparent opacity-0 blur-sm transition-all duration-500 group-hover:left-1/2 group-hover:opacity-100"
            />
          </button>
        </div>
      </div>

      <div className="bg-white h-1 opacity-10"></div>

      <div className="max-w-7xl mx-auto px-6 py-10">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

    <div className="border border-white/10 rounded-xl p-4 flex items-center gap-4">
      <div className="bg-purple-900/30 p-3 rounded-full">
        👥
      </div>
      <div>
        <h2 className="text-purple-400 text-2xl font-bold">25K+</h2>
        <p className="text-gray-400 text-sm">Creators Empowered</p>
      </div>
    </div>

    <div className="border border-white/10 rounded-xl p-4 flex items-center gap-4">
      <div className="bg-purple-900/30 p-3 rounded-full">
        ☕
      </div>
      <div>
        <h2 className="text-purple-400 text-2xl font-bold">1.8M+</h2>
        <p className="text-gray-400 text-sm">Chais Bought</p>
      </div>
    </div>

    <div className="border border-white/10 rounded-xl p-4 flex items-center gap-4">
      <div className="bg-purple-900/30 p-3 rounded-full">
        💜
      </div>
      <div>
        <h2 className="text-purple-400 text-2xl font-bold">500K+</h2>
        <p className="text-gray-400 text-sm">Supporters Worldwide</p>
      </div>
    </div>

    <div className="border border-white/10 rounded-xl p-4 flex items-center gap-4">
      <div className="bg-purple-900/30 p-3 rounded-full">
        ₹
      </div>
      <div>
        <h2 className="text-purple-400 text-2xl font-bold">₹12Cr+</h2>
        <p className="text-gray-400 text-sm">Earnings Generated</p>
      </div>
    </div>

  </div>
</div>


          <div className="bg-white h-1 opacity-10"></div>



      <div className="w-full px-6 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <div className="border border-white rounded-lg p-6 w-full flex flex-col justify-start text-white">
              <div className="flex-grid  gap-5">
              <h1 className="text-white text-xl font-bold">
               Create Your Creator Page
              </h1>
               <Image
                src={profile}
                alt="Support"
                width={96}
                height={96}
                className="w-24 h-24"
              />

              <p>Description:
Build your personal page in minutes. Share your story, showcase your work, and let your supporters contribute with just a few clicks. </p>

             

             
            </div>
          </div>

          <div className="border border-white rounded-lg p-6 w-full flex flex-col justify-start text-white">
            <div className="flex-grid gap-5">
              <h1 className="text-white text-xl font-bold">
                💜 Receive Support Instantly
              </h1>

               <Image
                src={doller}
                alt="Support"
                width={96}
                height={96}
                className="w-24 h-24"
              />

              <p> 
Accept contributions from your fans and followers. Every chai purchased helps you continue creating amazing content and growing your community.</p>

        
            </div>
          </div>

          <div className="border border-white rounded-lg p-6 w-full flex flex-col justify-start text-white">
            <div className=" flex-grid  gap-5">
              <h1 className="text-white text-xl font-bold">
                Fans Want to help
              </h1>

               <Image
                src={supportImg}
                alt="Support"
                width={96}
                height={96}
                className="w-24 h-24"
              />

           

              <p >
                Fans want to help their favorite creators. They want to support them in their creative journey. They want to buy them a Chai and support them in their creative journey.
              </p>
            </div>
          </div>
        </div>
      </div>


          <div className="bg-white h-1 opacity-10"></div>

          <div className="max-w-7xl mx-auto px-6 py-12">
  <h2 className="text-3xl font-bold text-white text-center mb-8">
    Creators You Can Support
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

    <div className="bg-[#111] border border-purple-900/30 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <img
          src="https://i.pravatar.cc/100?img=1"
          alt="creator"
          className="w-14 h-14 rounded-full"
        />
        <div>
          <h3 className="text-white font-bold">CodeWithRahul</h3>
          <p className="text-gray-400 text-sm">Web Developer</p>
        </div>
      </div>

      <div className="flex gap-4 text-sm text-gray-400 mt-4">
        <span>☕ 2,453</span>
        <span>₹1,24,500</span>
      </div>

      <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg">
        Support
      </button>
    </div>

    <div className="bg-[#111] border border-purple-900/30 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <img
          src="https://i.pravatar.cc/100?img=5"
          alt="creator"
          className="w-14 h-14 rounded-full"
        />
        <div>
          <h3 className="text-white font-bold">ArtByPriya</h3>
          <p className="text-gray-400 text-sm">Digital Artist</p>
        </div>
      </div>

      <div className="flex gap-4 text-sm text-gray-400 mt-4">
        <span>☕ 1,892</span>
        <span>₹98,760</span>
      </div>

      <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg">
        Support
      </button>
    </div>

    <div className="bg-[#111] border border-purple-900/30 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <img
          src="https://i.pravatar.cc/100?img=12"
          alt="creator"
          className="w-14 h-14 rounded-full"
        />
        <div>
          <h3 className="text-white font-bold">WriteWithArjun</h3>
          <p className="text-gray-400 text-sm">Writer</p>
        </div>
      </div>

      <div className="flex gap-4 text-sm text-gray-400 mt-4">
        <span>☕ 1,205</span>
        <span>₹75,340</span>
      </div>

      <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg">
        Support
      </button>
    </div>

    <div className="bg-[#111] border border-purple-900/30 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <img
          src="https://i.pravatar.cc/100?img=9"
          alt="creator"
          className="w-14 h-14 rounded-full"
        />
        <div>
          <h3 className="text-white font-bold">TechWithNeha</h3>
          <p className="text-gray-400 text-sm">Tech Educator</p>
        </div>
      </div>

      <div className="flex gap-4 text-sm text-gray-400 mt-4">
        <span>☕ 2,112</span>
        <span>₹1,05,230</span>
      </div>

      <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg">
        Support
      </button>
    </div>

  </div>
</div>

<div className="max-w-7xl mx-auto px-6 pb-12">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

    <div className="bg-[#111] rounded-xl p-4 text-white">
      <h3 className="font-bold text-purple-400">0% Platform Fee</h3>
      <p className="text-gray-400 text-sm mt-2">
        100% of your support goes to the creator.
      </p>
    </div>

    <div className="bg-[#111] rounded-xl p-4 text-white">
      <h3 className="font-bold text-purple-400">Withdraw Anytime</h3>
      <p className="text-gray-400 text-sm mt-2">
        Creators can withdraw earnings whenever needed.
      </p>
    </div>

    <div className="bg-[#111] rounded-xl p-4 text-white">
      <h3 className="font-bold text-purple-400">Safe & Secure</h3>
      <p className="text-gray-400 text-sm mt-2">
        Payments are protected with industry-standard security.
      </p>
    </div>

    <div className="bg-[#111] rounded-xl p-4 text-white">
      <h3 className="font-bold text-purple-400">24/7 Support</h3>
      <p className="text-gray-400 text-sm mt-2">
        We are here whenever you need help.
      </p>
    </div>

  </div>
</div>

          


    </>


  );
}

