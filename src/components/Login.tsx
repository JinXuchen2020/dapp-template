'use client'
import { Button, Form, Input, message, Space } from 'antd';
import React, { FunctionComponent, useState } from 'react';

export const Login : FunctionComponent<{callback: any}> = ({callback}) => {
  const [form] = Form.useForm();

  const handleLogin = async() => {
    const format = await form.validateFields();
    await callback(format);
  }

  return (
    <div className='flex flex-col w-screen justify-center items-center gap-10'>
      <h1 className='text-3xl text-blue-500 font-bold text-center'> 
        用户登陆 
      </h1> 
      <Form
        form={form}
        name='login'
        className='min-w-96'
        labelCol={{span: 4}}
        wrapperCol={{span: 20}}
        layout={'horizontal'}
        onFinish={handleLogin}
      >
        <Form.Item label='账号' name='Email' rules={[{ required: true, message: '请输入微信号' }]}>
          <Input placeholder='请输入微信号'/>
        </Form.Item>
        <Form.Item label='密码' name='Password' rules={[{ required: true, message: '请输入密码' }]}>
          <Input type='password' placeholder='请输入密码'/>
        </Form.Item>
        <Form.Item wrapperCol={{span: 24}} style={{textAlign:'center'}}>
          <Space>
            <Button type='primary' htmlType='submit'>登陆</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  )
}
