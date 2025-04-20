import clsx from 'clsx';
import Twemoji from '../ui/Twemoji.js';

const GreetingComponent = () => {
  const className = clsx(
    'font-greeting',
    'bg-gradient-to-r from-lime-500 to-pink-800 dark:bg-gradient-to-l dark:from-indigo-600 dark:to-lime-300',
    'mb-8 bg-clip-text text-4xl font-extrabold leading-[60px] tracking-tight text-transparent md:text-7xl md:leading-[86px]'
  );

  return (
    <div className={className}>
      Hi, guys! <Twemoji emoji="waving-hand" size="base" />
      <div className="font-bold text-[60px] mt-2">
        Welcome to FollowXu's blog! <Twemoji emoji="sparkles" size="base" />
      </div>
    </div>
  );
};

export default GreetingComponent;
