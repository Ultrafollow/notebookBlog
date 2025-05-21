import {Header} from './Header';
import WebAuth from './GitAuth';

export default function HeaderComponent() {
    return (
        <div className='relative flex-auto items-center justify-center'>
            <Header>
                <WebAuth />
            </Header>
        </div>
    )
}