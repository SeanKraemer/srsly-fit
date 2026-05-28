NextJS server actions allow users to invoke server logic directly, bypassing traditional 
REST api or client-side fetching. You can define server actions in this folder, they are
super useful for creating, updating, and deleting - kinda useless for reading tho. You 
must include the "use server" directive at the top of the file! Great for forms!!! For 
example, you might have several actions in a userActions.ts, updateUser, deleteUser,
createUser etc etc.

- declare "use server"
- interact with database
- can access headers and cookies in server actions
- revalidatePath('path/to/form') to update DOM with new state
- server actions are asynchronous


https://www.youtube.com/watch?v=O94ESaJtHtM
