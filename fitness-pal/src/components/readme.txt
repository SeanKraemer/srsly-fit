Compnents are the building blocks of NextJS applications, they are functional
meaning you delcare and return them as default TypeScript functions. By default
all components are server components, meaning the are rendered on the server
before being sent to the client! If you want to create a client component, you 
must use the "use client" directive at the top of the function! Note that you
cannot use any unique client state in sever components as they are rendered on
the server!!! To use client side hooks like useEffect and useState etc etc, you
must declare the component a client side component. 

- create myComponent.tsx
- export default function MyComponent({ children }: { children: React.ReactNode }) {}
- the body will return HTML return (<h1><h1>)
- must declare "use client" at the top in order to use any react hooks
