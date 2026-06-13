import React from 'react';
import LottiePackage from 'lottie-react';
import coinAnimation from '../assets/Fake 3D vector coin.json';

const Lottie = LottiePackage.default || LottiePackage;

const Loader = ({ size = "h-64 w-64", text = "Loading" }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-4">
      <div className={`${size}`}>
        <Lottie animationData={coinAnimation} loop={true} />
      </div>
      {text && <p className="text-[#5B0A1C] font-bold animate-pulse text-lg">{text}</p>}
    </div>
  );
};

export default Loader;
