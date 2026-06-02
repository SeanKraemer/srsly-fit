"use client"

import { loginAction, signUpAction } from '@/src/actions/login'
import { useState } from 'react'

export default function SmartForm({ demoMode }: { demoMode: boolean }) {
    const [toggleForm, setForm] = useState(false)

    if (demoMode) {
        return (
            <div className='flex flex-col gap-4 w-80 p-6 bg-white rounded shadow shadow-white mx-auto my-5'>
                <h1 className='text-red-800 font-bold text-center'>Srsly Fit Demo</h1>
                <form action={loginAction} className='flex flex-col gap-4'>
                    <input type='hidden' name='username' value='demo' />
                    <input type='hidden' name='password' value='demo' />
                    <button
                        type='submit'
                        className='bg-red-800 text-white py-2 px-4 rounded hover:bg-red-700 hover:cursor-pointer font-bold'
                    >
                        Continue as Demo User
                    </button>
                </form>
                <p className='text-sm text-red-800'>
                    Demo mode uses seeded read-only data and does not call live services.
                </p>
            </div>
        )
    }

    return (toggleForm ?
        <form
            className='flex flex-col gap-4 w-80 p-6 bg-white rounded shadow shadow-white mx-auto my-5'
            action={signUpAction}
        >
            <h1 className='text-red-800 font-bold text-center'>Sign Up</h1>
            <label htmlFor='email' className='font-semibold text-red-800'>
                Username
                <input
                    type='text'
                    id='username'
                    name='username'
                    required
                    className='mt-1 p-2 w-full border border-red-800 rounded'
                    autoComplete='username'
                    placeholder='user'
                />
            </label>
            <label htmlFor='password' className='font-semibold text-red-800'>
                Password
                <input
                    type='password'
                    id='password'
                    name='password'
                    required
                    className='mt-1 p-2 w-full border border-red-800 rounded'
                    autoComplete='current-password'
                    placeholder='••••••••'
                />
            </label>
            <label htmlFor='firstname' className='font-semibold text-red-800'>
                First Name
                <input
                    type='text'
                    id='firstname'
                    name='firstname'
                    required
                    className='mt-1 p-2 w-full border border-red-800 rounded'
                    placeholder='first'
                />
            </label>
            <label htmlFor='lastname' className='font-semibold text-red-800'>
                Last Name
                <input
                    type='text'
                    id='lastname'
                    name='lastname'
                    required
                    className='mt-1 p-2 w-full border border-red-800 rounded'
                    placeholder='last'
                />
            </label>
            <button
                type='submit'
                className='bg-red-800 text-white py-2 px-4 rounded hover:bg-red-700 hover:cursor-pointer font-bold'
            >
                Sign Up
            </button>
            <p className='text-red-800'>
                Already have an account?&nbsp;
                <label
                    className='underline underline-offset-1 hover:cursor-pointer'
                    onClick={() => {
                        setForm(!toggleForm)
                    }}
                >
                    Login.
                </label>
            </p>
        </form>

        :

        <form
            className='flex flex-col gap-4 w-80 p-6 bg-white rounded shadow shadow-white mx-auto my-5'
            action={loginAction}
        >
            <h1 className='text-red-800 font-bold text-center'>Login</h1>

            <label htmlFor='email' className='font-semibold text-red-800'>
                Username
                <input
                    type='text'
                    id='username'
                    name='username'
                    required
                    className='mt-1 p-2 w-full border border-red-800 rounded'
                    autoComplete='username'
                    placeholder='user'
                />
            </label>
            <label htmlFor='password' className='font-semibold text-red-800'>
                Password
                <input
                    type='password'
                    id='password'
                    name='password'
                    required
                    className='mt-1 p-2 w-full border border-red-800 rounded'
                    autoComplete='current-password'
                    placeholder='••••••••'
                />
            </label>
            <button
                type='submit'
                className='bg-red-800 text-white py-2 px-4 rounded hover:bg-red-700 hover:cursor-pointer font-bold'
            >
                Login
            </button>
            <p className='text-red-800'>
                Don&apos;t have an account?&nbsp;
                <label
                    className='underline underline-offset-1 hover:cursor-pointer'
                    onClick={() => {
                        setForm(!toggleForm)
                    }}
                >
                    Sign Up
                </label>
            </p>
        </form>
    )
}
