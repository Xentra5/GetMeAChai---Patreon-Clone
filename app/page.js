import Image from "next/image";
import { BookOpenText } from 'lucide-react';
import supportImg from "../images/support.png";


export default function Home() {
  return (
    <>
      <div className="flex flex-col flex-1 justify-center items-center text-white p-24">
        <div className=" flex text-6xl font-bold mb-4">  Buy me a Chai </div>

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

      <div className="w-full px-6 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <div className="border border-white rounded-lg p-6 w-full flex flex-col justify-start">
              <div className="flex-grid  gap-5">
              <h1 className="text-white text-xl font-bold">
                Your Fans can buy you a Chai and support you in your creative journey.
              </h1>

              <BookOpenText size={88} color="white" />

             
            </div>
          </div>

          <div className="border border-white rounded-lg p-6 w-full flex flex-col justify-start">
            <div className="flex-grid gap-5">
              <h1 className="text-white text-xl font-bold">
                Your Fans can buy you a Chai and support you in your creative journey.
              </h1>

              <BookOpenText size={88} color="white" />

        
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


    </>


  );
}

