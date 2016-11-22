# Design notes

## Application state

On the server every request–response has its own instance of the application state, which means that multiple instances can exist alongside each other.

As a result, model instance identity exists within the scope of a state instance. This means that delivering model instances should be (ultimately) in the hands of a state instance.

A state instance holds collections. Every model instance that is managed by a state instance exists in one to many collections on that state. A collection may hold instances of various model types. The contents of a collection are managed by methods on the collection.

Collections should support lazy loading, meaning that reading their value triggers their (asynchronous) retrieval. Loading a collection may be marked as required, and the status of all required load operations combined should be observable on their state instance.

Retrieval is not entirely defined on the collection but may be partly carried out via a separate method on the state instance. This means that collections should have access to the state they live on.

The implementation of the actual retrieval should be configurable upon state instantiation to allow support for various environments, such as server, client and testing.

Retrieval may be a multi-step process, in which every step can be explicitly executed or withheld. The current state of a retrieval operation is state like any other.

Model instances should have access to the collections within their state scope. This probably means that model instances they should have access to the state scope they live in.

Model instances should be capable of refreshing their own data and possibly of deleting and destroying themselves. This probably means that model instances should have access to retrieval method(s) as well, in such a way that supplying their type should be sufficient for these methods to know what to do.

State should be easily serializable and deserializable to and from JSON.