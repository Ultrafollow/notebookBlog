import React from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import {
  LogOut,
  CircleUser,
  Mail
} from 'lucide-react' // 引入图标库

export default function DownList({children, session}) {
  const items = [
    {
      label: (
        <Space>
          <CircleUser />
          <span>{session?.user?.name}</span>
        </Space>
      ),
      key: '0',
    },
    {
      label: (
        <Space>
          <Mail />
          <span>{session?.user?.email}</span>
        </Space>
      ),
      key: '1',
    },
    {
      label: (
        <Space>
          <LogOut />
          {children}
        </Space>
      ),
      key: '2',
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <a onClick={e => e.preventDefault()}>
        <Space>
            <div
              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-600 rounded-full hover:bg-gray-200 hover:scale-[1.05] transition-transform cursor-pointer"
            >
                <img 
                  src={session?.user?.image}
                  className="w-10 h-10 rounded-full border-4 border-blue-200 object-cover object-center"
                  alt="avatar"
                />
            </div>
          <DownOutlined />
        </Space>
      </a>
    </Dropdown>
  );
}