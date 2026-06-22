import React from 'react'

const NavBar = () => {
  return (
    <nav className="bg-black/50 backdrop-blur-md border-b border-gray-800 text-white sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">gerMEChai</div>
        <ul className="flex items-center gap-8">
          <li className="hover:text-purple-400 transition-colors cursor-pointer">Home</li>
          <li className="hover:text-purple-400 transition-colors cursor-pointer">About</li>
          <li className="hover:text-purple-400 transition-colors cursor-pointer">Contact</li>
          <li className="px-4 py-2 border border-purple-500 rounded-lg hover:bg-purple-500/10 transition-colors cursor-pointer">Sign Up</li>
          <li className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all cursor-pointer">Login</li>
        </ul>
      </div>
    </nav>
  )
}

export default NavBar
