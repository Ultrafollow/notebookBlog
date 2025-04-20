import Snowfall from './Snowfall.js'
import Greeting from './Greeting.js'
import { Intro } from './Intro.js'
import { TypedBios } from './Typedbios.js'
import { BlogLinks } from './BlogLinks.js'
import Twemoji from '@/components/ui/Twemoji'
import { ProfileCard } from '@/components/Cards/Profile' // 个人信息卡片组件
import { Container } from '@/components/ui/Container' // 容器组件
import { RecentPosts } from './RecentPosts.js'

export function Home () {
    return (
        <Container as="div" className="pt-2 lg:pt-8">
            <div className="relative">
                    <Snowfall/>
                    <div className="mt-4 dark:divide-gray-700 md:mt-8">
                        <Greeting />
                    </div>
                    <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-3">
                        {/* 左侧内容 */}
                        <div className="col-span-2 space-y-6">
                            <div className="text-base leading-7 text-gray-600 dark:text-gray-400 md:text-lg md:leading-8">
                            <Intro />
                            <TypedBios />
                            <div className="mb-6 pt-6 md:mb-8">
                                <p>I started learning to code when I was a senior in college.</p>
                                <p>Python has brought a lot of convenience to my subject learning.</p>
                                <p>I have a passion for Py / js and web dev.</p>
                                <p>I set up this blog because I want to record what I've learned, and I can easily review it.</p>
                            </div>
                                <BlogLinks />
                            <p className="my-6 flex md:my-8">
                                <span className="mr-2">Happy reading</span>
                                <Twemoji emoji="clinking-beer-mugs" />
                            </p>
                            </div>
                        </div>
                        {/* 右侧边栏 */}
                        <div className="hidden pl-4 xl:block">
                            <ProfileCard />
                        </div>
                    </div>
                    <div className="pt-12">
                        <RecentPosts limit={5}/>
                    </div>
            </div>
        </Container>   
    )
}