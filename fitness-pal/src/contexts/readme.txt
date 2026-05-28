Contexts are an advanced way to propagate client side state through out the
DOM (document object model). It's an alternative to the old way of doing
things which was to use useState to declare client side state. The problem
with useState is that you basically end up handing off state variables and 
their handlers down the DOM from parent to child components, again, and 
again, and again. This is rediculously tidious and super error prone, known
as prop drilling. Contexts allow us to avoid prop drilling by wrapping the 
entire application in a state context, eliminating the need to drill any 
props entirely. When combined with a functional reducer to dispatch a 
setState action, it makes for an exceptionally efficient way to scale up 
application state and complexity.
