import React from 'react'

const NavBar = () => {
  return (
    <div className="bg-black text-white flex justify-between items-center  px-4 h-13 ">
        <div className= "logo font-bold"> gerMEChai</div>
       <ul className="flex justify-between gap-4">
        <li>Home</li>
        <li>About</li>
        <li>Contact</li>
        <li> Sign up</li>
        <li> Login</li>
       </ul>

      
    </div>
  )
}

export default NavBar
